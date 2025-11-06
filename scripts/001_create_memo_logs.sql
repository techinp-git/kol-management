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
