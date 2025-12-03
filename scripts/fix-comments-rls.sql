-- Fix Row Level Security policies for comments, comment_tags, and tags

-- Ensure RLS is enabled
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on comments
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Brand users can view their campaign comments" ON public.comments;
DROP POLICY IF EXISTS "KOL users can view their post comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON public.comments;

-- Create permissive policies for comments
CREATE POLICY "Authenticated users can view comments"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing policies on comment_tags
DROP POLICY IF EXISTS "Users can view comment tags" ON public.comment_tags;
DROP POLICY IF EXISTS "Admins and analysts can insert comment tags" ON public.comment_tags;
DROP POLICY IF EXISTS "Admins and analysts can delete comment tags" ON public.comment_tags;

-- Create permissive policies for comment_tags
CREATE POLICY "Authenticated users can view comment tags"
  ON public.comment_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comment tags"
  ON public.comment_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comment tags"
  ON public.comment_tags
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing policies on tags
DROP POLICY IF EXISTS "Everyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can view tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can update tags" ON public.tags;

-- Create permissive policies for tags
CREATE POLICY "Authenticated users can view tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
  ON public.tags
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


