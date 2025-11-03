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
