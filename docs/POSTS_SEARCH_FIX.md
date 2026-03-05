# Posts Search และ Pagination Fix

## ปัญหาที่แก้ไข
เดิมการ search ใน Posts module จะค้นหาเฉพาะข้อมูลใน page ปัจจุบันเท่านั้น ไม่ได้ค้นหาจากข้อมูลทั้งหมด และไม่ได้คำนวณ pagination ใหม่หลังจาก search

## การแก้ไข

### 1. แก้ไข Posts Page (`app/dashboard/posts/page.tsx`)

#### เปลี่ยนจาก Paginated Fetch เป็น Full Data Fetch
```tsx
// เดิม - fetch แค่ page ปัจจุบัน
.range(requestedOffset, requestedOffset + PAGE_SIZE - 1)

// ใหม่ - fetch ข้อมูลทั้งหมด
.order("posted_at", { ascending: false })
```

#### ลบ Fallback Logic ที่ไม่จำเป็น
- ลบการ fetch หน้าสุดท้ายเมื่อ page เกิน
- ลบ logic ที่ซับซ้อนสำหรับ pagination validation
- เพิ่ม `useClientSideSearch={true}` prop

### 2. แก้ไข Posts List Client (`components/posts-list-client.tsx`)

#### เพิ่ม Props และ State
```tsx
interface PostsListClientProps {
  // ... existing props
  useClientSideSearch?: boolean  // เปิด/ปิด client-side search
}

// เพิ่ม state สำหรับ client-side pagination
const [clientPagination, setClientPagination] = useState({
  currentPage: pagination?.currentPage || 1,
  totalPages: pagination?.totalPages || 1,
  totalCount: pagination?.totalCount || allPosts.length,
  pageSize: pagination?.pageSize || 10,
  filteredPosts: allPosts
})
```

#### เพิ่มฟังก์ชัน Client-Side Search
```tsx
const performClientSearch = (query: string, dateFromFilter: string, dateToFilter: string, page: number = 1) => {
  let filtered = allPosts

  // Apply search filter
  if (query.trim()) {
    const searchTerm = query.toLowerCase()
    filtered = filtered.filter((post) => {
      return (
        post.kol_name?.toLowerCase().includes(searchTerm) ||
        post.post_name?.toLowerCase().includes(searchTerm) ||
        post.caption?.toLowerCase().includes(searchTerm) ||
        post.platform?.toLowerCase().includes(searchTerm) ||
        post.content_type?.toLowerCase().includes(searchTerm) ||
        post.campaign_name?.toLowerCase().includes(searchTerm) ||
        post.remark?.toLowerCase().includes(searchTerm) ||
        categories.toLowerCase().includes(searchTerm)
      )
    })
  }

  // Apply date filter
  if (dateFromFilter || dateToFilter) {
    // ... date filtering logic
  }

  // Calculate pagination
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const pageData = filtered.slice(startIndex, endIndex)

  // Update state
  setClientPagination({ currentPage: validPage, totalPages, totalCount, pageSize, filteredPosts: pageData })
  setPosts(pageData)
}
```

#### อัปเดต Effects
```tsx
// Initialize client-side search
useEffect(() => {
  if (useClientSideSearch) {
    performClientSearch("", "", "", 1)
  } else {
    setPosts(allPosts)
  }
}, [useClientSideSearch, allPosts])

// Debounced search effect
useEffect(() => {
  if (!useClientSideSearch) return
  
  const timeoutId = setTimeout(() => {
    performClientSearch(searchQuery, dateFrom, dateTo, 1)
  }, 300)
  
  return () => clearTimeout(timeoutId)
}, [searchQuery, dateFrom, dateTo, useClientSideSearch])
```

#### อัปเดต Pagination Logic
```tsx
const handlePageChange = (page: number) => {
  if (useClientSideSearch) {
    // Client-side pagination
    performClientSearch(searchQuery, dateFrom, dateTo, page)
  } else {
    // URL-based pagination (เดิม)
    // ... existing logic
  }
}
```

