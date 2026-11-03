begin;
-- Unknown is distinct from not conducted. Do not infer past meetings from contract status.
alter table public.consultations add column if not exists meeting_completed boolean;
comment on column public.consultations.meeting_completed is 'Admin-only meeting/site survey: null unknown, false not conducted, true completed';
notify pgrst, 'reload schema';
commit;
