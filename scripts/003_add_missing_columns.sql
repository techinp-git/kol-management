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
