-- Add missing columns to post_metrics table for detailed statistics
-- This script adds columns for organic/boost impressions and reach, clicks, and retweets

-- Add columns to post_metrics table
ALTER TABLE public.post_metrics 
  ADD COLUMN IF NOT EXISTS impressions_organic INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impressions_boost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_organic INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_boost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS link_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retweets INTEGER DEFAULT 0;

-- Add boost_budget to posts table (optional, for tracking boost budget per post)
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS boost_budget DECIMAL(15, 2) DEFAULT 0;

-- Add comments to document the new columns
COMMENT ON COLUMN public.post_metrics.impressions_organic IS 'Organic impressions (not boosted)';
COMMENT ON COLUMN public.post_metrics.impressions_boost IS 'Boosted impressions (paid promotion)';
COMMENT ON COLUMN public.post_metrics.reach_organic IS 'Organic reach (not boosted)';
COMMENT ON COLUMN public.post_metrics.reach_boost IS 'Boosted reach (paid promotion)';
COMMENT ON COLUMN public.post_metrics.post_clicks IS 'Number of clicks on the post';
COMMENT ON COLUMN public.post_metrics.link_clicks IS 'Number of clicks on links in the post';
COMMENT ON COLUMN public.post_metrics.retweets IS 'Number of retweets (for Twitter/X)';
COMMENT ON COLUMN public.posts.boost_budget IS 'Budget spent on boosting this post';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'post_metrics'
  AND column_name IN (
    'impressions_organic',
    'impressions_boost',
    'reach_organic',
    'reach_boost',
    'post_clicks',
    'link_clicks',
    'retweets'
  )
ORDER BY column_name;

