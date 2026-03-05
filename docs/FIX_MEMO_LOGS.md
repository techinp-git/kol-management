# แก้ไขปัญหา Memo Logs ไม่สามารถเพิ่มได้

## ปัญหา
- ไม่สามารถเพิ่ม memo log ใน KOL module ได้
- น่าจะเป็นปัญหา RLS (Row Level Security) ของ table `memo_logs`

## วิธีแก้ไข

### 1. Run SQL Script เพื่อแก้ไข RLS Policies

```bash
# ใช้ Cursor MCP Supabase Integration
```

**หรือ** คัดลอก SQL จากไฟล์ `scripts/fix-memo-logs-rls.sql` ไป run ใน Supabase SQL Editor:

```sql
-- Fix RLS policies for memo_logs table

-- Enable RLS
ALTER TABLE public.memo_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Authenticated users can insert memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Authenticated users can update memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Users can view all memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Users can insert memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Admins can view all memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Brand users can view memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Admins can manage memo logs" ON public.memo_logs;
DROP POLICY IF EXISTS "Brand users can manage memo logs" ON public.memo_logs;

-- Create new permissive policies for authenticated users
CREATE POLICY "Authenticated users can view all memo logs"
  ON public.memo_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert memo logs"
  ON public.memo_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update memo logs"
  ON public.memo_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete memo logs"
  ON public.memo_logs
  FOR DELETE
  TO authenticated
  USING (true);
```

### 2. ตรวจสอบ Policies

```sql
-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'memo_logs'
ORDER BY policyname;
```

ควรเห็น 4 policies:
1. `Authenticated users can view all memo logs` - SELECT
2. `Authenticated users can insert memo logs` - INSERT
3. `Authenticated users can update memo logs` - UPDATE
4. `Authenticated users can delete memo logs` - DELETE

### 3. ตรวจสอบ Table Structure

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memo_logs'
ORDER BY ordinal_position;
```

ควรมี columns:
- `id` (uuid)
- `entity_type` (text)
- `entity_id` (uuid)
- `memo` (text)
- `rating` (integer)
- `author` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## การทดสอบ

1. ไปที่หน้า KOL detail: `http://localhost:3000/dashboard/kols/[id]`
2. คลิกปุ่ม "เพิ่มบันทึก"
3. ให้คะแนน (1-5 ดาว)
4. เขียนข้อความบันทึก
5. คลิก "บันทึก"
6. ควรเห็น alert "เพิ่ม memo สำเร็จ!"
7. บันทึกควรแสดงในรายการด้านล่าง

---

## Debug

### ตรวจสอบ Console Logs

เปิด Browser Console (F12) และดู logs:
- `[v0] Adding memo:` - ข้อมูลที่ส่งไป
- `[v0] Memo added successfully:` - ข้อมูลที่ได้กลับมา
- หากมี error จะแสดง `[v0] Failed to add memo:` พร้อมรายละเอียด

### ตรวจสอบ Terminal

ดู logs ใน terminal ที่รัน `pnpm dev`:
- `[v0] Error creating memo log:` - error จาก Supabase
- `[v0] Error code:` - error code (เช่น `42501` = RLS error)
- `[v0] RLS Error:` - หากเป็น RLS error

### Common Errors

**Error: Permission denied**
```
Error code: 42501
Error: new row violates row-level security policy for table "memo_logs"
```
**แก้ไข**: Run SQL script `fix-memo-logs-rls.sql`

**Error: Table doesn't exist**
```
Error code: 42P01
Error: relation "memo_logs" does not exist
```
**แก้ไข**: Run SQL script `scripts/001_create_memo_logs.sql`

---

## สรุปการแก้ไข

**ไฟล์ที่แก้ไข:**
1. `app/api/kols/[id]/memos/route.ts` - เพิ่ม error logging
2. `components/kol-detail-client.tsx` - เพิ่ม console logs และ alerts
3. `scripts/fix-memo-logs-rls.sql` - SQL script สำหรับแก้ไข RLS

**การเปลี่ยนแปลง:**
- ✅ เพิ่ม detailed error logging ใน API
- ✅ เพิ่ม RLS error detection
- ✅ เพิ่ม console logs สำหรับ debugging
- ✅ เพิ่ม user alerts สำหรับ success/error
- ✅ สร้าง SQL script สำหรับแก้ไข RLS policies

**วิธีแก้ไข:**
1. Run `scripts/fix-memo-logs-rls.sql` ใน Supabase
2. Refresh หน้า browser
3. ลองเพิ่ม memo อีกครั้ง
4. ตรวจสอบ console logs และ alerts

---

## Next Steps

หลังจาก run SQL script แล้ว:
1. ✅ Restart browser (Ctrl+Shift+R / Cmd+Shift+R)
2. ✅ Login ใหม่
3. ✅ ไปหน้า KOL detail
4. ✅ ลองเพิ่ม memo
5. ✅ ตรวจสอบว่าแสดงในรายการ

หากยังไม่ได้ ให้ดู Console และ Terminal logs แล้วแจ้งมา

