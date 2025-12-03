# KOL Module Summary

## โครงสร้างการทำงาน

### 1. การสร้าง KOL (POST /api/kols)

**ขั้นตอน:**
1. รับข้อมูล KOL จาก request body
2. **Insert KOL ก่อน** → รับ `kol.id` กลับมา
3. **ถ้าสำเร็จ** → จึงค่อย insert `kol_channels` โดยใช้ `kol.id` เป็น foreign key
4. บันทึก `follower_history` ไปพร้อมกับ channels

**โค้ด:**
```typescript
// Step 1: Insert KOL
const { data: kol, error: kolError } = await supabase
  .from("kols")
  .insert({ name, handle, category, ... })
  .select()
  .single()

// Step 2: Insert channels (after KOL is created)
if (channels && channels.length > 0) {
  const channelsToInsert = channels.map((channel) => ({
    kol_id: kol.id,  // Use KOL ID
    channel_type: channel.channel_type,
    handle: channel.handle,
    follower_history: channel.history,  // Save history
  }))
  await supabase.from("kol_channels").insert(channelsToInsert)
}
```

---

### 2. การแก้ไข KOL (PATCH /api/kols/[id])

**ขั้นตอน:**
1. รับข้อมูล KOL จาก request body
2. **Update KOL ก่อน**
3. **ถ้าสำเร็จ** → จึงค่อย update/insert `kol_channels`
4. ลบ channels เก่าที่ไม่อยู่ใน list ใหม่
5. Update channels ที่มี ID อยู่แล้ว
6. Insert channels ใหม่ที่ไม่มี ID

**โค้ด:**
```typescript
// Step 1: Update KOL
const { data: kol, error: kolError } = await supabase
  .from("kols")
  .update({ name, handle, category, ... })
  .eq("id", id)
  .select()
  .single()

// Step 2: Update channels
if (channels) {
  // Delete old channels not in new list
  await supabase.from("kol_channels").delete()...
  
  // Update or insert channels
  for (const channel of channels) {
    if (channel.id) {
      // Update existing
      await supabase.from("kol_channels").update(...)
    } else {
      // Insert new
      await supabase.from("kol_channels").insert(...)
    }
  }
}
```

---

### 3. ช่องทางโซเชียลมีเดีย (History Mode)

**โครงสร้างข้อมูล:**
```typescript
{
  id: "uuid",
  kol_id: "uuid",
  channel_type: "instagram" | "facebook" | "tiktok" | ...,
  handle: "username",
  profile_url: "https://...",
  follower_count: 0,  // Current count
  follower_history: [  // History array (JSONB)
    { date: "2024-01-30", follower_count: 1000 },
    { date: "2024-01-23", follower_count: 950 },
    { date: "2024-01-16", follower_count: 900 },
  ]
}
```

**การเพิ่มประวัติ:**
1. ใน form มีปุ่ม "เพิ่มประวัติ" ในแต่ละ channel
2. กรอกวันที่และจำนวนผู้ติดตาม
3. บันทึกเป็น array ใน `follower_history`

---

### 4. การแสดงผลหน้า List (dashboard/kols)

**Format การแสดงผล:**
```
[Avatar] KOL Name
        @handle • Category1, Category2
        
        Facebook: fb_handle: 4,200
        Instagram: ig_handle: 15.5K
        TikTok: tiktok_handle: 2.3M
        +2 ช่องทางอื่น
        👥 รวม: 2.5M
        
        [Status Badge] [✏️ Edit]
```

**โค้ด:**
```typescript
{kol.kol_channels?.slice(0, 3).map((channel) => {
  const latestFollowerCount = getLatestFollowerCount(channel)
  return (
    <div>
      <span>{channel.channel_type}</span>
      <span>:</span>
      <span>{channel.handle}</span>
      <span>:</span>
      <span>{formatFollowerCount(latestFollowerCount)}</span>
    </div>
  )
})}
```

**ฟังก์ชัน `getLatestFollowerCount()`:**
- ถ้ามี `follower_history` → ใช้ค่าล่าสุดจากประวัติ (sorted by date desc)
- ถ้าไม่มีประวัติ → ใช้ `follower_count` จาก table

---

## ฐานข้อมูล

### Table: kols
```sql
- id: uuid (PK)
- name: text
- handle: text
- category: text[]
- country: text
- contact_email: text
- contact_phone: text
- bio: text
- notes: text
- status: text
- created_at: timestamptz
- updated_at: timestamptz
```

