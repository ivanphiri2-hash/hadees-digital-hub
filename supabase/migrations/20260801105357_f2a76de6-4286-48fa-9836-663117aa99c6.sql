
-- ============ ENUMS ============
create type public.app_role as enum ('super_admin','administrator','sales','project_manager','finance','support','client');
create type public.lead_stage as enum ('new_lead','contacted','consultation_scheduled','proposal_sent','waiting_deposit','deposit_received','waiting_client_info','project_started','design','development','client_review','completed','support');
create type public.lead_source as enum ('website','whatsapp','referral','facebook','instagram','google','manual');
create type public.project_status as enum ('pending','in_progress','waiting_client','review','completed','archived');
create type public.doc_status as enum ('draft','sent','accepted','rejected','paid','overdue','void','cancelled');
create type public.ticket_status as enum ('open','in_progress','waiting_client','resolved','closed');

-- ============ HELPERS ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  whatsapp text,
  avatar_url text,
  is_staff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','administrator','sales','project_manager','finance','support'))
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','administrator'))
$$;

create policy "profiles self read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin(auth.uid())) with check (id = auth.uid() or public.is_admin(auth.uid()));
create policy "profiles self insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'client') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============ CRM ============
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  company_name text,
  registration_number text,
  vat_number text,
  address text,
  industry text,
  notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  status text not null default 'active',
  lifetime_value_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create trigger trg_clients_updated before update on public.clients for each row execute function public.update_updated_at_column();
create policy "clients staff all" on public.clients for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "clients own read" on public.clients for select to authenticated using (user_id = auth.uid());
create policy "clients own update" on public.clients for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  service_slug text,
  service_name text,
  message text,
  source public.lead_source not null default 'website',
  stage public.lead_stage not null default 'new_lead',
  value_cents integer not null default 0,
  assigned_to uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  next_follow_up date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create trigger trg_leads_updated before update on public.leads for each row execute function public.update_updated_at_column();
create policy "leads staff all" on public.leads for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  message text not null,
  source public.lead_source not null default 'website',
  handled boolean not null default false,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "enquiries staff read" on public.enquiries for select to authenticated using (public.is_staff(auth.uid()));
create policy "enquiries staff write" on public.enquiries for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ============ DOCUMENT NUMBERING ============
create table public.doc_counters (
  kind text not null,
  year integer not null,
  seq integer not null default 0,
  primary key (kind, year)
);
grant all on public.doc_counters to service_role;
alter table public.doc_counters enable row level security;

create or replace function public.next_doc_number(_prefix text)
returns text language plpgsql security definer set search_path = public as $$
declare y integer := extract(year from now())::int; n integer;
begin
  insert into public.doc_counters (kind, year, seq) values (_prefix, y, 1)
  on conflict (kind, year) do update set seq = public.doc_counters.seq + 1
  returning seq into n;
  return _prefix || '-' || y || '-' || lpad(n::text, 6, '0');
end; $$;

-- ============ QUOTES / INVOICES / PAYMENTS / RECEIPTS ============
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default public.next_doc_number('QTN'),
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0,
  vat_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'ZAR',
  status public.doc_status not null default 'draft',
  valid_until date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.quotations to authenticated;
