begin;
create table if not exists public.partner_portal_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  company text not null check (char_length(company) between 2 and 100),
  email text not null unique check (char_length(email) <= 254),
  active boolean not null default true,
  session_version uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create table if not exists public.partner_lead_publications (
  consultation_id uuid primary key references public.consultations(id) on delete cascade,
  published_at timestamptz not null default now()
);
alter table public.partner_portal_accounts enable row level security;
alter table public.partner_lead_publications enable row level security;
revoke all on public.partner_portal_accounts, public.partner_lead_publications from public, anon, authenticated;
grant select, insert, update, delete on public.partner_portal_accounts, public.partner_lead_publications to service_role;
comment on table public.partner_lead_publications is 'Explicit admin publication only. Partner APIs return a masked allowlist; never private notes or contact details.';
notify pgrst, 'reload schema';
commit;
