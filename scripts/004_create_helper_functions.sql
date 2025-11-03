-- Create helper functions for common queries

-- Function to get memo logs for an entity
CREATE OR REPLACE FUNCTION get_memo_logs(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  star_rating INTEGER,
  created_by UUID,
  creator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.id,
    ml.content,
    ml.star_rating,
    ml.created_by,
    COALESCE(p.full_name, p.email) as creator_name,
    ml.created_at
  FROM public.memo_logs ml
  LEFT JOIN public.profiles p ON ml.created_by = p.id
  WHERE ml.entity_type = p_entity_type
    AND ml.entity_id = p_entity_id
  ORDER BY ml.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get status change history for an entity
CREATE OR REPLACE FUNCTION get_status_history(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  id UUID,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  changed_by UUID,
  changer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.old_status,
    sc.new_status,
    sc.reason,
    sc.changed_by,
    COALESCE(p.full_name, p.email) as changer_name,
    sc.created_at
  FROM public.status_changes sc
  LEFT JOIN public.profiles p ON sc.changed_by = p.id
  WHERE sc.entity_type = p_entity_type
    AND sc.entity_id = p_entity_id
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get post statistics history
CREATE OR REPLACE FUNCTION get_post_statistics_history(
  p_post_id UUID
)
RETURNS TABLE (
  id UUID,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  reach INTEGER,
  engagement_rate NUMERIC,
  captured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.views,
    pm.likes,
    pm.comments,
    pm.shares,
    pm.saves,
    pm.reach,
    pm.engagement_rate,
    pm.captured_at,
    pm.created_at
  FROM public.post_metrics pm
  WHERE pm.post_id = p_post_id
  ORDER BY pm.captured_at DESC, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get account statistics (projects, campaigns, KOLs count)
CREATE OR REPLACE FUNCTION get_account_statistics(
  p_account_id UUID
)
RETURNS TABLE (
  projects_count BIGINT,
  campaigns_count BIGINT,
  kols_count BIGINT,
  total_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pr.id) as projects_count,
    COUNT(DISTINCT c.id) as campaigns_count,
    COUNT(DISTINCT ck.kol_id) as kols_count,
    COALESCE(SUM(pr.total_budget), 0) as total_budget
  FROM public.accounts a
  LEFT JOIN public.projects pr ON pr.account_id = a.id
  LEFT JOIN public.campaigns c ON c.project_id = pr.id
  LEFT JOIN public.campaign_kols ck ON ck.campaign_id = c.id
  WHERE a.id = p_account_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memo_logs IS 'Retrieves memo logs for a specific entity with creator information';
COMMENT ON FUNCTION get_status_history IS 'Retrieves status change history for a specific entity';
COMMENT ON FUNCTION get_post_statistics_history IS 'Retrieves historical statistics for a post';
COMMENT ON FUNCTION get_account_statistics IS 'Retrieves statistics for an account (projects, campaigns, KOLs, budget)';
