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
  post_link TEXT,
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
