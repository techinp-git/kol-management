# แก้ไขปัญหา Account Channels Save ไม่ได้

## ปัญหา
ช่องทางโซเชียลมีเดีย save insert/update ไม่ได้

## สาเหตุที่อาจเป็นไปได้

### 1. Table ยังไม่ถูกสร้าง
- `account_channels` table ยังไม่ถูกสร้างในฐานข้อมูล

### 2. RLS Policy ไม่ถูกต้อง
- RLS policies จำกัดสิทธิ์เกินไป
- Authenticated users ไม่สามารถ insert/update ได้

## วิธีแก้ไข

### ขั้นตอนที่ 1: สร้าง Table (ถ้ายังไม่มี)

**รัน SQL Script นี้ใน Supabase Dashboard > SQL Editor:**

**ไฟล์**: `scripts/009_create_account_channels.sql`

```sql
-- Account Social Channels table
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

-- Enable RLS
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_account_channels_account_id ON public.account_channels(account_id);
CREATE INDEX IF NOT EXISTS idx_account_channels_type ON public.account_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_account_channels_status ON public.account_channels(status);
CREATE INDEX IF NOT EXISTS idx_account_channels_follower_history ON public.account_channels USING GIN (follower_history);
```

### ขั้นตอนที่ 2: แก้ไข RLS Policies (ถ้า Table มีแล้ว)

**รัน SQL Script นี้ใน Supabase Dashboard > SQL Editor:**

**ไฟล์**: `scripts/fix-account-channels-rls.sql`

```sql
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
```

---

## ตรวจสอบปัญหา

### 1. ตรวจสอบว่า Table ถูกสร้างหรือยัง

**รัน SQL นี้ใน Supabase Dashboard:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'account_channels';
```

**ผลลัพธ์:**
- ถ้ามี row → Table ถูกสร้างแล้ว ✅
- ถ้าไม่มี row → ต้องรัน `scripts/009_create_account_channels.sql` ❌

### 2. ตรวจสอบ RLS Policies

**รัน SQL นี้ใน Supabase Dashboard:**

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'account_channels';
```

**ผลลัพธ์:**
- ควรมี 4 policies:
  1. `Authenticated users can view account channels` (SELECT)
  2. `Authenticated users can insert account channels` (INSERT)
  3. `Authenticated users can update account channels` (UPDATE)
  4. `Authenticated users can delete account channels` (DELETE)

### 3. ตรวจสอบ Console Logs

**เปิด Browser Console หรือ Terminal:**
- ดู error messages ที่ขึ้นมา
- ตรวจสอบ error code:
  - `42P01` = Table not found
  - `42501` = RLS policy violation
  - `42703` = Column not found

---

## Error Messages ที่พบบ่อย

### Error: "relation 'account_channels' does not exist"
**แก้ไข:**
- รัน `scripts/009_create_account_channels.sql`

### Error: "new row violates row-level security policy"
**แก้ไข:**
- รัน `scripts/fix-account-channels-rls.sql`

### Error: "duplicate key value violates unique constraint"
**แก้ไข:**
- อาจมี channel ที่ซ้ำกัน (account_id + channel_type + handle)
- ลบ channel เก่าที่ซ้ำกันก่อน

---

## ทดสอบ

### 1. สร้าง Account พร้อม Social Channels
1. ไปที่ `/dashboard/accounts`
2. คลิก "เพิ่มบัญชี"
3. เพิ่มช่องทางโซเชียล:
   - Channel Type: Instagram
   - Handle: test_handle
   - Profile URL: https://instagram.com/test_handle
   - Follower Count: 1000
4. บันทึก
5. ตรวจสอบ Console logs:
   - ควรเห็น: `[v0] Social channels created successfully`
   - ไม่ควรเห็น error

### 2. แก้ไข Account และ Social Channels
1. เปิดหน้า edit account
2. ตรวจสอบว่าช่องทางโซเชียลแสดงอยู่
3. แก้ไข/เพิ่ม/ลบช่องทาง
4. บันทึก
5. ตรวจสอบ Console logs:
   - ควรเห็น: `[v0] Social channels updated successfully`
   - ไม่ควรเห็น error

### 3. ตรวจสอบใน Database
**รัน SQL นี้:**

```sql
SELECT * FROM account_channels ORDER BY created_at DESC LIMIT 10;
```

**ผลลัพธ์:**
- ควรเห็น channels ที่บันทึกไว้

---

## สรุป

**ต้องทำ:**
1. ✅ รัน `scripts/009_create_account_channels.sql` (ถ้ายังไม่มี table)
2. ✅ รัน `scripts/fix-account-channels-rls.sql` (ถ้ามี RLS error)
3. ✅ ทดสอบสร้าง account พร้อม social channels
4. ✅ ทดสอบแก้ไข account และ social channels

**หลังแก้ไขแล้ว:**
- ✅ สามารถบันทึกช่องทางโซเชียลได้
- ✅ สามารถแก้ไขช่องทางโซเชียลได้
- ✅ ช่องทางไม่หายไปตอน edit

---

## Quick Fix

**ถ้าต้องการแก้ไขทั้ง table และ RLS ในครั้งเดียว:**

รัน SQL นี้ใน Supabase Dashboard:

```sql
-- Create table (if not exists)
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

-- Drop old policies
DROP POLICY IF EXISTS "Admins can view account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Admins can insert account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Admins can update account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Admins can delete account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Authenticated users can view account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Authenticated users can insert account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Authenticated users can update account channels" ON public.account_channels;
DROP POLICY IF EXISTS "Authenticated users can delete account channels" ON public.account_channels;

-- Enable RLS
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Authenticated users can view account channels"
  ON public.account_channels FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert account channels"
  ON public.account_channels FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update account channels"
  ON public.account_channels FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete account channels"
  ON public.account_channels FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_account_channels_account_id ON public.account_channels(account_id);
CREATE INDEX IF NOT EXISTS idx_account_channels_type ON public.account_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_account_channels_status ON public.account_channels(status);
CREATE INDEX IF NOT EXISTS idx_account_channels_follower_history ON public.account_channels USING GIN (follower_history);
```

**พร้อมใช้งาน** ✅

