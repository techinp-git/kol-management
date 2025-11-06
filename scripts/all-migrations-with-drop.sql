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


-- ==========================================
-- STEP 2: CREATE ALL TABLES
-- ==========================================


-- ==========================================
-- File: 000_drop_all.sql
-- ==========================================

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



-- ==========================================
-- File: 001_create_memo_logs.sql
-- ==========================================

-- Create memo_logs table for tracking work notes with star ratings
-- Supports KOLs, Accounts, Campaigns, and Posts

CREATE TABLE IF NOT EXISTS public.memo_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('kol', 'account', 'campaign', 'post')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memo_logs_entity ON public.memo_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_memo_logs_created_by ON public.memo_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_memo_logs_created_at ON public.memo_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.memo_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies first to avoid conflicts
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

CREATE POLICY "Admins can view all memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Analysts can view all memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'analyst'
    )
  );

CREATE POLICY "Brand users can view memo logs for their entities"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'brand'
      AND (
        -- Can view account memo logs for their account
        (memo_logs.entity_type = 'account' AND memo_logs.entity_id = profiles.account_id)
        OR
        -- Can view campaign memo logs for their account's campaigns
        (memo_logs.entity_type = 'campaign' AND EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.projects p ON c.project_id = p.id
          WHERE c.id = memo_logs.entity_id
          AND p.account_id = profiles.account_id
        ))
        OR
        -- Can view post memo logs for their account's campaigns
        (memo_logs.entity_type = 'post' AND EXISTS (
          SELECT 1 FROM public.posts po
          JOIN public.campaigns c ON po.campaign_id = c.id
          JOIN public.projects p ON c.project_id = p.id
          WHERE po.id = memo_logs.entity_id
          AND p.account_id = profiles.account_id
        ))
      )
    )
  );

CREATE POLICY "KOL users can view their own memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'kol'
      AND memo_logs.entity_type = 'kol'
      AND memo_logs.entity_id = profiles.kol_id
    )
  );

CREATE POLICY "Admins and analysts can insert memo logs"
  ON public.memo_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Admins can update memo logs"
  ON public.memo_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete memo logs"
  ON public.memo_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memo_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER memo_logs_updated_at
  BEFORE UPDATE ON public.memo_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_memo_logs_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.memo_logs IS 'Stores work notes and star ratings for KOLs, Accounts, Campaigns, and Posts';
COMMENT ON COLUMN public.memo_logs.entity_type IS 'Type of entity: kol, account, campaign, or post';
COMMENT ON COLUMN public.memo_logs.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.memo_logs.star_rating IS 'Optional star rating from 1 to 5';


-- ==========================================
-- File: 001_create_profiles_and_roles.sql
-- ==========================================

-- Create profiles table that references auth.users
-- This stores additional user information and role assignments

CREATE TYPE user_role AS ENUM ('admin', 'brand_user', 'kol_user', 'analyst');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'brand_user',
  account_id UUID, -- FK to accounts table (for brand users)
  kol_id UUID, -- FK to kols table (for KOL users)
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Bangkok',
  language TEXT DEFAULT 'th',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'brand_user')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON public.profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kol_id ON public.profiles(kol_id);


-- ==========================================
-- File: 002_create_accounts.sql
-- ==========================================

-- Accounts table (clients/brands)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  logo_url TEXT,
  tax_id TEXT,
  billing_address TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  currency TEXT DEFAULT 'THB',
  credit_terms INTEGER DEFAULT 30, -- days
  msa_document_url TEXT, -- Master Service Agreement
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all accounts"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brand users can view their own account"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_id = accounts.id
    )
  );

CREATE POLICY "Analysts can view all accounts"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'analyst'
    )
  );

CREATE POLICY "Admins can insert accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update accounts"
  ON public.accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts(created_at);


-- ==========================================
-- File: 002_create_status_changes.sql
-- ==========================================

-- Create status_changes table for tracking status changes with reasons
-- Supports KOLs, Accounts, Campaigns, and Posts

CREATE TABLE IF NOT EXISTS public.status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('kol', 'account', 'campaign', 'post')),
  entity_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_status_changes_entity ON public.status_changes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_changes_changed_by ON public.status_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_status_changes_created_at ON public.status_changes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.status_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Analysts can view all status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'analyst'
    )
  );

CREATE POLICY "Brand users can view status changes for their entities"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'brand'
      AND (
        -- Can view account status changes for their account
        (status_changes.entity_type = 'account' AND status_changes.entity_id = profiles.account_id)
        OR
        -- Can view campaign status changes for their account's campaigns
        (status_changes.entity_type = 'campaign' AND EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.projects p ON c.project_id = p.id
          WHERE c.id = status_changes.entity_id
          AND p.account_id = profiles.account_id
        ))
        OR
        -- Can view post status changes for their account's campaigns
        (status_changes.entity_type = 'post' AND EXISTS (
          SELECT 1 FROM public.posts po
          JOIN public.campaigns c ON po.campaign_id = c.id
          JOIN public.projects p ON c.project_id = p.id
          WHERE po.id = status_changes.entity_id
          AND p.account_id = profiles.account_id
        ))
      )
    )
  );

CREATE POLICY "KOL users can view their own status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'kol'
      AND status_changes.entity_type = 'kol'
      AND status_changes.entity_id = profiles.kol_id
    )
  );

CREATE POLICY "Admins and analysts can insert status changes"
  ON public.status_changes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'analyst')
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.status_changes IS 'Tracks status changes with reasons for KOLs, Accounts, Campaigns, and Posts';
COMMENT ON COLUMN public.status_changes.entity_type IS 'Type of entity: kol, account, campaign, or post';
COMMENT ON COLUMN public.status_changes.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.status_changes.old_status IS 'Previous status value';
COMMENT ON COLUMN public.status_changes.new_status IS 'New status value';
COMMENT ON COLUMN public.status_changes.reason IS 'Reason for the status change';


-- ==========================================
-- File: 003_add_missing_columns.sql
-- ==========================================

-- Add any missing columns to existing tables based on UI requirements

-- Ensure posts table has all necessary columns
DO $$ 
BEGIN
  -- Add status column to posts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));
  END IF;
END $$;

-- Ensure campaigns table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'campaigns' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
    -- Add new constraint
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check 
      CHECK (status IN ('active', 'inactive', 'draft', 'completed', 'cancelled'));
  END IF;
END $$;

-- Ensure accounts table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_status_check;
    -- Add new constraint
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_status_check 
      CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- Ensure kols table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'kols' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.kols DROP CONSTRAINT IF EXISTS kols_status_check;
    -- Add new constraint
    ALTER TABLE public.kols ADD CONSTRAINT kols_status_check 
      CHECK (status IN ('active', 'inactive', 'draft', 'ban'));
  END IF;
END $$;

-- Add indexes for status columns for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_kols_status ON public.kols(status);

COMMENT ON COLUMN public.posts.status IS 'Post status: active, inactive, or draft';
COMMENT ON COLUMN public.campaigns.status IS 'Campaign status: active, inactive, draft, completed, or cancelled';
COMMENT ON COLUMN public.accounts.status IS 'Account status: active or inactive';
COMMENT ON COLUMN public.kols.status IS 'KOL status: active, inactive, draft, or ban';


-- ==========================================
-- File: 003_create_projects.sql
-- ==========================================

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT,
  brief_document_url TEXT,
  total_budget DECIMAL(15, 2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  owner_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brand users can view their account projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.account_id = projects.account_id
    )
  );

CREATE POLICY "Analysts can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'analyst'
    )
  );

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_account_id ON public.projects(account_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON public.projects(start_date, end_date);


-- ==========================================
-- File: 004_create_helper_functions.sql
-- ==========================================

-- Create helper functions for common queries

-- Function to get memo logs for an entity
CREATE OR REPLACE FUNCTION get_memo_logs(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  star_rating INTEGER,
  created_by UUID,
  creator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.id,
    ml.content,
    ml.star_rating,
    ml.created_by,
    COALESCE(p.full_name, p.email) as creator_name,
    ml.created_at
  FROM public.memo_logs ml
  LEFT JOIN public.profiles p ON ml.created_by = p.id
  WHERE ml.entity_type = p_entity_type
    AND ml.entity_id = p_entity_id
  ORDER BY ml.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get status change history for an entity
CREATE OR REPLACE FUNCTION get_status_history(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  changed_by UUID,
  changer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.old_status,
    sc.new_status,
    sc.reason,
    sc.changed_by,
    COALESCE(p.full_name, p.email) as changer_name,
    sc.created_at
  FROM public.status_changes sc
  LEFT JOIN public.profiles p ON sc.changed_by = p.id
  WHERE sc.entity_type = p_entity_type
    AND sc.entity_id = p_entity_id
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get post statistics history
CREATE OR REPLACE FUNCTION get_post_statistics_history(
  p_post_id UUID
)
RETURNS TABLE (
  id UUID,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  reach INTEGER,
  engagement_rate NUMERIC,
  captured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.views,
    pm.likes,
    pm.comments,
    pm.shares,
    pm.saves,
    pm.reach,
    pm.engagement_rate,
    pm.captured_at,
    pm.created_at
  FROM public.post_metrics pm
  WHERE pm.post_id = p_post_id
  ORDER BY pm.captured_at DESC, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get account statistics (projects, campaigns, KOLs count)
CREATE OR REPLACE FUNCTION get_account_statistics(
  p_account_id UUID
)
RETURNS TABLE (
  projects_count BIGINT,
  campaigns_count BIGINT,
  kols_count BIGINT,
  total_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pr.id) as projects_count,
    COUNT(DISTINCT c.id) as campaigns_count,
    COUNT(DISTINCT ck.kol_id) as kols_count,
    COALESCE(SUM(pr.total_budget), 0) as total_budget
  FROM public.accounts a
  LEFT JOIN public.projects pr ON pr.account_id = a.id
  LEFT JOIN public.campaigns c ON c.project_id = pr.id
  LEFT JOIN public.campaign_kols ck ON ck.campaign_id = c.id
  WHERE a.id = p_account_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memo_logs IS 'Retrieves memo logs for a specific entity with creator information';
COMMENT ON FUNCTION get_status_history IS 'Retrieves status change history for a specific entity';
COMMENT ON FUNCTION get_post_statistics_history IS 'Retrieves historical statistics for a post';
COMMENT ON FUNCTION get_account_statistics IS 'Retrieves statistics for an account (projects, campaigns, KOLs, budget)';


-- ==========================================
-- File: 004_create_kols.sql
-- ==========================================

-- KOLs (Key Opinion Leaders / Influencers) table
CREATE TABLE IF NOT EXISTS public.kols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT,
  category TEXT[], -- niche categories (fashion, tech, food, etc.)
  country TEXT DEFAULT 'TH',
  language TEXT[] DEFAULT ARRAY['th'],
  contact_email TEXT,
  contact_phone TEXT,
  contact_line TEXT,
  
  -- Billing info
  entity_type TEXT CHECK (entity_type IN ('individual', 'company')),
  tax_id TEXT,
  billing_address TEXT,
  payment_method TEXT,
  bank_account TEXT,
  
  -- Additional info
  avatar_url TEXT,
  bio TEXT,
  notes TEXT,
  quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 5),
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.kols ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all KOLs"
  ON public.kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own profile"
  ON public.kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND kol_id = kols.id
    )
  );

CREATE POLICY "Brand users can view active KOLs"
  ON public.kols FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'brand_user'
    )
  );

