-- Add post_name column to posts table if it doesn't exist
-- This fixes the error: Could not find the 'post_name' column of 'posts' in the schema cache

-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'posts' 
      AND column_name = 'post_name'
  ) THEN
    ALTER TABLE public.posts 
      ADD COLUMN post_name TEXT;
    
    COMMENT ON COLUMN public.posts.post_name IS 'Post name/title';
    
    RAISE NOTICE 'Column post_name added successfully';
  ELSE
    RAISE NOTICE 'Column post_name already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
  AND column_name = 'post_name';

