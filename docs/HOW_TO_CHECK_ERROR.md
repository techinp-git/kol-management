# วิธีตรวจสอบ Error "fetch failed" ใน module post

## 1. ตรวจสอบการเชื่อมต่อ Supabase

รันคำสั่งนี้เพื่อทดสอบการเชื่อมต่อ:

```bash
pnpm tsx scripts/test-connection.ts
```

หรือถ้าใช้ npm:
```bash
npx tsx scripts/test-connection.ts
```

สคริปต์นี้จะตรวจสอบ:
- ✅ การเชื่อมต่อกับ Supabase
- ✅ Environment variables
- ✅ ตารางต่างๆ รวมถึง `post_metrics`
- ✅ คอลัมน์ที่จำเป็นใน `post_metrics`

## 2. ตรวจสอบ Environment Variables

ตรวจสอบว่ามีไฟล์ `.env.local` และมีค่าตามนี้:

```bash
# ตรวจสอบว่ามีไฟล์ .env.local
cat .env.local

# หรือใช้คำสั่งนี้เพื่อดูเฉพาะ Supabase config
grep SUPABASE .env.local
```

ต้องมีค่าดังนี้:
```
NEXT_PUBLIC_SUPABASE_URL=https://sqaffprdetbrxrdnslfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 3. ตรวจสอบว่ามี Migration Script ที่จำเป็นรันแล้วหรือยัง

ตรวจสอบว่าตาราง `post_metrics` มีคอลัมน์ที่จำเป็นหรือไม่:

### วิธีที่ 1: ใช้ Supabase Dashboard

1. ไปที่ https://supabase.com/dashboard
2. เลือก project ของคุณ
3. ไปที่ **Table Editor** → **post_metrics**
4. ตรวจสอบว่ามีคอลัมน์เหล่านี้หรือไม่:
   - `impressions_organic`
   - `impressions_boost`
   - `reach_organic`
   - `reach_boost`
   - `post_clicks`
   - `link_clicks`
   - `retweets`

### วิธีที่ 2: รัน SQL Query ตรวจสอบ

ไปที่ **SQL Editor** ใน Supabase Dashboard และรัน:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'post_metrics'
  AND column_name IN (
    'impressions_organic',
    'impressions_boost',
    'reach_organic',
    'reach_boost',
    'post_clicks',
    'link_clicks',
    'retweets'
  )
ORDER BY column_name;
```

ถ้าไม่มีคอลัมน์เหล่านี้ ให้รัน migration script:

```sql
-- รันไฟล์: scripts/add_post_metrics_columns.sql
ALTER TABLE public.post_metrics 
  ADD COLUMN IF NOT EXISTS impressions_organic INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impressions_boost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_organic INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_boost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS link_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retweets INTEGER DEFAULT 0;
```

## 4. ตรวจสอบ Network/Firewall

ถ้ายังเกิด error "fetch failed" อาจเป็นเพราะ:

1. **Internet connection** - ตรวจสอบว่าเชื่อมต่ออินเทอร์เน็ตได้
2. **Supabase Service Status** - ตรวจสอบที่ https://status.supabase.com
3. **Firewall/Proxy** - ถ้าอยู่ในบริษัท อาจต้องอนุญาต `*.supabase.co`
4. **Timeout** - ลองเพิ่ม timeout ใน query

## 5. ตรวจสอบ Browser Console

เปิด Developer Tools (F12) และดูที่ Console:

- ดู error message ที่ชัดเจนกว่า
- ดู Network tab ว่า request ไปที่ Supabase สำเร็จหรือไม่

## 6. ตรวจสอบ Server Logs

ถ้ารัน Next.js development server ให้ดูที่ terminal:

```bash
# ดู logs จาก Next.js server
# ควรเห็น error message ที่ละเอียดกว่า

# Error จะแสดงว่า:
# - Network error (fetch failed)
# - หรือ Query error (column not found, etc.)
```

## วิธีแก้ไข

### ถ้าเป็น Network Error:
1. ตรวจสอบ internet connection
2. ลอง refresh หน้าเว็บ
3. รอสักครู่แล้วลองใหม่ (อาจเป็น temporary issue)

### ถ้าเป็น Missing Columns:
รัน migration script:
```bash
# วิธีที่ 1: ใช้ Supabase Dashboard SQL Editor
# Copy เนื้อหาจาก scripts/add_post_metrics_columns.sql ไปรัน

# วิธีที่ 2: ใช้ Supabase CLI
supabase db push
```

### ถ้าเป็น RLS Policy Error:
ตรวจสอบว่ามีสิทธิ์เข้าถึงตาราง `post_metrics` หรือไม่:
- ต้อง login เป็น admin หรือ analyst
- หรือตรวจสอบ RLS policies ใน Supabase Dashboard