CREATE POLICY "Admins can insert KOLs"
  ON public.kols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update KOLs"
  ON public.kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can update their own profile"
  ON public.kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND kol_id = kols.id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kols_status ON public.kols(status);
CREATE INDEX IF NOT EXISTS idx_kols_category ON public.kols USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_kols_country ON public.kols(country);
CREATE INDEX IF NOT EXISTS idx_kols_quality_score ON public.kols(quality_score);


-- ==========================================
-- File: 005_check_and_fix_user_role_enum.sql
-- ==========================================

-- Check current enum values for user_role
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;

-- Add missing enum values if they don't exist
DO $$ 
BEGIN
    -- Add 'brand' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'brand' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'brand';
    END IF;
    
    -- Add 'kol' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'kol' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'kol';
    END IF;
    
    -- Add 'admin' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
    
    -- Add 'analyst' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'analyst' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'analyst';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;


-- ==========================================
-- File: 005_create_kol_channels.sql
-- ==========================================

-- KOL Channels (multi-channel support)
CREATE TYPE channel_type AS ENUM ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'line', 'other');

CREATE TABLE IF NOT EXISTS public.kol_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  handle TEXT NOT NULL,
  external_id TEXT, -- platform-specific ID
  profile_url TEXT,
  
  -- Current stats (updated periodically)
  follower_count INTEGER DEFAULT 0,
  avg_likes DECIMAL(10, 2),
  avg_comments DECIMAL(10, 2),
  avg_shares DECIMAL(10, 2),
  avg_views DECIMAL(10, 2),
  engagement_rate DECIMAL(5, 2), -- percentage
  
  -- Metadata
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(kol_id, channel_type, handle)
);

-- Enable RLS
ALTER TABLE public.kol_channels ENABLE ROW LEVEL SECURITY;

-- Policies (inherit from kols table)
CREATE POLICY "Admins can view all channels"
  ON public.kol_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own channels"
  ON public.kol_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kols k ON p.kol_id = k.id
      WHERE p.id = auth.uid() AND k.id = kol_channels.kol_id
    )
  );

CREATE POLICY "Brand users can view active channels"
  ON public.kol_channels FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'brand_user'
    )
  );

CREATE POLICY "Admins can insert channels"
  ON public.kol_channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update channels"
  ON public.kol_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can update their own channels"
  ON public.kol_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kols k ON p.kol_id = k.id
      WHERE p.id = auth.uid() AND k.id = kol_channels.kol_id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kol_channels_kol_id ON public.kol_channels(kol_id);
CREATE INDEX IF NOT EXISTS idx_kol_channels_type ON public.kol_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_kol_channels_status ON public.kol_channels(status);


-- ==========================================
-- File: 006_create_rate_cards.sql
-- ==========================================

-- Rate Cards (versioned billing rates for KOLs)
CREATE TABLE IF NOT EXISTS public.rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL means current/active
  currency TEXT DEFAULT 'THB',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(kol_id, version),
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Rate Items (individual rates per channel/content type)
CREATE TABLE IF NOT EXISTS public.rate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_card_id UUID NOT NULL REFERENCES public.rate_cards(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  content_type TEXT NOT NULL, -- post, reel, story, video, live, etc.
  base_rate DECIMAL(15, 2) NOT NULL,
  
  -- Add-ons stored as JSONB for flexibility
  addons JSONB DEFAULT '{}', -- e.g., {"whitelisting": 10000, "usage_days": 30, "exclusivity": 5000}
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_items ENABLE ROW LEVEL SECURITY;

-- Policies for rate_cards
CREATE POLICY "Admins can view all rate cards"
  ON public.rate_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own rate cards"
  ON public.rate_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.kol_id = rate_cards.kol_id
    )
  );

CREATE POLICY "Admins can insert rate cards"
  ON public.rate_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update rate cards"
  ON public.rate_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for rate_items
CREATE POLICY "Admins can view all rate items"
  ON public.rate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own rate items"
  ON public.rate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rate_cards rc ON p.kol_id = rc.kol_id
      WHERE p.id = auth.uid() AND rc.id = rate_items.rate_card_id
    )
  );

CREATE POLICY "Admins can insert rate items"
  ON public.rate_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update rate items"
  ON public.rate_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_cards_kol_id ON public.rate_cards(kol_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_effective ON public.rate_cards(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_rate_items_rate_card_id ON public.rate_items(rate_card_id);
CREATE INDEX IF NOT EXISTS idx_rate_items_channel ON public.rate_items(channel_type);


-- ==========================================
-- File: 006_fix_rls_policies.sql
-- ==========================================

-- Fix infinite recursion in RLS policies
-- The issue is that policies are checking user roles by querying the profiles table,
-- which creates a circular dependency

-- First, let's create a helper function to get user role from JWT
-- This avoids querying the profiles table in policies
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'analyst'
  )::text;
$$;

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Recreate profiles policies without circular references
-- Users can always view their own profile (no role check needed)
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (no role check needed)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (using JWT role)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can update all profiles (using JWT role)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can insert profiles (using JWT role)
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() = 'admin');

-- Now fix other tables that might have similar issues
-- Drop and recreate KOLs policies
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON kols;

-- Recreate KOLs policies using JWT role
CREATE POLICY "Admins can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all KOLs"
ON kols FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view active KOLs"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand' 
  AND status = 'active'
);

CREATE POLICY "KOL users can view their own profile"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "KOL users can update their own profile"
ON kols FOR UPDATE
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

-- Fix accounts policies
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON accounts;

CREATE POLICY "Admins can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all accounts"
ON accounts FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their own account"
ON accounts FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON campaigns;

CREATE POLICY "Admins can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their account campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND project_id IN (
    SELECT id FROM projects 
    WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  )
);

-- Add a comment explaining the fix
COMMENT ON FUNCTION auth.user_role() IS 
'Returns the user role from JWT metadata to avoid circular references in RLS policies. This prevents infinite recursion when policies need to check user roles.';


-- ==========================================
-- File: 007_create_campaigns.sql
-- ==========================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT, -- reach, engagement, traffic, conversion
  kpi_targets JSONB, -- flexible KPI storage
  start_date DATE,
  end_date DATE,
  channels channel_type[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'live', 'completed', 'cancelled')),
  budget DECIMAL(15, 2),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Campaign KOLs (junction table with allocation details)
CREATE TABLE IF NOT EXISTS public.campaign_kols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  kol_channel_id UUID REFERENCES public.kol_channels(id),
  target_metrics JSONB, -- campaign-specific targets for this KOL
  allocated_budget DECIMAL(15, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(campaign_id, kol_id, kol_channel_id)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_kols ENABLE ROW LEVEL SECURITY;

-- Policies for campaigns
CREATE POLICY "Admins can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their account campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      WHERE p.id = auth.uid() AND pr.id = campaigns.project_id
    )
  );

CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for campaign_kols
CREATE POLICY "Admins can view all campaign KOLs"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign KOLs"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      WHERE p.id = auth.uid() AND c.id = campaign_kols.campaign_id
    )
  );

CREATE POLICY "KOL users can view their own campaign assignments"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.kol_id = campaign_kols.kol_id
    )
  );

CREATE POLICY "Admins can insert campaign KOLs"
  ON public.campaign_kols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update campaign KOLs"
  ON public.campaign_kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON public.campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_kols_campaign_id ON public.campaign_kols(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_kols_kol_id ON public.campaign_kols(kol_id);


-- ==========================================
-- File: 007_simplify_rls_policies.sql
-- ==========================================

-- ลบ policies เดิมที่มีปัญหา infinite recursion และสร้างใหม่แบบง่ายๆ
-- อนุญาตให้ทุกคนที่ login แล้วทำงานได้เลย ไม่ต้องเช็ค role

-- ==========================================
-- PROFILES TABLE
-- ==========================================

-- ลบ policies เดิมทั้งหมดของ profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- สร้าง policies ใหม่แบบง่ายๆ
CREATE POLICY "Anyone authenticated can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ==========================================
-- KOLS TABLE
-- ==========================================

-- ลบ policies เดิม
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Analysts can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can delete KOLs" ON kols;

-- สร้าง policies ใหม่ - ให้ทุกคนที่ login แล้วทำได้หมด
CREATE POLICY "Authenticated users can view KOLs"
ON kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete KOLs"
ON kols FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- ACCOUNTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON accounts;

CREATE POLICY "Authenticated users can view accounts"
ON accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete accounts"
ON accounts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- CAMPAIGNS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Analysts can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;

CREATE POLICY "Authenticated users can view campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete campaigns"
ON campaigns FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- POSTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Analysts can view all posts" ON posts;
DROP POLICY IF EXISTS "Brand users can view posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

CREATE POLICY "Authenticated users can view posts"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
ON posts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete posts"
ON posts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- PROJECTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON projects;
DROP POLICY IF EXISTS "Brand users can view their projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Authenticated users can view projects"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;

CREATE POLICY "Authenticated users can view comments"
ON comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
ON comments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete comments"
ON comments FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- MEMO_LOGS TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can insert memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can update memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can delete memo logs" ON memo_logs;

CREATE POLICY "Authenticated users can view memo logs"
ON memo_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert memo logs"
ON memo_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update memo logs"
ON memo_logs FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete memo logs"
ON memo_logs FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- STATUS_CHANGES TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view status changes" ON status_changes;
DROP POLICY IF EXISTS "Users can insert status changes" ON status_changes;

CREATE POLICY "Authenticated users can view status changes"
ON status_changes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert status changes"
ON status_changes FOR INSERT
TO authenticated
WITH CHECK (true);


-- ==========================================
-- File: 008_create_posts.sql
-- ==========================================

-- Posts table (social media posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_post_id TEXT NOT NULL, -- Platform-specific post ID (used for imports)
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  kol_channel_id UUID NOT NULL REFERENCES public.kol_channels(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  content_type TEXT, -- post, reel, story, video, live, etc.
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  utm_params JSONB,
  
  posted_at TIMESTAMPTZ,
  screenshot_url TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'removed')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(external_post_id, kol_channel_id)
);

-- Post Metrics (engagement data snapshots)
CREATE TABLE IF NOT EXISTS public.post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Engagement metrics
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Calculated metrics
  ctr DECIMAL(5, 2), -- Click-through rate
  engagement_rate DECIMAL(5, 2), -- ER%
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, captured_at)
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      WHERE p.id = auth.uid() AND c.id = posts.campaign_id
    )
  );

