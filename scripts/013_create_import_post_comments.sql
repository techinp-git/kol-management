-- 013_create_import_post_comments.sql
-- Table to store imported post comments batches

create extension if not exists "uuid-ossp";

create table if not exists public.import_post_comments (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  post_link text,
  update_post date,
  kol_post_detail text,
  post_intention text,
  post_message text,
  sentiment text,
  tags text[],
  flag_use boolean default false,
  import_date timestamptz default timezone('utc', now()),
  status text default 'queued',
  error_message text,
  raw_payload jsonb,
  created_by uuid references auth.users (id),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.import_post_comments enable row level security;

create index if not exists import_post_comments_file_name_idx on public.import_post_comments (file_name);
create index if not exists import_post_comments_import_date_idx on public.import_post_comments (import_date desc);
create index if not exists import_post_comments_created_by_idx on public.import_post_comments (created_by);

drop policy if exists "Import post comments select" on public.import_post_comments;
create policy "Import post comments select" on public.import_post_comments
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Import post comments insert" on public.import_post_comments;
create policy "Import post comments insert" on public.import_post_comments
  for insert
  with check (auth.role() = 'authenticated' and created_by = auth.uid());

drop policy if exists "Import post comments update" on public.import_post_comments;
create policy "Import post comments update" on public.import_post_comments
  for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Import post comments delete" on public.import_post_comments;
create policy "Import post comments delete" on public.import_post_comments
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
    create trigger set_import_post_comments_updated_at
    before update on public.import_post_comments
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

