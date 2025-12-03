-- Remove UNIQUE constraint on (external_post_id, kol_channel_id) from posts table
-- This allows duplicate external_post_id for the same KOL channel
-- Import will only check for duplicate URLs instead

-- Drop the unique constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_external_post_id_kol_channel_id_key;

-- Verify the constraint is removed
-- You can check with: \d posts in psql to see remaining constraints