CREATE POLICY "KOL users can view their own posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      WHERE p.id = auth.uid() AND kc.id = posts.kol_channel_id
    )
  );

CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      WHERE p.id = auth.uid() AND kc.id = posts.kol_channel_id
    )
  );

CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for post_metrics
CREATE POLICY "Admins can view all metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      JOIN public.posts po ON c.id = po.campaign_id
      WHERE p.id = auth.uid() AND po.id = post_metrics.post_id
    )
  );

CREATE POLICY "KOL users can view their own metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      JOIN public.posts po ON kc.id = po.kol_channel_id
      WHERE p.id = auth.uid() AND po.id = post_metrics.post_id
    )
  );

CREATE POLICY "Admins can insert metrics"
  ON public.post_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update metrics"
  ON public.post_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_external_id ON public.posts(external_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_campaign_id ON public.posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_posts_kol_channel_id ON public.posts(kol_channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON public.posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON public.post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_captured_at ON public.post_metrics(captured_at);


-- ==========================================
-- File: 009_create_comments.sql
-- ==========================================

-- Tags table (for comment categorization)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('sentiment', 'topic', 'intent')),
  color TEXT, -- hex color for UI
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_comment_id TEXT NOT NULL, -- Platform-specific comment ID
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  like_count INTEGER DEFAULT 0,
  
  parent_comment_id UUID REFERENCES public.comments(id), -- for threaded comments
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(external_comment_id, post_id)
);

-- Comment Tags (junction table)
CREATE TABLE IF NOT EXISTS public.comment_tags (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  PRIMARY KEY (comment_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_tags ENABLE ROW LEVEL SECURITY;

-- Policies for tags
CREATE POLICY "Everyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for comments
CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      JOIN public.posts po ON c.id = po.campaign_id
      WHERE p.id = auth.uid() AND po.id = comments.post_id
    )
  );

CREATE POLICY "KOL users can view their post comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      JOIN public.posts po ON kc.id = po.kol_channel_id
      WHERE p.id = auth.uid() AND po.id = comments.post_id
    )
  );

CREATE POLICY "Admins can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for comment_tags
CREATE POLICY "Users can view comment tags"
  ON public.comment_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and analysts can insert comment tags"
  ON public.comment_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Admins and analysts can delete comment tags"
  ON public.comment_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags(type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_external_id ON public.comments(external_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON public.comments(timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_comment_id ON public.comment_tags(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_tag_id ON public.comment_tags(tag_id);


-- ==========================================
-- File: 010_create_audit_logs.sql
-- ==========================================

-- Audit Logs table (for tracking all important changes)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- create, update, delete, import, export, etc.
  entity_type TEXT NOT NULL, -- kol, campaign, post, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- Allow system to insert logs

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);


-- ==========================================
-- File: 011_create_notifications.sql
-- ==========================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- campaign_start, campaign_end, missing_metrics, approval_needed, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to relevant page
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);


-- ==========================================
-- File: 012_seed_default_tags.sql
-- ==========================================

-- Seed default tags for comment categorization

-- Sentiment tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Positive', 'sentiment', '#22c55e', 'Positive sentiment'),
  ('Neutral', 'sentiment', '#6b7280', 'Neutral sentiment'),
  ('Negative', 'sentiment', '#ef4444', 'Negative sentiment')
ON CONFLICT (name) DO NOTHING;

-- Topic tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Product', 'topic', '#3b82f6', 'About the product'),
  ('Price', 'topic', '#f59e0b', 'About pricing'),
  ('Delivery', 'topic', '#8b5cf6', 'About delivery/shipping'),
  ('Quality', 'topic', '#ec4899', 'About quality'),
  ('Service', 'topic', '#14b8a6', 'About customer service')
ON CONFLICT (name) DO NOTHING;

-- Intent tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Purchase Intent', 'intent', '#10b981', 'Shows intent to purchase'),
  ('Complaint', 'intent', '#f97316', 'Complaint or issue'),
  ('Question', 'intent', '#06b6d4', 'Asking a question'),
  ('General', 'intent', '#64748b', 'General comment')
ON CONFLICT (name) DO NOTHING;


-- ==========================================
-- File: all-migrations-with-drop.sql
-- ==========================================

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

-- Note: While policies are usually dropped with tables,
-- it's safer to explicitly drop them first to avoid conflicts

-- Drop memo_logs policies
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

-- Drop status_changes policies
DROP POLICY IF EXISTS "Admins can view all status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Analysts can view all status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Brand users can view status changes for their entities" ON public.status_changes;
DROP POLICY IF EXISTS "KOL users can view their own status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Admins and analysts can insert status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Authenticated users can view status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Authenticated users can insert status changes" ON public.status_changes;

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Drop accounts policies
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON public.accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can view accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can delete accounts" ON public.accounts;

-- Drop kols policies
DROP POLICY IF EXISTS "Admins can view all KOLs" ON public.kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON public.kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON public.kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON public.kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can view KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can update KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can delete KOLs" ON public.kols;

-- Drop projects policies
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Brand users can view their account projects" ON public.projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Drop campaigns policies
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON public.campaigns;

-- Drop campaign_kols policies
DROP POLICY IF EXISTS "Admins can view all campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Brand users can view their campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "KOL users can view their own campaign assignments" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can insert campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can update campaign KOLs" ON public.campaign_kols;

-- Drop posts policies
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Brand users can view their campaign posts" ON public.posts;
DROP POLICY IF EXISTS "KOL users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "KOL users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;

-- Drop post_metrics policies
DROP POLICY IF EXISTS "Admins can view all metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Brand users can view their campaign metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "KOL users can view their own metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Admins can insert metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Admins can update metrics" ON public.post_metrics;

-- Drop comments policies
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Brand users can view their campaign comments" ON public.comments;
DROP POLICY IF EXISTS "KOL users can view their post comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON public.comments;

-- Drop tags policies
DROP POLICY IF EXISTS "Everyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;

-- Drop comment_tags policies
DROP POLICY IF EXISTS "Users can view comment tags" ON public.comment_tags;
DROP POLICY IF EXISTS "Admins and analysts can insert comment tags" ON public.comment_tags;
DROP POLICY IF EXISTS "Admins and analysts can delete comment tags" ON public.comment_tags;

-- Drop rate_cards policies
DROP POLICY IF EXISTS "Admins can view all rate cards" ON public.rate_cards;
DROP POLICY IF EXISTS "KOL users can view their own rate cards" ON public.rate_cards;
DROP POLICY IF EXISTS "Admins can insert rate cards" ON public.rate_cards;
DROP POLICY IF EXISTS "Admins can update rate cards" ON public.rate_cards;

-- Drop rate_items policies
DROP POLICY IF EXISTS "Admins can view all rate items" ON public.rate_items;
DROP POLICY IF EXISTS "KOL users can view their own rate items" ON public.rate_items;
DROP POLICY IF EXISTS "Admins can insert rate items" ON public.rate_items;
DROP POLICY IF EXISTS "Admins can update rate items" ON public.rate_items;

-- Drop kol_channels policies
DROP POLICY IF EXISTS "Admins can view all channels" ON public.kol_channels;
DROP POLICY IF EXISTS "KOL users can view their own channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Brand users can view active channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "KOL users can update their own channels" ON public.kol_channels;

-- Drop audit_logs policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Drop notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- ==========================================
-- DROP INDEXES (if any remain)
-- ==========================================

-- Note: Indexes are automatically dropped when tables are dropped

-- ==========================================
-- DONE
-- ==========================================

-- After running this script, you can run all-migrations.sql
-- or individual migration scripts in order


-- ==========================================
-- STEP 2: CREATE ALL TABLES
-- ==========================================


-- ==========================================
-- File: 000_drop_all.sql
-- ==========================================

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

-- Note: While policies are usually dropped with tables,
-- it's safer to explicitly drop them first to avoid conflicts

-- Drop memo_logs policies
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

-- Drop status_changes policies
DROP POLICY IF EXISTS "Admins can view all status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Analysts can view all status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Brand users can view status changes for their entities" ON public.status_changes;
DROP POLICY IF EXISTS "KOL users can view their own status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Admins and analysts can insert status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Authenticated users can view status changes" ON public.status_changes;
DROP POLICY IF EXISTS "Authenticated users can insert status changes" ON public.status_changes;

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Drop accounts policies
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON public.accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can view accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can delete accounts" ON public.accounts;

-- Drop kols policies
DROP POLICY IF EXISTS "Admins can view all KOLs" ON public.kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON public.kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON public.kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON public.kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can view KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can insert KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can update KOLs" ON public.kols;
DROP POLICY IF EXISTS "Authenticated users can delete KOLs" ON public.kols;

-- Drop projects policies
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Brand users can view their account projects" ON public.projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Drop campaigns policies
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON public.campaigns;

-- Drop campaign_kols policies
DROP POLICY IF EXISTS "Admins can view all campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Brand users can view their campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "KOL users can view their own campaign assignments" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can insert campaign KOLs" ON public.campaign_kols;
DROP POLICY IF EXISTS "Admins can update campaign KOLs" ON public.campaign_kols;

-- Drop posts policies
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Brand users can view their campaign posts" ON public.posts;
DROP POLICY IF EXISTS "KOL users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "KOL users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;

-- Drop post_metrics policies
DROP POLICY IF EXISTS "Admins can view all metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Brand users can view their campaign metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "KOL users can view their own metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Admins can insert metrics" ON public.post_metrics;
DROP POLICY IF EXISTS "Admins can update metrics" ON public.post_metrics;

-- Drop comments policies
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Brand users can view their campaign comments" ON public.comments;
DROP POLICY IF EXISTS "KOL users can view their post comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON public.comments;

-- Drop tags policies
DROP POLICY IF EXISTS "Everyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;

-- Drop comment_tags policies
DROP POLICY IF EXISTS "Users can view comment tags" ON public.comment_tags;
DROP POLICY IF EXISTS "Admins and analysts can insert comment tags" ON public.comment_tags;
DROP POLICY IF EXISTS "Admins and analysts can delete comment tags" ON public.comment_tags;

-- Drop rate_cards policies
DROP POLICY IF EXISTS "Admins can view all rate cards" ON public.rate_cards;
DROP POLICY IF EXISTS "KOL users can view their own rate cards" ON public.rate_cards;
DROP POLICY IF EXISTS "Admins can insert rate cards" ON public.rate_cards;
DROP POLICY IF EXISTS "Admins can update rate cards" ON public.rate_cards;

-- Drop rate_items policies
DROP POLICY IF EXISTS "Admins can view all rate items" ON public.rate_items;
DROP POLICY IF EXISTS "KOL users can view their own rate items" ON public.rate_items;
DROP POLICY IF EXISTS "Admins can insert rate items" ON public.rate_items;
DROP POLICY IF EXISTS "Admins can update rate items" ON public.rate_items;

-- Drop kol_channels policies
DROP POLICY IF EXISTS "Admins can view all channels" ON public.kol_channels;
DROP POLICY IF EXISTS "KOL users can view their own channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Brand users can view active channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON public.kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON public.kol_channels;
DROP POLICY IF EXISTS "KOL users can update their own channels" ON public.kol_channels;

-- Drop audit_logs policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Drop notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- ==========================================
-- DROP INDEXES (if any remain)
-- ==========================================

-- Note: Indexes are automatically dropped when tables are dropped

-- ==========================================
-- DONE
-- ==========================================

-- After running this script, you can run all-migrations.sql
-- or individual migration scripts in order



-- ==========================================
-- File: 001_create_memo_logs.sql
-- ==========================================

-- Create memo_logs table for tracking work notes with star ratings
-- Supports KOLs, Accounts, Campaigns, and Posts

CREATE TABLE IF NOT EXISTS public.memo_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('kol', 'account', 'campaign', 'post')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memo_logs_entity ON public.memo_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_memo_logs_created_by ON public.memo_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_memo_logs_created_at ON public.memo_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.memo_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies first to avoid conflicts
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

CREATE POLICY "Admins can view all memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Analysts can view all memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'analyst'
    )
  );

