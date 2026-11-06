begin;
create table if not exists public.partner_lead_entries (
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  partner_id uuid not null references public.partner_portal_accounts(id) on delete cascade,
  slot smallint not null check (slot in (1, 2)),
  created_at timestamptz not null default now(),
  primary key (consultation_id, slot),
  unique (consultation_id, partner_id)
);
alter table public.partner_lead_entries enable row level security;
revoke all on public.partner_lead_entries from public, anon, authenticated, service_role;
grant select on public.partner_lead_entries to service_role;

create or replace function public.claim_partner_lead(p_partner_id uuid, p_session_version uuid, p_consultation_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_status text; v_count integer; v_slot smallint;
begin
  -- Account changes and concurrent claims cannot race this transaction.
  perform 1 from public.partner_portal_accounts where id=p_partner_id and active and session_version=p_session_version for share;
  if not found then return jsonb_build_object('status','inactive'); end if;
  select status into v_status from public.consultations where id=p_consultation_id and created_at >= now()-interval '90 days' for update;
  if not found then return jsonb_build_object('status','unavailable'); end if;
  perform 1 from public.partner_lead_publications where consultation_id=p_consultation_id for share;
  if not found then return jsonb_build_object('status','unavailable'); end if;
  select count(*) into v_count from public.partner_lead_entries where consultation_id=p_consultation_id;
  select slot into v_slot from public.partner_lead_entries where consultation_id=p_consultation_id and partner_id=p_partner_id;
  if found then return jsonb_build_object('status','joined','slot',v_slot,'participants',v_count); end if;
  if v_status is null or v_status not in ('new','contact_attempted','contacted','consulting','quoted') then return jsonb_build_object('status','closed','participants',v_count); end if;
  if v_count >= 2 then return jsonb_build_object('status','full','participants',v_count); end if;
  select case when exists(select 1 from public.partner_lead_entries where consultation_id=p_consultation_id and slot=1) then 2 else 1 end into v_slot;
  insert into public.partner_lead_entries(consultation_id,partner_id,slot) values(p_consultation_id,p_partner_id,v_slot);
  return jsonb_build_object('status','joined','slot',v_slot,'participants',v_count+1);
end;
$$;
revoke all on function public.claim_partner_lead(uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.claim_partner_lead(uuid,uuid,uuid) to service_role;
notify pgrst, 'reload schema';
commit;
