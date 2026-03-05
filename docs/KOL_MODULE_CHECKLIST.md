# KOL Module - INSERT/UPDATE/DELETE Checklist

## ✅ ตรวจสอบ Module KOL

### 1. INSERT (Create KOL) ✅

**API Route:** `app/api/kols/route.ts` - `POST`
- ✅ Validate status (active, inactive, blacklisted, draft, ban)
- ✅ Insert KOL data
- ✅ Insert kol_channels (if provided)
- ✅ Error handling

**Frontend:** `components/kol-form.tsx`
- ✅ Form fields: name, handle, category, country, contact_email, contact_phone, bio, notes
- ✅ Channels management
- ✅ Submit to `/api/kols` (POST)
- ✅ Redirect to detail page after success

**RLS Policy:** `scripts/fix-kols-rls.sql`
- ✅ `Authenticated users can insert KOLs` - WITH CHECK (true)

**Status:** ✅ Ready

---

### 2. UPDATE (Edit KOL) ✅

**API Route:** `app/api/kols/[id]/route.ts` - `PATCH`
- ✅ Validate status (active, inactive, blacklisted, draft, ban)
- ✅ Update KOL data
- ✅ Update kol_channels (delete old, insert/update new)
- ✅ Error handling

**Frontend:** `components/kol-edit-form.tsx`
- ✅ Form fields: name, handle, category, country, contact_email, contact_phone, bio, notes, status
- ✅ Channels management
- ✅ Submit to `/api/kols/[id]` (PATCH)
- ✅ Redirect to detail page after success

**RLS Policy:** `scripts/fix-kols-rls.sql`
- ✅ `Authenticated users can update KOLs` - USING (true)

**Status:** ✅ Ready

---

### 3. DELETE (Remove KOL) ✅

**API Route:** `app/api/kols/[id]/route.ts` - `DELETE`
- ✅ Delete kol_channels first (foreign key constraint)
- ✅ Delete KOL
- ✅ Error handling

**Frontend:** `components/kol-detail-client.tsx`
- ✅ Delete button with confirmation dialog
- ✅ Submit to `/api/kols/[id]` (DELETE)
- ✅ Redirect to list page after success

**RLS Policy:** `scripts/fix-kols-rls.sql`
- ✅ `Authenticated users can delete KOLs` - USING (true)

**Status:** ✅ Ready

---

### 4. SELECT (View KOL) ✅

**API Route:** `app/api/kols/[id]/route.ts` - `GET`
- ✅ Fetch KOL with kol_channels
- ✅ Error handling

**Frontend:** 
- `app/dashboard/kols/[id]/page.tsx` - Detail page
- `components/kol-detail-client.tsx` - Client component

**RLS Policy:** `scripts/fix-kols-rls.sql`
- ✅ `Authenticated users can view KOLs` - USING (true)

**Status:** ✅ Ready

---

## 📋 Test Checklist

### Test 1: INSERT (Create KOL)

**Steps:**
1. Go to `/dashboard/kols/new`
2. Fill in:
   - Name: "Test KOL"
   - Handle: "@testkol"
   - Category: "Fashion"
   - Country: "TH"
   - Contact Email: "test@example.com"
   - Contact Phone: "0812345678"
   - Bio: "Test bio"
   - Notes: "Test notes"
3. Add channel (optional):
   - Channel Type: "instagram"
   - Handle: "@testkol"
   - Profile URL: "https://instagram.com/testkol"
   - Follower Count: 1000
4. Click "บันทึก"

**Expected:**
- ✅ KOL created successfully
- ✅ Redirect to `/dashboard/kols/[id]`
- ✅ KOL data displayed correctly
- ✅ Channels created (if provided)

**Check:**
- [ ] No error in console
- [ ] KOL appears in list (`/dashboard/kols`)
- [ ] KOL data correct in Supabase Dashboard

---

### Test 2: UPDATE (Edit KOL)

**Steps:**
1. Go to `/dashboard/kols/[id]/edit`
2. Change:
   - Name: "Updated Test KOL"
   - Contact Email: "updated@example.com"
   - Bio: "Updated bio"
3. Add/update channel
4. Click "บันทึก"

**Expected:**
- ✅ KOL updated successfully
- ✅ Redirect to `/dashboard/kols/[id]`
- ✅ Updated data displayed correctly
- ✅ Channels updated correctly

**Check:**
- [ ] No error in console
- [ ] Updated data visible in detail page
- [ ] Updated data correct in Supabase Dashboard

---

### Test 3: DELETE (Remove KOL)

**Steps:**
1. Go to `/dashboard/kols/[id]`
2. Click "ลบ" button
3. Confirm deletion in dialog
4. Click "ลบ" in confirmation

**Expected:**
- ✅ KOL deleted successfully
- ✅ Redirect to `/dashboard/kols`
- ✅ KOL removed from list
- ✅ Channels deleted (cascade)

**Check:**
- [ ] No error in console
- [ ] KOL removed from list
- [ ] KOL deleted from Supabase Dashboard
- [ ] Channels deleted from Supabase Dashboard

---

### Test 4: Status Updates

**Steps:**
1. Go to `/dashboard/kols/[id]`
2. Change status via status dropdown
3. Select new status (active, inactive, draft, ban)
4. Add reason (optional)
5. Click "บันทึก"

**Expected:**
- ✅ Status updated successfully
- ✅ Status change logged in status_changes table (if reason provided)
- ✅ Status badge updated in UI

**Check:**
- [ ] No error in console
- [ ] Status updated in detail page
- [ ] Status updated in Supabase Dashboard
- [ ] Status change logged (if reason provided)

---

## 🔧 Pre-Test Checklist

### Before Testing:

1. **RLS Policies** ✅
   - [ ] Run `scripts/fix-kols-rls.sql` in Supabase Dashboard
   - [ ] Verify policies exist:
     ```sql
     SELECT policyname, cmd FROM pg_policies WHERE tablename = 'kols';
     ```
   - [ ] Should see: SELECT, INSERT, UPDATE, DELETE policies

2. **Status Constraint** ✅
   - [ ] Verify constraint allows: 'active', 'inactive', 'blacklisted', 'draft', 'ban'
   - [ ] Run `scripts/fix-kols-status-constraint.sql` if needed

3. **Authentication** ✅
   - [ ] User logged in
   - [ ] Supabase session active
   - [ ] Check: `localStorage` or browser console

4. **Server Running** ✅
   - [ ] `pnpm dev` running
   - [ ] Accessible at `http://localhost:3000`

---

## 🐛 Common Issues & Solutions

### Issue: "new row violates row-level security policy"
**Solution:** Run `scripts/fix-kols-rls.sql`

### Issue: "violates check constraint kols_status_check"
**Solution:** Use valid status: 'active', 'inactive', 'blacklisted', 'draft', 'ban'

### Issue: "KOL not found"
**Solution:** Check KOL ID exists in database

### Issue: "permission denied for table kols"
**Solution:** Run `scripts/fix-kols-rls.sql` and verify user is authenticated

---

## 📝 Notes

- All operations require authentication
- Status validation is enforced in API routes
- Channels are managed with KOL (create/update/delete)
- Foreign key constraints: kol_channels deleted before KOL

---

## ✅ Summary

**INSERT:** ✅ Ready
**UPDATE:** ✅ Ready
**DELETE:** ✅ Ready
**SELECT:** ✅ Ready

**All modules are ready for testing!**

