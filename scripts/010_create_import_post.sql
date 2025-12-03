-- 010_create_import_post.sql
-- Table to store imported post information batches

-- Ensure extension for UUID if not already enabled
create extension if not exists "uuid-ossp";

create table if not exists public.import_post (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  kol_name text,
  post_name text,
  kol_category text,
  post_note text,
  post_type text,
  content_type text,
  platform text,
  kol_tier text,
  follower integer,
  kol_boost_budget numeric(14,2),
  boost_budget numeric(14,2),
  post_link text,
  post_date timestamptz,
  flag_use boolean default false,
  import_date timestamptz default timezone('utc', now()),
  status text default 'processed',
  error_message text,
  raw_payload jsonb,
  created_by uuid references auth.users (id),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.import_post enable row level security;

create index if not exists import_post_file_name_idx on public.import_post (file_name);
create index if not exists import_post_import_date_idx on public.import_post (import_date desc);
create index if not exists import_post_created_by_idx on public.import_post (created_by);

drop policy if exists "Import post select" on public.import_post;
create policy "Import post select" on public.import_post
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Import post insert" on public.import_post;
create policy "Import post insert" on public.import_post
  for insert
  with check (auth.role() = 'authenticated' and created_by = auth.uid());

drop policy if exists "Import post update" on public.import_post;
create policy "Import post update" on public.import_post
  for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Import post delete" on public.import_post;
create policy "Import post delete" on public.import_post
  for delete
  using (auth.uid() = created_by);

do $$
begin
  if exists (
    select 1
    from pg_proc
    where proname = 'set_updated_at'
      and pg_catalog.pg_function_is_visible(oid)
  ) then
    create trigger set_import_post_updated_at
    before update on public.import_post
    for each row
    execute function public.set_updated_at();
  end if;
end $$;
-- Create table to store raw Post Information imports
create extension if not exists "pgcrypto";

create table if not exists public.import_post (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  kol_name text,
  post_name text,
  kol_category text,
  post_note text,
  post_type text,
  content_type text,
  platform text,
  kol_tier text,
  follower numeric,
  kol_boost_budget numeric,
  boost_budget numeric,
  post_link text,
  post_date date,
  flag_use boolean not null default false,
  import_date timestamptz not null default now(),
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_import_post_file_name on public.import_post (file_name);
create index if not exists idx_import_post_import_date on public.import_post (import_date desc);

create or replace function public.set_import_post_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_import_post_updated_at on public.import_post;
create trigger trg_import_post_updated_at
before update on public.import_post
for each row
execute function public.set_import_post_updated_at();

alter table public.import_post enable row level security;

drop policy if exists "Authenticated users can manage import_post" on public.import_post;
create policy "Authenticated users can manage import_post"
  on public.import_post
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

