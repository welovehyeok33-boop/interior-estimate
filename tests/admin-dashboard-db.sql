begin;
do $$
declare d date := (now() at time zone 'Asia/Seoul')::date;
  v text := encode(sha256(gen_random_uuid()::text::bytea),'hex');
  cid uuid; result jsonb; n integer;
begin
  perform public.record_traffic_v2(d,v,'visit','{"source":"naver","medium":"social","campaign":"qa_rollback","landing":"/"}');
  perform public.record_traffic_v2(d,v,'consult','{"source":"google","medium":"referral","campaign":"different","landing":"/consult"}');
  if not exists(select 1 from public.traffic_daily where day=d and visitor=v and source='naver' and consult_start and landing='/') then raise exception 'First source or start lost'; end if;
  insert into public.consultations(name,phone,analytics_visitor) values('QA rollback only','01000000000',v) returning id into cid;
  if not exists(select 1 from public.traffic_daily where day=d and visitor=v and converted and source='naver') then raise exception 'Conversion lost'; end if;
  update public.consultations set admin_note='QA',status='consulting',admin_version=1,next_contact_at=now()-interval '1 minute' where id=cid and admin_version=0;
  update public.consultations set admin_note='Wrong stale edit' where id=cid and admin_version=0;
  get diagnostics n = row_count;
  if n<>0 then raise exception 'Stale update accepted'; end if;
  result:=public.admin_dashboard(30,0);
  if jsonb_array_length(result->'days')<>60 or (result->>'from')::date<>d-29 then raise exception 'Range wrong'; end if;
  if not exists(select 1 from jsonb_array_elements(result->'sources') s where s->>'campaign'='qa_rollback' and (s->>'converted')::int=1) then raise exception 'Source conversion missing'; end if;
  if has_function_privilege('anon','public.admin_dashboard(integer,integer)','execute') or has_function_privilege('authenticated','public.record_traffic_v2(date,text,text,jsonb)','execute') then raise exception 'Public RPC exposed'; end if;
  if has_table_privilege('anon','public.consultations','select') or has_table_privilege('authenticated','public.traffic_daily','select') then raise exception 'Public data exposed'; end if;
end $$;
rollback;
select 'PASS: first touch, conversion, ranges, optimistic lock, private permissions; test rows rolled back' as result;
