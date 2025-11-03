-- Fix infinite recursion in RLS policies
-- The issue is that policies are checking user roles by querying the profiles table,
-- which creates a circular dependency

-- First, let's create a helper function to get user role from JWT
-- This avoids querying the profiles table in policies
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'analyst'
  )::text;
$$;

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Recreate profiles policies without circular references
-- Users can always view their own profile (no role check needed)
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (no role check needed)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (using JWT role)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can update all profiles (using JWT role)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can insert profiles (using JWT role)
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() = 'admin');

-- Now fix other tables that might have similar issues
-- Drop and recreate KOLs policies
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON kols;

-- Recreate KOLs policies using JWT role
CREATE POLICY "Admins can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all KOLs"
ON kols FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view active KOLs"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand' 
  AND status = 'active'
);

CREATE POLICY "KOL users can view their own profile"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "KOL users can update their own profile"
ON kols FOR UPDATE
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

-- Fix accounts policies
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON accounts;

CREATE POLICY "Admins can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all accounts"
ON accounts FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their own account"
ON accounts FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON campaigns;

CREATE POLICY "Admins can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their account campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND project_id IN (
    SELECT id FROM projects 
    WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  )
);

-- Add a comment explaining the fix
COMMENT ON FUNCTION auth.user_role() IS 
'Returns the user role from JWT metadata to avoid circular references in RLS policies. This prevents infinite recursion when policies need to check user roles.';
