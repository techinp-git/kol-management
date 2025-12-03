-- Fix RLS policies for posts and post_metrics tables to allow authenticated users to perform CRUD operations

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for posts
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Brand users can view their campaign posts" ON public.posts;
DROP POLICY IF EXISTS "KOL users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "KOL users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;

-- Create new permissive policies for posts
CREATE POLICY "Authenticated users can view all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing policies for post_metrics
DROP POLICY IF EXISTS "Admins can view all metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Brand users can view their campaign metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "KOL users can view their own metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Admins can insert metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Admins can update metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Authenticated users can view all metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Authenticated users can update metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Authenticated users can delete metrics" ON public.post_metrics;

-- Create new permissive policies for post_metrics
CREATE POLICY "Authenticated users can view all metrics"
  ON public.post_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert metrics"
  ON public.post_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update metrics"
  ON public.post_metrics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete metrics"
  ON public.post_metrics
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('posts', 'post_metrics')
ORDER BY tablename, policyname;

