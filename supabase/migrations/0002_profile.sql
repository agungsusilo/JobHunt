-- 0002_profile.sql -- single-row profile table + CV storage bucket
-- Idempotent: safe to re-run/re-paste in the Supabase SQL Editor.

create table if not exists public.profile (
  id                uuid primary key default gen_random_uuid(),
  full_name         text,
  email             text,
  phone             text,
  location          text,
  headline          text,
  linkedin_url      text,
  portfolio_url     text,
  summary           text,
  cv_path           text,
  cv_filename       text,
  cv_uploaded_at    timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Enforce at most one row (singleton config table).
create unique index if not exists profile_singleton_idx on public.profile ((true));

drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at
  before update on public.profile
  for each row
  execute function public.set_updated_at();

alter table public.profile enable row level security;

drop policy if exists "profile_allow_all" on public.profile;
create policy "profile_allow_all"
  on public.profile
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Storage bucket for CV/resume files. Public bucket, matching this app's
-- single-user permissive-RLS posture (see README security note).
insert into storage.buckets (id, name, public)
values ('cv-uploads', 'cv-uploads', true)
on conflict (id) do nothing;

drop policy if exists "cv_uploads_allow_all" on storage.objects;
create policy "cv_uploads_allow_all"
  on storage.objects
  for all
  to anon, authenticated
  using (bucket_id = 'cv-uploads')
  with check (bucket_id = 'cv-uploads');
