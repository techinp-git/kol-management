-- ==================================================
-- COMPLETE SETUP FOR ACCOUNT_CHANNELS
-- แก้ไขให้ account_channels ใช้งานได้ครบทุกอย่าง
-- ==================================================

-- ==========================================
-- 1. สร้าง Table (ถ้ายังไม่มี)
-- ==========================================
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

-- ==========================================
-- 2. ลบ Policies เก่าทั้งหมด
-- ==========================================
DO $$ 
BEGIN
  -- Drop all existing policies for account_channels
  DROP POLICY IF EXISTS "Admins can view account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Admins can insert account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Admins can update account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Admins can delete account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can view account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can insert account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can update account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can delete account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Users can view account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Users can insert account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Users can update account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Users can delete account channels" ON public.account_channels;
  
  RAISE NOTICE 'All old policies dropped successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- ==========================================
-- 3. Enable RLS
-- ==========================================
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. สร้าง Policies ใหม่ (อนุญาตให้ authenticated users ทำได้ทุกอย่าง)
-- ==========================================

-- SELECT Policy
CREATE POLICY "Authenticated users can view account channels"
  ON public.account_channels 
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT Policy
CREATE POLICY "Authenticated users can insert account channels"
  ON public.account_channels 
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE Policy
CREATE POLICY "Authenticated users can update account channels"
  ON public.account_channels 
  FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE Policy
CREATE POLICY "Authenticated users can delete account channels"
  ON public.account_channels 
  FOR DELETE
  TO authenticated
  USING (true);

-- ==========================================
-- 5. สร้าง Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_account_channels_account_id 
  ON public.account_channels(account_id);

CREATE INDEX IF NOT EXISTS idx_account_channels_type 
  ON public.account_channels(channel_type);

CREATE INDEX IF NOT EXISTS idx_account_channels_status 
  ON public.account_channels(status);

CREATE INDEX IF NOT EXISTS idx_account_channels_follower_history 
  ON public.account_channels USING GIN (follower_history);

-- ==========================================
-- 6. ตรวจสอบผลลัพธ์
-- ==========================================

-- แสดง Table info
SELECT 
  'account_channels table created' AS status,
  COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'account_channels';

-- แสดง Policies
SELECT 
  'Policies created' AS status,
  policyname,
  cmd AS command
FROM pg_policies 
WHERE tablename = 'account_channels'
ORDER BY cmd;

-- แสดง Indexes
SELECT 
  'Indexes created' AS status,
  indexname
FROM pg_indexes 
WHERE tablename = 'account_channels'
  AND schemaname = 'public';

-- ==========================================
-- Success Message
-- ==========================================
DO $$ 
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'ACCOUNT_CHANNELS SETUP COMPLETE!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Table: account_channels - READY';
  RAISE NOTICE 'RLS: ENABLED';
  RAISE NOTICE 'Policies: 4 policies created (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE 'Indexes: 4 indexes created';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '  - INSERT account channels';
  RAISE NOTICE '  - UPDATE account channels';
  RAISE NOTICE '  - DELETE account channels';
  RAISE NOTICE '  - SELECT account channels';
  RAISE NOTICE '';
  RAISE NOTICE 'Test it by creating a new account with social channels!';
  RAISE NOTICE '==================================================';
END $$;

