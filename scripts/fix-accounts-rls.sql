-- Fix RLS policies for accounts table
-- Allow authenticated users to perform all CRUD operations

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON public.accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view accounts"
  ON public.accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert accounts"
  ON public.accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
  ON public.accounts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete accounts"
  ON public.accounts FOR DELETE
  TO authenticated
  USING (true);

