ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS post_intention TEXT;

CREATE INDEX IF NOT EXISTS idx_comments_post_intention ON public.comments(post_intention);

COMMENT ON COLUMN public.comments.post_intention IS 'Post intention/intent from imported comments';

