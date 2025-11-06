-- Quick fix for KOLs RLS: Allow authenticated users to insert
-- Run this in Supabase Dashboard > SQL Editor

DROP POLICY IF EXISTS "Admins can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can insert KOLs" ON public.kols;

CREATE POLICY "Authenticated users can insert KOLs"
ON public.kols FOR INSERT
TO authenticated
WITH CHECK (true);

