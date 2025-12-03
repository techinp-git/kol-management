-- Check if there are any posts in the database
SELECT 
  COUNT(*) as total_posts,
  COUNT(DISTINCT kol_channel_id) as unique_channels,
  COUNT(DISTINCT campaign_id) as unique_campaigns,
  MIN(created_at) as oldest_post,
  MAX(created_at) as newest_post
FROM posts;

-- Show sample posts with related data
SELECT 
  p.id,
  p.url,
  p.posted_at,
  p.content_type,
  k.name as kol_name,
  kc.channel_type as platform,
  c.name as campaign_name
FROM posts p
LEFT JOIN kol_channels kc ON p.kol_channel_id = kc.id
LEFT JOIN kols k ON kc.kol_id = k.id
LEFT JOIN campaigns c ON p.campaign_id = c.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Check RLS policies on posts table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'posts';