CREATE POLICY "Brand users can view memo logs for their entities"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'brand'
      AND (
        -- Can view account memo logs for their account
        (memo_logs.entity_type = 'account' AND memo_logs.entity_id = profiles.account_id)
        OR
        -- Can view campaign memo logs for their account's campaigns
        (memo_logs.entity_type = 'campaign' AND EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.projects p ON c.project_id = p.id
          WHERE c.id = memo_logs.entity_id
          AND p.account_id = profiles.account_id
        ))
        OR
        -- Can view post memo logs for their account's campaigns
        (memo_logs.entity_type = 'post' AND EXISTS (
          SELECT 1 FROM public.posts po
          JOIN public.campaigns c ON po.campaign_id = c.id
          JOIN public.projects p ON c.project_id = p.id
          WHERE po.id = memo_logs.entity_id
          AND p.account_id = profiles.account_id
        ))
      )
    )
  );

CREATE POLICY "KOL users can view their own memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'kol'
      AND memo_logs.entity_type = 'kol'
      AND memo_logs.entity_id = profiles.kol_id
    )
  );

CREATE POLICY "Admins and analysts can insert memo logs"
  ON public.memo_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Admins can update memo logs"
  ON public.memo_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete memo logs"
  ON public.memo_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memo_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER memo_logs_updated_at
  BEFORE UPDATE ON public.memo_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_memo_logs_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.memo_logs IS 'Stores work notes and star ratings for KOLs, Accounts, Campaigns, and Posts';
COMMENT ON COLUMN public.memo_logs.entity_type IS 'Type of entity: kol, account, campaign, or post';
COMMENT ON COLUMN public.memo_logs.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.memo_logs.star_rating IS 'Optional star rating from 1 to 5';


-- ==========================================
-- File: 001_create_profiles_and_roles.sql
-- ==========================================

-- Create profiles table that references auth.users
-- This stores additional user information and role assignments

CREATE TYPE user_role AS ENUM ('admin', 'brand_user', 'kol_user', 'analyst');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'brand_user',
  account_id UUID, -- FK to accounts table (for brand users)
  kol_id UUID, -- FK to kols table (for KOL users)
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Bangkok',
  language TEXT DEFAULT 'th',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'brand_user')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON public.profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kol_id ON public.profiles(kol_id);


-- ==========================================
-- File: 002_create_accounts.sql
-- ==========================================

-- Accounts table (clients/brands)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  logo_url TEXT,
  tax_id TEXT,
  billing_address TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  currency TEXT DEFAULT 'THB',
  credit_terms INTEGER DEFAULT 30, -- days
  msa_document_url TEXT, -- Master Service Agreement
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all accounts"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brand users can view their own account"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_id = accounts.id
    )
  );

CREATE POLICY "Analysts can view all accounts"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'analyst'
    )
  );

CREATE POLICY "Admins can insert accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update accounts"
  ON public.accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts(created_at);


-- ==========================================
-- File: 002_create_status_changes.sql
-- ==========================================

-- Create status_changes table for tracking status changes with reasons
-- Supports KOLs, Accounts, Campaigns, and Posts

CREATE TABLE IF NOT EXISTS public.status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('kol', 'account', 'campaign', 'post')),
  entity_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_status_changes_entity ON public.status_changes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_changes_changed_by ON public.status_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_status_changes_created_at ON public.status_changes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.status_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Analysts can view all status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'analyst'
    )
  );

CREATE POLICY "Brand users can view status changes for their entities"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'brand'
      AND (
        -- Can view account status changes for their account
        (status_changes.entity_type = 'account' AND status_changes.entity_id = profiles.account_id)
        OR
        -- Can view campaign status changes for their account's campaigns
        (status_changes.entity_type = 'campaign' AND EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.projects p ON c.project_id = p.id
          WHERE c.id = status_changes.entity_id
          AND p.account_id = profiles.account_id
        ))
        OR
        -- Can view post status changes for their account's campaigns
        (status_changes.entity_type = 'post' AND EXISTS (
          SELECT 1 FROM public.posts po
          JOIN public.campaigns c ON po.campaign_id = c.id
          JOIN public.projects p ON c.project_id = p.id
          WHERE po.id = status_changes.entity_id
          AND p.account_id = profiles.account_id
        ))
      )
    )
  );

CREATE POLICY "KOL users can view their own status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'kol'
      AND status_changes.entity_type = 'kol'
      AND status_changes.entity_id = profiles.kol_id
    )
  );

CREATE POLICY "Admins and analysts can insert status changes"
  ON public.status_changes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'analyst')
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.status_changes IS 'Tracks status changes with reasons for KOLs, Accounts, Campaigns, and Posts';
COMMENT ON COLUMN public.status_changes.entity_type IS 'Type of entity: kol, account, campaign, or post';
COMMENT ON COLUMN public.status_changes.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.status_changes.old_status IS 'Previous status value';
COMMENT ON COLUMN public.status_changes.new_status IS 'New status value';
COMMENT ON COLUMN public.status_changes.reason IS 'Reason for the status change';


-- ==========================================
-- File: 003_add_missing_columns.sql
-- ==========================================

-- Add any missing columns to existing tables based on UI requirements

-- Ensure posts table has all necessary columns
DO $$ 
BEGIN
  -- Add status column to posts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));
  END IF;
END $$;

-- Ensure campaigns table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'campaigns' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
    -- Add new constraint
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check 
      CHECK (status IN ('active', 'inactive', 'draft', 'completed', 'cancelled'));
  END IF;
END $$;

-- Ensure accounts table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_status_check;
    -- Add new constraint
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_status_check 
      CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- Ensure kols table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'kols' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.kols DROP CONSTRAINT IF EXISTS kols_status_check;
    -- Add new constraint
    ALTER TABLE public.kols ADD CONSTRAINT kols_status_check 
      CHECK (status IN ('active', 'inactive', 'draft', 'ban'));
  END IF;
END $$;

-- Add indexes for status columns for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_kols_status ON public.kols(status);

COMMENT ON COLUMN public.posts.status IS 'Post status: active, inactive, or draft';
COMMENT ON COLUMN public.campaigns.status IS 'Campaign status: active, inactive, draft, completed, or cancelled';
COMMENT ON COLUMN public.accounts.status IS 'Account status: active or inactive';
COMMENT ON COLUMN public.kols.status IS 'KOL status: active, inactive, draft, or ban';


-- ==========================================
-- File: 003_create_projects.sql
-- ==========================================

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT,
  brief_document_url TEXT,
  total_budget DECIMAL(15, 2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  owner_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brand users can view their account projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.account_id = projects.account_id
    )
  );

CREATE POLICY "Analysts can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'analyst'
    )
  );

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_account_id ON public.projects(account_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON public.projects(start_date, end_date);


-- ==========================================
-- File: 004_create_helper_functions.sql
-- ==========================================

-- Create helper functions for common queries

-- Function to get memo logs for an entity
CREATE OR REPLACE FUNCTION get_memo_logs(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  star_rating INTEGER,
  created_by UUID,
  creator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.id,
    ml.content,
    ml.star_rating,
    ml.created_by,
    COALESCE(p.full_name, p.email) as creator_name,
    ml.created_at
  FROM public.memo_logs ml
  LEFT JOIN public.profiles p ON ml.created_by = p.id
  WHERE ml.entity_type = p_entity_type
    AND ml.entity_id = p_entity_id
  ORDER BY ml.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get status change history for an entity
CREATE OR REPLACE FUNCTION get_status_history(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  changed_by UUID,
  changer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.old_status,
    sc.new_status,
    sc.reason,
    sc.changed_by,
    COALESCE(p.full_name, p.email) as changer_name,
    sc.created_at
  FROM public.status_changes sc
  LEFT JOIN public.profiles p ON sc.changed_by = p.id
  WHERE sc.entity_type = p_entity_type
    AND sc.entity_id = p_entity_id
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get post statistics history
CREATE OR REPLACE FUNCTION get_post_statistics_history(
  p_post_id UUID
)
RETURNS TABLE (
  id UUID,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  reach INTEGER,
  engagement_rate NUMERIC,
  captured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.views,
    pm.likes,
    pm.comments,
    pm.shares,
    pm.saves,
    pm.reach,
    pm.engagement_rate,
    pm.captured_at,
    pm.created_at
  FROM public.post_metrics pm
  WHERE pm.post_id = p_post_id
  ORDER BY pm.captured_at DESC, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get account statistics (projects, campaigns, KOLs count)
CREATE OR REPLACE FUNCTION get_account_statistics(
  p_account_id UUID
)
RETURNS TABLE (
  projects_count BIGINT,
  campaigns_count BIGINT,
  kols_count BIGINT,
  total_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pr.id) as projects_count,
    COUNT(DISTINCT c.id) as campaigns_count,
    COUNT(DISTINCT ck.kol_id) as kols_count,
    COALESCE(SUM(pr.total_budget), 0) as total_budget
  FROM public.accounts a
  LEFT JOIN public.projects pr ON pr.account_id = a.id
  LEFT JOIN public.campaigns c ON c.project_id = pr.id
  LEFT JOIN public.campaign_kols ck ON ck.campaign_id = c.id
  WHERE a.id = p_account_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memo_logs IS 'Retrieves memo logs for a specific entity with creator information';
COMMENT ON FUNCTION get_status_history IS 'Retrieves status change history for a specific entity';
COMMENT ON FUNCTION get_post_statistics_history IS 'Retrieves historical statistics for a post';
COMMENT ON FUNCTION get_account_statistics IS 'Retrieves statistics for an account (projects, campaigns, KOLs, budget)';


-- ==========================================
-- File: 004_create_kols.sql
-- ==========================================

-- KOLs (Key Opinion Leaders / Influencers) table
CREATE TABLE IF NOT EXISTS public.kols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT,
  category TEXT[], -- niche categories (fashion, tech, food, etc.)
  country TEXT DEFAULT 'TH',
  language TEXT[] DEFAULT ARRAY['th'],
  contact_email TEXT,
  contact_phone TEXT,
  contact_line TEXT,
  
  -- Billing info
  entity_type TEXT CHECK (entity_type IN ('individual', 'company')),
  tax_id TEXT,
  billing_address TEXT,
  payment_method TEXT,
  bank_account TEXT,
  
  -- Additional info
  avatar_url TEXT,
  bio TEXT,
  notes TEXT,
  quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 5),
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.kols ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all KOLs"
  ON public.kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own profile"
  ON public.kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND kol_id = kols.id
    )
  );

CREATE POLICY "Brand users can view active KOLs"
  ON public.kols FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'brand_user'
    )
  );

