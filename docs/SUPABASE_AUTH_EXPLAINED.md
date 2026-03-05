# Supabase Authentication - Password Storage

## 🔐 Password เก็บที่ไหน?

### **Password เก็บใน `auth.users` table (Supabase Built-in)**

**Password ไม่ได้เก็บใน custom tables ของเรา!**

Supabase ใช้ระบบ authentication ของตัวเอง:

1. **`auth.users`** - Supabase's built-in table (เราเข้าถึงไม่ได้โดยตรง)
   - เก็บ **password hash** (ไม่ใช่ password จริง)
   - เก็บข้อมูล authentication ทั้งหมด
   - Supabase จัดการเอง
   - เราไม่สามารถ SELECT หรือ INSERT เข้าไปได้โดยตรง

2. **`public.profiles`** - Custom table ของเรา
   - เก็บข้อมูลเพิ่มเติม (full_name, role, account_id, etc.)
   - **ไม่เก็บ password** (เพราะเก็บใน auth.users แล้ว)
   - Reference `auth.users` ด้วย `id` (UUID)

## 📊 Database Structure

```
auth.users (Supabase Built-in)
├── id (UUID)
├── email
├── encrypted_password (hashed)
├── email_confirmed_at
├── created_at
└── ... (metadata)

public.profiles (Our Custom Table)
├── id (UUID) → REFERENCES auth.users(id)
├── email
├── full_name
├── role
├── account_id
└── ... (no password!)
```

## 🔄 Signup Flow

1. **User สมัครสมาชิก:**
   ```typescript
   supabase.auth.signUp({
     email: "user@example.com",
     password: "password123"
   })
   ```

2. **Supabase ทำงาน:**
   - Hash password ด้วย bcrypt
   - เก็บ password hash ใน `auth.users` table
   - สร้าง record ใน `auth.users`

3. **Trigger ทำงาน:**
   - `handle_new_user()` function ถูก trigger
   - สร้าง record ใน `public.profiles` table
   - ใช้ `id` จาก `auth.users` เป็น foreign key

## ✅ ทำไมถึงไม่เก็บ password ใน profiles?

1. **Security:**
   - Password ควรเก็บในที่ที่ปลอดภัย (Supabase จัดการให้)
   - Hash ด้วย bcrypt (เราไม่ต้องทำเอง)

2. **Separation of Concerns:**
   - Authentication data (password) → `auth.users`
   - Application data (profile info) → `public.profiles`

3. **Best Practices:**
   - ไม่ควรเก็บ password ใน custom tables
   - ใช้ Supabase Auth system ที่มีการจัดการ password อย่างถูกต้อง

## 🔍 วิธีตรวจสอบ

### ดู auth.users (ผ่าน Supabase Dashboard):
1. ไปที่: https://supabase.com/dashboard/project/_/auth/users
2. จะเห็น users ทั้งหมด
3. **ไม่เห็น password** (เห็นแค่ hash ที่ถูก encrypt)

### ดู profiles:
```sql
SELECT * FROM public.profiles;
-- จะไม่มี password field
```

## 📝 Summary

- **Password เก็บใน:** `auth.users` table (Supabase built-in)
- **Password format:** Hashed (bcrypt)
- **เราเข้าถึงได้ไหม:** ไม่ได้โดยตรง (Supabase จัดการให้)
- **profiles table:** ไม่มี password field (ถูกต้อง!)

## 🔐 Security Features

Supabase จัดการให้:
- ✅ Password hashing (bcrypt)
- ✅ Password strength requirements
- ✅ Email confirmation
- ✅ Password reset
- ✅ Session management
- ✅ JWT tokens

เราไม่ต้องทำเอง!

