-- Fix RLS policies for campaigns table to allow authenticated users to perform CRUD operations

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_kols ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON public.campaigns;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view all campaigns"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaigns"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing policies for campaign_kols
DROP POLICY IF EXISTS "Admins can view all campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Brand users can view their campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "KOL users can view their own campaign assignments" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can insert campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can update campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Authenticated users can view all campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Authenticated users can insert campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Authenticated users can update campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Authenticated users can delete campaign KOLs" ON public.campaign_kols;

-- Create new permissive policies for campaign_kols
CREATE POLICY "Authenticated users can view all campaign KOLs"
  ON public.campaign_kols
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaign KOLs"
  ON public.campaign_kols
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign KOLs"
  ON public.campaign_kols
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign KOLs"
  ON public.campaign_kols
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('campaigns', 'campaign_kols')
ORDER BY tablename, policyname;

