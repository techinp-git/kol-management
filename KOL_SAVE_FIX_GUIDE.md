# KOL Save/Redirect Issue Fix Guide

## Problem Description

When saving a new KOL, the following errors occur:
```
Error: invalid input syntax for type uuid: "undefined"
Code: 22P02
```

The KOL is successfully saved to the database, but the redirect fails because the API cannot return the created KOL's ID.

## Root Cause

This is caused by **RLS (Row Level Security)** policies that prevent the API from reading back the newly created KOL record. Specifically:

1. The `INSERT` operation succeeds and creates the KOL
2. The `.select().single()` query fails due to RLS policies
3. The API returns `{id: undefined}` instead of `{id: "uuid-value"}`
4. The form tries to redirect to `/dashboard/kols/undefined`
5. The detail page tries to query for UUID "undefined" and fails

## Solution

You need to update the RLS policies to allow authenticated users to read the records they create.

### Option 1: Apply SQL Fix via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql

2. Copy and paste the following SQL:

```sql
-- Fix RLS policies for kol_channels table
-- This allows authenticated users to create channels when creating KOLs

-- ==========================================
-- KOL_CHANNELS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all channels" ON kol_channels;
DROP POLICY IF EXISTS "KOL users can view their own channels" ON kol_channels;
DROP POLICY IF EXISTS "Brand users can view active channels" ON kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON kol_channels;
DROP POLICY IF EXISTS "KOL users can update their own channels" ON kol_channels;

CREATE POLICY "Authenticated users can view kol channels"
ON kol_channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert kol channels"
ON kol_channels FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update kol channels"
ON kol_channels FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete kol channels"
ON kol_channels FOR DELETE
TO authenticated
USING (true);
```

3. Click **"Run"** to execute

4. Verify the policies were created:

```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'kol_channels';
```

### Option 2: Apply Complete Simplified RLS Policies

If you want to simplify ALL RLS policies (not just kol_channels), run this:

1. Go to: https://supabase.com/dashboard/project/_/sql
2. Run the file: `scripts/007_simplify_rls_policies.sql`
3. This will update all tables to allow authenticated users full access

### Option 3: Using Command Line (psql)

If you have PostgreSQL client installed:

```bash
# Get your database URL from Supabase Dashboard
# Settings > Database > Connection string > URI

export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Run the fix
psql $DATABASE_URL < scripts/fix-kol-channels-rls.sql
```

## Verification

After applying the fix:

1. **Test the KOL creation flow:**
   - Go to `/dashboard/kols/new`
   - Fill in the KOL form
   - Add at least one social media channel
   - Click "Save"
   - You should be redirected to `/dashboard/kols/[uuid]` (the detail page)

2. **Check the console logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see: `[v0] KOL created, response data: {id: "uuid-value", ...}`
   - No error messages about "undefined"

3. **Verify in database:**
   ```sql
   SELECT id, name, created_at FROM kols ORDER BY created_at DESC LIMIT 5;
   SELECT id, kol_id, channel_type, handle FROM kol_channels ORDER BY created_at DESC LIMIT 5;
   ```

## Additional Improvements

The following code changes have been made to help diagnose and handle this issue:

### 1. Enhanced Form Error Handling (`components/kol-form.tsx`)

```typescript
const data = await response.json()
console.log("[v0] KOL created, response data:", data)

if (!data.id) {
  console.error("[v0] No ID returned from API:", data)
  throw new Error("KOL created but no ID returned. This may be a permission issue.")
}

router.push(`/dashboard/kols/${data.id}`)
```

### 2. Enhanced API Logging (`app/api/kols/route.ts`)

```typescript
if (!kol || !kol.id) {
  console.error("[v0] KOL created but no ID returned")
  console.error("[v0] Returned data:", JSON.stringify(kol, null, 2))
  console.error("[v0] This is likely an RLS (Row Level Security) issue")
  return NextResponse.json({ 
    error: "KOL created but unable to retrieve ID. This is likely an RLS issue." 
  }, { status: 500 })
}
```

## Troubleshooting

### Issue: Still getting "undefined" error after applying fix

**Check current RLS policies:**
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('kols', 'kol_channels')
ORDER BY tablename, policyname;
```

**Expected output for kol_channels:**
- `Authenticated users can view kol channels` (SELECT)
- `Authenticated users can insert kol channels` (INSERT)
- `Authenticated users can update kol channels` (UPDATE)
- `Authenticated users can delete kol channels` (DELETE)

### Issue: Permission denied error

**Check if user is authenticated:**
```sql
-- Run in SQL Editor while logged into your app
SELECT auth.uid(), auth.role();
```

Should return:
- `uid`: your user's UUID
- `role`: `authenticated`

### Issue: Channels not being created

**Check kol_channels RLS policies:**
```sql
-- This should return the simplified policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'kol_channels';
```

If you see old policies like "Admins can insert channels", the fix wasn't applied.

## Prevention

To prevent this issue in the future:

1. **Always test INSERT operations with `.select()` in development**
2. **Check RLS policies when adding new tables**
3. **Use simplified RLS policies during development** (restrict in production)
4. **Add proper error handling** for missing IDs
5. **Log the full response data** for debugging

## Related Files

- `scripts/007_simplify_rls_policies.sql` - Complete RLS simplification
- `scripts/fix-kol-channels-rls.sql` - Quick fix for kol_channels only
- `components/kol-form.tsx` - Form with enhanced error handling
- `app/api/kols/route.ts` - API with enhanced logging
- `app/dashboard/kols/[id]/page.tsx` - Detail page

## Need Help?

If you're still experiencing issues:

1. Check the browser console for `[v0]` prefixed logs
2. Check the server/terminal console for API logs
3. Verify your `.env.local` has correct Supabase credentials
4. Ensure you're logged in as an authenticated user
5. Try creating a KOL with and without channels

## Summary

The fix is simple: Update RLS policies to allow authenticated users to read/write data. The error happens because the API can insert data but cannot read it back due to restrictive policies.

**Quick Fix:** Run `scripts/fix-kol-channels-rls.sql` in Supabase Dashboard SQL Editor.

