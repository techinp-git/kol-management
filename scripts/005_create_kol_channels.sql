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
