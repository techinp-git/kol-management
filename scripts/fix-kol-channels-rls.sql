-- Fix RLS policies for kol_channels table
-- This allows authenticated users to create channels when creating KOLs

-- ==========================================
-- KOL_CHANNELS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all channels" ON kol_channels;
DROP POLICY IF EXISTS "KOL users can view their own channels" ON kol_channels;
DROP POLICY IF EXISTS "Brand users can view active channels" ON kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON kol_channels;
DROP POLICY IF EXISTS "KOL users can update their own channels" ON kol_channels;

CREATE POLICY "Authenticated users can view kol channels"
ON kol_channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert kol channels"
ON kol_channels FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update kol channels"
ON kol_channels FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete kol channels"
ON kol_channels FOR DELETE
TO authenticated
USING (true);

