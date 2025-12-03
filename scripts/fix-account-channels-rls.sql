-- Fix RLS policies for account_channels table
-- Allow authenticated users to perform all CRUD operations

-- Drop old restrictive policies (if any)
DROP POLICY IF EXISTS "Admins can view account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Admins can insert account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Admins can update account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Admins can delete account channels" ON public.account_channels;

-- Enable RLS
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view account channels"
  ON public.account_channels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert account channels"
  ON public.account_channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update account channels"
  ON public.account_channels FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete account channels"
  ON public.account_channels FOR DELETE
  TO authenticated
  USING (true);

