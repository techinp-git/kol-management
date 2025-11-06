-- Verify KOL Module - INSERT/UPDATE/DELETE
-- Run this in Supabase Dashboard > SQL Editor

-- ==========================================
-- 1. CHECK RLS POLICIES
-- ==========================================

SELECT 
    'RLS Policies Check' as check_type,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN 'View KOLs'
        WHEN cmd = 'INSERT' THEN 'Create KOLs'
        WHEN cmd = 'UPDATE' THEN 'Edit KOLs'
        WHEN cmd = 'DELETE' THEN 'Remove KOLs'
        ELSE cmd
    END as description
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'kols'
ORDER BY cmd;

-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ==========================================
-- 2. CHECK STATUS CONSTRAINT
-- ==========================================

SELECT 
    'Status Constraint Check' as check_type,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.kols'::regclass
  AND conname = 'kols_status_check';

-- Expected: CHECK (status IN ('active', 'inactive', 'blacklisted', 'draft', 'ban'))

-- ==========================================
-- 3. CHECK TABLE STRUCTURE
-- ==========================================

SELECT 
    'Table Structure Check' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'kols'
ORDER BY ordinal_position;

-- ==========================================
-- 4. CHECK FOREIGN KEY (kol_channels)
-- ==========================================

SELECT 
    'Foreign Key Check' as check_type,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'kol_channels'
  AND kcu.column_name = 'kol_id';

-- Expected: kol_channels.kol_id -> kols.id

-- ==========================================
-- 5. TEST INSERT (Dry Run)
-- ==========================================

-- This will show if INSERT would work (without actually inserting)
-- Note: This requires authentication in actual use

-- SELECT 
--     'Test INSERT' as test_type,
--     'Would insert: { name: "Test KOL", status: "active" }' as test_data
-- WHERE EXISTS (
--     SELECT 1 FROM pg_policies 
--     WHERE tablename = 'kols' 
--       AND cmd = 'INSERT' 
--       AND policyname LIKE '%insert%'
-- );

-- ==========================================
-- 6. VERIFICATION SUMMARY
-- ==========================================

SELECT 
    'Verification Summary' as summary_type,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'SELECT') as select_policy_exists,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'INSERT') as insert_policy_exists,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'UPDATE') as update_policy_exists,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'DELETE') as delete_policy_exists,
    (SELECT COUNT(*) FROM pg_constraint 
     WHERE conrelid = 'public.kols'::regclass 
       AND conname = 'kols_status_check') as status_constraint_exists;

-- Expected: All should be 1 (or more)

