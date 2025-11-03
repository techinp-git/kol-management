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
