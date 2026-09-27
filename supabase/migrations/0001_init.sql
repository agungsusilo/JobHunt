-- 0001_init.sql -- JobHunt applications table, trigger, RLS, realtime
-- Idempotent: safe to re-run/re-paste in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id                uuid primary key default gen_random_uuid(),
  company           text not null,
  position          text not null,
  job_url           text unique,               -- NULLs never conflict with each other
  location          text,
  source            text not null default 'other'
                      check (source in ('linkedin','company_site','referral','other')),
  status            text not null default 'wishlist'
                      check (status in ('wishlist','applied','phone_screen','interview','offer','rejected','withdrawn')),
  salary_min        integer check (salary_min is null or salary_min >= 0),
  salary_max        integer check (salary_max is null or salary_max >= 0),
  applied_date      date,
  next_action       text,
  next_action_date  date,
  notes             text,
  contact_name      text,
  contact_info      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint salary_range_check check (
    salary_min is null or salary_max is null or salary_max >= salary_min
  )
);

create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_applied_date_idx on public.applications (applied_date);

-- updated_at auto-touch trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at();

-- RLS: permissive single-user policy (NOTE: tighten before any public deploy)
alter table public.applications enable row level security;

drop policy if exists "applications_allow_all" on public.applications;
create policy "applications_allow_all"
  on public.applications
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Realtime: add table to the default publication (idempotent guard)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'applications'
  ) then
    alter publication supabase_realtime add table public.applications;
  end if;
end $$;
