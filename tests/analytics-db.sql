begin;
do $$
declare d date := (now() at time zone 'Asia/Seoul')::date;
v text := encode(sha256(gen_random_uuid()::text::bytea),'hex');
n bigint;
begin
 perform public.record_traffic(d,v,'visit');
 perform public.record_traffic(d,v,'visit');
 perform public.record_traffic(d,v,'consult');
 perform public.record_traffic(d,v,'engine');
 select count(*) into n from public.traffic_daily where day=d and visitor=v and consult_start and engine_start;
 if n <> 1 then raise exception 'Duplicate visit or missing funnel flag'; end if;
 insert into public.consultations(name,phone,analytics_visitor) values('통계 트랜잭션 검증','01000000000',v);
 select count(*) into n from public.traffic_daily where day=d and visitor=v and converted;
 if n <> 1 then raise exception 'Conversion trigger failed'; end if;
 select count(*) into n from public.traffic_report();
 if n <> 7 then raise exception 'Missing days'; end if;
 if has_table_privilege('anon','public.traffic_daily','select') or
 has_function_privilege('anon','public.traffic_report()','execute') then raise exception 'Anonymous access leak'; end if;
end $$;
rollback;
select 'PASS: duplicate visits, funnel flags, conversion trigger, 7-day report, RLS. Test changes rolled back.' as result;
