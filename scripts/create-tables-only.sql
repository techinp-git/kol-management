-- ==========================================
-- KOL Management - Create Tables Only
-- ==========================================
-- This script contains ONLY CREATE TABLE statements
-- No RLS policies, functions, triggers, or indexes
-- Run this in Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- ==========================================
-- STEP 1: Create Types
-- ==========================================
-- Note: PostgreSQL doesn't support IF NOT EXISTS for CREATE TYPE
-- We'll use DO blocks to check and create only if they don't exist

-- Create user_role enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'brand_user', 'kol_user', 'analyst');
  END IF;
END $$;

-- Create channel_type enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channel_type') THEN
    CREATE TYPE channel_type AS ENUM ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'line', 'other');
  END IF;
END $$;

-- ==========================================
-- STEP 2: Create Tables (in dependency order)
-- ==========================================

-- 1. Profiles (references auth.users, no dependencies on other custom tables)
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

-- 2. Memo Logs (references auth.users only)
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

-- 3. Status Changes (references auth.users only)
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

-- 4. Accounts (references profiles)
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

-- 5. Projects (references accounts and profiles)
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

-- 6. KOLs (references profiles)
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

-- 7. KOL Channels (references kols)
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

-- 8. Rate Cards (references kols and profiles)
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

-- 9. Rate Items (references rate_cards)
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

-- 10. Campaigns (references projects and profiles)
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

-- 11. Campaign KOLs (references campaigns, kols, and kol_channels)
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

-- 12. Posts (references campaigns, kol_channels, and profiles)
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

-- 13. Post Metrics (references posts)
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

-- 14. Tags (standalone, no dependencies)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('sentiment', 'topic', 'intent')),
  color TEXT, -- hex color for UI
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Comments (references posts)
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

-- 16. Comment Tags (junction table: references comments and tags)
CREATE TABLE IF NOT EXISTS public.comment_tags (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  
  PRIMARY KEY (comment_id, tag_id)
);

-- 17. Audit Logs (references profiles)
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

-- 18. Notifications (references profiles)
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

-- ==========================================
-- DONE
-- ==========================================
-- All tables created successfully!
-- Next steps:
-- 1. Enable RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- 2. Create RLS policies
-- 3. Create indexes for better performance
-- 4. Create functions and triggers if needed
-- ==========================================