### Table: kol_channels
```sql
- id: uuid (PK)
- kol_id: uuid (FK → kols.id)
- channel_type: channel_type enum
- handle: text
- external_id: text
- profile_url: text
- follower_count: integer
- follower_history: jsonb  -- [{ date, follower_count }]
- avg_likes: decimal
- avg_comments: decimal
- avg_shares: decimal
- avg_views: decimal
- engagement_rate: decimal
- verified: boolean
- status: text
- notes: text
- created_at: timestamptz
- updated_at: timestamptz
```

---

## SQL Script สำหรับเพิ่ม follower_history

```sql
-- Add follower_history column
ALTER TABLE public.kol_channels 
ADD COLUMN IF NOT EXISTS follower_history JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.kol_channels.follower_history IS 
  'Array of follower history entries: [{"date": "YYYY-MM-DD", "follower_count": number}, ...]';

-- Create index
CREATE INDEX IF NOT EXISTS idx_kol_channels_follower_history 
ON public.kol_channels USING GIN (follower_history);
```

---

## Features

### ✅ สร้าง KOL
- Insert KOL ก่อน → สำเร็จ → Insert channels
- บันทึก follower_history พร้อม channels

### ✅ แก้ไข KOL
- Update KOL ก่อน → สำเร็จ → Update channels
- Update follower_history

### ✅ เพิ่มช่องทาง Social
- คลิก "เพิ่มช่องทาง"
- กรอกข้อมูล: channel_type, handle, profile_url, follower_count
- บันทึก

### ✅ เพิ่มประวัติผู้ติดตาม
- ในแต่ละ channel
- คลิก "เพิ่มประวัติ"
- กรอก: date, follower_count
- บันทึก

### ✅ แสดงผลหน้า List
- Format: "Facebook: handle_name: 4,200"
- แสดงค่าล่าสุดจากประวัติ
- แสดงยอดรวมทุก channels

---

## การทดสอบ

### 1. สร้าง KOL ใหม่
```
1. ไปที่ /dashboard/kols/new
2. กรอกข้อมูล KOL
3. คลิก "เพิ่มช่องทาง"
4. กรอกข้อมูล channel (Instagram, handle, follower_count)
5. คลิก "เพิ่มประวัติ"
6. กรอกวันที่และจำนวนผู้ติดตาม
7. บันทึก
8. ตรวจสอบว่า KOL และ channels ถูกสร้าง
```

### 2. แก้ไข KOL
```
1. ไปที่ /dashboard/kols
2. คลิก ✏️ edit
3. แก้ไขข้อมูล
4. เพิ่ม/ลบ channels
5. เพิ่ม/ลบ ประวัติผู้ติดตาม
6. บันทึก
7. ตรวจสอบว่าข้อมูลถูก update
```

### 3. ดูหน้า List
```
1. ไปที่ /dashboard/kols
2. ตรวจสอบว่าแสดง:
   - ชื่อ KOL
   - Facebook: fb_handle: 4,200
   - Instagram: ig_handle: 15.5K
   - ยอดรวม
```

---

## หมายเหตุ

### ⚠️ สำคัญ
1. **ต้องรัน SQL script** เพื่อเพิ่ม `follower_history` column
2. ถ้ายังไม่รัน → จะใช้ `follower_count` จาก table
3. หลังรัน → จะใช้ค่าล่าสุดจากประวัติ

### 🔧 Troubleshooting
1. **ถ้า insert KOL แต่ไม่มี channels:**
   - ตรวจสอบ console logs
   - ตรวจสอบว่า KOL ถูกสร้างหรือไม่
   - ตรวจสอบ RLS policies

2. **ถ้าแสดง follower count ผิด:**
   - ตรวจสอบว่ารัน SQL script แล้วหรือยัง
   - ตรวจสอบ `follower_history` ในฐานข้อมูล
   - ตรวจสอบ `getLatestFollowerCount()` function

3. **ถ้าเพิ่มช่องทางไม่ได้:**
   - เปิด Browser Console
   - ดู logs: `[v0] addChannel called`
   - ตรวจสอบ `channels` state

---

## สรุป

**ระบบทำงานแบบนี้:**
1. Insert/Update KOL ก่อน
2. จึงค่อย Insert/Update channels
3. ช่องทางเก็บ history แบบ JSONB array
4. หน้า list แสดง: "Channel: handle: count"
5. ใช้ค่าล่าสุดจากประวัติ

**พร้อมใช้งานแล้ว** ✅