CREATE POLICY "Admins can insert KOLs"
  ON public.kols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update KOLs"
  ON public.kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can update their own profile"
  ON public.kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND kol_id = kols.id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kols_status ON public.kols(status);
CREATE INDEX IF NOT EXISTS idx_kols_category ON public.kols USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_kols_country ON public.kols(country);
CREATE INDEX IF NOT EXISTS idx_kols_quality_score ON public.kols(quality_score);


-- ==========================================
-- File: 005_check_and_fix_user_role_enum.sql
-- ==========================================

-- Check current enum values for user_role
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;

-- Add missing enum values if they don't exist
DO $$ 
BEGIN
    -- Add 'brand' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'brand' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'brand';
    END IF;
    
    -- Add 'kol' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'kol' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'kol';
    END IF;
    
    -- Add 'admin' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
    
    -- Add 'analyst' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'analyst' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'analyst';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;


-- ==========================================
-- File: 005_create_kol_channels.sql
-- ==========================================

-- KOL Channels (multi-channel support)
CREATE TYPE channel_type AS ENUM ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'line', 'other');

CREATE TABLE IF NOT EXISTS public.kol_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  handle TEXT NOT NULL,
  external_id TEXT, -- platform-specific ID
  profile_url TEXT,
  
  -- Current stats (updated periodically)
  follower_count INTEGER DEFAULT 0,
  avg_likes DECIMAL(10, 2),
  avg_comments DECIMAL(10, 2),
  avg_shares DECIMAL(10, 2),
  avg_views DECIMAL(10, 2),
  engagement_rate DECIMAL(5, 2), -- percentage
  
  -- Metadata
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(kol_id, channel_type, handle)
);

-- Enable RLS
ALTER TABLE public.kol_channels ENABLE ROW LEVEL SECURITY;

-- Policies (inherit from kols table)
CREATE POLICY "Admins can view all channels"
  ON public.kol_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own channels"
  ON public.kol_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kols k ON p.kol_id = k.id
      WHERE p.id = auth.uid() AND k.id = kol_channels.kol_id
    )
  );

CREATE POLICY "Brand users can view active channels"
  ON public.kol_channels FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'brand_user'
    )
  );

CREATE POLICY "Admins can insert channels"
  ON public.kol_channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update channels"
  ON public.kol_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can update their own channels"
  ON public.kol_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kols k ON p.kol_id = k.id
      WHERE p.id = auth.uid() AND k.id = kol_channels.kol_id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kol_channels_kol_id ON public.kol_channels(kol_id);
CREATE INDEX IF NOT EXISTS idx_kol_channels_type ON public.kol_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_kol_channels_status ON public.kol_channels(status);


-- ==========================================
-- File: 006_create_rate_cards.sql
-- ==========================================

-- Rate Cards (versioned billing rates for KOLs)
CREATE TABLE IF NOT EXISTS public.rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL means current/active
  currency TEXT DEFAULT 'THB',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(kol_id, version),
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Rate Items (individual rates per channel/content type)
CREATE TABLE IF NOT EXISTS public.rate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_card_id UUID NOT NULL REFERENCES public.rate_cards(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  content_type TEXT NOT NULL, -- post, reel, story, video, live, etc.
  base_rate DECIMAL(15, 2) NOT NULL,
  
  -- Add-ons stored as JSONB for flexibility
  addons JSONB DEFAULT '{}', -- e.g., {"whitelisting": 10000, "usage_days": 30, "exclusivity": 5000}
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_items ENABLE ROW LEVEL SECURITY;

-- Policies for rate_cards
CREATE POLICY "Admins can view all rate cards"
  ON public.rate_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own rate cards"
  ON public.rate_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.kol_id = rate_cards.kol_id
    )
  );

CREATE POLICY "Admins can insert rate cards"
  ON public.rate_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update rate cards"
  ON public.rate_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for rate_items
CREATE POLICY "Admins can view all rate items"
  ON public.rate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own rate items"
  ON public.rate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rate_cards rc ON p.kol_id = rc.kol_id
      WHERE p.id = auth.uid() AND rc.id = rate_items.rate_card_id
    )
  );

CREATE POLICY "Admins can insert rate items"
  ON public.rate_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update rate items"
  ON public.rate_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_cards_kol_id ON public.rate_cards(kol_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_effective ON public.rate_cards(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_rate_items_rate_card_id ON public.rate_items(rate_card_id);
CREATE INDEX IF NOT EXISTS idx_rate_items_channel ON public.rate_items(channel_type);


-- ==========================================
-- File: 006_fix_rls_policies.sql
-- ==========================================

-- Fix infinite recursion in RLS policies
-- The issue is that policies are checking user roles by querying the profiles table,
-- which creates a circular dependency

-- First, let's create a helper function to get user role from JWT
-- This avoids querying the profiles table in policies
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'analyst'
  )::text;
$$;

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Recreate profiles policies without circular references
-- Users can always view their own profile (no role check needed)
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (no role check needed)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (using JWT role)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can update all profiles (using JWT role)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can insert profiles (using JWT role)
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() = 'admin');

-- Now fix other tables that might have similar issues
-- Drop and recreate KOLs policies
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON kols;

-- Recreate KOLs policies using JWT role
CREATE POLICY "Admins can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all KOLs"
ON kols FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view active KOLs"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand' 
  AND status = 'active'
);

CREATE POLICY "KOL users can view their own profile"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "KOL users can update their own profile"
ON kols FOR UPDATE
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

-- Fix accounts policies
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON accounts;

CREATE POLICY "Admins can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all accounts"
ON accounts FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their own account"
ON accounts FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON campaigns;

CREATE POLICY "Admins can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their account campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND project_id IN (
    SELECT id FROM projects 
    WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  )
);

-- Add a comment explaining the fix
COMMENT ON FUNCTION auth.user_role() IS 
'Returns the user role from JWT metadata to avoid circular references in RLS policies. This prevents infinite recursion when policies need to check user roles.';


-- ==========================================
-- File: 007_create_campaigns.sql
-- ==========================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT, -- reach, engagement, traffic, conversion
  kpi_targets JSONB, -- flexible KPI storage
  start_date DATE,
  end_date DATE,
  channels channel_type[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'live', 'completed', 'cancelled')),
  budget DECIMAL(15, 2),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Campaign KOLs (junction table with allocation details)
CREATE TABLE IF NOT EXISTS public.campaign_kols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  kol_channel_id UUID REFERENCES public.kol_channels(id),
  target_metrics JSONB, -- campaign-specific targets for this KOL
  allocated_budget DECIMAL(15, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(campaign_id, kol_id, kol_channel_id)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_kols ENABLE ROW LEVEL SECURITY;

-- Policies for campaigns
CREATE POLICY "Admins can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their account campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      WHERE p.id = auth.uid() AND pr.id = campaigns.project_id
    )
  );

CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for campaign_kols
CREATE POLICY "Admins can view all campaign KOLs"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign KOLs"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      WHERE p.id = auth.uid() AND c.id = campaign_kols.campaign_id
    )
  );

CREATE POLICY "KOL users can view their own campaign assignments"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.kol_id = campaign_kols.kol_id
    )
  );

CREATE POLICY "Admins can insert campaign KOLs"
  ON public.campaign_kols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update campaign KOLs"
  ON public.campaign_kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON public.campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_kols_campaign_id ON public.campaign_kols(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_kols_kol_id ON public.campaign_kols(kol_id);


-- ==========================================
-- File: 007_simplify_rls_policies.sql
-- ==========================================

-- ลบ policies เดิมที่มีปัญหา infinite recursion และสร้างใหม่แบบง่ายๆ
-- อนุญาตให้ทุกคนที่ login แล้วทำงานได้เลย ไม่ต้องเช็ค role

-- ==========================================
-- PROFILES TABLE
-- ==========================================

-- ลบ policies เดิมทั้งหมดของ profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- สร้าง policies ใหม่แบบง่ายๆ
CREATE POLICY "Anyone authenticated can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ==========================================
-- KOLS TABLE
-- ==========================================

-- ลบ policies เดิม
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Analysts can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can delete KOLs" ON kols;

-- สร้าง policies ใหม่ - ให้ทุกคนที่ login แล้วทำได้หมด
CREATE POLICY "Authenticated users can view KOLs"
ON kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete KOLs"
ON kols FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- ACCOUNTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON accounts;

CREATE POLICY "Authenticated users can view accounts"
ON accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete accounts"
ON accounts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- CAMPAIGNS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Analysts can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;

CREATE POLICY "Authenticated users can view campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete campaigns"
ON campaigns FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- POSTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Analysts can view all posts" ON posts;
DROP POLICY IF EXISTS "Brand users can view posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

CREATE POLICY "Authenticated users can view posts"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
ON posts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete posts"
ON posts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- PROJECTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON projects;
DROP POLICY IF EXISTS "Brand users can view their projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Authenticated users can view projects"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;

CREATE POLICY "Authenticated users can view comments"
ON comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
ON comments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete comments"
ON comments FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- MEMO_LOGS TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can insert memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can update memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can delete memo logs" ON memo_logs;

CREATE POLICY "Authenticated users can view memo logs"
ON memo_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert memo logs"
ON memo_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update memo logs"
ON memo_logs FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete memo logs"
ON memo_logs FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- STATUS_CHANGES TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view status changes" ON status_changes;
DROP POLICY IF EXISTS "Users can insert status changes" ON status_changes;

CREATE POLICY "Authenticated users can view status changes"
ON status_changes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert status changes"
ON status_changes FOR INSERT
TO authenticated
WITH CHECK (true);


-- ==========================================
-- File: 008_create_posts.sql
-- ==========================================

-- Posts table (social media posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_post_id TEXT NOT NULL, -- Platform-specific post ID (used for imports)
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  kol_channel_id UUID NOT NULL REFERENCES public.kol_channels(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  content_type TEXT, -- post, reel, story, video, live, etc.
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  utm_params JSONB,
  
  posted_at TIMESTAMPTZ,
  screenshot_url TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'removed')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(external_post_id, kol_channel_id)
);

-- Post Metrics (engagement data snapshots)
CREATE TABLE IF NOT EXISTS public.post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Engagement metrics
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Calculated metrics
  ctr DECIMAL(5, 2), -- Click-through rate
  engagement_rate DECIMAL(5, 2), -- ER%
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, captured_at)
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      WHERE p.id = auth.uid() AND c.id = posts.campaign_id
    )
  );

