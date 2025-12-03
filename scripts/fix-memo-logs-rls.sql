-- Fix RLS policies for memo_logs table to allow authenticated users to insert/view memos

-- Enable RLS
ALTER TABLE public.memo_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can view all memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Authenticated users can insert memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Authenticated users can update their memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Users can view all memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Users can insert memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Users can update their memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Admins can view all memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Brand users can view memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Admins can manage memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Brand users can manage memo logs" ON public.memo_logs;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view all memo logs"
  ON public.memo_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert memo logs"
  ON public.memo_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update memo logs"
  ON public.memo_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete memo logs"
  ON public.memo_logs
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'memo_logs'
ORDER BY policyname;

-- Check if table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memo_logs'
ORDER BY ordinal_position;

