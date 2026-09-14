-- 1. Lead enrichment
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS last_contacted timestamptz,
  ADD COLUMN IF NOT EXISTS website_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS website_status text;

-- 2. Website & technical tracker
CREATE TABLE IF NOT EXISTS public.client_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  live_url text,
  demo_url text,
  domain text,
  domain_registrar text,
  hosting_provider text,
  deployment_provider text,
  lovable_project_name text,
  lovable_project_url text,
  lovable_account_email text,
  github_repo text,
  github_account text,
  vercel_project text,
  netlify_project text,
  supabase_ref text,
  database_notes text,
  dns_notes text,
  deployment_notes text,
  technical_notes text,
  responsible_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_websites_client_idx ON public.client_websites(client_id);
CREATE INDEX IF NOT EXISTS client_websites_project_idx ON public.client_websites(project_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_websites TO authenticated;
GRANT ALL ON public.client_websites TO service_role;
ALTER TABLE public.client_websites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage website records" ON public.client_websites;
CREATE POLICY "Staff manage website records" ON public.client_websites
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP TRIGGER IF EXISTS client_websites_updated_at ON public.client_websites;
CREATE TRIGGER client_websites_updated_at BEFORE UPDATE ON public.client_websites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Follow-ups
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  due_time time,
  reason text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS follow_ups_due_idx ON public.follow_ups(due_date);
CREATE INDEX IF NOT EXISTS follow_ups_lead_idx ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS follow_ups_client_idx ON public.follow_ups(client_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage follow ups" ON public.follow_ups;
CREATE POLICY "Staff manage follow ups" ON public.follow_ups
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP TRIGGER IF EXISTS follow_ups_updated_at ON public.follow_ups;
CREATE TRIGGER follow_ups_updated_at BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Guarantee the Hadees super admin
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role FROM auth.users u
WHERE lower(u.email) = 'admin@hadeestrading.co.za'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles p SET is_staff = true
FROM auth.users u
WHERE p.id = u.id AND lower(u.email) = 'admin@hadeestrading.co.za';