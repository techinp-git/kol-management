# KOL Module Pagination Implementation

## Overview
ได้ทำการพัฒนาระบบ pagination สำหรับ KOL module ที่รองรับทั้ง server-side และ client-side pagination

## Features Implemented

### 1. API Endpoint for Paginated KOL Fetching
**File:** `app/api/kols/route.ts`

เพิ่ม GET method ที่รองรับ:
- **Pagination**: `page`, `limit` parameters
- **Search**: ค้นหาใน name, handle, bio
- **Filtering**: status, category, country, tier
- **Sorting**: sortBy, sortOrder parameters
- **Error Handling**: รองรับ fallback สำหรับ follower_history column

#### API Parameters:
```
GET /api/kols?page=1&limit=25&search=keyword&status=active&sortBy=created_at&sortOrder=desc
```

#### Response Format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalCount": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "search": "keyword",
    "status": "active",
    "category": "",
    "country": "",
    "tier": "",
    "sortBy": "created_at",
    "sortOrder": "desc"
  }
}
```

### 2. Enhanced KOL List Client Component
**File:** `components/kols-list-client.tsx`

เพิ่มความสามารถ:
- **Dual Mode**: รองรับทั้ง URL-based และ API-based pagination
- **API Integration**: fetch data จาก API endpoint
- **Loading States**: แสดง loading indicator ขณะโหลดข้อมูล
- **Debounced Search**: ค้นหาแบบ real-time สำหรับ API mode
- **Keyboard Navigation**: ใช้ลูกศร ← → เพื่อเปลี่ยนหน้า

#### New Props:
```typescript
interface KOLsListClientProps {
  // ... existing props
  useApiPagination?: boolean  // เปิด/ปิด API pagination mode
}
```

### 3. Demo Page for API Pagination
**File:** `app/dashboard/kols-api/page.tsx`

หน้าตัวอย่างที่ใช้ API pagination mode

## Usage Examples

### 1. Server-Side Pagination (เดิม)
```tsx
<KOLsListClient 
  initialKOLs={kols} 
  currentPage={currentPage}
  totalPages={totalPages}
  totalCount={totalCount}
  itemsPerPage={itemsPerPage}
  useApiPagination={false} // default
/>
```

### 2. API-Based Pagination (ใหม่)
```tsx
<KOLsListClient 
  initialKOLs={[]} 
  currentPage={1}
  totalPages={1}
  totalCount={0}
  itemsPerPage={25}
  useApiPagination={true}
/>
```

## Key Benefits

### 1. Performance
- ลดการโหลดข้อมูลที่ไม่จำเป็น
- รองรับ dataset ขนาดใหญ่
- Real-time search และ filtering

### 2. User Experience
- Loading states ที่ smooth
- Keyboard navigation
- Debounced search (300ms)
- Responsive pagination controls

### 3. Flexibility
- เลือกใช้ pagination mode ตามความเหมาะสม
- รองรับ backward compatibility
- Configurable page size และ sorting

## Technical Implementation Details

### 1. API Route Structure
```typescript
export async function GET(request: Request) {
  // Parse query parameters
  // Apply filters and search
  // Execute paginated query
  // Return structured response
}
```

### 2. Client-Side State Management
```typescript
const [apiPagination, setApiPagination] = useState({
  page: currentPage,
  totalPages: totalPages,
  totalCount: totalCount,
  hasNextPage: boolean,
  hasPrevPage: boolean
})
```

### 3. Dual Mode Logic
```typescript
const currentPageNum = useApiPagination ? apiPagination.page : currentPage
const maxPages = useApiPagination ? apiPagination.totalPages : totalPages
```

## Testing

### Manual Testing Steps:
1. เริ่ม development server
2. เข้าไปที่ `/dashboard/kols` (server-side pagination)
3. เข้าไปที่ `/dashboard/kols-api` (API pagination)
4. ทดสอบ search, filtering, และ navigation

### API Testing:
```bash
# Test basic pagination
curl "http://localhost:3000/api/kols?page=1&limit=10"

# Test search
curl "http://localhost:3000/api/kols?search=keyword"

# Test filtering
curl "http://localhost:3000/api/kols?status=active&page=1"
```

## Future Enhancements

1. **Caching**: เพิ่ม client-side caching สำหรับ API responses
2. **Infinite Scroll**: รองรับ infinite scrolling mode
3. **Advanced Filters**: เพิ่ม date range, multiple selection filters
4. **Export**: เพิ่มความสามารถ export filtered results
5. **Real-time Updates**: WebSocket สำหรับ real-time data updates

## Files Modified/Created

### Modified:
- `app/api/kols/route.ts` - เพิ่ม GET method
- `components/kols-list-client.tsx` - เพิ่ม API pagination support

### Created:
- `app/dashboard/kols-api/page.tsx` - Demo page
- `test-kol-api.js` - API testing script
- `KOL_PAGINATION_IMPLEMENTATION.md` - Documentation

## Conclusion

การ implement pagination ใน KOL module สำเร็จแล้ว โดยรองรับทั้ง server-side และ client-side pagination พร้อมด้วย search, filtering, และ sorting capabilities ที่ครบครัน
