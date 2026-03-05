# Troubleshooting Guide - KOL Management

## วิธีตรวจสอบ Error

### 1. ดู Error ใน Console/Terminal

เมื่อเกิด error ดูที่:
- **Terminal** (ที่รัน `pnpm dev`)
- **Browser Console** (F12 > Console)
- **Network Tab** (F12 > Network) เพื่อดู API response

### 2. Error ที่พบบ่อย

#### Error: "new row violates row-level security policy"
**สาเหตุ:** RLS policy ไม่อนุญาตให้ INSERT/UPDATE/SELECT

**วิธีแก้:**
```sql
-- Run this in Supabase Dashboard > SQL Editor
-- See: scripts/fix-kols-rls.sql
```

#### Error: "violates check constraint kols_status_check"
**สาเหตุ:** Status ไม่ถูกต้อง (ต้องเป็น: 'active', 'inactive', 'blacklisted', 'draft', 'ban')

**วิธีแก้:**
- ตรวจสอบว่า status ที่ส่งไปถูกต้อง
- ดู: `app/api/kols/route.ts` - มี validation แล้ว

#### Error: "KOL not found"
**สาเหตุ:** KOL ID ที่ส่งมาไม่มีในฐานข้อมูล

**วิธีแก้:**
- ตรวจสอบว่า KOL ID ถูกต้อง
- ตรวจสอบว่า KOL มีอยู่ในฐานข้อมูล

#### Error: "permission denied for table kols"
**สาเหตุ:** RLS policy ไม่อนุญาตให้ SELECT

**วิธีแก้:**
```sql
-- Run this in Supabase Dashboard > SQL Editor
-- See: scripts/fix-kols-rls.sql
```

### 3. ตรวจสอบ RLS Policies

รัน SQL นี้ใน Supabase Dashboard > SQL Editor:

```sql
-- Check KOLs RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'kols'
ORDER BY policyname;
```

**ควรมี policies:**
- `Authenticated users can view KOLs` (SELECT)
- `Authenticated users can insert KOLs` (INSERT)
- `Authenticated users can update KOLs` (UPDATE)
- `Authenticated users can delete KOLs` (DELETE)

### 4. ตรวจสอบ Status Constraint

รัน SQL นี้ใน Supabase Dashboard > SQL Editor:

```sql
-- Check status constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.kols'::regclass
  AND conname = 'kols_status_check';
```

**ควรเห็น:**
```
CHECK (status IN ('active', 'inactive', 'blacklisted', 'draft', 'ban'))
```

### 5. ตรวจสอบ Authentication

ตรวจสอบว่า user login แล้ว:
- ดูใน browser console: `localStorage` หรือ `sessionStorage`
- ตรวจสอบว่า Supabase session มีอยู่

### 6. Debug Steps

1. **เปิด Browser Console (F12)**
   - ดู error messages
   - ดู network requests

2. **ดู Terminal Logs**
   - ดู server-side errors
   - ดู error details จาก console.error

3. **ตรวจสอบ Supabase Dashboard**
   - Table Editor > kols table
   - SQL Editor > รัน check queries

4. **Test API Directly**
   ```bash
   # Test GET request
   curl http://localhost:3000/api/kols/[id]
   
   # Test POST request
   curl -X POST http://localhost:3000/api/kols \
     -H "Content-Type: application/json" \
     -d '{"name":"Test KOL","status":"active"}'
   ```

### 7. Quick Fixes

#### Fix RLS Policies
```sql
-- Run: scripts/fix-kols-rls.sql
```

#### Fix Status Constraint
```sql
-- Run: scripts/fix-kols-status-constraint.sql
```

#### Check User Authentication
```typescript
// In browser console
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```

## Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `new row violates row-level security policy` | RLS policy blocks INSERT | Run `fix-kols-rls.sql` |
| `violates check constraint kols_status_check` | Invalid status value | Check status value |
| `permission denied for table kols` | RLS policy blocks SELECT | Run `fix-kols-rls.sql` |
| `KOL not found` | KOL ID doesn't exist | Check KOL ID |
| `Invalid status` | Status not in allowed list | Use valid status |

## Files to Check

- `app/api/kols/route.ts` - POST endpoint (create KOL)
- `app/api/kols/[id]/route.ts` - PATCH endpoint (update KOL)
- `app/dashboard/kols/[id]/page.tsx` - Detail page (fetch KOL)
- `scripts/fix-kols-rls.sql` - Fix RLS policies
- `scripts/fix-kols-status-constraint.sql` - Fix status constraint

