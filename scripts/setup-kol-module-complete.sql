-- ==========================================
-- SETUP KOL MODULE COMPLETE
-- This script sets up all necessary configurations for KOL module
-- to work with Supabase (INSERT, UPDATE, DELETE, SELECT)
-- 
-- Run this in Supabase Dashboard > SQL Editor
-- ==========================================

-- ==========================================
-- STEP 1: FIX STATUS CONSTRAINT
-- ==========================================

-- Drop the old constraint
ALTER TABLE public.kols 
DROP CONSTRAINT IF EXISTS kols_status_check;

-- Add new constraint with all status values
ALTER TABLE public.kols 
ADD CONSTRAINT kols_status_check 
CHECK (status IN ('active', 'inactive', 'blacklisted', 'draft', 'ban'));

-- ==========================================
-- STEP 2: FIX RLS POLICIES
-- ==========================================

-- ลบ policies เดิมทั้งหมด
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

-- สร้าง policies ใหม่ - ให้ทุกคนที่ login แล้วทำได้หมด
CREATE POLICY "Authenticated users can view KOLs"
ON public.kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON public.kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update KOLs"
ON public.kols FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete KOLs"
ON public.kols FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- STEP 3: FIX KOL_CHANNELS RLS POLICIES (ถ้ามี)
-- ==========================================

-- ลบ policies เดิมของ kol_channels
DROP POLICY IF EXISTS "Admins can view all channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can delete channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can view channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can delete channels" ON public.kol_channels;

-- สร้าง policies ใหม่สำหรับ kol_channels
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
-- VERIFICATION
-- ==========================================

-- Check status constraint
SELECT 
    '✅ Status Constraint' as check_item,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.kols'::regclass
  AND conname = 'kols_status_check';

-- Check KOLs RLS policies
SELECT 
    '✅ KOLs RLS Policies' as check_item,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '👁️ View'
        WHEN cmd = 'INSERT' THEN '➕ Create'
        WHEN cmd = 'UPDATE' THEN '✏️ Edit'
        WHEN cmd = 'DELETE' THEN '🗑️ Delete'
    END as action
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'kols'
ORDER BY cmd;

-- Check KOL_CHANNELS RLS policies
SELECT 
    '✅ Channels RLS Policies' as check_item,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '👁️ View'
        WHEN cmd = 'INSERT' THEN '➕ Create'
        WHEN cmd = 'UPDATE' THEN '✏️ Edit'
        WHEN cmd = 'DELETE' THEN '🗑️ Delete'
    END as action
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'kol_channels'
ORDER BY cmd;

-- Summary
SELECT 
    '📊 Summary' as summary_type,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'SELECT') as kols_select,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'INSERT') as kols_insert,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'UPDATE') as kols_update,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'DELETE') as kols_delete,
    (SELECT COUNT(*) FROM pg_constraint 
     WHERE conrelid = 'public.kols'::regclass 
       AND conname = 'kols_status_check') as status_constraint,
    CASE 
        WHEN (
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'SELECT') >= 1 AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'INSERT') >= 1 AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'UPDATE') >= 1 AND
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'DELETE') >= 1 AND
            (SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'public.kols'::regclass AND conname = 'kols_status_check') >= 1
        ) THEN '✅ READY'
        ELSE '❌ NEEDS ATTENTION'
    END as status;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ KOL Module Setup Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 What was configured:';
    RAISE NOTICE '   1. Status constraint: active, inactive, blacklisted, draft, ban';
    RAISE NOTICE '   2. RLS policies for kols table: SELECT, INSERT, UPDATE, DELETE';
    RAISE NOTICE '   3. RLS policies for kol_channels table: SELECT, INSERT, UPDATE, DELETE';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 You can now:';
    RAISE NOTICE '   ➕ Create KOLs';
    RAISE NOTICE '   ✏️ Edit KOLs';
    RAISE NOTICE '   🗑️ Delete KOLs';
    RAISE NOTICE '   👁️ View KOLs';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test it:';
    RAISE NOTICE '   1. Go to http://localhost:3000/dashboard/kols/new';
    RAISE NOTICE '   2. Create a test KOL';
    RAISE NOTICE '   3. View, edit, and delete it';
    RAISE NOTICE '';
    RAISE NOTICE '📚 Documentation:';
    RAISE NOTICE '   - See KOL_MODULE_CHECKLIST.md for testing checklist';
    RAISE NOTICE '   - See TROUBLESHOOTING.md for common issues';
END $$;

