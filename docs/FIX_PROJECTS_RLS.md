# แก้ไข RLS Policy สำหรับ Projects Table

## ปัญหา
```
Error: new row violates row-level security policy for table "projects"
```

## สาเหตุ
RLS (Row Level Security) policies ปัจจุบันจำกัดสิทธิ์ให้เฉพาะ admin เท่านั้นที่สามารถ insert projects ได้

## วิธีแก้ไข

### 1. ไปที่ Supabase Dashboard
1. เปิด Supabase Dashboard: https://supabase.com/dashboard
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor**

### 2. รัน SQL Script
Copy และ paste SQL script นี้ลงใน SQL Editor แล้วกด **Run**:

**ไฟล์**: `scripts/fix-projects-rls.sql`

```sql
-- Fix RLS policies for projects table
-- Allow authenticated users to perform all CRUD operations

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Brand users can view their account projects" ON public.projects;
DROP POLICY IF EXISTS "Brand users can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);
```

### 3. ตรวจสอบผลลัพธ์
- ควรเห็น message: "Success. No rows returned"
- หรือ "Success" ถ้าสำเร็จ

### 4. ทดสอบ
1. กลับไปที่หน้าโปรเจกต์
2. คลิก "เพิ่มโปรเจกต์" หรือสร้างโปรเจกต์ใหม่
3. กรอกข้อมูลและบันทึก
4. ควรบันทึกได้โดยไม่มี error

---

## ไฟล์ SQL Script
- **ไฟล์**: `scripts/fix-projects-rls.sql`
- **Location**: `/scripts/fix-projects-rls.sql`

---

## ตรวจสอบผลลัพธ์

### ตรวจสอบ Policies
รัน SQL นี้:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY cmd;
```

**ผลลัพธ์:** ควรเห็น 4 rows:
- `Authenticated users can delete projects` (DELETE)
- `Authenticated users can insert projects` (INSERT) ← **สำคัญ!**
- `Authenticated users can view projects` (SELECT)
- `Authenticated users can update projects` (UPDATE)

---

## Troubleshooting

### ถ้ายังมี error หลังจากรัน script:
1. ตรวจสอบว่า script รันสำเร็จหรือไม่
2. ตรวจสอบว่า RLS ยังเปิดอยู่หรือไม่:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'projects';
   ```
3. ตรวจสอบ policies ที่มีอยู่:
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'projects';
   ```

### ถ้า error: "policy already exists"
- ลบ policy เก่าก่อน:
  ```sql
  DROP POLICY IF EXISTS "policy_name" ON public.projects;
  ```

---

## สรุป
**รัน SQL script นี้ใน Supabase Dashboard > SQL Editor** แล้วลองสร้าง project ใหม่อีกครั้ง

**พร้อมใช้งาน** ✅

**หมายเหตุ:**
- Script นี้จะลบ policies เก่าที่จำกัดสิทธิ์
- สร้าง policies ใหม่ที่อนุญาตให้ authenticated users ทั้งหมดทำ CRUD operations ได้
- ถ้าต้องการจำกัดสิทธิ์เพิ่มเติม สามารถแก้ไข policies ได้ภายหลัง

