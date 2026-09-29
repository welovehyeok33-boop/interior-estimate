begin;

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  region text,
  building_type text,
  area numeric,
  experience text,
  schedule text,
  work_scope text,
  budget text,
  memo text,
  status text not null default 'new'
);
alter table public.consultations
  add column if not exists residential_grade text,
  add column if not exists commercial_type text,
  add column if not exists commercial_sub text,
  add column if not exists space_description text,
  add column if not exists consent_version text,
  add column if not exists consent_at timestamptz,
  add column if not exists submission_id uuid;
create unique index if not exists consultations_submission_id on public.consultations(submission_id);

-- Existing rows are preserved. Only the server service role can access customer data.
alter table public.leads enable row level security;
alter table public.consultations enable row level security;
revoke all on public.leads, public.consultations from anon, authenticated;
grant select, insert, update, delete on public.leads, public.consultations to service_role;

create table if not exists public.request_limits (
  key text primary key,
  window_start timestamptz not null,
  hits integer not null
);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;
grant all on public.request_limits to service_role;
create or replace function public.consume_request_limit(bucket text, max_hits integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare hit_count integer;
begin
  if max_hits < 1 or window_seconds < 1 then return false; end if;
  delete from public.request_limits where window_start < now() - interval '1 day';
  insert into public.request_limits as r(key, window_start, hits)
  values(bucket, now(), 1)
  on conflict(key) do update set
    hits = case when r.window_start < now() - make_interval(secs => window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => window_seconds) then now() else r.window_start end
  returning hits into hit_count;
  return hit_count <= max_hits;
end;
$$;
revoke all on function public.consume_request_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_request_limit(text, integer, integer) to service_role;
notify pgrst, 'reload schema';
commit;
