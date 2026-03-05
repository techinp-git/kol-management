# แก้ไข Account Channels ให้ Insert/Edit ได้

## ปัญหา
account_channels ยัง insert/edit ไม่ได้

## วิธีแก้ไข (รันครั้งเดียวเสร็จ)

### ขั้นตอนที่ 1: ไปที่ Supabase Dashboard
1. เปิด [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)

### ขั้นตอนที่ 2: รัน SQL Script
Copy และ paste SQL script นี้ลงใน SQL Editor แล้วกด **Run**:

**ไฟล์**: `scripts/SETUP_ACCOUNT_CHANNELS_COMPLETE.sql`

```sql
-- ==================================================
-- COMPLETE SETUP FOR ACCOUNT_CHANNELS
-- ==================================================

-- 1. สร้าง Table
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

-- 2. ลบ Policies เก่า
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Admins can insert account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Admins can update account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Admins can delete account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can view account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can insert account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can update account channels" ON public.account_channels;
  DROP POLICY IF EXISTS "Authenticated users can delete account channels" ON public.account_channels;
END $$;

-- 3. Enable RLS
ALTER TABLE public.account_channels ENABLE ROW LEVEL SECURITY;

-- 4. สร้าง Policies ใหม่
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
```

### ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์
หลังจากรัน SQL แล้ว ควรเห็น:
- ✅ "Success. No rows returned" หรือ
- ✅ ตารางแสดงผลลัพธ์ (policies, indexes)

---

## ตรวจสอบว่าทำงานหรือยัง

### 1. ตรวจสอบ Table
รัน SQL นี้:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'account_channels';
```
**ผลลัพธ์:** ควรเห็น 1 row ที่แสดง `account_channels`

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
- `Authenticated users can insert account channels` (INSERT)
- `Authenticated users can view account channels` (SELECT)
- `Authenticated users can update account channels` (UPDATE)

### 3. ตรวจสอบ Indexes
รัน SQL นี้:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'account_channels'
  AND schemaname = 'public';
```
**ผลลัพธ์:** ควรเห็น 5 rows (4 indexes + 1 primary key)

---

## ทดสอบ

### 1. สร้าง Account พร้อม Social Channels
1. ไปที่ `http://localhost:3000/dashboard/accounts`
2. คลิก **"เพิ่มบัญชี"**
3. กรอกข้อมูล Account:
   - ชื่อบัญชี: `Test Account`
   - อื่นๆ (optional)
4. เพิ่มช่องทางโซเชียล:
   - **ประเภทช่องทาง**: Instagram
   - **Handle**: `test_instagram`
   - **Profile URL**: `https://instagram.com/test_instagram`
   - **จำนวนผู้ติดตาม**: `10000`
   - คลิก **"เพิ่มช่องทาง"**
5. คลิก **"บันทึก"**

**ผลลัพธ์ที่คาดหวัง:**
- ✅ บันทึกสำเร็จ ไม่มี error
- ✅ redirect ไปหน้า accounts list
- ✅ ดู Console logs ควรเห็น: `[v0] Social channels created successfully`

### 2. แก้ไข Account และ Social Channels
1. คลิก **✏️ แก้ไข** ที่ account ที่สร้างไว้
2. ตรวจสอบว่าช่องทางโซเชียลแสดงอยู่
3. แก้ไข follower count เป็น `15000`
4. เพิ่มช่องทางใหม่:
   - **ประเภทช่องทาง**: Facebook
   - **Handle**: `test_facebook`
   - **Profile URL**: `https://facebook.com/test_facebook`
   - **จำนวนผู้ติดตาม**: `20000`
   - คลิก **"เพิ่มช่องทาง"**
5. คลิก **"บันทึก"**

**ผลลัพธ์ที่คาดหวัง:**
- ✅ บันทึกสำเร็จ
- ✅ ช่องทางโซเชียลทั้งหมดถูกบันทึก
- ✅ ดู Console logs ควรเห็น: `[v0] Social channels updated successfully`

### 3. ตรวจสอบใน Database
รัน SQL นี้:
```sql
SELECT 
  ac.id,
  a.name AS account_name,
  ac.channel_type,
  ac.handle,
  ac.follower_count,
  ac.created_at
FROM account_channels ac
JOIN accounts a ON ac.account_id = a.id
ORDER BY ac.created_at DESC
LIMIT 10;
```

**ผลลัพธ์ที่คาดหวัง:**
- เห็น channels ที่เพิ่งสร้าง
- เห็น Instagram และ Facebook channels

---

## Troubleshooting

### Error: "relation 'account_channels' does not exist"
**แก้ไข:**
- รัน SQL script อีกครั้ง
- ตรวจสอบว่ารันใน project ที่ถูกต้อง

### Error: "new row violates row-level security policy"
**แก้ไข:**
- รัน SQL script อีกครั้ง (เพื่อลบ policies เก่าและสร้างใหม่)
- ตรวจสอบว่า user ที่ login เป็น authenticated user

### Error: "duplicate key value violates unique constraint"
**แก้ไข:**
- มี channel ซ้ำกัน (account_id + channel_type + handle)
- ลบ channel เก่าก่อน หรือใช้ handle ที่ต่างกัน

### ช่องทางยังไม่แสดงตอน edit
**แก้ไข:**
- ตรวจสอบว่า insert สำเร็จหรือไม่ (ดู Console logs)
- ตรวจสอบใน database ว่ามีข้อมูลหรือไม่

---

## สรุป

**ต้องทำ:**
1. ✅ รัน SQL script: `scripts/SETUP_ACCOUNT_CHANNELS_COMPLETE.sql`
2. ✅ ทดสอบสร้าง account พร้อม social channels
3. ✅ ทดสอบแก้ไข account และ social channels

**หลังแก้ไขแล้ว:**
- ✅ สามารถบันทึกช่องทางโซเชียลได้
- ✅ สามารถแก้ไขช่องทางโซเชียลได้
- ✅ สามารถลบช่องทางโซเชียลได้
- ✅ ช่องทางไม่หายไปตอน edit

---

## Quick Check

**ก่อนทดสอบ:**
```sql
-- ตรวจสอบว่า setup เสร็จหรือยัง
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'account_channels') AS table_exists,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE tablename = 'account_channels') AS policy_count,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE tablename = 'account_channels' AND schemaname = 'public') AS index_count;
```

**ผลลัพธ์ที่ถูกต้อง:**
- `table_exists`: 1
- `policy_count`: 4
- `index_count`: 5

---

## พร้อมใช้งาน ✅

หลังจากรัน SQL script แล้ว:
1. Refresh browser (Ctrl+Shift+R หรือ Cmd+Shift+R)
2. ทดสอบสร้าง account พร้อม social channels
3. ทดสอบแก้ไข และลบ social channels

**เสร็จแล้ว!** 🎉

