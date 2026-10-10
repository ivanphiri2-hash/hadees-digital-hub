CREATE TABLE public.case_studies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL DEFAULT '',
 client_identity text NOT NULL DEFAULT '',
 challenge text NOT NULL DEFAULT '',
 work_performed text NOT NULL DEFAULT '',
 outcome text NOT NULL DEFAULT '',
 completion_date date,
 evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
 permission_confirmed boolean NOT NULL DEFAULT false,
 scope_verified boolean NOT NULL DEFAULT false,
 privacy_reviewed boolean NOT NULL DEFAULT false,
 published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT SELECT ON public.case_studies TO anon;
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY case_studies_admin ON public.case_studies FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role::text IN ('super_admin','administrator'))) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role::text IN ('super_admin','administrator')));
CREATE POLICY case_studies_public ON public.case_studies FOR SELECT TO anon, authenticated USING (published AND permission_confirmed AND scope_verified AND privacy_reviewed);
CREATE FUNCTION public.validate_case_study_publication() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NEW.published AND (NOT NEW.permission_confirmed OR NOT NEW.scope_verified OR NOT NEW.privacy_reviewed OR NEW.completion_date IS NULL OR NEW.completion_date > CURRENT_DATE OR length(trim(NEW.title))=0 OR length(trim(NEW.client_identity))=0 OR length(trim(NEW.challenge))=0 OR length(trim(NEW.work_performed))=0 OR length(trim(NEW.outcome))=0) THEN RAISE EXCEPTION 'Publishing requires client permission, verified completed work, a privacy review and complete public copy.'; END IF;
 NEW.updated_at=now(); RETURN NEW;
END; $$;
CREATE TRIGGER validate_case_study BEFORE INSERT OR UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.validate_case_study_publication();
CREATE INDEX case_studies_public_idx ON public.case_studies (completion_date DESC) WHERE published;
