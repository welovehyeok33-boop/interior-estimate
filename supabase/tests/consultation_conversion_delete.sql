-- LOCAL DISPOSABLE DATABASE ONLY. Never run this fixture test in production.
-- Run as the local database owner. All fixtures and changes are rolled back.
begin;
do $$
declare
  browser_id text := md5(gen_random_uuid()::text) || md5(gen_random_uuid()::text);
  first_id uuid := gen_random_uuid();
  second_id uuid := gen_random_uuid();
  untracked_id uuid := gen_random_uuid();
  visit_day date := (now() at time zone 'Asia/Seoul')::date;
  visit_count bigint;
begin
  if exists (select 1 from public.traffic_daily where visitor = browser_id) then
    raise exception 'Fixture identity already exists';
  end if;
  insert into public.consultations(id, name, phone, analytics_visitor)
  values (first_id, 'conversion regression', '01000000000', browser_id),
    (second_id, 'conversion regression', '01000000000', browser_id);
  if not (select converted from public.traffic_daily where visitor = browser_id and day = visit_day) then
    raise exception 'Insert must count as a conversion';
  end if;
  delete from public.consultations where id = first_id;
  if not (select converted from public.traffic_daily where visitor = browser_id and day = visit_day) then
    raise exception 'Another saved application must preserve the conversion';
  end if;
  delete from public.consultations where id = second_id;
  if (select converted from public.traffic_daily where visitor = browser_id and day = visit_day) then
    raise exception 'Deleting the last application must clear the conversion';
  end if;
  select count(*) into visit_count from public.traffic_daily where visitor = browser_id and day = visit_day;
  if visit_count <> 1 then raise exception 'Deleting applications must preserve the visitor denominator'; end if;
  insert into public.consultations(id, name, phone, analytics_visitor)
  values (untracked_id, 'conversion regression', '01000000000', null);
  delete from public.consultations where id = untracked_id;
  if (select converted from public.traffic_daily where visitor = browser_id and day = visit_day) then
    raise exception 'An untracked deletion must not change another visit';
  end if;
end; $$;
select 'PASS: insert, duplicate retention, last deletion, visit preservation, untracked deletion' as regression_result;
rollback;
