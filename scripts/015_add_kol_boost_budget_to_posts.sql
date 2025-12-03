-- Add kol_boost_budget column to posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS kol_boost_budget NUMERIC(14,2);

CREATE INDEX IF NOT EXISTS idx_posts_kol_boost_budget ON public.posts(kol_boost_budget);
