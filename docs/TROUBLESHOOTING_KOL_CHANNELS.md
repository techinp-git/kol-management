# Troubleshooting: บันทึกช่องทางโซเชียลไม่ได้

## ปัญหา
ช่องทางโซเชียลมีเดีย (kol_channels) บันทึกไม่ได้ ทั้ง Insert และ Edit

## สาเหตุที่เป็นไปได้

### 1. ❌ ยังไม่มี `follower_history` column
**อาการ:**
- Error: `column "follower_history" does not exist`
- Error code: `42703`

**แก้ไข:**
รัน SQL script เพื่อเพิ่ม column:

```sql
-- Add follower_history column
ALTER TABLE public.kol_channels 
ADD COLUMN IF NOT EXISTS follower_history JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.kol_channels.follower_history IS 
  'Array of follower history entries: [{"date": "YYYY-MM-DD", "follower_count": number}, ...]';

-- Create index
CREATE INDEX IF NOT EXISTS idx_kol_channels_follower_history 
ON public.kol_channels USING GIN (follower_history);
```

**หมายเหตุ:**
- ระบบมี fallback แล้ว → ถ้าไม่มี column จะบันทึกได้โดยไม่เก็บ history
- แต่แนะนำให้รัน SQL เพื่อให้ระบบทำงานเต็มรูปแบบ

---

### 2. ❌ RLS (Row Level Security) Policies ไม่ถูกต้อง
**อาการ:**
- KOL บันทึกได้ แต่ channels ไม่ถูกบันทึก
- ไม่มี error แสดง

**แก้ไข:**
ตรวจสอบและแก้ไข RLS policies:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Authenticated users can delete channels" ON public.kol_channels;

-- Create new policies
CREATE POLICY "Authenticated users can insert channels"
  ON public.kol_channels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update channels"
  ON public.kol_channels FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete channels"
  ON public.kol_channels FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can select channels"
  ON public.kol_channels FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

---

### 3. ❌ Data validation error
**อาการ:**
- Error: `invalid input value for enum channel_type`
- channel_type ไม่ตรงกับ enum

**แก้ไข:**
ตรวจสอบ channel_type ที่ส่งไป ต้องเป็นหนึ่งใน:
- `facebook`
- `instagram`
- `tiktok`
- `youtube`
- `twitter`
- `line`
- `other`

---

### 4. ❌ Empty channels array
**อาการ:**
- KOL บันทึกได้ แต่ไม่มี channels

**ตรวจสอบ:**
1. เปิด Browser Console (F12)
2. ดู logs:
   ```
   [v0] Submitting KOL with channels: [...]
   [v0] Payload: {...}
   ```
3. ตรวจสอบว่า `channels` array มีข้อมูลหรือไม่

---

## วิธีดีบัก (Debug)

### 1. เปิด Browser Console
กด F12 หรือ Cmd+Option+I (Mac) → ไปที่ tab Console

### 2. ทดสอบสร้าง KOL
1. ไปที่ `/dashboard/kols/new`
2. กรอกข้อมูล KOL
3. คลิก "เพิ่มช่องทาง"
4. กรอกข้อมูล channel
5. บันทึก
6. ดู Console logs:

**Frontend logs:**
```
[v0] Submitting KOL with channels: 1 channels
[v0] Payload: {
  "name": "Test KOL",
  "channels": [
    {
      "channel_type": "instagram",
      "handle": "test",
      "follower_count": 1000,
      ...
    }
  ]
}
```

**Backend logs (Terminal):**
```
[v0] KOL created successfully with ID: xxx
[v0] Inserting channels: 1 channels
[v0] Channels to insert: [...]
[v0] Channels created successfully
```

---

