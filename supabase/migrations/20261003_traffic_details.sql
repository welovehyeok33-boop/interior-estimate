begin;
alter table public.traffic_config
  add column if not exists details_enabled boolean not null default true,
  add column if not exists masked_ip_enabled boolean not null default true,
  add column if not exists details_started_at timestamptz not null default now();

create table if not exists public.traffic_details (
  day date not null, visitor text not null,
  first_at timestamptz not null default now(), last_at timestamptz not null default now(),
  country text, region text, city text, ip_mask text,
  device text not null, browser text not null, os text not null,
  pages text[] not null default '{}',
  primary key(day,visitor),
  foreign key(day,visitor) references public.traffic_daily(day,visitor) on delete cascade,
  check (country is null or country ~ '^[A-Z]{2}$'),
  check (length(region)<=8 and length(city)<=80),
  check (ip_mask is null or ip_mask ~ '^([0-9]{1,3}\.[0-9]{1,3}\.\*\.\*|[0-9a-f]{1,4}:[0-9a-f]{1,4}:[0-9a-f]{1,4}:\*:\*:\*:\*:\*)$'),
  check (length(device)<=30 and length(browser)<=30 and length(os)<=30 and cardinality(pages)<=14)
);
alter table public.traffic_details enable row level security;
revoke all on table public.traffic_details from public,anon,authenticated;
grant select,insert,update,delete on table public.traffic_details to service_role;

create or replace function public.record_traffic_v3(p_day date,p_visitor text,p_kind text,p_attribution jsonb,p_page text,p_metadata jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare enabled boolean; keep_ip boolean;
begin
  perform public.record_traffic_v2(p_day,p_visitor,p_kind,p_attribution);
  -- Retention only applies to this new detail table, never to historical counts or applications.
  delete from public.traffic_details where day < (now() at time zone 'Asia/Seoul')::date-29;
  select details_enabled,masked_ip_enabled into enabled,keep_ip from public.traffic_config where id=1;
  if not coalesce(enabled,false) or p_page is null or p_metadata is null then return; end if;
  if p_page not in ('/','/landing','/estimate','/estimate/scan','/blog','/consult','/consult/step2','/consult/step3','/consult/step4','/estimate/detail','/estimate/detail/step2','/estimate/detail/step3','/estimate/detail/step4','/estimate/detail/step5') then raise exception 'Invalid page'; end if;
  insert into public.traffic_details(day,visitor,country,region,city,ip_mask,device,browser,os,pages)
  values(p_day,p_visitor,p_metadata->>'country',p_metadata->>'region',p_metadata->>'city',
    case when keep_ip then p_metadata->>'ip_mask' else null end,
    coalesce(p_metadata->>'device','확인 불가'),coalesce(p_metadata->>'browser','확인 불가'),coalesce(p_metadata->>'os','확인 불가'),array[p_page])
  on conflict(day,visitor) do update set
    last_at=case when p_page=any(traffic_details.pages) then traffic_details.last_at else now() end,
    pages=case when p_page=any(traffic_details.pages) then traffic_details.pages else array_append(traffic_details.pages,p_page) end;
end; $$;
revoke all on function public.record_traffic_v3(date,text,text,jsonb,text,jsonb) from public,anon,authenticated;
grant execute on function public.record_traffic_v3(date,text,text,jsonb,text,jsonb) to service_role;

create or replace function public.set_traffic_detail_settings(p_enabled boolean,p_ip_enabled boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if p_enabled is null or p_ip_enabled is null then raise exception 'Invalid settings'; end if;
  update public.traffic_config set details_enabled=p_enabled,masked_ip_enabled=p_ip_enabled where id=1;
end; $$;
revoke all on function public.set_traffic_detail_settings(boolean,boolean) from public,anon,authenticated;
grant execute on function public.set_traffic_detail_settings(boolean,boolean) to service_role;

create or replace function public.admin_traffic_details(p_days integer default 7,p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; first_day date; last_day date; result jsonb;
begin
  if p_days is null or p_offset is null or p_days not in (1,7,30) or p_offset not in (0,1) or (p_offset=1 and p_days<>1) then raise exception 'Invalid range'; end if;
  last_day:=today-p_offset; first_day:=last_day-p_days+1;
  delete from public.traffic_details where day<today-29;
  with selected as (
    select d.*,t.converted,t.source,t.campaign from public.traffic_details d join public.traffic_daily t using(day,visitor)
    where d.day between first_day and last_day
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
revoke all on function public.admin_traffic_details(integer,integer) from public,anon,authenticated;
grant execute on function public.admin_traffic_details(integer,integer) to service_role;
notify pgrst,'reload schema';
commit;
