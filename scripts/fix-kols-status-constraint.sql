-- Fix KOLs status check constraint
-- Add 'draft' and 'ban' status values to match code usage
-- Run this in Supabase Dashboard > SQL Editor

-- ==========================================
-- UPDATE KOLS STATUS CONSTRAINT
-- ==========================================

-- Drop the old constraint
ALTER TABLE public.kols 
DROP CONSTRAINT IF EXISTS kols_status_check;

-- Add new constraint with additional status values
ALTER TABLE public.kols 
ADD CONSTRAINT kols_status_check 
CHECK (status IN ('active', 'inactive', 'blacklisted', 'draft', 'ban'));

-- Update default value if needed (optional)
-- ALTER TABLE public.kols ALTER COLUMN status SET DEFAULT 'active';

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.kols'::regclass
  AND conname = 'kols_status_check';

-- Test the constraint (should work now)
-- INSERT INTO public.kols (name, status) VALUES ('Test KOL', 'draft');
-- INSERT INTO public.kols (name, status) VALUES ('Test KOL 2', 'ban');

