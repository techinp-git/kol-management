# 🚨 QUICK FIX - KOL View ไม่ได้

## ปัญหา
- ✅ สร้าง KOL ได้
- ❌ **ดู KOL ไม่ได้** (กดเข้า view ไม่ได้)
- ❌ Error: "invalid input syntax for type uuid: undefined"
- ❌ หรือไปหน้า 404

## สาเหตุ
**RLS policy สำหรับ SELECT ไม่ทำงาน**

## วิธีแก้ (3 นาที)

### ขั้นตอนที่ 1: เปิด Supabase Dashboard

ไปที่: **https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/sql**

### ขั้นตอนที่ 2: Copy SQL นี้

```sql
-- FIX: Allow viewing KOLs
ALTER TABLE public.kols ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can insert KOLs" ON public.kols;

CREATE POLICY "Authenticated users can view KOLs"
ON public.kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON public.kols FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'kols';
```

### ขั้นตอนที่ 3: Paste และ Run

1. Paste SQL ใน SQL Editor
2. กดปุ่ม **Run** (หรือกด Ctrl+Enter)

### ขั้นตอนที่ 4: ตรวจสอบผลลัพธ์

ควรเห็น:
```
policyname: "Authenticated users can view KOLs"
cmd: SELECT

policyname: "Authenticated users can insert KOLs"  
cmd: INSERT
```

### ขั้นตอนที่ 5: ทดสอบ

1. ไปที่: `http://localhost:3000/dashboard/kols`
2. คลิกเข้า KOL ใดๆ
3. **ควรเห็นหน้า detail และไม่มี error**

---

## 🔧 แก้แบบสมบูรณ์ (รัน Script เดียวเสร็จ)

ถ้าต้องการแก้ทุกอย่างรวมกัน:

### เปิดไฟล์: `scripts/FIX-KOL-VIEW-COMPLETE.sql`

1. Copy ทั้งหมด
2. Paste ใน Supabase SQL Editor
3. กด Run
4. ดู success message

---

## ✅ หลัง Fix แล้วควรได้

- ✅ คลิกเข้า view KOL ได้
- ✅ เห็นหน้า detail
- ✅ ไม่มี error "undefined"
- ✅ ไม่ไปหน้า 404

---

## 🔍 ตรวจสอบว่า Fix แล้วหรือยัง

รัน SQL นี้:

```sql
-- Check if SELECT policy exists
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'kols' 
  AND cmd = 'SELECT';
```

**ควรเห็น:**
```
tablename: kols
policyname: "Authenticated users can view KOLs"
cmd: SELECT
```

ถ้าไม่เห็น = ยังไม่มี SELECT policy = **view ไม่ได้**

---

## 📝 สรุป

**ปัญหา:** RLS policy ไม่อนุญาตให้ SELECT (ดู) KOL

**วิธีแก้:** 
1. Enable RLS
2. สร้าง SELECT policy
3. Test ว่า view ได้

**SQL ที่ต้องรัน:** `scripts/FIX-KOL-VIEW-COMPLETE.sql`

**ลิงก์:** https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/sql

---

**รันแล้วควรใช้งานได้ทันที!** ✅
