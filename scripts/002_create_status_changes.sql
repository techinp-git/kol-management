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