CREATE POLICY "KOL users can view their own posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      WHERE p.id = auth.uid() AND kc.id = posts.kol_channel_id
    )
  );

CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      WHERE p.id = auth.uid() AND kc.id = posts.kol_channel_id
    )
  );

CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for post_metrics
CREATE POLICY "Admins can view all metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      JOIN public.posts po ON c.id = po.campaign_id
      WHERE p.id = auth.uid() AND po.id = post_metrics.post_id
    )
  );

CREATE POLICY "KOL users can view their own metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      JOIN public.posts po ON kc.id = po.kol_channel_id
      WHERE p.id = auth.uid() AND po.id = post_metrics.post_id
    )
  );

CREATE POLICY "Admins can insert metrics"
  ON public.post_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update metrics"
  ON public.post_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_external_id ON public.posts(external_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_campaign_id ON public.posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_posts_kol_channel_id ON public.posts(kol_channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON public.posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON public.post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_captured_at ON public.post_metrics(captured_at);


-- ==========================================
-- File: 009_create_comments.sql
-- ==========================================

-- Tags table (for comment categorization)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('sentiment', 'topic', 'intent')),
  color TEXT, -- hex color for UI
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_comment_id TEXT NOT NULL, -- Platform-specific comment ID
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  like_count INTEGER DEFAULT 0,
  
  parent_comment_id UUID REFERENCES public.comments(id), -- for threaded comments
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(external_comment_id, post_id)
);

-- Comment Tags (junction table)
CREATE TABLE IF NOT EXISTS public.comment_tags (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  PRIMARY KEY (comment_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_tags ENABLE ROW LEVEL SECURITY;

-- Policies for tags
CREATE POLICY "Everyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for comments
CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      JOIN public.posts po ON c.id = po.campaign_id
      WHERE p.id = auth.uid() AND po.id = comments.post_id
    )
  );

CREATE POLICY "KOL users can view their post comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      JOIN public.posts po ON kc.id = po.kol_channel_id
      WHERE p.id = auth.uid() AND po.id = comments.post_id
    )
  );

CREATE POLICY "Admins can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for comment_tags
CREATE POLICY "Users can view comment tags"
  ON public.comment_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and analysts can insert comment tags"
  ON public.comment_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Admins and analysts can delete comment tags"
  ON public.comment_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags(type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_external_id ON public.comments(external_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON public.comments(timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_comment_id ON public.comment_tags(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_tag_id ON public.comment_tags(tag_id);


-- ==========================================
-- File: 010_create_audit_logs.sql
-- ==========================================

-- Audit Logs table (for tracking all important changes)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- create, update, delete, import, export, etc.
  entity_type TEXT NOT NULL, -- kol, campaign, post, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- Allow system to insert logs

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);


-- ==========================================
-- File: 011_create_notifications.sql
-- ==========================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- campaign_start, campaign_end, missing_metrics, approval_needed, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to relevant page
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);


-- ==========================================
-- File: 012_seed_default_tags.sql
-- ==========================================

-- Seed default tags for comment categorization

-- Sentiment tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Positive', 'sentiment', '#22c55e', 'Positive sentiment'),
  ('Neutral', 'sentiment', '#6b7280', 'Neutral sentiment'),
  ('Negative', 'sentiment', '#ef4444', 'Negative sentiment')
ON CONFLICT (name) DO NOTHING;

-- Topic tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Product', 'topic', '#3b82f6', 'About the product'),
  ('Price', 'topic', '#f59e0b', 'About pricing'),
  ('Delivery', 'topic', '#8b5cf6', 'About delivery/shipping'),
  ('Quality', 'topic', '#ec4899', 'About quality'),
  ('Service', 'topic', '#14b8a6', 'About customer service')
ON CONFLICT (name) DO NOTHING;

-- Intent tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Purchase Intent', 'intent', '#10b981', 'Shows intent to purchase'),
  ('Complaint', 'intent', '#f97316', 'Complaint or issue'),
  ('Question', 'intent', '#06b6d4', 'Asking a question'),
  ('General', 'intent', '#64748b', 'General comment')
ON CONFLICT (name) DO NOTHING;


-- ==========================================
-- File: all-migrations-with-drop.sql
-- ==========================================

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
-- DROP POLICIES (if any remain)
-- ==========================================

-- Note: Policies are automatically dropped when tables are dropped
-- But we'll explicitly drop them just in case

-- ==========================================
-- DROP INDEXES (if any remain)
-- ==========================================

-- Note: Indexes are automatically dropped when tables are dropped

-- ==========================================
-- DONE
-- ==========================================

-- After running this script, you can run all-migrations.sql
-- or individual migration scripts in order


-- ==========================================
-- STEP 2: CREATE ALL TABLES
-- ==========================================


-- ==========================================
-- File: 001_create_memo_logs.sql
-- ==========================================

-- Create memo_logs table for tracking work notes with star ratings
-- Supports KOLs, Accounts, Campaigns, and Posts

CREATE TABLE IF NOT EXISTS public.memo_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('kol', 'account', 'campaign', 'post')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memo_logs_entity ON public.memo_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_memo_logs_created_by ON public.memo_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_memo_logs_created_at ON public.memo_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.memo_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Analysts can view all memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'analyst'
    )
  );

CREATE POLICY "Brand users can view memo logs for their entities"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'brand'
      AND (
        -- Can view account memo logs for their account
        (memo_logs.entity_type = 'account' AND memo_logs.entity_id = profiles.account_id)
        OR
        -- Can view campaign memo logs for their account's campaigns
        (memo_logs.entity_type = 'campaign' AND EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.projects p ON c.project_id = p.id
          WHERE c.id = memo_logs.entity_id
          AND p.account_id = profiles.account_id
        ))
        OR
        -- Can view post memo logs for their account's campaigns
        (memo_logs.entity_type = 'post' AND EXISTS (
          SELECT 1 FROM public.posts po
          JOIN public.campaigns c ON po.campaign_id = c.id
          JOIN public.projects p ON c.project_id = p.id
          WHERE po.id = memo_logs.entity_id
          AND p.account_id = profiles.account_id
        ))
      )
    )
  );

CREATE POLICY "KOL users can view their own memo logs"
  ON public.memo_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'kol'
      AND memo_logs.entity_type = 'kol'
      AND memo_logs.entity_id = profiles.kol_id
    )
  );

CREATE POLICY "Admins and analysts can insert memo logs"
  ON public.memo_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Admins can update memo logs"
  ON public.memo_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete memo logs"
  ON public.memo_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memo_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER memo_logs_updated_at
  BEFORE UPDATE ON public.memo_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_memo_logs_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.memo_logs IS 'Stores work notes and star ratings for KOLs, Accounts, Campaigns, and Posts';
COMMENT ON COLUMN public.memo_logs.entity_type IS 'Type of entity: kol, account, campaign, or post';
COMMENT ON COLUMN public.memo_logs.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.memo_logs.star_rating IS 'Optional star rating from 1 to 5';


-- ==========================================
-- File: 001_create_profiles_and_roles.sql
-- ==========================================

-- Create profiles table that references auth.users
-- This stores additional user information and role assignments

CREATE TYPE user_role AS ENUM ('admin', 'brand_user', 'kol_user', 'analyst');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'brand_user',
  account_id UUID, -- FK to accounts table (for brand users)
  kol_id UUID, -- FK to kols table (for KOL users)
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Bangkok',
  language TEXT DEFAULT 'th',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'brand_user')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON public.profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kol_id ON public.profiles(kol_id);


-- ==========================================
-- File: 002_create_accounts.sql
-- ==========================================

-- Accounts table (clients/brands)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  logo_url TEXT,
  tax_id TEXT,
  billing_address TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  currency TEXT DEFAULT 'THB',
  credit_terms INTEGER DEFAULT 30, -- days
  msa_document_url TEXT, -- Master Service Agreement
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all accounts"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brand users can view their own account"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_id = accounts.id
    )
  );

CREATE POLICY "Analysts can view all accounts"
  ON public.accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'analyst'
    )
  );

CREATE POLICY "Admins can insert accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update accounts"
  ON public.accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts(created_at);


-- ==========================================
-- File: 002_create_status_changes.sql
-- ==========================================

-- Create status_changes table for tracking status changes with reasons
-- Supports KOLs, Accounts, Campaigns, and Posts

CREATE TABLE IF NOT EXISTS public.status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('kol', 'account', 'campaign', 'post')),
  entity_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_status_changes_entity ON public.status_changes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_changes_changed_by ON public.status_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_status_changes_created_at ON public.status_changes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.status_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Analysts can view all status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'analyst'
    )
  );

CREATE POLICY "Brand users can view status changes for their entities"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'brand'
      AND (
        -- Can view account status changes for their account
        (status_changes.entity_type = 'account' AND status_changes.entity_id = profiles.account_id)
        OR
        -- Can view campaign status changes for their account's campaigns
        (status_changes.entity_type = 'campaign' AND EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.projects p ON c.project_id = p.id
          WHERE c.id = status_changes.entity_id
          AND p.account_id = profiles.account_id
        ))
        OR
        -- Can view post status changes for their account's campaigns
        (status_changes.entity_type = 'post' AND EXISTS (
          SELECT 1 FROM public.posts po
          JOIN public.campaigns c ON po.campaign_id = c.id
          JOIN public.projects p ON c.project_id = p.id
          WHERE po.id = status_changes.entity_id
          AND p.account_id = profiles.account_id
        ))
      )
    )
  );

CREATE POLICY "KOL users can view their own status changes"
  ON public.status_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'kol'
      AND status_changes.entity_type = 'kol'
      AND status_changes.entity_id = profiles.kol_id
    )
  );