### 3. ตรวจสอบฐานข้อมูล
```sql
-- ตรวจสอบว่า KOL ถูกสร้างหรือยัง
SELECT * FROM kols ORDER BY created_at DESC LIMIT 1;

-- ตรวจสอบว่า channels ถูกสร้างหรือยัง
SELECT * FROM kol_channels WHERE kol_id = 'xxx';

-- ตรวจสอบ follower_history
SELECT id, channel_type, handle, follower_history 
FROM kol_channels 
WHERE kol_id = 'xxx';
```

---

## ตัวอย่าง Error และวิธีแก้

### Error 1: Column does not exist
```
Error: column "follower_history" does not exist
Code: 42703
```

**แก้ไข:**
- รัน SQL script เพื่อเพิ่ม column
- หรือ ระบบจะ fallback บันทึกโดยไม่เก็บ history

---

### Error 2: Row Level Security
```
Error: new row violates row-level security policy
```

**แก้ไข:**
- แก้ไข RLS policies (ดูด้านบน)
- หรือ ปิด RLS ชั่วคราว:
  ```sql
  ALTER TABLE kol_channels DISABLE ROW LEVEL SECURITY;
  ```

---

### Error 3: Foreign key constraint
```
Error: insert or update on table "kol_channels" violates foreign key constraint
```

**แก้ไข:**
- ตรวจสอบว่า `kol_id` ถูกส่งไปถูกต้องหรือไม่
- ตรวจสอบว่า KOL ถูกสร้างก่อนหรือยัง

---

## Checklist การแก้ไข

### ✅ ขั้นตอนที่ 1: รัน SQL Script
```sql
ALTER TABLE public.kol_channels 
ADD COLUMN IF NOT EXISTS follower_history JSONB DEFAULT '[]'::jsonb;
```

### ✅ ขั้นตอนที่ 2: แก้ไข RLS Policies
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can insert channels" ON public.kol_channels;
-- Create new policies
CREATE POLICY "Authenticated users can insert channels"
  ON public.kol_channels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### ✅ ขั้นตอนที่ 3: ทดสอบ
1. เปิด Browser Console
2. สร้าง KOL ใหม่พร้อมช่องทาง
3. ดู Console logs
4. ตรวจสอบฐานข้อมูล

---

## API Endpoints

### POST /api/kols (สร้าง KOL)
**Input:**
```json
{
  "name": "KOL Name",
  "handle": "@handle",
  "channels": [
    {
      "channel_type": "instagram",
      "handle": "ig_handle",
      "follower_count": 1000,
      "history": [
        { "date": "2024-01-30", "follower_count": 1000 }
      ]
    }
  ]
}
```

**Output (Success):**
```json
{
  "id": "uuid",
  "name": "KOL Name",
  ...
}
```

**Output (Error):**
```json
{
  "error": "Failed to create channels: ...",
  "kol_id": "uuid"
}
```

---

### PATCH /api/kols/[id] (แก้ไข KOL)
**Input:**
```json
{
  "name": "Updated Name",
  "channels": [
    {
      "id": "existing-uuid",
      "channel_type": "instagram",
      "handle": "updated_handle",
      "follower_count": 1500
    },
    {
      "channel_type": "facebook",
      "handle": "new_fb_handle",
      "follower_count": 500
    }
  ]
}
```

---

## สรุป

**ปัญหาส่วนใหญ่:**
1. ❌ ยังไม่มี `follower_history` column → รัน SQL
2. ❌ RLS policies ไม่ถูกต้อง → แก้ไข policies
3. ❌ Data validation error → ตรวจสอบข้อมูล

**วิธีแก้:**
1. ✅ รัน SQL script เพื่อเพิ่ม column
2. ✅ แก้ไข RLS policies
3. ✅ ดู Console logs เพื่อหาสาเหตุ
4. ✅ ตรวจสอบฐานข้อมูล

**ระบบมี Fallback:**
- ถ้าไม่มี `follower_history` column → จะบันทึกโดยไม่เก็บ history
- แสดง error ใน Console และ UI
- ไม่ให้ทั้งระบบล่ม

**พร้อมใช้งาน** ✅

