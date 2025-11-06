-- Fix KOLs RLS policies to allow authenticated users to insert
-- This script fixes the "new row violates row-level security policy" error
-- Run this in Supabase Dashboard > SQL Editor

-- ==========================================
-- KOLS TABLE RLS FIX
-- ==========================================

-- ลบ policies เดิมที่มีข้อจำกัด
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
-- VERIFICATION
-- ==========================================

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'kols'
ORDER BY policyname;