CREATE POLICY "Admins and analysts can insert status changes"
  ON public.status_changes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'analyst')
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.status_changes IS 'Tracks status changes with reasons for KOLs, Accounts, Campaigns, and Posts';
COMMENT ON COLUMN public.status_changes.entity_type IS 'Type of entity: kol, account, campaign, or post';
COMMENT ON COLUMN public.status_changes.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.status_changes.old_status IS 'Previous status value';
COMMENT ON COLUMN public.status_changes.new_status IS 'New status value';
COMMENT ON COLUMN public.status_changes.reason IS 'Reason for the status change';


-- ==========================================
-- File: 003_add_missing_columns.sql
-- ==========================================

-- Add any missing columns to existing tables based on UI requirements

-- Ensure posts table has all necessary columns
DO $$ 
BEGIN
  -- Add status column to posts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));
  END IF;
END $$;

-- Ensure campaigns table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'campaigns' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
    -- Add new constraint
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check 
      CHECK (status IN ('active', 'inactive', 'draft', 'completed', 'cancelled'));
  END IF;
END $$;

-- Ensure accounts table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_status_check;
    -- Add new constraint
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_status_check 
      CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- Ensure kols table has all necessary columns
DO $$ 
BEGIN
  -- Ensure status column exists and has correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'kols' 
    AND column_name = 'status'
  ) THEN
    -- Drop existing constraint if any
    ALTER TABLE public.kols DROP CONSTRAINT IF EXISTS kols_status_check;
    -- Add new constraint
    ALTER TABLE public.kols ADD CONSTRAINT kols_status_check 
      CHECK (status IN ('active', 'inactive', 'draft', 'ban'));
  END IF;
END $$;

-- Add indexes for status columns for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_kols_status ON public.kols(status);

COMMENT ON COLUMN public.posts.status IS 'Post status: active, inactive, or draft';
COMMENT ON COLUMN public.campaigns.status IS 'Campaign status: active, inactive, draft, completed, or cancelled';
COMMENT ON COLUMN public.accounts.status IS 'Account status: active or inactive';
COMMENT ON COLUMN public.kols.status IS 'KOL status: active, inactive, draft, or ban';


-- ==========================================
-- File: 003_create_projects.sql
-- ==========================================

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT,
  brief_document_url TEXT,
  total_budget DECIMAL(15, 2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  owner_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brand users can view their account projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.account_id = projects.account_id
    )
  );

CREATE POLICY "Analysts can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'analyst'
    )
  );

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_account_id ON public.projects(account_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON public.projects(start_date, end_date);


-- ==========================================
-- File: 004_create_helper_functions.sql
-- ==========================================

-- Create helper functions for common queries

-- Function to get memo logs for an entity
CREATE OR REPLACE FUNCTION get_memo_logs(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  star_rating INTEGER,
  created_by UUID,
  creator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.id,
    ml.content,
    ml.star_rating,
    ml.created_by,
    COALESCE(p.full_name, p.email) as creator_name,
    ml.created_at
  FROM public.memo_logs ml
  LEFT JOIN public.profiles p ON ml.created_by = p.id
  WHERE ml.entity_type = p_entity_type
    AND ml.entity_id = p_entity_id
  ORDER BY ml.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get status change history for an entity
CREATE OR REPLACE FUNCTION get_status_history(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  changed_by UUID,
  changer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.old_status,
    sc.new_status,
    sc.reason,
    sc.changed_by,
    COALESCE(p.full_name, p.email) as changer_name,
    sc.created_at
  FROM public.status_changes sc
  LEFT JOIN public.profiles p ON sc.changed_by = p.id
  WHERE sc.entity_type = p_entity_type
    AND sc.entity_id = p_entity_id
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get post statistics history
CREATE OR REPLACE FUNCTION get_post_statistics_history(
  p_post_id UUID
)
RETURNS TABLE (
  id UUID,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  reach INTEGER,
  engagement_rate NUMERIC,
  captured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.views,
    pm.likes,
    pm.comments,
    pm.shares,
    pm.saves,
    pm.reach,
    pm.engagement_rate,
    pm.captured_at,
    pm.created_at
  FROM public.post_metrics pm
  WHERE pm.post_id = p_post_id
  ORDER BY pm.captured_at DESC, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get account statistics (projects, campaigns, KOLs count)
CREATE OR REPLACE FUNCTION get_account_statistics(
  p_account_id UUID
)
RETURNS TABLE (
  projects_count BIGINT,
  campaigns_count BIGINT,
  kols_count BIGINT,
  total_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pr.id) as projects_count,
    COUNT(DISTINCT c.id) as campaigns_count,
    COUNT(DISTINCT ck.kol_id) as kols_count,
    COALESCE(SUM(pr.total_budget), 0) as total_budget
  FROM public.accounts a
  LEFT JOIN public.projects pr ON pr.account_id = a.id
  LEFT JOIN public.campaigns c ON c.project_id = pr.id
  LEFT JOIN public.campaign_kols ck ON ck.campaign_id = c.id
  WHERE a.id = p_account_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memo_logs IS 'Retrieves memo logs for a specific entity with creator information';
COMMENT ON FUNCTION get_status_history IS 'Retrieves status change history for a specific entity';
COMMENT ON FUNCTION get_post_statistics_history IS 'Retrieves historical statistics for a post';
COMMENT ON FUNCTION get_account_statistics IS 'Retrieves statistics for an account (projects, campaigns, KOLs, budget)';


-- ==========================================
-- File: 004_create_kols.sql
-- ==========================================

-- KOLs (Key Opinion Leaders / Influencers) table
CREATE TABLE IF NOT EXISTS public.kols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT,
  category TEXT[], -- niche categories (fashion, tech, food, etc.)
  country TEXT DEFAULT 'TH',
  language TEXT[] DEFAULT ARRAY['th'],
  contact_email TEXT,
  contact_phone TEXT,
  contact_line TEXT,
  
  -- Billing info
  entity_type TEXT CHECK (entity_type IN ('individual', 'company')),
  tax_id TEXT,
  billing_address TEXT,
  payment_method TEXT,
  bank_account TEXT,
  
  -- Additional info
  avatar_url TEXT,
  bio TEXT,
  notes TEXT,
  quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 5),
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.kols ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all KOLs"
  ON public.kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own profile"
  ON public.kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND kol_id = kols.id
    )
  );

CREATE POLICY "Brand users can view active KOLs"
  ON public.kols FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'brand_user'
    )
  );

CREATE POLICY "Admins can insert KOLs"
  ON public.kols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update KOLs"
  ON public.kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can update their own profile"
  ON public.kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND kol_id = kols.id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kols_status ON public.kols(status);
CREATE INDEX IF NOT EXISTS idx_kols_category ON public.kols USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_kols_country ON public.kols(country);
CREATE INDEX IF NOT EXISTS idx_kols_quality_score ON public.kols(quality_score);


-- ==========================================
-- File: 005_check_and_fix_user_role_enum.sql
-- ==========================================

-- Check current enum values for user_role
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;

-- Add missing enum values if they don't exist
DO $$ 
BEGIN
    -- Add 'brand' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'brand' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'brand';
    END IF;
    
    -- Add 'kol' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'kol' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'kol';
    END IF;
    
    -- Add 'admin' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
    
    -- Add 'analyst' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'analyst' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'analyst';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;


-- ==========================================
-- File: 005_create_kol_channels.sql
-- ==========================================

-- KOL Channels (multi-channel support)
CREATE TYPE channel_type AS ENUM ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'line', 'other');

CREATE TABLE IF NOT EXISTS public.kol_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  handle TEXT NOT NULL,
  external_id TEXT, -- platform-specific ID
  profile_url TEXT,
  
  -- Current stats (updated periodically)
  follower_count INTEGER DEFAULT 0,
  avg_likes DECIMAL(10, 2),
  avg_comments DECIMAL(10, 2),
  avg_shares DECIMAL(10, 2),
  avg_views DECIMAL(10, 2),
  engagement_rate DECIMAL(5, 2), -- percentage
  
  -- Metadata
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(kol_id, channel_type, handle)
);

-- Enable RLS
ALTER TABLE public.kol_channels ENABLE ROW LEVEL SECURITY;

-- Policies (inherit from kols table)
CREATE POLICY "Admins can view all channels"
  ON public.kol_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own channels"
  ON public.kol_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kols k ON p.kol_id = k.id
      WHERE p.id = auth.uid() AND k.id = kol_channels.kol_id
    )
  );

CREATE POLICY "Brand users can view active channels"
  ON public.kol_channels FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'brand_user'
    )
  );

CREATE POLICY "Admins can insert channels"
  ON public.kol_channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update channels"
  ON public.kol_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can update their own channels"
  ON public.kol_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kols k ON p.kol_id = k.id
      WHERE p.id = auth.uid() AND k.id = kol_channels.kol_id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kol_channels_kol_id ON public.kol_channels(kol_id);
CREATE INDEX IF NOT EXISTS idx_kol_channels_type ON public.kol_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_kol_channels_status ON public.kol_channels(status);


-- ==========================================
-- File: 006_create_rate_cards.sql
-- ==========================================

-- Rate Cards (versioned billing rates for KOLs)
CREATE TABLE IF NOT EXISTS public.rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL means current/active
  currency TEXT DEFAULT 'THB',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(kol_id, version),
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Rate Items (individual rates per channel/content type)
CREATE TABLE IF NOT EXISTS public.rate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_card_id UUID NOT NULL REFERENCES public.rate_cards(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  content_type TEXT NOT NULL, -- post, reel, story, video, live, etc.
  base_rate DECIMAL(15, 2) NOT NULL,
  
  -- Add-ons stored as JSONB for flexibility
  addons JSONB DEFAULT '{}', -- e.g., {"whitelisting": 10000, "usage_days": 30, "exclusivity": 5000}
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_items ENABLE ROW LEVEL SECURITY;

-- Policies for rate_cards
CREATE POLICY "Admins can view all rate cards"
  ON public.rate_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own rate cards"
  ON public.rate_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.kol_id = rate_cards.kol_id
    )
  );

CREATE POLICY "Admins can insert rate cards"
  ON public.rate_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update rate cards"
  ON public.rate_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for rate_items
CREATE POLICY "Admins can view all rate items"
  ON public.rate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "KOL users can view their own rate items"
  ON public.rate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rate_cards rc ON p.kol_id = rc.kol_id
      WHERE p.id = auth.uid() AND rc.id = rate_items.rate_card_id
    )
  );

