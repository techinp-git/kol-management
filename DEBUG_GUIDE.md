# Debug Guide - วิธีดู Logs & Errors

## 🔍 วิธีดู Error แบบ Real-time

### 1. Terminal Logs (Server-side)

**ที่:** Terminal ที่รัน `pnpm dev`

**จะเห็น:**
- ✅ API route errors
- ✅ Database query errors
- ✅ Server-side errors
- ✅ Supabase errors

**ตัวอย่าง error:**
```
[v0] Error fetching KOL: {
  message: "Row level security",
  details: null,
  hint: null,
  code: "42501"
}
```

---

### 2. Browser Console (Client-side)

**วิธีเปิด:**
- กด **F12** (Windows/Linux)
- กด **Cmd+Option+I** (Mac)
- หรือ Right-click > Inspect > Console

**จะเห็น:**
- ✅ React errors
- ✅ Client-side errors
- ✅ console.error() messages
- ✅ JavaScript errors

**ตัวอย่าง error:**
```javascript
Error: Failed to save KOL
    at KOLForm.handleSubmit (kol-form.tsx:128)
```

---

### 3. Network Tab (API errors)

**วิธีเปิด:**
1. กด **F12**
2. ไปที่แท็บ **Network**
3. Filter: **Fetch/XHR**

**จะเห็น:**
- ✅ API requests
- ✅ Response status (200, 400, 404, 500)
- ✅ Response body
- ✅ Request payload

**ตัวอย่าง:**
```
POST /api/kols → Status: 400
Response: { error: "new row violates row-level security policy" }
```

---

### 4. Error Details ใน Code

**ใน:** `app/dashboard/kols/[id]/page.tsx`

```typescript
if (error) {
  console.error("[v0] Error fetching KOL:", error)
  console.error("[v0] Error details:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  })
  notFound()
}
```

**จะแสดง:**
- `message`: Error message
- `details`: รายละเอียดเพิ่มเติม
- `hint`: คำแนะนำ
- `code`: Error code (เช่น 42501 = RLS error)

---

## 🎯 Error Codes ที่พบบ่อย

| Error Code | ความหมาย | สาเหตุ | วิธีแก้ |
|------------|---------|--------|---------|
| `42501` | insufficient_privilege | RLS policy ไม่อนุญาต | รัน fix-kols-rls.sql |
| `23514` | check_constraint_violation | Status ไม่ถูกต้อง | ใช้ valid status |
| `23503` | foreign_key_violation | Foreign key ไม่ถูกต้อง | ตรวจสอบ reference |
| `42P01` | undefined_table | Table ไม่มี | รัน migrations |

---

## 🧪 ทดสอบแบบมี Logs

### Test 1: สร้าง KOL พร้อม Debug

**Terminal 1:** รัน server
```bash
pnpm dev
```

**Terminal 2:** Watch logs (optional)
```bash
tail -f .next/trace
```

**Browser:**
1. เปิด Console (F12)
2. เปิด Network tab
3. ไปที่: http://localhost:3000/dashboard/kols/new
4. กรอกข้อมูลและกด "บันทึก"

**ดู logs:**
- **Terminal 1:** Server-side errors
- **Browser Console:** Client-side errors
- **Network Tab:** API responses

---

### Test 2: ดู Error แบบละเอียด

เพิ่ม debug logs ใน code:

```typescript
// In: components/kol-form.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  console.log("🚀 Submitting KOL:", {
    name,
    handle,
    category: selectedCategories,
    status: "active",
  })

  try {
    const response = await fetch("/api/kols", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        handle,
        category: selectedCategories,
        country,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        bio,
        notes,
        status: "active",
        channels,
      }),
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const data = await response.json()
      console.error("❌ Error response:", data)
      throw new Error(data.error || "Failed to save KOL")
    }

    const data = await response.json()
    console.log("✅ Success:", data)
    
    router.push(`/dashboard/kols/${data.id}`)
    router.refresh()
  } catch (err: any) {
    console.error("💥 Exception:", err)
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}
```

---

## 📊 Common Error Patterns

### Pattern 1: RLS Error
```
Terminal:
  [v0] Error creating KOL: { code: "42501" }
  
Solution:
  Run: scripts/fix-kols-rls.sql
```

### Pattern 2: Status Constraint Error
```
Terminal:
  [v0] Error: violates check constraint "kols_status_check"
  
Solution:
  Use valid status: 'active', 'inactive', 'blacklisted', 'draft', 'ban'
```

### Pattern 3: 404 After Save
```
Browser Console:
  [v0] Error fetching KOL: { code: "42501" }
  
Terminal:
  POST /api/kols → 200 ✅
  GET /api/kols/[id] → 404 ❌
  
Solution:
  SELECT policy missing - Run fix-kols-rls.sql
```

---

## 💡 Tips

1. **เปิด 2 terminals:**
   - Terminal 1: `pnpm dev` (server)
   - Terminal 2: ว่างไว้สำหรับรัน commands

2. **เปิด Browser DevTools ตลอด:**
   - Console tab สำหรับ errors
   - Network tab สำหรับ API calls

3. **ดู error code:**
   - `42501` = RLS error
   - `23514` = Constraint error
   - `42P01` = Table not found

4. **Check ทั้ง 3 ที่:**
   - ✅ Terminal (server logs)
   - ✅ Browser Console (client errors)
   - ✅ Network Tab (API responses)

---

## 🔗 เอกสารเพิ่มเติม

- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Setup Guide:** `SETUP_KOL_MODULE.md`
- **Test Checklist:** `KOL_MODULE_CHECKLIST.md`

---

## 📝 Quick Commands

```bash
# Start server
pnpm dev

# Check if server is running
curl http://localhost:3000

# Test API endpoint
curl http://localhost:3000/api/kols/[id]

# Watch logs (if available)
tail -f .next/trace
```

---

**สรุป:** ดู logs จาก 3 ที่:
1. **Terminal** (server logs)
2. **Browser Console** (client errors)  
3. **Network Tab** (API responses)