grant all on public.quotations to service_role;
alter table public.quotations enable row level security;
create trigger trg_quotations_updated before update on public.quotations for each row execute function public.update_updated_at_column();
create policy "quotations staff all" on public.quotations for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "quotations client read" on public.quotations for select to authenticated
  using (exists (select 1 from public.clients c where c.id = quotations.client_id and c.user_id = auth.uid()));

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default public.next_doc_number('INV'),
  client_id uuid references public.clients(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  title text not null,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0,
  vat_cents integer not null default 0,
  total_cents integer not null default 0,
  amount_paid_cents integer not null default 0,
  currency text not null default 'ZAR',
  status public.doc_status not null default 'draft',
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
grant select, insert, update, delete on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;
create trigger trg_invoices_updated before update on public.invoices for each row execute function public.update_updated_at_column();
create policy "invoices staff all" on public.invoices for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "invoices client read" on public.invoices for select to authenticated
  using (exists (select 1 from public.clients c where c.id = invoices.client_id and c.user_id = auth.uid()));

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'ZAR',
  method text not null default 'payfast',
  status text not null default 'pending',
  reference text,
  pf_payment_id text,
  raw jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "payments staff all" on public.payments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "payments client read" on public.payments for select to authenticated
  using (exists (select 1 from public.clients c where c.id = payments.client_id and c.user_id = auth.uid()));

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default public.next_doc_number('REC'),
  payment_id uuid references public.payments(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'ZAR',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert on public.receipts to authenticated;
grant all on public.receipts to service_role;
alter table public.receipts enable row level security;
create policy "receipts staff all" on public.receipts for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "receipts client read" on public.receipts for select to authenticated
  using (exists (select 1 from public.clients c where c.id = receipts.client_id and c.user_id = auth.uid()));

-- ============ PROJECTS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid references public.clients(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  service_slug text,
  status public.project_status not null default 'pending',
  progress integer not null default 0,
  assigned_to uuid references auth.users(id) on delete set null,
  due_date date,
  milestones jsonb not null default '[]'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create trigger trg_projects_updated before update on public.projects for each row execute function public.update_updated_at_column();
create policy "projects staff all" on public.projects for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "projects client read" on public.projects for select to authenticated
  using (exists (select 1 from public.clients c where c.id = projects.client_id and c.user_id = auth.uid()));

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  assigned_to uuid references auth.users(id) on delete set null,
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.project_tasks to authenticated;
grant all on public.project_tasks to service_role;
alter table public.project_tasks enable row level security;
create trigger trg_tasks_updated before update on public.project_tasks for each row execute function public.update_updated_at_column();
create policy "tasks staff all" on public.project_tasks for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "tasks client read" on public.project_tasks for select to authenticated
  using (exists (select 1 from public.projects p join public.clients c on c.id = p.client_id
                 where p.id = project_tasks.project_id and c.user_id = auth.uid()));

create table public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.project_comments to authenticated;
grant all on public.project_comments to service_role;
alter table public.project_comments enable row level security;
create policy "comments staff all" on public.project_comments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "comments client read" on public.project_comments for select to authenticated
  using (exists (select 1 from public.projects p join public.clients c on c.id = p.client_id
                 where p.id = project_comments.project_id and c.user_id = auth.uid()));
create policy "comments client insert" on public.project_comments for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.projects p join public.clients c on c.id = p.client_id
                 where p.id = project_comments.project_id and c.user_id = auth.uid()));

-- ============ DOCUMENTS ============
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  category text not null default 'general',
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes integer,
  version integer not null default 1,
  parent_id uuid references public.documents(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "documents staff all" on public.documents for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "documents client read" on public.documents for select to authenticated
  using (exists (select 1 from public.clients c where c.id = documents.client_id and c.user_id = auth.uid()));
create policy "documents client insert" on public.documents for insert to authenticated
  with check (uploaded_by = auth.uid() and exists (select 1 from public.clients c where c.id = documents.client_id and c.user_id = auth.uid()));

-- ============ SUPPORT ============
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  subject text not null,
  body text not null,
  status public.ticket_status not null default 'open',
  priority text not null default 'normal',
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.support_tickets to authenticated;
grant all on public.support_tickets to service_role;
alter table public.support_tickets enable row level security;
create trigger trg_tickets_updated before update on public.support_tickets for each row execute function public.update_updated_at_column();
create policy "tickets staff all" on public.support_tickets for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "tickets client read" on public.support_tickets for select to authenticated
  using (exists (select 1 from public.clients c where c.id = support_tickets.client_id and c.user_id = auth.uid()));
create policy "tickets client insert" on public.support_tickets for insert to authenticated
  with check (created_by = auth.uid() and exists (select 1 from public.clients c where c.id = support_tickets.client_id and c.user_id = auth.uid()));

-- ============ NOTIFICATIONS / ACTIVITY ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  audience text not null default 'staff',
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications staff read" on public.notifications for select to authenticated
  using (public.is_staff(auth.uid()) and audience = 'staff');
create policy "notifications own read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update to authenticated
  using (user_id = auth.uid() or (public.is_staff(auth.uid()) and audience = 'staff'))
  with check (user_id = auth.uid() or (public.is_staff(auth.uid()) and audience = 'staff'));

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  action text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "activity staff read" on public.activity_logs for select to authenticated using (public.is_staff(auth.uid()));
create policy "activity staff insert" on public.activity_logs for insert to authenticated with check (public.is_staff(auth.uid()));

-- ============ SETTINGS / SOCIALS ============
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.settings to anon, authenticated;
grant insert, update, delete on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create trigger trg_settings_updated before update on public.settings for each row execute function public.update_updated_at_column();
create policy "settings public read" on public.settings for select to anon, authenticated using (is_public = true);
create policy "settings admin all" on public.settings for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique,
  url text not null,
  label text,
  enabled boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.social_links to anon, authenticated;
grant insert, update, delete on public.social_links to authenticated;
grant all on public.social_links to service_role;
alter table public.social_links enable row level security;
create trigger trg_socials_updated before update on public.social_links for each row execute function public.update_updated_at_column();
create policy "socials public read" on public.social_links for select to anon, authenticated using (true);
create policy "socials admin all" on public.social_links for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- indexes
create index idx_leads_stage on public.leads(stage);
create index idx_projects_client on public.projects(client_id);
create index idx_invoices_client on public.invoices(client_id);
create index idx_documents_client on public.documents(client_id);
create index idx_payments_client on public.payments(client_id);
create index idx_notifications_created on public.notifications(created_at desc);

-- seed settings + socials
insert into public.settings (key, value, is_public) values
  ('company', '{"name":"HADEES TRADING (PTY) LTD","email":"info@hadeestrading.co.za","phone":"+27 83 753 5798","whatsapp":"27837535798","address":"South Africa","vat_registered":false,"vat_rate":15}'::jsonb, true),
  ('business_hours', '{"mon_fri":"08:00 - 17:00","sat":"09:00 - 13:00","sun":"Closed"}'::jsonb, true),
  ('payments', '{"provider":"payfast","deposit_percent":50,"currency":"ZAR"}'::jsonb, false);

insert into public.social_links (platform, url, position) values
  ('whatsapp','https://wa.me/27837535798',1),
  ('facebook','https://facebook.com/hadeestrading',2),
  ('instagram','https://instagram.com/hadeestrading',3),
  ('linkedin','https://linkedin.com/company/hadeestrading',4),
  ('x','https://x.com/hadeestrading',5),
  ('youtube','https://youtube.com/@hadeestrading',6),
  ('tiktok','https://tiktok.com/@hadeestrading',7),
  ('telegram','https://t.me/hadeestrading',8),
  ('discord','https://discord.gg/hadeestrading',9);
