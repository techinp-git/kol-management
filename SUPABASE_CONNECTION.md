# เชื่อมต่อ Cursor กับ Supabase

## วิธีที่ 1: ใช้ Supabase Extension (แนะนำ)

### ขั้นตอน:
1. **ติดตั้ง Extension:**
   - เปิด Cursor
   - กด `Cmd+Shift+X` (Mac) หรือ `Ctrl+Shift+X` (Windows)
   - ค้นหา "Supabase" และติดตั้ง "Supabase" extension

2. **เชื่อมต่อกับ Supabase:**
   - กด `Cmd+Shift+P` (Mac) หรือ `Ctrl+Shift+P` (Windows)
   - พิมพ์ "Supabase: Login"
   - Login ด้วย Supabase account ของคุณ
   - เลือก project ของคุณ

3. **ใช้ SQL Editor ใน Cursor:**
   - เปิดไฟล์ `.sql` ใน `scripts/`
   - กด `Cmd+Shift+P` → "Supabase: Run SQL"
   - หรือใช้ Command Palette → "Supabase: Execute SQL"

## วิธีที่ 2: ใช้ PostgreSQL Extension

### ขั้นตอน:
1. **ติดตั้ง Extension:**
   - ค้นหา "PostgreSQL" extension
   - ติดตั้ง "PostgreSQL" หรือ "PostgreSQL Management Tool"

2. **เชื่อมต่อ:**
   - ไปที่ Supabase Dashboard: https://supabase.com/dashboard/project/_/settings/database
   - Copy **Connection string** (URI format)
   - ใน Cursor, ใช้ PostgreSQL extension เพื่อเชื่อมต่อ

### Connection String:
```
postgresql://postgres:[PASSWORD]@db.sqaffprdetbrxrdnslfm.supabase.co:5432/postgres
```

**หา Password ได้ที่:**
- Supabase Dashboard → Settings → Database
- หรือ Settings → API → Database → Connection string

## วิธีที่ 3: ใช้ Supabase CLI

### ติดตั้ง:
```bash
# macOS
brew install supabase/tap/supabase

# หรือใช้ npm
npm install -g supabase
```

### Login และ Link Project:
```bash
# Login
supabase login

# Link project
supabase link --project-ref sqaffprdetbrxrdnslfm

# Run SQL
supabase db push
```

## วิธีที่ 4: ใช้ Supabase Dashboard (ง่ายที่สุด)

1. ไปที่: https://supabase.com/dashboard/project/_/sql
2. Copy SQL จากไฟล์ใน `scripts/`
3. Paste และ Run

## หมายเหตุ

- **Service Role Key** ใช้สำหรับ admin operations
- **Anon Key** ใช้สำหรับ client-side operations
- **Database Password** ใช้สำหรับ PostgreSQL connection

## Environment Variables

เพิ่มใน `.env.local`:
```env
# Database connection (optional - for CLI/extensions)
SUPABASE_DB_PASSWORD=your_database_password
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

