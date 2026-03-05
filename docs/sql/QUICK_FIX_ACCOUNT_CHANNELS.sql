-- ==================================================
-- QUICK FIX FOR ACCOUNT_CHANNELS
-- แก้ไขให้ save account_channels ได้ทันที
-- ==================================================

-- 1. สร้าง Table (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS public.account_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  handle TEXT NOT NULL,
  profile_url TEXT,
  follower_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  follower_history JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, channel_type, handle)
);

-- 2. ลบ Policies เก่าทั้งหมด (ถ้ามี)
DO $$ 
DECLARE
  policy_name TEXT;
BEGIN
  -- ลบ policies ทั้งหมดของ account_channels
  FOR policy_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'account_channels'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.account_channels', policy_name);
  END LOOP;
END $$;

-- 3. Enable RLS
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- 4. สร้าง Policies ใหม่ (อนุญาตให้ authenticated users ทำได้ทุกอย่าง)
CREATE POLICY "Authenticated users can view account channels"
  ON public.account_channels FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert account channels"
  ON public.account_channels FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update account channels"
  ON public.account_channels FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete account channels"
  ON public.account_channels FOR DELETE TO authenticated USING (true);

-- 5. สร้าง Indexes
CREATE INDEX IF NOT EXISTS idx_account_channels_account_id ON public.account_channels(account_id);
CREATE INDEX IF NOT EXISTS idx_account_channels_type ON public.account_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_account_channels_status ON public.account_channels(status);
CREATE INDEX IF NOT EXISTS idx_account_channels_follower_history ON public.account_channels USING GIN (follower_history);

-- 6. ตรวจสอบผลลัพธ์
SELECT 
  '✅ Table exists' AS check_result,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'account_channels') AS table_count
UNION ALL
SELECT 
  '✅ Policies created' AS check_result,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'account_channels') AS policy_count
UNION ALL
SELECT 
  '✅ Indexes created' AS check_result,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE tablename = 'account_channels' AND schemaname = 'public') AS index_count;

-- 7. แสดง Policies ที่สร้างไว้
SELECT 
  policyname AS "Policy Name",
  cmd AS "Command",
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ View'
    WHEN cmd = 'INSERT' THEN '✅ Insert'
    WHEN cmd = 'UPDATE' THEN '✅ Update'
    WHEN cmd = 'DELETE' THEN '✅ Delete'
  END AS "Status"
FROM pg_policies 
WHERE tablename = 'account_channels'
ORDER BY cmd;

