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
