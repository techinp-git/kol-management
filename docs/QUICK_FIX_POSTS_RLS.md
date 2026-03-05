# Quick Fix: Posts RLS Error

## Problem
Error: "Permission denied. Please check Row Level Security policies for posts table."

## Solution
Run the SQL script in Supabase SQL Editor to fix RLS policies for `posts` and `post_metrics` tables.

## Steps

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from `scripts/fix-posts-rls.sql`
3. Click "Run" to execute the script
4. Verify the policies were created successfully

## What the script does

- Drops old restrictive RLS policies for `posts` and `post_metrics` tables
- Creates new permissive policies allowing authenticated users to:
  - SELECT (view) all posts and metrics
  - INSERT (create) posts and metrics
  - UPDATE (edit) posts and metrics
  - DELETE posts and metrics

## Verification

After running the script, you should see:
- 4 policies for `posts` table
- 4 policies for `post_metrics` table

You can verify by running:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('posts', 'post_metrics')
ORDER BY tablename, policyname;
```

## Alternative: Run via Supabase CLI

If you have Supabase CLI installed:
```bash
supabase db execute -f scripts/fix-posts-rls.sql
```

