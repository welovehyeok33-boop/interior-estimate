begin;

-- Add bounded, read-only calendar-range RPCs. Existing preset RPCs and all records stay unchanged.
create or replace function public.admin_dashboard_range(p_from date, p_to date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; result jsonb;
begin
  if p_from is null or p_to is null or p_from < date '2000-01-01' or p_to > today
    or p_to < p_from or p_to - p_from > 30 then raise exception 'Invalid range'; end if;
  with dates as (select p_from + i as d from generate_series(0, p_to - p_from) i),
  selected as (select * from public.traffic_daily where day between p_from and p_to),
  traffic as (
    select day d, count(*) v, count(*) filter(where consult_start) c, count(*) filter(where engine_start) e,
      count(*) filter(where converted) s from selected group by day
  ), applications as (
    select (created_at at time zone 'Asia/Seoul')::date d, count(*) n from public.consultations
    where created_at >= (p_from::timestamp at time zone 'Asia/Seoul')
      and created_at < ((p_to + 1)::timestamp at time zone 'Asia/Seoul') group by 1
  ), days as (
    select dates.d as day, coalesce(t.v,0) visitors, coalesce(t.c,0) consult_starts, coalesce(t.e,0) engine_starts,
      coalesce(t.s,0) converted, coalesce(a.n,0) requests from dates left join traffic t using(d) left join applications a using(d)
  ), sources as (
    select source, coalesce(medium,'') medium, coalesce(campaign,'') campaign, count(*) visitors,
      count(*) filter(where consult_start) starts, count(*) filter(where converted) converted
    from selected group by source, medium, campaign
  ), landings as (
    select landing, count(*) visitors, count(*) filter(where converted) converted from selected group by landing
  ), statuses as (select coalesce(status,'unknown') status, count(*) count from public.consultations group by status)
  select jsonb_build_object(
    'days',(select jsonb_agg(to_jsonb(d) order by day) from days d),
    'sources',coalesce((select jsonb_agg(to_jsonb(s) order by visitors desc,source,medium,campaign) from sources s),'[]'::jsonb),
    'landings',coalesce((select jsonb_agg(to_jsonb(l) order by visitors desc,landing) from landings l),'[]'::jsonb),
    'statuses',coalesce((select jsonb_agg(to_jsonb(s) order by status) from statuses s),'[]'::jsonb),
    'totalRequests',(select count(*) from public.consultations),
    'pendingRequests',(select count(*) from public.consultations where status='new'),
    'dueRequests',(select count(*) from public.consultations where next_contact_at <= now() and status not in ('closed','contracted')),
    'startedAt',(select started_at from public.traffic_config where id=1),
    'attributionStartedAt',(select attribution_started_at from public.traffic_config where id=1),
    'updatedAt',now(),'from',p_from,'to',p_to
  ) into result;
  return result;
end; $$;
revoke all on function public.admin_dashboard_range(date,date) from public,anon,authenticated;
grant execute on function public.admin_dashboard_range(date,date) to service_role;

create or replace function public.admin_traffic_details_range(p_from date, p_to date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; result jsonb;
begin
  if p_from is null or p_to is null or p_from < date '2000-01-01' or p_to > today
    or p_to < p_from or p_to - p_from > 30 then raise exception 'Invalid range'; end if;
  -- Never resurrect or extend the existing 30-day detail retention, even if cleanup has not run.
  with selected as (
    select d.*,t.converted,t.source,t.campaign from public.traffic_details d join public.traffic_daily t using(day,visitor)
    where d.day between p_from and p_to and d.day >= today - 29
  ), regions as (select country,region,city,count(*) visitors,count(*) filter(where converted) converted from selected group by country,region,city),
  devices as (select device label,count(*) visitors,count(*) filter(where converted) converted from selected group by device),
  browsers as (select browser label,count(*) visitors,count(*) filter(where converted) converted from selected group by browser),
  systems as (select os label,count(*) visitors,count(*) filter(where converted) converted from selected group by os),
  pages as (select p.path,count(*) visitors,count(*) filter(where converted) converted from selected cross join lateral unnest(pages) p(path) group by p.path),
  recent as (select day,first_at,last_at,country,region,city,
    case when (select masked_ip_enabled from public.traffic_config where id=1) then ip_mask else null end ip_mask,
    device,browser,os,pages,source,campaign,converted from selected order by last_at desc,day desc,visitor limit 50)
  select jsonb_build_object(
    'enabled',(select details_enabled from public.traffic_config where id=1),
    'ipEnabled',(select masked_ip_enabled from public.traffic_config where id=1),
    'startedAt',(select details_started_at from public.traffic_config where id=1),
    'visitors',(select count(*) from selected),
    'regions',coalesce((select jsonb_agg(to_jsonb(r) order by visitors desc,country,region,city) from regions r),'[]'::jsonb),
    'devices',coalesce((select jsonb_agg(to_jsonb(r) order by visitors desc,label) from devices r),'[]'::jsonb),
    'browsers',coalesce((select jsonb_agg(to_jsonb(r) order by visitors desc,label) from browsers r),'[]'::jsonb),
    'systems',coalesce((select jsonb_agg(to_jsonb(r) order by visitors desc,label) from systems r),'[]'::jsonb),
    'pages',coalesce((select jsonb_agg(to_jsonb(r) order by path) from pages r),'[]'::jsonb),
    'recent',coalesce((select jsonb_agg(to_jsonb(r) order by last_at desc) from recent r),'[]'::jsonb)
  ) into result;
  return result;
end; $$;
revoke all on function public.admin_traffic_details_range(date,date) from public,anon,authenticated;
grant execute on function public.admin_traffic_details_range(date,date) to service_role;

notify pgrst,'reload schema';
commit;
