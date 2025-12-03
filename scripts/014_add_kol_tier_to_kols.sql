-- 014_add_kol_tier_to_kols.sql
-- Add kol_tier column to kols table for categorising influencer tiers

alter table if exists public.kols
  add column if not exists kol_tier text;

create index if not exists idx_kols_kol_tier on public.kols(kol_tier);

