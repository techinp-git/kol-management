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
  post_link TEXT,
  post_intention TEXT, -- Post intention/intent from imported comments
  
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
CREATE INDEX IF NOT EXISTS idx_comments_post_link ON public.comments(post_link);
CREATE INDEX IF NOT EXISTS idx_comments_post_intention ON public.comments(post_intention);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON public.comments(timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_comment_id ON public.comment_tags(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_tags_tag_id ON public.comment_tags(tag_id);
