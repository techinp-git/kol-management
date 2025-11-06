# Setup KOL Module - คู่มือการติดตั้ง

## 📋 ภาพรวม

คู่มือนี้จะช่วยให้คุณติดตั้ง KOL Module เพื่อให้สามารถ:
- ➕ **สร้าง KOL** (INSERT)
- ✏️ **แก้ไข KOL** (UPDATE)
- 🗑️ **ลบ KOL** (DELETE)
- 👁️ **ดู KOL** (SELECT)

## 🚀 วิธีติดตั้ง (เลือก 1 วิธี)

### วิธีที่ 1: รัน SQL ใน Supabase Dashboard (แนะนำ)

**ขั้นตอน:**

1. **เปิด Supabase Dashboard**
   - ไปที่: https://supabase.com/dashboard
   - เลือกโปรเจค: `kol-management`

2. **เปิด SQL Editor**
   - คลิก "SQL Editor" ในเมนูด้านซ้าย
   - หรือไปที่: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/sql

3. **Copy และ Paste SQL Script**
   - เปิดไฟล์: `scripts/setup-kol-module-complete.sql`
   - Copy ทั้งหมด
   - Paste ใน SQL Editor

4. **กด Run**
   - คลิกปุ่ม "Run" (หรือกด Ctrl+Enter / Cmd+Enter)
   - รอสักครู่

5. **ตรวจสอบผลลัพธ์**
   - ดู Results ด้านล่าง
   - ควรเห็น ✅ READY ใน status column
   - ดู success message ใน Notices

**เสร็จแล้ว!** 🎉

---

### วิธีที่ 2: รัน SQL ทีละส่วน (สำหรับแก้ปัญหาเฉพาะ)

#### 2.1 แก้ Status Constraint
```sql
-- Run: scripts/fix-kols-status-constraint.sql
ALTER TABLE public.kols 
DROP CONSTRAINT IF EXISTS kols_status_check;

ALTER TABLE public.kols 
ADD CONSTRAINT kols_status_check 
CHECK (status IN ('active', 'inactive', 'blacklisted', 'draft', 'ban'));
```

#### 2.2 แก้ RLS Policies
```sql
-- Run: scripts/fix-kols-rls.sql
-- (See full script in file)
```

---

## ✅ ตรวจสอบการติดตั้ง

### 1. ตรวจสอบใน Supabase Dashboard

รัน SQL นี้ใน SQL Editor:

```sql
-- Check if setup is complete
SELECT 
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'SELECT') as kols_select,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'INSERT') as kols_insert,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'UPDATE') as kols_update,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'kols' AND cmd = 'DELETE') as kols_delete;
```

**ผลลัพธ์ที่ควรได้:**
- `kols_select`: 1 (หรือมากกว่า)
- `kols_insert`: 1 (หรือมากกว่า)
- `kols_update`: 1 (หรือมากกว่า)
- `kols_delete`: 1 (หรือมากกว่า)

### 2. ตรวจสอบ Status Constraint

```sql
-- Check status constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.kols'::regclass 
  AND conname = 'kols_status_check';
```

**ผลลัพธ์ที่ควรได้:**
```
CHECK (status IN ('active', 'inactive', 'blacklisted', 'draft', 'ban'))
```

### 3. ตรวจสอบแบบละเอียด

รัน script: `scripts/verify-kol-module.sql`

---

## 🧪 ทดสอบการใช้งาน

### Test 1: สร้าง KOL
1. ไปที่: `http://localhost:3000/dashboard/kols/new`
2. กรอกข้อมูล:
   - Name: "Test KOL"
   - Handle: "@testkol"
   - Category: "Fashion"
3. กด "บันทึก"

**ควรได้:**
- ✅ redirect ไปหน้า detail
- ✅ เห็นข้อมูล KOL
- ✅ ไม่มี error

### Test 2: แก้ไข KOL
1. ไปที่: `http://localhost:3000/dashboard/kols/[id]/edit`
2. แก้ไขข้อมูล
3. กด "บันทึก"

**ควรได้:**
- ✅ ข้อมูลถูกอัปเดต
- ✅ ไม่มี error

### Test 3: ลบ KOL
1. ไปที่: `http://localhost:3000/dashboard/kols/[id]`
2. กด "ลบ"
3. ยืนยันการลบ

**ควรได้:**
- ✅ redirect ไปหน้า list
- ✅ KOL ถูกลบ
- ✅ ไม่มี error

---

## 🐛 แก้ปัญหา

### ปัญหา 1: "new row violates row-level security policy"

**สาเหตุ:** RLS policy ไม่อนุญาตให้ INSERT

**วิธีแก้:**
1. รัน `scripts/setup-kol-module-complete.sql` อีกครั้ง
2. หรือรัน `scripts/fix-kols-rls.sql`

### ปัญหา 2: "violates check constraint kols_status_check"

**สาเหตุ:** Status ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบว่า status เป็น: 'active', 'inactive', 'blacklisted', 'draft', 'ban'
2. รัน `scripts/fix-kols-status-constraint.sql`

### ปัญหา 3: "permission denied for table kols"

**สาเหตุ:** ไม่มี RLS policy สำหรับ SELECT

**วิธีแก้:**
1. รัน `scripts/setup-kol-module-complete.sql` อีกครั้ง

### ปัญหา 4: ไม่สามารถเชื่อมต่อ Supabase

**สาเหตุ:** Environment variables ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://sqaffprdetbrxrdnslfm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. Restart server: `pnpm dev`

---

## 📚 เอกสารเพิ่มเติม

- **Test Checklist**: `KOL_MODULE_CHECKLIST.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **SQL Scripts**:
  - `scripts/setup-kol-module-complete.sql` - Setup ทั้งหมด
  - `scripts/fix-kols-rls.sql` - แก้ RLS policies
  - `scripts/fix-kols-status-constraint.sql` - แก้ status constraint
  - `scripts/verify-kol-module.sql` - ตรวจสอบการติดตั้ง

---

## ✨ สรุป

**ขั้นตอนสั้นๆ:**
1. เปิด Supabase Dashboard > SQL Editor
2. Copy `scripts/setup-kol-module-complete.sql`
3. Paste และกด Run
4. ตรวจสอบผลลัพธ์ (ควรเห็น ✅ READY)
5. ทดสอบสร้าง/แก้ไข/ลบ KOL

**เสร็จแล้ว!** 🎉

หากมีปัญหา ดูที่ `TROUBLESHOOTING.md` หรือรัน `scripts/verify-kol-module.sql` เพื่อตรวจสอบ

