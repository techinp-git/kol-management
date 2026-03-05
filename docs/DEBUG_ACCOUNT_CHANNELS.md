# แก้ปัญหา Account Channels Save ไม่ได้

## สาเหตุที่เป็นไปได้

### 1. Table ยังไม่ถูกสร้าง
- `account_channels` table ยังไม่มีใน database

### 2. RLS Policies ไม่ถูกต้อง
- Policies จำกัดสิทธิ์เกินไป
- ไม่มี INSERT policy สำหรับ authenticated users

### 3. Data validation error
- ข้อมูลที่ส่งไปไม่ครบหรือผิดรูปแบบ

---

## วิธีแก้ไข (รันครั้งเดียว)

### ขั้นตอนที่ 1: ไปที่ Supabase Dashboard
1. เปิด [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor**

### ขั้นตอนที่ 2: รัน SQL Script

**Copy และ paste SQL นี้ลงใน SQL Editor แล้วกด Run:**

```sql
-- สร้าง Table
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

-- ลบ Policies เก่า
DO $$ 
DECLARE
  policy_name TEXT;
BEGIN
  FOR policy_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'account_channels'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.account_channels', policy_name);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- สร้าง Policies ใหม่
CREATE POLICY "Authenticated users can view account channels"
  ON public.account_channels FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert account channels"
  ON public.account_channels FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update account channels"
  ON public.account_channels FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete account channels"
  ON public.account_channels FOR DELETE TO authenticated USING (true);

-- สร้าง Indexes
CREATE INDEX IF NOT EXISTS idx_account_channels_account_id ON public.account_channels(account_id);
CREATE INDEX IF NOT EXISTS idx_account_channels_type ON public.account_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_account_channels_status ON public.account_channels(status);
CREATE INDEX IF NOT EXISTS idx_account_channels_follower_history ON public.account_channels USING GIN (follower_history);
```

**หรือใช้ไฟล์**: `QUICK_FIX_ACCOUNT_CHANNELS.sql`

---

## ตรวจสอบว่าสำเร็จ

### 1. ตรวจสอบ Table
รัน SQL นี้:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'account_channels';
```
**ผลลัพธ์:** ควรเห็น 1 row

### 2. ตรวจสอบ Policies
รัน SQL นี้:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'account_channels'
ORDER BY cmd;
```
**ผลลัพธ์:** ควรเห็น 4 rows:
- `Authenticated users can delete account channels` (DELETE)
- `Authenticated users can insert account channels` (INSERT) ← **สำคัญ!**
- `Authenticated users can view account channels` (SELECT)
- `Authenticated users can update account channels` (UPDATE)

### 3. ตรวจสอบ RLS
รัน SQL นี้:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'account_channels' 
  AND schemaname = 'public';
```
**ผลลัพธ์:** ควรเห็น `rowsecurity = true`

---

## Debug: ดู Console Logs

### 1. เปิด Browser Console
1. กด `F12` หรือ `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. ไปที่ tab **Console**

### 2. เปิด Terminal (ดู Server Logs)
ดู logs ใน terminal ที่รัน `pnpm dev`

### 3. ดู Error Messages

**ถ้า error: "relation 'account_channels' does not exist"**
- → Table ยังไม่ถูกสร้าง
- → รัน SQL script อีกครั้ง

**ถ้า error: "new row violates row-level security policy"**
- → RLS policy ไม่ถูกต้อง
- → รัน SQL script อีกครั้ง (เพื่อลบ policies เก่าและสร้างใหม่)

**ถ้า error: "duplicate key value violates unique constraint"**
- → มี channel ซ้ำกัน (account_id + channel_type + handle)
- → ใช้ handle ที่ต่างกัน

---

## ทดสอบ

### 1. สร้าง Account พร้อม Social Channels
1. ไปที่ `http://localhost:3000/dashboard/accounts`
2. คลิก **"เพิ่มบัญชี"**
3. กรอกข้อมูล:
   - ชื่อบัญชี: `Test Account`
4. เพิ่มช่องทาง:
   - **Channel Type**: Instagram
   - **Handle**: `test_handle`
   - **Profile URL**: `https://instagram.com/test_handle`
   - **Follower Count**: `10000`
   - คลิก **"เพิ่มช่องทาง"**
5. คลิก **"บันทึก"**

### 2. ดู Console Logs
**Browser Console:**
```
[v0] Saving account with social channels: {...}
```

**Terminal/Server Logs:**
```
[v0] Inserting social channels: 1 channels
[v0] Channels to insert: [...]
[v0] Social channels created successfully  ← ควรเห็นข้อความนี้
```

### 3. ตรวจสอบใน Database
รัน SQL นี้:
```sql
SELECT * FROM account_channels 
ORDER BY created_at DESC 
LIMIT 5;
```

**ผลลัพธ์:** ควรเห็น channel ที่เพิ่งสร้าง

---

## ถ้ายังไม่ได้

### 1. ตรวจสอบว่า user login หรือยัง
- ต้องเป็น authenticated user
- ตรวจสอบว่า login อยู่หรือไม่

### 2. ตรวจสอบว่า account_id ถูกต้องหรือไม่
- ดู Console logs: `[v0] Channels to insert:`
- ตรวจสอบว่า `account_id` มีค่า (UUID)

### 3. ตรวจสอบ data format
- `channel_type`: ต้องเป็น string (เช่น "Instagram", "Facebook")
- `handle`: ต้องเป็น string (เช่น "test_handle")
- `follower_count`: ต้องเป็น number (เช่น 10000)

---

## Quick Test

### ทดสอบ INSERT โดยตรงใน Supabase
รัน SQL นี้:
```sql
-- ตรวจสอบว่า INSERT ได้หรือไม่
INSERT INTO account_channels (
  account_id,
  channel_type,
  handle,
  follower_count
) VALUES (
  (SELECT id FROM accounts LIMIT 1),  -- ใช้ account ที่มีอยู่
  'Instagram',
  'test_handle',
  10000
) RETURNING *;
```

**ผลลัพธ์:**
- ถ้า INSERT สำเร็จ → Table และ Policies ถูกต้อง ✅
- ถ้า error → ดู error message และแก้ไข

---

## สรุป

**ต้องทำ:**
1. ✅ รัน SQL script: `QUICK_FIX_ACCOUNT_CHANNELS.sql`
2. ✅ ตรวจสอบว่า table และ policies ถูกสร้างแล้ว
3. ✅ ทดสอบสร้าง account พร้อม social channels
4. ✅ ดู Console logs เพื่อ debug

**หลังแก้ไขแล้ว:**
- ✅ บันทึก social channels ได้
- ✅ แก้ไข social channels ได้
- ✅ ลบ social channels ได้

---

## ไฟล์ที่เกี่ยวข้อง

- **`QUICK_FIX_ACCOUNT_CHANNELS.sql`** - SQL script สำหรับแก้ไข
- **`SETUP_ACCOUNT_CHANNELS_COMPLETE.sql`** - SQL script แบบละเอียด
- **`DEBUG_ACCOUNT_CHANNELS.md`** - เอกสารนี้

**รัน SQL script แล้วทดสอบเลย!** 🚀

