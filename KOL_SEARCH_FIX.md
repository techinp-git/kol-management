# KOL Search และ Pagination Fix

## ปัญหาที่แก้ไข
เดิมการ search ใน KOL module จะค้นหาเฉพาะข้อมูลใน page ปัจจุบันเท่านั้น ไม่ได้ค้นหาจากข้อมูลทั้งหมด และไม่ได้คำนวณ pagination ใหม่หลังจาก search

## การแก้ไข

### 1. แก้ไข KOL Page (`app/dashboard/kols/page.tsx`)
- เปลี่ยนจาก fetch แค่ page ปัจจุบัน เป็น fetch ข้อมูลทั้งหมด
- ส่งข้อมูลทั้งหมดไปให้ client component จัดการ
- เพิ่ม prop `useClientSideSearch={true}`

```tsx
// เดิม - fetch แค่ page ปัจจุบัน
.range(offset, offset + itemsPerPage - 1)

// ใหม่ - fetch ข้อมูลทั้งหมด
.order("created_at", { ascending: false })
```

### 2. แก้ไข KOL List Client (`components/kols-list-client.tsx`)

#### เพิ่ม Props และ State
```tsx
interface KOLsListClientProps {
  // ... existing props
  useClientSideSearch?: boolean  // เปิด/ปิด client-side search
}

// เพิ่ม state สำหรับ client-side pagination
const [allKols, setAllKols] = useState<KOL[]>(initialKOLs)
const [clientPagination, setClientPagination] = useState({
  page: currentPage,
  totalPages: totalPages,
  totalCount: totalCount,
  filteredKols: initialKOLs
})
```

#### เพิ่มฟังก์ชัน Client-Side Search
```tsx
const performClientSearch = (query: string, page: number = 1) => {
  // Filter จากข้อมูลทั้งหมด
  const filtered = allKols.filter((kol) => {
    const searchTerm = query.toLowerCase()
    return (
      kol.name.toLowerCase().includes(searchTerm) ||
      kol.handle?.toLowerCase().includes(searchTerm) ||
      // ... ค้นหาใน field อื่นๆ
    )
  })

  // คำนวณ pagination ใหม่
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const pageData = filtered.slice(startIndex, endIndex)

  // อัปเดต state
  setClientPagination({ page, totalPages, totalCount, filteredKols: pageData })
}
```

#### อัปเดต Effects
```tsx
// Client-side search effect
useEffect(() => {
  if (!useClientSideSearch) return
  
  const timeoutId = setTimeout(() => {
    performClientSearch(searchQuery, 1)
  }, 300)
  
  return () => clearTimeout(timeoutId)
}, [searchQuery, useClientSideSearch, allKols])
```

#### อัปเดต Pagination Logic
```tsx
const handlePageChange = (page: number) => {
  // รองรับ 3 modes: API, Client-side, URL-based
  if (useApiPagination) {
    // API pagination
  } else if (useClientSideSearch) {
    // Client-side pagination
    performClientSearch(searchQuery, page)
  } else {
    // URL-based pagination (เดิม)
  }
}
```

## คุณสมบัติใหม่

### 1. Search จากข้อมูลทั้งหมด
- ค้นหาจาก database ทั้งหมด ไม่ใช่แค่ page ปัจจุบัน
- แสดงผลการค้นหาที่ถูกต้อง

### 2. Pagination ที่คำนวณใหม่
- คำนวณจำนวนหน้าใหม่ตามผลการค้นหา
- แสดงจำนวนรายการที่ถูกต้อง
- Navigation ที่ทำงานถูกต้อง

### 3. UI Improvements
- แสดงข้อความ "ผลการค้นหา" เมื่อมีการค้นหา
- Loading states ที่เหมาะสม
- Keyboard navigation ที่ทำงานถูกต้อง

### 4. Performance
- Debounced search (300ms)
- Client-side filtering ที่รวดเร็ว
- Memory efficient pagination

## การใช้งาน

### Server-Side Pagination (API)
```tsx
<KOLsListClient 
  useApiPagination={true}
  // ... other props
/>
```

### Client-Side Search (ใหม่)
```tsx
<KOLsListClient 
  useClientSideSearch={true}
  initialKOLs={allKolsData}  // ข้อมูลทั้งหมด
  // ... other props
/>
```

### URL-Based Pagination (เดิม)
```tsx
<KOLsListClient 
  // default behavior
  initialKOLs={pagedKolsData}  // ข้อมูล page ปัจจุบัน
  // ... other props
/>
```

## ข้อดี

1. **ความถูกต้อง**: Search จากข้อมูลทั้งหมด
2. **UX ที่ดีขึ้น**: Pagination ที่คำนวณใหม่ตามผลการค้นหา
3. **Performance**: Client-side filtering ที่รวดเร็ว
4. **Flexibility**: รองรับหลาย pagination modes
5. **Backward Compatible**: ไม่กระทบกับ code เดิม

## Files ที่แก้ไข

- ✅ `app/dashboard/kols/page.tsx` - Fetch ข้อมูลทั้งหมด
- ✅ `components/kols-list-client.tsx` - Client-side search และ pagination
- ✅ `KOL_SEARCH_FIX.md` - เอกสารนี้

## ผลลัพธ์

ตอนนี้การ search ใน KOL module จะ:
1. ค้นหาจากข้อมูลทั้งหมดในฐานข้อมูล
2. คำนวณ pagination ใหม่ตามผลการค้นหา
3. แสดงจำนวนรายการที่ถูกต้อง
4. Navigation ที่ทำงานถูกต้องตามผลการค้นหา

การแก้ไขนี้ทำให้ระบบ search และ pagination ทำงานได้อย่างถูกต้องและมีประสิทธิภาพมากขึ้น! 🚀
