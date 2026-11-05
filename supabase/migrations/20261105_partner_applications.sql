create table if not exists public.partner_applications (
 id uuid primary key default gen_random_uuid(),
 submission_id uuid not null unique,
 company text not null check (char_length(company) between 2 and 100),
 contact text not null check (char_length(contact) between 2 and 50),
 phone text not null,
 regions text[] not null,
 specialties text[] not null,
 budget text not null,
 portfolio text not null default '',
 intro text not null check (char_length(intro) between 10 and 2000),
 consent_version text not null,
 consented_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '90 days'),
 status text not null default 'new' check (status in ('new','reviewing','discussing','approved','on_hold','rejected')),
 admin_note text not null default '' check (char_length(admin_note) <= 4000),
 admin_version integer not null default 0
);
alter table public.partner_applications enable row level security;
revoke all on public.partner_applications from public, anon, authenticated;
grant select, insert, update, delete on public.partner_applications to service_role;
create index if not exists partner_applications_created on public.partner_applications (created_at desc);
create index if not exists partner_applications_expiry on public.partner_applications (expires_at);
