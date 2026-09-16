ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_number text;

CREATE SEQUENCE IF NOT EXISTS public.client_number_seq START WITH 1 INCREMENT BY 1;

DO $$
DECLARE r record; n integer := 0;
BEGIN
  FOR r IN SELECT id FROM public.clients WHERE client_number IS NULL ORDER BY created_at ASC LOOP
    n := nextval('public.client_number_seq');
    UPDATE public.clients SET client_number = 'HT-' || lpad(n::text, 3, '0') WHERE id = r.id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.set_client_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.client_number IS NULL OR NEW.client_number = '' THEN
    NEW.client_number := 'HT-' || lpad(nextval('public.client_number_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_number ON public.clients;
CREATE TRIGGER trg_clients_number
BEFORE INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.set_client_number();

CREATE UNIQUE INDEX IF NOT EXISTS clients_client_number_key ON public.clients (client_number);

GRANT USAGE, SELECT ON SEQUENCE public.client_number_seq TO authenticated, service_role;