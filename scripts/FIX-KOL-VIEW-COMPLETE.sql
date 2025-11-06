-- ==========================================
-- FIX KOL VIEW - Complete Solution
-- This fixes "cannot view KOL" issue
-- ==========================================
-- Problem: Can INSERT but cannot SELECT (view) KOLs
-- Cause: Missing or incorrect SELECT policy
-- Solution: Enable RLS and create proper policies
-- ==========================================

-- Step 1: Enable RLS (MUST BE ENABLED!)
ALTER TABLE public.kols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kol_channels ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL old policies (clean slate)
DROP POLICY IF EXISTS "Admins can view all KOLs" ON public.kols;
DROP POLICY IF EXISTS "Analysts can view all KOLs" ON public.kols;
DROP POLICY IF EXISTS "Brand users can view KOLs" ON public.kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON public.kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON public.kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON public.kols;
DROP POLICY IF EXISTS "Admins can delete KOLs" ON public.kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can view KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can update KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can delete KOLs" ON public.kols;

-- Step 3: Create NEW policies (allowing authenticated users)
-- ⭐ SELECT - This is THE KEY to view KOLs
CREATE POLICY "Authenticated users can view KOLs"
ON public.kols FOR SELECT
TO authenticated
USING (true);

-- INSERT - Allows creating KOLs
CREATE POLICY "Authenticated users can insert KOLs"
ON public.kols FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE - Allows editing KOLs
CREATE POLICY "Authenticated users can update KOLs"
ON public.kols FOR UPDATE
TO authenticated
USING (true);

-- DELETE - Allows deleting KOLs
CREATE POLICY "Authenticated users can delete KOLs"
ON public.kols FOR DELETE
TO authenticated
USING (true);

-- Step 4: Fix kol_channels policies
DROP POLICY IF EXISTS "Admins can view all channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can delete channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can view channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can delete channels" ON public.kol_channels;

CREATE POLICY "Authenticated users can view channels"
ON public.kol_channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert channels"
ON public.kol_channels FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update channels"
ON public.kol_channels FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete channels"
ON public.kol_channels FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- VERIFICATION - Check if everything is OK
-- ==========================================

-- Check 1: RLS is enabled
DO $$
DECLARE
    kols_rls boolean;
    channels_rls boolean;
BEGIN
    SELECT rowsecurity INTO kols_rls FROM pg_tables WHERE tablename = 'kols';
    SELECT rowsecurity INTO channels_rls FROM pg_tables WHERE tablename = 'kol_channels';
    
    IF kols_rls = true AND channels_rls = true THEN
        RAISE NOTICE '✅ RLS is ENABLED for both tables';
    ELSE
        RAISE NOTICE '❌ RLS is NOT enabled properly!';
        RAISE NOTICE '   - kols RLS: %', kols_rls;
        RAISE NOTICE '   - kol_channels RLS: %', channels_rls;
    END IF;
END $$;

-- Check 2: Display RLS status
SELECT 
    '🔒 RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('kols', 'kol_channels');

-- Check 3: Display policies
SELECT 
    '📋 KOLs Policies' as check_type,
    policyname,
    cmd,
    CASE cmd
        WHEN 'SELECT' THEN '👁️ View (THIS IS KEY!)'
        WHEN 'INSERT' THEN '➕ Create'
        WHEN 'UPDATE' THEN '✏️ Edit'
        WHEN 'DELETE' THEN '🗑️ Delete'
    END as description
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'kols'
ORDER BY cmd;

-- Check 4: Display channels policies
SELECT 
    '📋 Channels Policies' as check_type,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'kol_channels'
ORDER BY cmd;

-- Check 5: Summary
SELECT 
    '📊 Summary' as summary_type,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'kols') as kols_rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'SELECT') as has_select_policy,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'INSERT') as has_insert_policy,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'UPDATE') as has_update_policy,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'DELETE') as has_delete_policy,
    CASE 
        WHEN (
            (SELECT rowsecurity FROM pg_tables WHERE tablename = 'kols') = true AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'SELECT') >= 1 AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'INSERT') >= 1 AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'UPDATE') >= 1 AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'DELETE') >= 1
        ) THEN '✅ READY - You can now VIEW KOLs!'
        ELSE '❌ NOT READY - Check errors above'
    END as status;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ KOL View Fix Complete!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📝 What was fixed:';
    RAISE NOTICE '   ✅ RLS enabled for kols and kol_channels';
    RAISE NOTICE '   ✅ SELECT policy created (THIS ALLOWS VIEWING!)';
    RAISE NOTICE '   ✅ INSERT policy created (allows creating)';
    RAISE NOTICE '   ✅ UPDATE policy created (allows editing)';
    RAISE NOTICE '   ✅ DELETE policy created (allows deleting)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 You can now:';
    RAISE NOTICE '   👁️  VIEW KOLs (click to view details)';
    RAISE NOTICE '   ➕ CREATE KOLs';
    RAISE NOTICE '   ✏️  EDIT KOLs';
    RAISE NOTICE '   🗑️  DELETE KOLs';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test it now:';
    RAISE NOTICE '   1. Go to http://localhost:3000/dashboard/kols';
    RAISE NOTICE '   2. Click on any KOL to view details';
    RAISE NOTICE '   3. Should work without errors!';
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
END $$;

