-- Isolated temporary fixtures: no Auth users, consultations, messages or real slots are created.
begin;
create temporary table test_partner_accounts(id uuid primary key, active boolean, session_version uuid) on commit drop;
create temporary table test_consults(id uuid primary key, created_at timestamptz, status text) on commit drop;
create temporary table test_pubs(consultation_id uuid primary key) on commit drop;
create temporary table test_entries(like public.partner_lead_entries including all) on commit drop;
do $$
declare definition text; result jsonb;
  a uuid := '00000000-0000-4000-8000-000000000001';
  b uuid := '00000000-0000-4000-8000-000000000002';
  c uuid := '00000000-0000-4000-8000-000000000003';
  d uuid := '00000000-0000-4000-8000-000000000004';
  v uuid := '00000000-0000-4000-8000-000000000099';
  lead uuid := '00000000-0000-4000-8000-000000000100';
begin
  definition := pg_get_functiondef('public.claim_partner_lead(uuid,uuid,uuid)'::regprocedure);
  definition := replace(definition, 'public.claim_partner_lead(', 'pg_temp.test_claim_partner_lead(');
  definition := replace(definition, 'public.partner_portal_accounts', 'pg_temp.test_partner_accounts');
  definition := replace(definition, 'public.consultations', 'pg_temp.test_consults');
  definition := replace(definition, 'public.partner_lead_publications', 'pg_temp.test_pubs');
  definition := replace(definition, 'public.partner_lead_entries', 'pg_temp.test_entries');
  execute definition;
  insert into pg_temp.test_partner_accounts values(a,true,v),(b,true,v),(c,true,v),(d,false,v);
  insert into pg_temp.test_consults values(lead,now(),'new'),('00000000-0000-4000-8000-000000000101',now(),'lost'),('00000000-0000-4000-8000-000000000102',now()-interval '91 days','new'),('00000000-0000-4000-8000-000000000103',now(),'new');
  insert into pg_temp.test_pubs values(lead),('00000000-0000-4000-8000-000000000101'),('00000000-0000-4000-8000-000000000102');
  result := pg_temp.test_claim_partner_lead(a,v,lead);
  if result->>'status' <> 'joined' or (result->>'participants')::integer <> 1 then raise exception 'first claim failed'; end if;
  result := pg_temp.test_claim_partner_lead(a,v,lead);
  if (result->>'participants')::integer <> 1 then raise exception 'repeat used another slot'; end if;
  if pg_temp.test_claim_partner_lead(a,a,lead)->>'status' <> 'inactive' then raise exception 'stale session accepted'; end if;
  if pg_temp.test_claim_partner_lead(d,v,lead)->>'status' <> 'inactive' then raise exception 'inactive partner accepted'; end if;
  if pg_temp.test_claim_partner_lead(c,v,'00000000-0000-4000-8000-000000000101')->>'status' <> 'closed' then raise exception 'closed source accepted'; end if;
  if pg_temp.test_claim_partner_lead(c,v,'00000000-0000-4000-8000-000000000102')->>'status' <> 'unavailable' then raise exception 'expired source accepted'; end if;
  if pg_temp.test_claim_partner_lead(c,v,'00000000-0000-4000-8000-000000000103')->>'status' <> 'unavailable' then raise exception 'unpublished source accepted'; end if;
  result := pg_temp.test_claim_partner_lead(b,v,lead);
  if result->>'status' <> 'joined' or (result->>'participants')::integer <> 2 then raise exception 'second claim failed'; end if;
  if pg_temp.test_claim_partner_lead(c,v,lead)->>'status' <> 'full' then raise exception 'third partner accepted'; end if;
  if pg_temp.test_claim_partner_lead(a,v,lead)->>'status' <> 'joined' then raise exception 'repeat denied at capacity'; end if;
  begin
    insert into pg_temp.test_entries(consultation_id,partner_id,slot) values(lead,c,3);
    raise exception 'invalid third position accepted';
  exception when check_violation then null; end;
  delete from pg_temp.test_pubs where consultation_id=lead;
  if pg_temp.test_claim_partner_lead(a,v,lead)->>'status' <> 'unavailable' then raise exception 'unpublish did not revoke read'; end if;
  insert into pg_temp.test_pubs values(lead);
  if pg_temp.test_claim_partner_lead(c,v,lead)->>'status' <> 'full' then raise exception 'republish reset capacity'; end if;
  update pg_temp.test_consults set status='lost' where id=lead;
  if pg_temp.test_claim_partner_lead(a,v,lead)->>'status' <> 'joined' then raise exception 'existing participant lost revisit'; end if;
  if (select count(*) from pg_temp.test_entries) <> 2 then raise exception 'invalid final count'; end if;
end;
$$;
rollback;
select 'slot checks passed; temporary fixtures rolled back' as result,
  (select count(*) from public.partner_lead_entries) as actual_entries,
  has_table_privilege('service_role','public.partner_lead_entries','INSERT') as direct_insert,
  has_function_privilege('anon','public.claim_partner_lead(uuid,uuid,uuid)','EXECUTE') as anonymous_execute;
