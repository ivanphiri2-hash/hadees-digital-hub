CREATE TABLE public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text,
  from_staff boolean not null default false,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

CREATE INDEX messages_client_created_idx ON public.messages (client_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read all messages" ON public.messages
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Clients can read their own messages" ON public.messages
FOR SELECT TO authenticated USING (
  exists (select 1 from public.clients c where c.id = messages.client_id and c.user_id = auth.uid())
);

CREATE POLICY "Staff can send messages" ON public.messages
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) and sender_id = auth.uid() and from_staff = true);

CREATE POLICY "Clients can send their own messages" ON public.messages
FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() and from_staff = false
  and exists (select 1 from public.clients c where c.id = messages.client_id and c.user_id = auth.uid())
);

CREATE POLICY "Staff can update messages" ON public.messages
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));