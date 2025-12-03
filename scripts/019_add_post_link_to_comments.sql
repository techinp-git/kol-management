ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS post_link TEXT;

CREATE INDEX IF NOT EXISTS idx_comments_post_link ON public.comments(post_link);

COMMENT ON COLUMN public.comments.post_link IS 'Normalized post link reference for imported comments';

