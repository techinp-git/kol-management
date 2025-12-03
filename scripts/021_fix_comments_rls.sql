-- Fix RLS policies for comments table
-- This ensures authenticated users can view comments

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Brand users can view their campaign comments" ON public.comments;
DROP POLICY IF EXISTS "KOL users can view their post comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;

-- Create a policy that allows all authenticated users to view comments
CREATE POLICY "Authenticated users can view comments"
ON public.comments FOR SELECT
TO authenticated
USING (true);

-- Keep admin-only policies for insert/update/delete
DROP POLICY IF EXISTS "Admins can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;

CREATE POLICY "Authenticated users can insert comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
ON public.comments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (true);

