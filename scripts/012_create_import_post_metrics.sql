-- 012_create_import_post_metrics.sql
-- Table to store imported post metrics batches

create extension if not exists "uuid-ossp";

create table if not exists public.import_post_metrics (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  post_link text,
  update_post date,
  impression_organic numeric,
  impression_boost_post numeric,
  reach_organic numeric,
  reach_boost_post numeric,
  engage_likes numeric,
  engange_comments numeric,
  engage_shares numeric,
  engage_save numeric,
  post_click numeric,
  link_click numeric,
  retweet numeric,
  vdo_view numeric,
  flag_use boolean default false,
  import_date timestamptz default timezone('utc', now()),
  status text default 'queued',
  error_message text,
  raw_payload jsonb,
  created_by uuid references auth.users (id),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.import_post_metrics enable row level security;

create index if not exists import_post_metrics_file_name_idx on public.import_post_metrics (file_name);
create index if not exists import_post_metrics_import_date_idx on public.import_post_metrics (import_date desc);
create index if not exists import_post_metrics_created_by_idx on public.import_post_metrics (created_by);

drop policy if exists "Import post metrics select" on public.import_post_metrics;
create policy "Import post metrics select" on public.import_post_metrics
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Import post metrics insert" on public.import_post_metrics;
create policy "Import post metrics insert" on public.import_post_metrics
  for insert
  with check (auth.role() = 'authenticated' and created_by = auth.uid());

drop policy if exists "Import post metrics update" on public.import_post_metrics;
create policy "Import post metrics update" on public.import_post_metrics
  for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Import post metrics delete" on public.import_post_metrics;
create policy "Import post metrics delete" on public.import_post_metrics
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
    create trigger set_import_post_metrics_updated_at
    before update on public.import_post_metrics
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

