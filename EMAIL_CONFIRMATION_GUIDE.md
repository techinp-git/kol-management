# 📧 Email Confirmation - ทำอย่างไร?

## 🔐 Email Confirmation คืออะไร?

Email Confirmation คือการยืนยันอีเมลก่อนที่ user จะสามารถ login ได้

## ⚙️ วิธีเปิด/ปิด Email Confirmation

### **วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)**

1. **ไปที่ Supabase Dashboard:**
   - https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/url-configuration

2. **Authentication → Settings → Email Auth:**
   - เปิด/ปิด "Enable email confirmations"
   - ตั้งค่า "Email confirmation time" (default: 24 hours)

3. **หรือ Authentication → Providers → Email:**
   - ดูการตั้งค่า email provider
   - ตั้งค่า email templates

### **วิธีที่ 2: ใช้ SQL (ถ้าต้องการ)**

```sql
-- ตรวจสอบการตั้งค่าปัจจุบัน
SELECT * FROM auth.config WHERE key = 'email_confirmation_enabled';

-- เปิด email confirmation (ใช้ Supabase Dashboard แทน)
-- เราไม่สามารถแก้ไขได้โดยตรงผ่าน SQL
```

## 🔄 Flow การทำงาน

### **เมื่อเปิด Email Confirmation:**

1. **User สมัครสมาชิก:**
   ```typescript
   supabase.auth.signUp({
     email: "user@example.com",
     password: "password123"
   })
   ```

2. **Supabase ส่ง email confirmation:**
   - ส่ง email ไปที่ user@example.com
   - มี confirmation link

3. **User ต้อง click link:**
   - Click link ใน email
   - Supabase verify email
   - User สามารถ login ได้แล้ว

4. **ถ้าไม่ confirm:**
   - User ไม่สามารถ login ได้
   - Email ยังไม่ถูก confirm

### **เมื่อปิด Email Confirmation:**

1. **User สมัครสมาชิก:**
   - Supabase สร้าง user ทันที
   - User สามารถ login ได้เลย
   - ไม่ต้อง confirm email

## 📧 Email Template

### **ตั้งค่า Email Template:**

1. **ไปที่ Supabase Dashboard:**
   - https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/templates

2. **เลือก Email Template:**
   - "Confirm signup" - สำหรับ email confirmation
   - "Magic Link" - สำหรับ magic link login
   - "Change Email Address" - สำหรับเปลี่ยน email
   - "Reset Password" - สำหรับ reset password

3. **Customize Template:**
   - แก้ไข HTML/CSS
   - เพิ่ม variables: `{{ .ConfirmationURL }}`, `{{ .Email }}`, etc.

## 🧪 วิธี Test Email Confirmation

### **วิธีที่ 1: ใช้ Development Email (แนะนำ)**

1. **ไปที่ Supabase Dashboard:**
   - https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/logs

2. **ดู Email Logs:**
   - จะเห็น emails ที่ส่งไป
   - Copy confirmation link
   - Test ใน browser

### **วิธีที่ 2: ใช้ Real Email**

1. **Signup ด้วย real email:**
   - ใช้ email จริง (gmail, outlook, etc.)
   - ตรวจสอบ inbox
   - Click confirmation link

2. **ตรวจสอบ Spam Folder:**
   - บางครั้ง email อาจไปที่ spam

### **วิธีที่ 3: ใช้ Supabase CLI (Local Development)**

```bash
# ติดตั้ง Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# ดู email logs
supabase logs --email
```

## 🔧 ตั้งค่า Email Provider

### **Development (ใช้ Built-in Email):**

- Supabase มี built-in email service
- ใช้ได้เลย ไม่ต้องตั้งค่า
- Emails จะไปที่ email logs

### **Production (ใช้ Custom SMTP):**

1. **ไปที่ Supabase Dashboard:**
   - https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/settings/auth

2. **ตั้งค่า SMTP:**
   - SMTP Host (smtp.gmail.com, smtp.sendgrid.net, etc.)
   - SMTP Port (587, 465)
   - SMTP User (email)
   - SMTP Password (app password)
   - Sender Email

3. **Test Connection:**
   - ส่ง test email
   - ตรวจสอบว่าได้รับ email

## 📝 Code ที่เกี่ยวข้อง

### **Signup (app/auth/signup/page.tsx):**

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
    data: {
      full_name: fullName,
      role: "brand_user",
    },
  },
})
```

### **ตรวจสอบ Email Confirmation:**

```typescript
// ดู user ปัจจุบัน
const { data: { user } } = await supabase.auth.getUser()

// ตรวจสอบว่า email confirmed หรือยัง
if (user && !user.email_confirmed_at) {
  // Email ยังไม่ confirmed
  // แสดงข้อความให้ user confirm email
}
```

### **Resend Confirmation Email:**

```typescript
// ส่ง confirmation email ใหม่
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})
```

## 🚀 วิธีเปิด/ปิด Email Confirmation

### **เปิด Email Confirmation:**

1. ไปที่: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/providers
2. คลิก "Email" provider
3. เปิด "Enable email confirmations"
4. บันทึก

### **ปิด Email Confirmation (Development):**

1. ไปที่: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/providers
2. คลิก "Email" provider
3. ปิด "Enable email confirmations"
4. บันทึก

**⚠️ หมายเหตุ:** 
- ปิด email confirmation ใน development เพื่อความสะดวก
- เปิด email confirmation ใน production เพื่อความปลอดภัย

## 🔍 ตรวจสอบ Email Confirmation Status

### **ผ่าน Supabase Dashboard:**

1. ไปที่: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/users
2. ดู column "Email Confirmed"
3. ✅ = confirmed
4. ❌ = not confirmed

### **ผ่าน SQL:**

```sql
-- ดู users ที่ email confirmed แล้ว
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

-- ดู users ที่ email ยังไม่ confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;
```

## 📋 Checklist

- [ ] ตั้งค่า Email Confirmation (เปิด/ปิด)
- [ ] Customize Email Template (ถ้าต้องการ)
- [ ] ตั้งค่า SMTP (สำหรับ production)
- [ ] Test Email Confirmation
- [ ] ตรวจสอบ Email Logs
- [ ] Handle Email Confirmation ในโค้ด (ถ้าต้องการ)

## 🔗 Links

- **Email Settings:** https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/providers
- **Email Templates:** https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/templates
- **Email Logs:** https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/logs
- **Users:** https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/auth/users

## ✅ Summary

- **Email Confirmation:** เปิด/ปิดได้ใน Supabase Dashboard
- **Development:** ปิดได้เพื่อความสะดวก
- **Production:** ควรเปิดเพื่อความปลอดภัย
- **Email Template:** Customize ได้ใน Dashboard
- **Test:** ดู email logs ใน Dashboard

