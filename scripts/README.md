# SQL Migration Scripts

## วิธีรัน SQL Scripts

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ - ง่ายที่สุด)

1. ไปที่ Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
2. เลือก project ของคุณ
3. เปิด SQL Editor
4. Copy SQL จากไฟล์ในโฟลเดอร์ `scripts/` 
5. Paste ลงใน SQL Editor
6. กด Run

**ลำดับการรัน:**
1. `001_create_profiles_and_roles.sql` (ต้องรันก่อน)
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
14. `007_simplify_rls_policies.sql`
15. `008_create_posts.sql`
16. `009_create_comments.sql`
17. `010_create_audit_logs.sql`
18. `011_create_notifications.sql`
19. `012_seed_default_tags.sql`

### วิธีที่ 2: ใช้ psql (PostgreSQL client)

```bash
# ติดตั้ง PostgreSQL client (ถ้ายังไม่มี)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# ใช้ connection string จาก Supabase Dashboard
# Settings > Database > Connection string > URI
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -f scripts/001_create_profiles_and_roles.sql
```

### วิธีที่ 3: ใช้ Supabase CLI (ถ้าติดตั้งแล้ว)

```bash
# ติดตั้ง Supabase CLI
# macOS: brew install supabase/tap/supabase
# หรือ: npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref [YOUR_PROJECT_REF]

# Run migration
supabase db push
```

### วิธีที่ 4: รันทีละไฟล์ด้วย script

สร้างไฟล์ `.env.local` และเพิ่ม:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

จากนั้นรัน:
```bash
pnpm tsx scripts/run-migrations.ts
```

## หมายเหตุ

- **Service Role Key** ต้องใช้สำหรับรัน SQL ที่มีสิทธิ์สูง (เช่น CREATE TABLE)
- หา Service Role Key ได้ที่: https://supabase.com/dashboard/project/_/settings/api
- ระวัง: Service Role Key มีสิทธิ์สูงมาก อย่า expose ใน client-side code

