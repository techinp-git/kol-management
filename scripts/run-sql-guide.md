# 🚀 วิธีรัน SQL Scripts ใน Supabase

## วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ - ง่ายที่สุด) ⭐

### ขั้นตอน:

1. **เปิด Supabase Dashboard:**
   - ไปที่: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/sql/new
   - หรือ: https://supabase.com/dashboard/project/_/sql

2. **รัน SQL ทั้งหมดในครั้งเดียว:**
   - เปิดไฟล์: `scripts/all-migrations.sql`
   - Copy ทั้งหมด (Cmd+A → Cmd+C)
   - Paste ลงใน SQL Editor
   - กด **Run** หรือ Cmd/Ctrl + Enter

3. **หรือรันทีละไฟล์ (แนะนำ):**
   - เปิดไฟล์ใน `scripts/` ตามลำดับนี้:
   
   **ลำดับที่ต้องรัน:**
   1. `001_create_profiles_and_roles.sql` ⭐ (สำคัญที่สุด)
   2. `001_create_memo_logs.sql`
   3. `002_create_accounts.sql`
   4. `002_create_status_changes.sql`
   5. `003_add_missing_columns.sql`
   6. `003_create_projects.sql`
   7. `004_create_helper_functions.sql`
   8. `004_create_kols.sql`
   9. `005_check_and_fix_user_role_enum.sql`
   10. `005_create_kol_channels.sql`
   11. `006_create_rate_cards.sql`
   12. `006_fix_rls_policies.sql`
   13. `007_create_campaigns.sql`
   14. `007_simplify_rls_policies.sql` (แก้ปัญหา RLS)
   15. `008_create_posts.sql`
   16. `009_create_comments.sql`
   17. `010_create_audit_logs.sql`
   18. `011_create_notifications.sql`
   19. `012_seed_default_tags.sql`

## วิธีที่ 2: ใช้ psql (Command Line)

### ติดตั้ง PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql-client
```

### ตั้งค่า Connection String:
```bash
# ไปที่ Supabase Dashboard → Settings → Database
# Copy Connection string (URI format)

export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.sqaffprdetbrxrdnslfm.supabase.co:5432/postgres"
```

### รัน Scripts:
```bash
# รันทั้งหมด
./scripts/run-all-sql.sh

# หรือรันทีละไฟล์
psql "$SUPABASE_DB_URL" -f scripts/001_create_profiles_and_roles.sql
```

## วิธีที่ 3: ใช้ Supabase CLI

```bash
# ติดตั้ง
brew install supabase/tap/supabase

# Login
supabase login

# Link project
supabase link --project-ref sqaffprdetbrxrdnslfm

# Push migrations
supabase db push
```

## ⚠️ หมายเหตุสำคัญ:

1. **ต้องรัน `001_create_profiles_and_roles.sql` ก่อน** เพราะเป็น table หลัก
2. **รัน `007_simplify_rls_policies.sql`** เพื่อแก้ปัญหา infinite recursion ใน RLS
3. **ตรวจสอบ error messages** ใน SQL Editor ถ้ามี
4. **ถ้ามี error** ให้รันทีละไฟล์และตรวจสอบ

## ✅ ตรวจสอบผลลัพธ์:

```bash
# Test connection
pnpm test:supabase
```

## 🔗 Links:

- Supabase Dashboard: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/sql/new
- API Settings: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/settings/api
- Database Settings: https://supabase.com/dashboard/project/sqaffprdetbrxrdnslfm/settings/database

