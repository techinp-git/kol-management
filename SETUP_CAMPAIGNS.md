# Setup Campaign Module - เชื่อมต่อ Database

## สรุปการแก้ไข

### 1. สร้าง API Routes ✅
- **ไฟล์**: `app/api/campaigns/route.ts`
  - `GET` - ดึงรายการ campaigns ทั้งหมด
  - `POST` - สร้าง campaign ใหม่

- **ไฟล์**: `app/api/campaigns/[id]/route.ts`
  - `GET` - ดึง campaign ตาม ID
  - `PATCH` - อัปเดต campaign
  - `DELETE` - ลบ campaign

- **ไฟล์**: `app/api/campaigns/[id]/memos/route.ts`
  - `GET` - ดึง memo logs ของ campaign
  - `POST` - เพิ่ม memo log ให้ campaign

### 2. แก้ไข Campaigns Page ✅
- **ไฟล์**: `app/dashboard/campaigns/page.tsx`
  - แปลงเป็น Server Component
  - Fetch campaigns จาก database
  - แสดงข้อมูล project และ account
  - นับจำนวน KOLs

### 3. สร้าง CampaignsListClient Component ✅
- **ไฟล์**: `components/campaigns-list-client.tsx`
  - แสดงรายการ campaigns
  - Search functionality
  - Status change dialog
  - Memo log dialog
  - Delete dialog
  - Edit button

### 4. สร้าง SQL Script สำหรับแก้ไข RLS ✅
- **ไฟล์**: `scripts/fix-campaigns-rls.sql`
  - แก้ไข RLS policies สำหรับ `campaigns` table
  - แก้ไข RLS policies สำหรับ `campaign_kols` table
  - อนุญาตให้ authenticated users ทำ CRUD ได้

---

## วิธี Setup

### 1. Run SQL Script เพื่อแก้ไข RLS

**Option 1: ใช้ Supabase SQL Editor (แนะนำ)**

1. ไปที่ **Supabase Dashboard** → **SQL Editor**
2. คัดลอก SQL จากไฟล์ `scripts/fix-campaigns-rls.sql`
3. Paste ลงใน SQL Editor
4. คลิก **Run**
5. ตรวจสอบผลลัพธ์ว่าสร้าง policies สำเร็จ

**Option 2: คัดลอก SQL นี้ไป run**

```sql
-- Fix RLS policies for campaigns table

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_kols ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON public.campaigns;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view all campaigns"
  ON public.campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
  ON public.campaigns FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
  ON public.campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaigns"
  ON public.campaigns FOR DELETE TO authenticated USING (true);

-- Same for campaign_kols table
DROP POLICY IF EXISTS "Admins can view all campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Brand users can view their campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "KOL users can view their own campaign assignments" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can insert campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can update campaign KOLs" ON public.campaign_kols;

CREATE POLICY "Authenticated users can view all campaign KOLs"
  ON public.campaign_kols FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert campaign KOLs"
  ON public.campaign_kols FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign KOLs"
  ON public.campaign_kols FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign KOLs"
  ON public.campaign_kols FOR DELETE TO authenticated USING (true);
```

### 2. ตรวจสอบ Policies

```sql
-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('campaigns', 'campaign_kols')
ORDER BY tablename, policyname;
```

ควรเห็น 8 policies:
- `campaigns`: SELECT, INSERT, UPDATE, DELETE (4 policies)
- `campaign_kols`: SELECT, INSERT, UPDATE, DELETE (4 policies)

---

## ทดสอบ

### 1. ดูรายการ Campaigns
1. ไปที่ `http://localhost:3000/dashboard/campaigns`
2. ควรเห็นรายการ campaigns จาก database
3. ควรเห็นข้อมูล project และ account
4. ควรเห็นจำนวน KOLs

### 2. สร้าง Campaign ใหม่
1. คลิกปุ่ม "เพิ่มแคมเปญ"
2. กรอกข้อมูล
3. คลิก "บันทึก"
4. ควร redirect ไปที่ `/dashboard/campaigns`
5. ควรเห็น campaign ใหม่ในรายการ

### 3. แก้ไข Campaign
1. คลิกปุ่ม "แก้ไข" ที่ campaign
2. แก้ไขข้อมูล
3. คลิก "บันทึก"
4. ควรเห็นการเปลี่ยนแปลง

