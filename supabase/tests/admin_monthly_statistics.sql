-- Read-only verification; safe against the existing database. No customer/test records are written.
begin read only;
do $$
declare today date := (now() at time zone 'Asia/Seoul')::date;
  first_day date; last_day date; report jsonb; detail jsonb; item record;
  expected bigint; actual bigint;
begin
  for item in select * from (values (date '2024-02-01',date '2024-02-29'),
    (date '2025-02-01',date '2025-02-28'),(date '2025-08-01',date '2025-08-31'),
    (date_trunc('month',today)::date,today)) as periods(first_day,last_day)
  loop
    first_day := item.first_day; last_day := item.last_day;
    report := public.admin_dashboard_range(first_day,last_day);
    if jsonb_array_length(report->'days') <> last_day-first_day+1
      or (report->>'from')::date <> first_day or (report->>'to')::date <> last_day then raise exception 'Monthly range mismatch'; end if;
    select count(*) into expected from public.traffic_daily where day between first_day and last_day;
    select coalesce(sum((d->>'visitors')::bigint),0) into actual from jsonb_array_elements(report->'days') d;
    if actual <> expected then raise exception 'Monthly visitors mismatch'; end if;
    select coalesce(sum((s->>'visitors')::bigint),0) into actual from jsonb_array_elements(report->'sources') s;
    if actual <> expected then raise exception 'Monthly source totals mismatch'; end if;
    select count(*) into expected from public.consultations
      where created_at >= (first_day::timestamp at time zone 'Asia/Seoul')
        and created_at < ((last_day+1)::timestamp at time zone 'Asia/Seoul');
    select coalesce(sum((d->>'requests')::bigint),0) into actual from jsonb_array_elements(report->'days') d;
    if actual <> expected then raise exception 'Monthly applications mismatch'; end if;
    select count(*) into expected from public.traffic_daily where day between first_day and last_day and converted;
    select coalesce(sum((d->>'converted')::bigint),0) into actual from jsonb_array_elements(report->'days') d;
    if actual <> expected then raise exception 'Monthly conversions mismatch'; end if;
    detail := public.admin_traffic_details_range(first_day,last_day);
    if exists(select 1 from jsonb_array_elements(detail->'recent') r where (r->>'day')::date < today-29) then raise exception 'Expired detail exposed'; end if;
  end loop;
  begin
    perform public.admin_dashboard_range(today-31,today);
    raise exception 'Oversized period accepted';
  exception when others then if sqlerrm <> 'Invalid range' then raise; end if; end;
  begin
    perform public.admin_traffic_details_range(today,today+1);
    raise exception 'Future period accepted';
  exception when others then if sqlerrm <> 'Invalid range' then raise; end if; end;
  if has_function_privilege('anon','public.admin_dashboard_range(date,date)','execute')
    or has_function_privilege('authenticated','public.admin_dashboard_range(date,date)','execute')
    or has_function_privilege('anon','public.admin_traffic_details_range(date,date)','execute')
    or has_function_privilege('authenticated','public.admin_traffic_details_range(date,date)','execute')
    or not has_function_privilege('service_role','public.admin_dashboard_range(date,date)','execute')
    or not has_function_privilege('service_role','public.admin_traffic_details_range(date,date)','execute') then raise exception 'Monthly RPC permissions incorrect'; end if;
end $$;
rollback;
select 'PASS: calendar dates, KST visitor/application/source/conversion totals, detail retention, range bounds and private permissions' as result;