## คุณสมบัติใหม่

### 1. Search จากข้อมูลทั้งหมด
ค้นหาใน fields ต่อไปนี้:
- `kol_name` - ชื่อ KOL
- `post_name` - ชื่อโพสต์
- `caption` - คำบรรยาย
- `platform` - แพลตฟอร์ม
- `content_type` - ประเภทเนื้อหา
- `campaign_name` - ชื่อแคมเปญ
- `remark` - หมายเหตุ
- `kol_category` - หมวดหมู่ KOL

### 2. Date Range Filtering
- กรองตามช่วงวันที่โพสต์
- รองรับการกรองแบบ "จากวันที่" และ "ถึงวันที่"
- ทำงานร่วมกับ search ได้

### 3. Pagination ที่คำนวณใหม่
- คำนวณจำนวนหน้าใหม่ตามผลการค้นหา
- แสดงจำนวนรายการที่ถูกต้อง
- Navigation ที่ทำงานถูกต้อง

### 4. UI Improvements
- แสดงจำนวนผลการค้นหาแยกจากข้อมูลทั้งหมด
- Loading states ที่เหมาะสม
- Clear filters functionality

### 5. Performance
- Debounced search (300ms)
- Client-side filtering ที่รวดเร็ว
- Memory efficient pagination

## การใช้งาน

### Client-Side Search (ใหม่ - แนะนำ)
```tsx
<PostsListClient 
  useClientSideSearch={true}
  initialPosts={allPostsData}  // ข้อมูลทั้งหมด
  pagination={{
    currentPage: 1,
    pageSize: 10,
    totalCount: allPostsData.length,
    totalPages: Math.ceil(allPostsData.length / 10)
  }}
/>
```

### URL-Based Pagination (เดิม)
```tsx
<PostsListClient 
  initialPosts={pagedPostsData}  // ข้อมูล page ปัจจุบัน
  pagination={{
    currentPage,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages
  }}
/>
```

## ข้อดี

1. **ความถูกต้อง**: Search จากข้อมูลทั้งหมด
2. **UX ที่ดีขึ้น**: Pagination ที่คำนวณใหม่ตามผลการค้นหา
3. **Performance**: Client-side filtering ที่รวดเร็ว
4. **Rich Search**: รองรับ search หลาย fields และ date filtering
5. **Backward Compatible**: ไม่กระทบกับ code เดิม

## การทดสอบ

### Manual Testing Steps:
1. เข้าไปที่ `/dashboard/posts`
2. ทดสอบ search ด้วยคำค้นต่างๆ:
   - ชื่อ KOL
   - ชื่อโพสต์
   - คำบรรยาย
   - แพลตฟอร์ม
3. ทดสอบ date range filtering
4. ทดสอบ pagination หลังจาก search
5. ทดสอบการ clear filters

### Expected Results:
- Search ค้นหาจากข้อมูลทั้งหมด ไม่ใช่แค่ page ปัจจุบัน
- Pagination คำนวณใหม่ตามผลการค้นหา
- แสดงจำนวนรายการที่ถูกต้อง
- Navigation ทำงานถูกต้องตามผลการค้นหา

## Files ที่แก้ไข

- ✅ `app/dashboard/posts/page.tsx` - Fetch ข้อมูลทั้งหมด
- ✅ `components/posts-list-client.tsx` - Client-side search และ pagination
- ✅ `POSTS_SEARCH_FIX.md` - เอกสารนี้

## ผลลัพธ์

ตอนนี้การ search ใน Posts module จะ:
1. ค้นหาจากข้อมูลทั้งหมดในฐานข้อมูล
2. คำนวณ pagination ใหม่ตามผลการค้นหา
3. รองรับ date range filtering
4. แสดงจำนวนรายการที่ถูกต้อง
5. Navigation ที่ทำงานถูกต้องตามผลการค้นหา

การแก้ไขนี้ทำให้ระบบ search และ pagination ใน Posts module ทำงานได้อย่างถูกต้องและมีประสิทธิภาพมากขึ้น! 🚀
