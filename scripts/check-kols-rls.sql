-- Check KOLs RLS policies
-- Run this in Supabase Dashboard > SQL Editor to verify RLS policies

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'kols';

-- List all policies for kols table
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
WHERE schemaname = 'public' 
  AND tablename = 'kols'
ORDER BY policyname;

-- Test query (should work if authenticated)
-- SELECT * FROM public.kols LIMIT 1;

