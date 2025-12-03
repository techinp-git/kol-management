-- Add follower_history column to kol_channels table
-- This stores historical follower count data per channel
-- Run this in Supabase Dashboard > SQL Editor

-- Add follower_history column (JSONB to store array of history entries)
ALTER TABLE public.kol_channels 
ADD COLUMN IF NOT EXISTS follower_history JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN public.kol_channels.follower_history IS 'Array of follower history entries: [{"date": "YYYY-MM-DD", "follower_count": number}, ...]';

-- Create index for better query performance (if needed)
CREATE INDEX IF NOT EXISTS idx_kol_channels_follower_history 
ON public.kol_channels USING GIN (follower_history);

-- Example of how to query history:
-- SELECT follower_history 
-- FROM kol_channels 
-- WHERE id = 'channel-id';
--
-- Example of how to add history entry:
-- UPDATE kol_channels 
-- SET follower_history = follower_history || '{"date": "2024-01-30", "follower_count": 1000}'::jsonb
-- WHERE id = 'channel-id';

