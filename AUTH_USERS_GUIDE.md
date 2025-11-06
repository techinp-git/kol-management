# 🔐 auth.users Table - อยู่ตรงไหน?

## 📍 auth.users อยู่ที่ไหน?

### **auth.users คือ Supabase Built-in Table**

`auth.users` เป็น table ที่ Supabase จัดการเอง (built-in) อยู่ใน database ของ Supabase project ของคุณ

## 🔍 วิธีดู auth.users

### **วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)**

1. **Authentication → Users:**
   - ไปที่: https://supabase.com/dashboard/project/_/auth/users
   - จะเห็น users ทั้งหมด
   - สามารถดู email, created_at, last_sign_in_at, etc.
   - **ไม่เห็น password** (เห็นแค่ hash)

2. **Table Editor:**
   - ไปที่: https://supabase.com/dashboard/project/_/editor
   - เลือก schema: `auth` (ไม่ใช่ `public`)
   - จะเห็น table `users`
   - **⚠️ ระวัง:** ไม่ควรแก้ไขโดยตรง

### **วิธีที่ 2: ใช้ SQL Editor**

1. ไปที่: https://supabase.com/dashboard/project/_/sql/new
2. Run SQL:
   ```sql
   -- ดู users ทั้งหมด
   SELECT 
     id,
     email,
     email_confirmed_at,
     created_at,
     last_sign_in_at
   FROM auth.users
   ORDER BY created_at DESC;
   ```

3. หรือใช้ไฟล์: `scripts/view-auth-users.sql`

### **วิธีที่ 3: ใช้ Supabase Client (ในโค้ด)**

```typescript
// ไม่สามารถ SELECT จาก auth.users โดยตรงได้
// ใช้ Supabase Auth API แทน

const supabase = createClient()

// ดู user ปัจจุบัน
const { data: { user } } = await supabase.auth.getUser()

// ดู user ทั้งหมด (ต้องใช้ Admin API)
const { data: { users }, error } = await supabase.auth.admin.listUsers()
```

## 📊 Structure ของ auth.users

```
auth.users (Supabase Built-in)
├── id (UUID) - Primary Key
├── email (TEXT)
├── encrypted_password (TEXT) - Hashed password (bcrypt)
├── email_confirmed_at (TIMESTAMPTZ)
├── phone (TEXT)
├── phone_confirmed_at (TIMESTAMPTZ)
├── last_sign_in_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
├── raw_user_meta_data (JSONB) - Custom metadata
├── raw_app_meta_data (JSONB) - App metadata
└── ... (other auth fields)
```

## ⚠️ ข้อจำกัด

### **เราไม่สามารถ:**
- ❌ INSERT เข้าไปโดยตรง (ต้องใช้ `supabase.auth.signUp()`)
- ❌ UPDATE password โดยตรง (ต้องใช้ `supabase.auth.updateUser()`)
- ❌ DELETE โดยตรง (ต้องใช้ `supabase.auth.admin.deleteUser()`)
- ❌ SELECT password (เห็นแค่ hash)

### **เราสามารถ:**
- ✅ SELECT ข้อมูลบางส่วน (id, email, created_at, etc.)
- ✅ JOIN กับ `public.profiles` table
- ✅ ดูข้อมูลผ่าน Supabase Dashboard

## 🔗 ความสัมพันธ์กับ profiles

```
auth.users (1) ←→ (1) public.profiles
```

- `auth.users.id` = `public.profiles.id` (one-to-one relationship)
- เมื่อ user signup → สร้าง record ใน `auth.users` → trigger สร้าง `profiles`

## 📝 ตัวอย่าง Query

### ดู users ทั้งหมด:
```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users;
```

### ดู users พร้อม profiles:
```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
```

### นับจำนวน users:
```sql
SELECT COUNT(*) FROM auth.users;
```

## 🔐 Security

- **Password:** เก็บเป็น hash (bcrypt) ใน `encrypted_password`
- **เราไม่เห็น password จริง:** เห็นแค่ hash ที่ถูก encrypt
- **Supabase จัดการ:** Password hashing, reset, etc.

## 📍 ที่อยู่ใน Supabase

**URL:**
- Dashboard: `https://supabase.com/dashboard/project/[PROJECT_ID]/auth/users`
- Table Editor: `https://supabase.com/dashboard/project/[PROJECT_ID]/editor`
- SQL Editor: `https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new`

**Project ID ของคุณ:**
- `sqaffprdetbrxrdnslfm`
- Full URL: `https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/users`

## ✅ Summary

- **auth.users อยู่ที่ไหน:** ใน Supabase database ของ project คุณ
- **Schema:** `auth` (ไม่ใช่ `public`)
- **ดูได้ที่ไหน:**
  1. Supabase Dashboard → Authentication → Users
  2. Supabase Dashboard → Table Editor → auth schema → users
  3. SQL Editor → Query `auth.users`
- **เราแก้ไขได้ไหม:** ไม่ได้โดยตรง (ใช้ Supabase Auth API)

