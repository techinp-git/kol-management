# Account Social Channels Setup

## ปัญหา
ช่องทางโซเชียลมีเดีย save ไม่ได้ และตอน edit ก็หายไป

## สาเหตุ
ยังไม่มี `account_channels` table ในฐานข้อมูล

## วิธีแก้ไข

### 1. รัน SQL Script
รัน SQL script นี้ใน Supabase Dashboard > SQL Editor:

**ไฟล์**: `scripts/009_create_account_channels.sql`

```sql
-- Account Social Channels table
-- Stores social media channels for accounts (brands/clients)

CREATE TABLE IF NOT EXISTS public.account_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL, -- 'Instagram', 'Facebook', 'TikTok', 'YouTube', 'Twitter', 'LINE', etc.
  handle TEXT NOT NULL,
  profile_url TEXT,
  follower_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  follower_history JSONB DEFAULT '[]'::jsonb, -- Array of follower history: [{"date": "YYYY-MM-DD", "follower_count": number, "change": number}, ...]
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

-- Add comment
COMMENT ON COLUMN public.account_channels.follower_history IS 'Array of follower history entries: [{"date": "YYYY-MM-DD", "follower_count": number, "change": number}, ...]';
```

### 2. ตรวจสอบผลลัพธ์
- ควรเห็น message: "Success. No rows returned"
- หรือ "Success" ถ้าสำเร็จ

### 3. ทดสอบ
1. กลับไปที่หน้า `/dashboard/accounts`
2. คลิก "เพิ่มบัญชี" หรือ ✏️ edit
3. เพิ่มช่องทางโซเชียล:
   - คลิก "เพิ่มช่องทาง"
   - กรอก: channel_type, handle, profile_url, follower_count
4. บันทึก
5. ตรวจสอบว่าช่องทางถูกบันทึก
6. แก้ไข account อีกครั้ง
7. ตรวจสอบว่าช่องทางยังแสดงอยู่

---

## โครงสร้าง Table

### Table: account_channels
```sql
- id: uuid (PK)
- account_id: uuid (FK → accounts.id)
- channel_type: text (Instagram, Facebook, TikTok, etc.)
- handle: text
- profile_url: text
- follower_count: integer
- verified: boolean
- status: text ('active', 'inactive')
- follower_history: jsonb [{date, follower_count, change}]
- notes: text
- created_at: timestamptz
- updated_at: timestamptz
```

---

## API Endpoints

### POST /api/accounts
**Input:**
```json
{
  "name": "Account Name",
  "social_channels": [
    {
      "channel_type": "Instagram",
      "handle": "ig_handle",
      "profile_url": "https://...",
      "follower_count": 1000,
      "verified": false
    }
  ]
}
```

**Output:**
```json
{
  "id": "uuid",
  "name": "Account Name",
  ...
}
```

---

### PATCH /api/accounts/[id]
**Input:**
```json
{
  "name": "Updated Name",
  "social_channels": [
    {
      "id": "existing-uuid",
      "channel_type": "Instagram",
      "handle": "updated_handle",
      "follower_count": 1500
    },
    {
      "channel_type": "Facebook",
      "handle": "new_fb_handle",
      "follower_count": 500
    }
  ]
}
```

**Logic:**
1. ลบ channels ทั้งหมดของ account นี้
2. เพิ่ม channels ใหม่ทั้งหมด

---

## Features

### ✅ สร้าง Account
- เพิ่มช่องทางโซเชียลใน form
- บันทึก → Insert account ก่อน → Insert channels

### ✅ แก้ไข Account
- โหลดช่องทางโซเชียลจาก database
- แก้ไข/เพิ่ม/ลบช่องทาง
- บันทึก → Update account → Delete old channels → Insert new channels

### ✅ แสดงผล
- หน้า detail page แสดงช่องทางโซเชียล
- หน้า list page แสดงช่องทางโซเชียล (ถ้าเพิ่ม)

---

## Troubleshooting

### ❌ Error: "relation 'account_channels' does not exist"
**แก้ไข:**
- รัน SQL script `scripts/009_create_account_channels.sql`

### ❌ ช่องทางหายไปตอน edit
**แก้ไข:**
- ตรวจสอบว่า account_channels table ถูกสร้างแล้วหรือยัง
- ตรวจสอบว่า API ดึง account_channels มาแล้วหรือยัง
- ตรวจสอบว่า edit form โหลด account_channels แล้วหรือยัง

### ❌ Save ไม่ได้
**แก้ไข:**
- ตรวจสอบ RLS policies
- ตรวจสอบ Console logs
- ตรวจสอบว่า table ถูกสร้างแล้วหรือยัง

---

## สรุป

**ต้องทำ:**
1. ✅ รัน SQL script `scripts/009_create_account_channels.sql`
2. ✅ ทดสอบสร้าง account พร้อมช่องทาง
3. ✅ ทดสอบแก้ไข account และช่องทาง

**หลังรัน SQL แล้ว:**
- ✅ สามารถบันทึกช่องทางโซเชียลได้
- ✅ ช่องทางจะไม่หายไปตอน edit
- ✅ สามารถเพิ่ม/แก้ไข/ลบช่องทางได้

**พร้อมใช้งาน** ✅

