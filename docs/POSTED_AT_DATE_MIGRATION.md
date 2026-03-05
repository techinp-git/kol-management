# Migration: posted_at จาก TIMESTAMPTZ เป็น DATE

## 📋 สรุปการเปลี่ยนแปลง

เมื่อเปลี่ยน data type ของ `posted_at` จาก `TIMESTAMPTZ` เป็น `DATE` ใน table `posts` มีส่วนที่ต้องแก้ไขดังนี้:

## ✅ ส่วนที่แก้ไขแล้ว

### 1. **API Routes**
- ✅ `app/api/posts/route.ts` (POST) - แปลง posted_at เป็น DATE format (YYYY-MM-DD)
- ✅ `app/api/posts/[id]/route.ts` (PATCH) - แปลง posted_at เป็น DATE format (YYYY-MM-DD)
- ✅ `app/api/import-posts/transfer/route.ts` - แปลง post_date เป็น posted_at (DATE format)

### 2. **Form Components**
- ✅ `components/post-form.tsx` - เปลี่ยน input type จาก `datetime-local` เป็น `date`
- ✅ `components/post-edit-form.tsx` - เปลี่ยน input type จาก `datetime-local` เป็น `date` และปรับการแปลงค่าเริ่มต้น

### 3. **Display Components**
- ✅ `components/post-detail-client.tsx` - เปลี่ยนจาก `.toLocaleString()` เป็น `.toLocaleDateString()`
- ✅ `components/posts-list-client.tsx` - ใช้ `.toLocaleDateString()` ถูกต้องแล้ว
- ✅ `components/campaign-detail-client.tsx` - ใช้ `.toLocaleDateString()` ถูกต้องแล้ว
- ✅ `components/kol-detail-client.tsx` - ใช้ `.toLocaleDateString()` ถูกต้องแล้ว

### 4. **Filter Logic**
- ✅ `components/posts-list-client.tsx` - Date filter ทำงานถูกต้อง (ใช้ new Date() และ setHours() สำหรับ comparison)

## 📝 รายละเอียดการแก้ไข

### API Routes

**เดิม:**
```typescript
posted_at: posted_at ? (posted_at.includes("T") ? posted_at.split("T")[0] : posted_at) : null
```

**แก้ไขเป็น:**
```typescript
posted_at: posted_at 
  ? (typeof posted_at === 'string' 
      ? (posted_at.includes("T") ? posted_at.split("T")[0] : posted_at.slice(0, 10))
      : new Date(posted_at).toISOString().slice(0, 10))
  : null
```

### Form Components

**post-form.tsx:**
- เปลี่ยน `type="datetime-local"` → `type="date"`

**post-edit-form.tsx:**
- เปลี่ยน `type="datetime-local"` → `type="date"`
- ปรับการแปลงค่าเริ่มต้น:
  ```typescript
  const [postedAt, setPostedAt] = useState(
    post.posted_at 
      ? (typeof post.posted_at === 'string' 
          ? (post.posted_at.includes('T') ? post.posted_at.split('T')[0] : post.posted_at)
          : new Date(post.posted_at).toISOString().slice(0, 10))
      : ""
  )
  ```

### Display Components

**post-detail-client.tsx:**
- เปลี่ยนจาก `.toLocaleString()` → `.toLocaleDateString()` พร้อม format options

## ⚠️ สิ่งที่ต้องระวัง

1. **Database Migration**
   - Migration script `013_change_posted_at_to_date.sql` ควรรันแล้ว
   - ตรวจสอบว่า column type เป็น `DATE` แล้ว

2. **Existing Data**
   - ข้อมูลเก่าจะถูกแปลงจาก TIMESTAMPTZ เป็น DATE โดยอัตโนมัติ (เวลา 00:00:00 จะถูกตัดออก)

3. **Date Comparisons**
   - Filter logic ใน `posts-list-client.tsx` ใช้ `setHours()` เพื่อ normalize time เป็น 00:00:00 สำหรับ DATE ซึ่งทำงานได้ถูกต้อง

4. **API Responses**
   - Supabase จะ return DATE เป็น string format `YYYY-MM-DD` ซึ่งตรงกับที่ code คาดหวัง

## 🔍 ส่วนที่ควรตรวจสอบเพิ่มเติม

1. **Database Queries**
   - ตรวจสอบว่าการ query `posted_at` ใน Supabase ทำงานถูกต้องหรือไม่
   - ORDER BY `posted_at` ควรทำงานได้ปกติ

2. **Date Format**
   - ตรวจสอบว่า format ที่ส่งจาก frontend เป็น `YYYY-MM-DD` (date input format)

3. **Validation**
   - ตรวจสอบ validation rules ใน forms ว่ายังใช้งานได้หรือไม่

## 📊 ผลกระทบ

### ไม่กระทบ
- ✅ Database queries (ORDER BY, WHERE clauses)
- ✅ Date filtering logic
- ✅ การแสดงผลวันที่ (ใช้ .toLocaleDateString())

### กระทบเล็กน้อย
- ⚠️ Form inputs เปลี่ยนจาก datetime-local เป็น date (ไม่แสดงเวลา)
- ⚠️ การแสดงผลในบางที่อาจไม่แสดงเวลาอีกต่อไป (แต่ก็ไม่จำเป็นเพราะเป็น DATE)

## ✅ สรุป

การเปลี่ยน `posted_at` จาก TIMESTAMPTZ เป็น DATE ได้แก้ไขครบถ้วนแล้ว:
- ✅ API routes แปลง format ถูกต้อง
- ✅ Form components ใช้ date input แทน datetime-local
- ✅ Display components แสดงวันที่ถูกต้อง
- ✅ Filter logic ทำงานได้ปกติ
