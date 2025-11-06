-- Drop all tables, functions, types, and policies
-- Run this BEFORE running migration scripts to start fresh
-- WARNING: This will delete ALL data!

-- ==========================================
-- DROP TABLES (in reverse dependency order)
-- ==========================================

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.comment_tags CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.post_metrics CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.campaign_kols CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.rate_items CASCADE;
DROP TABLE IF EXISTS public.rate_cards CASCADE;
DROP TABLE IF EXISTS public.kol_channels CASCADE;
DROP TABLE IF EXISTS public.kols CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.status_changes CASCADE;
DROP TABLE IF EXISTS public.memo_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================================
-- DROP FUNCTIONS
-- ==========================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_memo_logs_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_analyst() CASCADE;
DROP FUNCTION IF EXISTS public.is_brand_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_kol_user() CASCADE;

-- ==========================================
-- DROP TRIGGERS
-- ==========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS memo_logs_updated_at ON public.memo_logs;
DROP TRIGGER IF EXISTS accounts_updated_at ON public.accounts;
DROP TRIGGER IF EXISTS kols_updated_at ON public.kols;
DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS rate_cards_updated_at ON public.rate_cards;

-- ==========================================
-- DROP TYPES
-- ==========================================

DROP TYPE IF EXISTS public.user_role CASCADE;

-- ==========================================
-- DROP POLICIES (explicitly drop all policies)
-- ==========================================

-- IMPORTANT: Policies are automatically dropped when tables are dropped with CASCADE
-- However, we need to drop policies BEFORE dropping tables to avoid errors
-- We'll use DO blocks to check table existence first

-- Drop memo_logs policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memo_logs') THEN
    DROP POLICY IF EXISTS "Admins can view all memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Analysts can view all memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Brand users can view memo logs for their entities" ON public.memo_logs;
    DROP POLICY IF EXISTS "KOL users can view their own memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Admins and analysts can insert memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Admins can update memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Admins can delete memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Authenticated users can view memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Authenticated users can insert memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Authenticated users can update memo logs" ON public.memo_logs;
    DROP POLICY IF EXISTS "Authenticated users can delete memo logs" ON public.memo_logs;
  END IF;
END $$;

-- Drop status_changes policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'status_changes') THEN
    DROP POLICY IF EXISTS "Admins can view all status changes" ON public.status_changes;
    DROP POLICY IF EXISTS "Analysts can view all status changes" ON public.status_changes;
    DROP POLICY IF EXISTS "Brand users can view status changes for their entities" ON public.status_changes;
    DROP POLICY IF EXISTS "KOL users can view their own status changes" ON public.status_changes;
    DROP POLICY IF EXISTS "Admins and analysts can insert status changes" ON public.status_changes;
    DROP POLICY IF EXISTS "Authenticated users can view status changes" ON public.status_changes;
    DROP POLICY IF EXISTS "Authenticated users can insert status changes" ON public.status_changes;
  END IF;
END $$;

-- Note: Since policies are automatically dropped with CASCADE when tables are dropped,
-- we don't need to drop all policies explicitly. The above examples are for tables
-- that might have complex policies that need special handling.

-- ==========================================
-- DROP INDEXES (if any remain)
-- ==========================================

-- Note: Indexes are automatically dropped when tables are dropped

-- ==========================================
-- DONE
-- ==========================================

-- After running this script, you can run all-migrations.sql
-- or individual migration scripts in order

