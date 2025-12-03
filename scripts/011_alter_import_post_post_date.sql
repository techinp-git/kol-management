-- 011_alter_import_post_post_date.sql
-- Ensure import_post.post_date uses DATE type (no time component)

begin;

alter table if exists public.import_post
  alter column post_date type date using cast(post_date as date);

commit;

