begin;
create table if not exists public.traffic_config (
  id integer primary key check (id = 1), started_at timestamptz not null default now()
);
insert into public.traffic_config(id) values(1) on conflict do nothing;
create table if not exists public.traffic_daily (
  day date not null, visitor text not null check (visitor ~ '^[a-f0-9]{64}$'),
  consult_start boolean not null default false,
  engine_start boolean not null default false,
  converted boolean not null default false,
  primary key(day, visitor)
);
alter table public.consultations add column if not exists analytics_visitor text;
create index if not exists consultations_created_at_idx on public.consultations(created_at);
alter table public.traffic_config enable row level security;
alter table public.traffic_daily enable row level security;
revoke all on public.traffic_config, public.traffic_daily from public, anon, authenticated;
grant select on public.traffic_config to service_role;
grant select, insert, update on public.traffic_daily to service_role;

create or replace function public.record_traffic(p_day date, p_visitor text, p_kind text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_day <> (now() at time zone 'Asia/Seoul')::date
    or p_visitor !~ '^[a-f0-9]{64}$' or p_kind not in ('visit','consult','engine') then
    raise exception 'Invalid event';
  end if;
  insert into public.traffic_daily as t(day, visitor, consult_start, engine_start)
  values(p_day,p_visitor,p_kind='consult',p_kind='engine')
  on conflict(day,visitor) do update set
    consult_start=t.consult_start or excluded.consult_start,
    engine_start=t.engine_start or excluded.engine_start;
end; $$;

-- Conversion is recorded atomically with a successful, non-duplicate application.
create or replace function public.track_consultation_conversion()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.analytics_visitor ~ '^[a-f0-9]{64}$' then
    insert into public.traffic_daily(day,visitor,consult_start,converted)
    values((new.created_at at time zone 'Asia/Seoul')::date,new.analytics_visitor,true,true)
    on conflict(day,visitor) do update set consult_start=true,converted=true;
  end if;
  return new;
end; $$;
drop trigger if exists consultation_conversion on public.consultations;
create trigger consultation_conversion after insert on public.consultations
for each row execute function public.track_consultation_conversion();

create or replace function public.traffic_report()
returns table(day date,visitors bigint,consult_starts bigint,engine_starts bigint,converted bigint,requests bigint)
language sql security definer set search_path = '' as $$
  with dates as (
    select (now() at time zone 'Asia/Seoul')::date - i as d from generate_series(0,6) i
  ), traffic as (
    select t.day d, count(*) v, count(*) filter(where t.consult_start) c,
      count(*) filter(where t.engine_start) e, count(*) filter(where t.converted) s
    from public.traffic_daily t where t.day >= (now() at time zone 'Asia/Seoul')::date - 6
    group by t.day
  ), applications as (
    select (c.created_at at time zone 'Asia/Seoul')::date d, count(*) n
    from public.consultations c
    where c.created_at >= (((now() at time zone 'Asia/Seoul')::date - 6)::timestamp at time zone 'Asia/Seoul')
    group by 1
  )
  select dates.d,coalesce(t.v,0),coalesce(t.c,0),coalesce(t.e,0),coalesce(t.s,0),coalesce(a.n,0)
  from dates left join traffic t using(d) left join applications a using(d) order by dates.d;
$$;
revoke all on function public.record_traffic(date,text,text) from public,anon,authenticated;
revoke all on function public.track_consultation_conversion() from public,anon,authenticated;
revoke all on function public.traffic_report() from public,anon,authenticated;
grant execute on function public.record_traffic(date,text,text) to service_role;
grant execute on function public.traffic_report() to service_role;
notify pgrst, 'reload schema';
commit;