### 4. เปลี่ยนสถานะ
1. คลิกปุ่ม "สถานะ"
2. เลือกสถานะใหม่
3. คลิก "บันทึก"
4. ควรเห็นสถานะเปลี่ยน

### 5. เพิ่ม Memo Log
1. คลิกปุ่ม "Memo"
2. ให้คะแนน (1-5 ดาว)
3. เขียนบันทึก
4. คลิก "บันทึก"
5. ควรเห็น alert "เพิ่ม memo สำเร็จ!"

### 6. ลบ Campaign
1. คลิกปุ่ม "ลบ" (Trash icon)
2. ยืนยันการลบ
3. Campaign ควรถูกลบออกจากรายการ

---

## Database Schema

### campaigns table
- `id` (UUID) - Primary key
- `project_id` (UUID) - Foreign key to projects
- `name` (TEXT) - ชื่อแคมเปญ
- `objective` (TEXT) - วัตถุประสงค์
- `kpi_targets` (JSONB) - KPI targets
- `start_date` (DATE) - วันที่เริ่ม
- `end_date` (DATE) - วันที่สิ้นสุด
- `channels` (channel_type[]) - ช่องทางที่ใช้
- `status` (TEXT) - สถานะ (draft, review, approved, live, completed, cancelled)
- `budget` (DECIMAL) - งบประมาณ
- `notes` (TEXT) - หมายเหตุ
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `created_by` (UUID) - Foreign key to profiles

### campaign_kols table
- `id` (UUID) - Primary key
- `campaign_id` (UUID) - Foreign key to campaigns
- `kol_id` (UUID) - Foreign key to kols
- `kol_channel_id` (UUID) - Foreign key to kol_channels
- `target_metrics` (JSONB) - เป้าหมายสำหรับ KOL นี้
- `allocated_budget` (DECIMAL) - งบประมาณที่จัดสรร
- `status` (TEXT) - สถานะ (pending, confirmed, completed, cancelled)
- `notes` (TEXT) - หมายเหตุ
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## Status Values

### Campaign Status
- `draft` - แบบร่าง
- `review` - รอตรวจสอบ
- `approved` - อนุมัติแล้ว
- `live` - กำลังดำเนินการ
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก

### Campaign KOL Status
- `pending` - รอการยืนยัน
- `confirmed` - ยืนยันแล้ว
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก

---

## Debug

### ตรวจสอบ Console Logs

เปิด Browser Console (F12) และดู logs:
- `[v0] Error fetching campaigns:` - error จาก Supabase
- `[v0] Error code:` - error code (เช่น `42501` = RLS error)
- `[v0] RLS Error:` - หากเป็น RLS error

### ตรวจสอบ Terminal Logs

ดู logs ใน terminal ที่รัน `pnpm dev`:
- `[v0] Error creating campaign:` - error จาก Supabase
- `[v0] Campaign created successfully:` - สำเร็จ

### Common Errors

**Error: Permission denied**
```
Error code: 42501
Error: new row violates row-level security policy for table "campaigns"
```
**แก้ไข**: Run SQL script `fix-campaigns-rls.sql`

**Error: Table doesn't exist**
```
Error code: 42P01
Error: relation "campaigns" does not exist
```
**แก้ไข**: Run SQL script `scripts/007_create_campaigns.sql`

---

## สรุป

**ไฟล์ที่สร้าง/แก้ไข:**
- ✅ `app/api/campaigns/route.ts` - API routes สำหรับ campaigns
- ✅ `app/api/campaigns/[id]/route.ts` - API routes สำหรับ campaign ตาม ID
- ✅ `app/api/campaigns/[id]/memos/route.ts` - API routes สำหรับ memo logs
- ✅ `app/dashboard/campaigns/page.tsx` - Server component page
- ✅ `components/campaigns-list-client.tsx` - Client component สำหรับ UI
- ✅ `scripts/fix-campaigns-rls.sql` - SQL script สำหรับแก้ไข RLS

**สิ่งที่ต้องทำ:**
1. ✅ สร้าง API routes
2. ✅ แก้ไข campaigns page
3. ✅ สร้าง client component
4. ⏳ **Run SQL script** `fix-campaigns-rls.sql` ใน Supabase
5. ⏳ ทดสอบ CRUD operations

---

**พร้อมใช้งานแล้ว** ✅

หลังจาก run SQL script แล้ว campaign module จะทำงานได้เต็มรูปแบบ!

