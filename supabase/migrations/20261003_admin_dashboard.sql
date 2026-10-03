begin;
alter table public.traffic_config add column if not exists attribution_started_at timestamptz not null default now();
alter table public.traffic_daily add column if not exists source text,
  add column if not exists medium text, add column if not exists campaign text, add column if not exists landing text;
alter table public.consultations add column if not exists admin_note text not null default '',
  add column if not exists next_contact_at timestamptz,
  add column if not exists admin_version integer not null default 0;
create index if not exists consultations_status_created_idx on public.consultations(status,created_at desc);
create index if not exists consultations_next_contact_idx on public.consultations(next_contact_at) where next_contact_at is not null;

create or replace function public.record_traffic_v2(p_day date,p_visitor text,p_kind text,p_attribution jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare s text; m text; c text; l text;
begin
  if p_attribution is not null then
    s:=p_attribution->>'source'; m:=p_attribution->>'medium'; c:=p_attribution->>'campaign'; l:=p_attribution->>'landing';
    if s is null or s !~ '^[a-z][a-z0-9_-]{0,63}$' or coalesce(m,'') !~ '^([a-z][a-z0-9_-]{0,63})?$'
      or coalesce(c,'') !~ '^([a-z][a-z0-9_-]{0,63})?$' or l is null or length(l)>80 then raise exception 'Invalid attribution'; end if;
  end if;
  perform public.record_traffic(p_day,p_visitor,p_kind);
  -- Preserve first recorded source for the KST day; never overwrite existing attribution.
  if s is not null then
    update public.traffic_daily set source=s,medium=coalesce(m,''),campaign=coalesce(c,''),landing=l
    where day=p_day and visitor=p_visitor and source is null;
  end if;
end; $$;
revoke all on function public.record_traffic_v2(date,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.record_traffic_v2(date,text,text,jsonb) to service_role;

create or replace function public.admin_dashboard(p_days integer default 7,p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; first_day date; last_day date; result jsonb;
begin
  if p_days not in (1,7,30) or p_offset not in (0,1) or (p_offset=1 and p_days<>1) then raise exception 'Invalid range'; end if;
  last_day:=today-p_offset; first_day:=last_day-p_days+1;
  with dates as (select today-i as d from generate_series(0,59) i),
  traffic as (
    select t.day d,count(*) v,count(*) filter(where t.consult_start) c,count(*) filter(where t.engine_start) e,
      count(*) filter(where t.converted) s from public.traffic_daily t where t.day between today-59 and today group by t.day
  ), applications as (
    select (created_at at time zone 'Asia/Seoul')::date d,count(*) n from public.consultations
    where created_at >= ((today-59)::timestamp at time zone 'Asia/Seoul') group by 1
  ), days as (
    select dates.d as day,coalesce(t.v,0) visitors,coalesce(t.c,0) consult_starts,coalesce(t.e,0) engine_starts,
      coalesce(t.s,0) converted,coalesce(a.n,0) requests from dates left join traffic t using(d) left join applications a using(d)
  ), selected as (select * from public.traffic_daily where day between first_day and last_day),
  sources as (
    select source,coalesce(medium,'') medium,coalesce(campaign,'') campaign,count(*) visitors,
      count(*) filter(where consult_start) starts,count(*) filter(where converted) converted
    from selected group by source,medium,campaign
  ), landings as (
    select landing,count(*) visitors,count(*) filter(where converted) converted from selected group by landing
  ), statuses as (select coalesce(status,'unknown') status,count(*) count from public.consultations group by status)
  select jsonb_build_object(
    'days',(select jsonb_agg(to_jsonb(d) order by day) from days d),
    'sources',coalesce((select jsonb_agg(to_jsonb(s) order by visitors desc,source,medium,campaign) from sources s),'[]'::jsonb),
    'landings',coalesce((select jsonb_agg(to_jsonb(l) order by visitors desc,landing) from landings l),'[]'::jsonb),
    'statuses',coalesce((select jsonb_agg(to_jsonb(s) order by status) from statuses s),'[]'::jsonb),
    'totalRequests',(select count(*) from public.consultations),
    'pendingRequests',(select count(*) from public.consultations where status='new'),
    'dueRequests',(select count(*) from public.consultations where next_contact_at<=now() and status not in ('closed','contracted')),
    'startedAt',(select started_at from public.traffic_config where id=1),
    'attributionStartedAt',(select attribution_started_at from public.traffic_config where id=1),
    'updatedAt',now(),'from',first_day,'to',last_day
  ) into result;
  return result;
end; $$;
revoke all on function public.admin_dashboard(integer,integer) from public,anon,authenticated;
grant execute on function public.admin_dashboard(integer,integer) to service_role;
notify pgrst,'reload schema';
commit;
