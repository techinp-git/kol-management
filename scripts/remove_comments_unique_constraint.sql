-- Remove UNIQUE constraint on (external_comment_id, post_id) from comments table
-- This allows duplicate external_comment_id for the same post
-- Import comments can be inserted multiple times without constraint violation

-- Drop the unique constraint
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_external_comment_id_post_id_key;

-- Verify the constraint is removed
-- You can check with: \d comments in psql to see remaining constraints
