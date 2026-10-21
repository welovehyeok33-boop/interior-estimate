begin;

-- A converted visit must still have a saved application for the same browser/KST day.
-- Deleting one of several same-day applications must keep that visit converted.
create or replace function public.untrack_deleted_consultation_conversion()
returns trigger language plpgsql security definer set search_path = '' as $$
declare application_day date := (old.created_at at time zone 'Asia/Seoul')::date;
begin
  if old.analytics_visitor ~ '^[a-f0-9]{64}$' then
    update public.traffic_daily t
    set converted = exists (
      select 1 from public.consultations c
      where c.analytics_visitor = old.analytics_visitor
        and c.created_at >= (application_day::timestamp at time zone 'Asia/Seoul')
        and c.created_at < ((application_day + 1)::timestamp at time zone 'Asia/Seoul')
    )
    where t.day = application_day and t.visitor = old.analytics_visitor;
  end if;
  return old;
end; $$;

drop trigger if exists consultation_conversion_delete on public.consultations;
create trigger consultation_conversion_delete after delete on public.consultations
for each row execute function public.untrack_deleted_consultation_conversion();
revoke all on function public.untrack_deleted_consultation_conversion() from public, anon, authenticated;

-- Repair flags left behind by earlier deletions. Preserve visits, sources and page history.
update public.traffic_daily t
set converted = false
where t.converted and not exists (
  select 1 from public.consultations c
  where c.analytics_visitor = t.visitor
    and c.created_at >= (t.day::timestamp at time zone 'Asia/Seoul')
    and c.created_at < ((t.day + 1)::timestamp at time zone 'Asia/Seoul')
);

commit;
