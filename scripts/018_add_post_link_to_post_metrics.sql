ALTER TABLE public.post_metrics
  ADD COLUMN IF NOT EXISTS post_link TEXT;

CREATE INDEX IF NOT EXISTS idx_post_metrics_post_link ON public.post_metrics(post_link);

COMMENT ON COLUMN public.post_metrics.post_link IS 'Normalized post link for reference and auditing';