CREATE POLICY "Admins can insert rate items"
  ON public.rate_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update rate items"
  ON public.rate_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_cards_kol_id ON public.rate_cards(kol_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_effective ON public.rate_cards(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_rate_items_rate_card_id ON public.rate_items(rate_card_id);
CREATE INDEX IF NOT EXISTS idx_rate_items_channel ON public.rate_items(channel_type);


-- ==========================================
-- File: 006_fix_rls_policies.sql
-- ==========================================

-- Fix infinite recursion in RLS policies
-- The issue is that policies are checking user roles by querying the profiles table,
-- which creates a circular dependency

-- First, let's create a helper function to get user role from JWT
-- This avoids querying the profiles table in policies
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'analyst'
  )::text;
$$;

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Recreate profiles policies without circular references
-- Users can always view their own profile (no role check needed)
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (no role check needed)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (using JWT role)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can update all profiles (using JWT role)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (auth.user_role() = 'admin');

-- Admins can insert profiles (using JWT role)
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() = 'admin');

-- Now fix other tables that might have similar issues
-- Drop and recreate KOLs policies
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON kols;

-- Recreate KOLs policies using JWT role
CREATE POLICY "Admins can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all KOLs"
ON kols FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view active KOLs"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand' 
  AND status = 'active'
);

CREATE POLICY "KOL users can view their own profile"
ON kols FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "KOL users can update their own profile"
ON kols FOR UPDATE
TO authenticated
USING (
  auth.user_role() = 'kol'
  AND id = (SELECT kol_id FROM profiles WHERE id = auth.uid())
);

-- Fix accounts policies
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own account" ON accounts;

CREATE POLICY "Admins can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all accounts"
ON accounts FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their own account"
ON accounts FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their account campaigns" ON campaigns;

CREATE POLICY "Admins can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can view all campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Brand users can view their account campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (
  auth.user_role() = 'brand'
  AND project_id IN (
    SELECT id FROM projects 
    WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  )
);

-- Add a comment explaining the fix
COMMENT ON FUNCTION auth.user_role() IS 
'Returns the user role from JWT metadata to avoid circular references in RLS policies. This prevents infinite recursion when policies need to check user roles.';


-- ==========================================
-- File: 007_create_campaigns.sql
-- ==========================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT, -- reach, engagement, traffic, conversion
  kpi_targets JSONB, -- flexible KPI storage
  start_date DATE,
  end_date DATE,
  channels channel_type[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'live', 'completed', 'cancelled')),
  budget DECIMAL(15, 2),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Campaign KOLs (junction table with allocation details)
CREATE TABLE IF NOT EXISTS public.campaign_kols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kol_id UUID NOT NULL REFERENCES public.kols(id) ON DELETE CASCADE,
  kol_channel_id UUID REFERENCES public.kol_channels(id),
  target_metrics JSONB, -- campaign-specific targets for this KOL
  allocated_budget DECIMAL(15, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(campaign_id, kol_id, kol_channel_id)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_kols ENABLE ROW LEVEL SECURITY;

-- Policies for campaigns
CREATE POLICY "Admins can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their account campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      WHERE p.id = auth.uid() AND pr.id = campaigns.project_id
    )
  );

CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for campaign_kols
CREATE POLICY "Admins can view all campaign KOLs"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign KOLs"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      WHERE p.id = auth.uid() AND c.id = campaign_kols.campaign_id
    )
  );

CREATE POLICY "KOL users can view their own campaign assignments"
  ON public.campaign_kols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.kol_id = campaign_kols.kol_id
    )
  );

CREATE POLICY "Admins can insert campaign KOLs"
  ON public.campaign_kols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update campaign KOLs"
  ON public.campaign_kols FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON public.campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_kols_campaign_id ON public.campaign_kols(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_kols_kol_id ON public.campaign_kols(kol_id);


-- ==========================================
-- File: 007_simplify_rls_policies.sql
-- ==========================================

-- ลบ policies เดิมที่มีปัญหา infinite recursion และสร้างใหม่แบบง่ายๆ
-- อนุญาตให้ทุกคนที่ login แล้วทำงานได้เลย ไม่ต้องเช็ค role

-- ==========================================
-- PROFILES TABLE
-- ==========================================

-- ลบ policies เดิมทั้งหมดของ profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- สร้าง policies ใหม่แบบง่ายๆ
CREATE POLICY "Anyone authenticated can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ==========================================
-- KOLS TABLE
-- ==========================================

-- ลบ policies เดิม
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Analysts can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can delete KOLs" ON kols;

-- สร้าง policies ใหม่ - ให้ทุกคนที่ login แล้วทำได้หมด
CREATE POLICY "Authenticated users can view KOLs"
ON kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete KOLs"
ON kols FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- ACCOUNTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON accounts;

CREATE POLICY "Authenticated users can view accounts"
ON accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete accounts"
ON accounts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- CAMPAIGNS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Analysts can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;

CREATE POLICY "Authenticated users can view campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete campaigns"
ON campaigns FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- POSTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Analysts can view all posts" ON posts;
DROP POLICY IF EXISTS "Brand users can view posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

CREATE POLICY "Authenticated users can view posts"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
ON posts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete posts"
ON posts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- PROJECTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON projects;
DROP POLICY IF EXISTS "Brand users can view their projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Authenticated users can view projects"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;

CREATE POLICY "Authenticated users can view comments"
ON comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
ON comments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete comments"
ON comments FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- MEMO_LOGS TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can insert memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can update memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can delete memo logs" ON memo_logs;

CREATE POLICY "Authenticated users can view memo logs"
ON memo_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert memo logs"
ON memo_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update memo logs"
ON memo_logs FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete memo logs"
ON memo_logs FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- STATUS_CHANGES TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view status changes" ON status_changes;
DROP POLICY IF EXISTS "Users can insert status changes" ON status_changes;

CREATE POLICY "Authenticated users can view status changes"
ON status_changes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert status changes"
ON status_changes FOR INSERT
TO authenticated
WITH CHECK (true);


-- ==========================================
-- File: 008_create_posts.sql
-- ==========================================

-- Posts table (social media posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_post_id TEXT NOT NULL, -- Platform-specific post ID (used for imports)
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  kol_channel_id UUID NOT NULL REFERENCES public.kol_channels(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  content_type TEXT, -- post, reel, story, video, live, etc.
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  utm_params JSONB,
  
  posted_at TIMESTAMPTZ,
  screenshot_url TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'removed')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(external_post_id, kol_channel_id)
);

-- Post Metrics (engagement data snapshots)
CREATE TABLE IF NOT EXISTS public.post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Engagement metrics
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Calculated metrics
  ctr DECIMAL(5, 2), -- Click-through rate
  engagement_rate DECIMAL(5, 2), -- ER%
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, captured_at)
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      WHERE p.id = auth.uid() AND c.id = posts.campaign_id
    )
  );

CREATE POLICY "KOL users can view their own posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      WHERE p.id = auth.uid() AND kc.id = posts.kol_channel_id
    )
  );

CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "KOL users can insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      WHERE p.id = auth.uid() AND kc.id = posts.kol_channel_id
    )
  );

CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for post_metrics
CREATE POLICY "Admins can view all metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      JOIN public.posts po ON c.id = po.campaign_id
      WHERE p.id = auth.uid() AND po.id = post_metrics.post_id
    )
  );

CREATE POLICY "KOL users can view their own metrics"
  ON public.post_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      JOIN public.posts po ON kc.id = po.kol_channel_id
      WHERE p.id = auth.uid() AND po.id = post_metrics.post_id
    )
  );

CREATE POLICY "Admins can insert metrics"
  ON public.post_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update metrics"
  ON public.post_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_external_id ON public.posts(external_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_campaign_id ON public.posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_posts_kol_channel_id ON public.posts(kol_channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON public.posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON public.post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_captured_at ON public.post_metrics(captured_at);


-- ==========================================
-- File: 009_create_comments.sql
-- ==========================================

-- Tags table (for comment categorization)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('sentiment', 'topic', 'intent')),
  color TEXT, -- hex color for UI
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_comment_id TEXT NOT NULL, -- Platform-specific comment ID
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  like_count INTEGER DEFAULT 0,
  
  parent_comment_id UUID REFERENCES public.comments(id), -- for threaded comments
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(external_comment_id, post_id)
);

-- Comment Tags (junction table)
CREATE TABLE IF NOT EXISTS public.comment_tags (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  PRIMARY KEY (comment_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_tags ENABLE ROW LEVEL SECURITY;

-- Policies for tags
CREATE POLICY "Everyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for comments
CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Brand users can view their campaign comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.projects pr ON p.account_id = pr.account_id
      JOIN public.campaigns c ON pr.id = c.project_id
      JOIN public.posts po ON c.id = po.campaign_id
      WHERE p.id = auth.uid() AND po.id = comments.post_id
    )
  );

CREATE POLICY "KOL users can view their post comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.kol_channels kc ON p.kol_id = kc.kol_id
      JOIN public.posts po ON kc.id = po.kol_channel_id
      WHERE p.id = auth.uid() AND po.id = comments.post_id
    )
  );

CREATE POLICY "Admins can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for comment_tags
CREATE POLICY "Users can view comment tags"
  ON public.comment_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and analysts can insert comment tags"
  ON public.comment_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

CREATE POLICY "Admins and analysts can delete comment tags"
  ON public.comment_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags(type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_external_id ON public.comments(external_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON public.comments(timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_comment_id ON public.comment_tags(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_tag_id ON public.comment_tags(tag_id);


-- ==========================================
-- File: 010_create_audit_logs.sql
-- ==========================================

-- Audit Logs table (for tracking all important changes)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- create, update, delete, import, export, etc.
  entity_type TEXT NOT NULL, -- kol, campaign, post, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- Allow system to insert logs

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);


-- ==========================================
-- File: 011_create_notifications.sql
-- ==========================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- campaign_start, campaign_end, missing_metrics, approval_needed, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to relevant page
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);


-- ==========================================
-- File: 012_seed_default_tags.sql
-- ==========================================

-- Seed default tags for comment categorization

-- Sentiment tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Positive', 'sentiment', '#22c55e', 'Positive sentiment'),
  ('Neutral', 'sentiment', '#6b7280', 'Neutral sentiment'),
  ('Negative', 'sentiment', '#ef4444', 'Negative sentiment')
ON CONFLICT (name) DO NOTHING;

-- Topic tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Product', 'topic', '#3b82f6', 'About the product'),
  ('Price', 'topic', '#f59e0b', 'About pricing'),
  ('Delivery', 'topic', '#8b5cf6', 'About delivery/shipping'),
  ('Quality', 'topic', '#ec4899', 'About quality'),
  ('Service', 'topic', '#14b8a6', 'About customer service')
ON CONFLICT (name) DO NOTHING;

-- Intent tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Purchase Intent', 'intent', '#10b981', 'Shows intent to purchase'),
  ('Complaint', 'intent', '#f97316', 'Complaint or issue'),
  ('Question', 'intent', '#06b6d4', 'Asking a question'),
  ('General', 'intent', '#64748b', 'General comment')
ON CONFLICT (name) DO NOTHING;



