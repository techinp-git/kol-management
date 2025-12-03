-- Add Post Name and Remark columns to posts table

-- Add post_name column if it doesn't exist
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS post_name TEXT;

-- Add remark column if it doesn't exist (or use notes column if remark should be the same as notes)
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS remark TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN public.posts.post_name IS 'Post name/title';
COMMENT ON COLUMN public.posts.remark IS 'Remarks/notes about the post';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
  AND column_name IN ('post_name', 'remark', 'notes')
ORDER BY column_name;

