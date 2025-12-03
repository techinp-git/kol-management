-- Add campaign_name column to import_post table
ALTER TABLE public.import_post
  ADD COLUMN IF NOT EXISTS campaign_name TEXT;

CREATE INDEX IF NOT EXISTS idx_import_post_campaign_name ON public.import_post(campaign_name);
