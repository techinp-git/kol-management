ALTER TABLE public.campaigns
  ALTER COLUMN project_id DROP NOT NULL;

COMMENT ON COLUMN public.campaigns.project_id IS 'Optional during auto-import; can be filled later';

