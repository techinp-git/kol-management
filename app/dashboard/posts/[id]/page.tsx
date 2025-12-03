import { PostDetailClient } from "@/components/post-detail-client"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function getPost(id: string) {
  try {
    const supabase = await createClient()

    // Fetch post with related data
    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        kol_channels (
          id,
          channel_type,
          handle,
          follower_count,
          kols (
            id,
            name,
            category
          )
        ),
        campaigns (
          id,
          name,
          projects (
            id,
            name,
            accounts (
              id,
              name
            )
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching post:", error)
      return null
    }

    if (!post) {
      return null
    }

    // Fetch all metrics for this post
    const { data: metrics, error: metricsError } = await supabase
      .from("post_metrics")
      .select("*")
      .eq("post_id", id)
      .order("captured_at", { ascending: false })

    if (metricsError) {
      console.error("[v0] Error fetching post metrics:", metricsError)
    }

    // Fetch comments for this post
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .order("timestamp", { ascending: false })

    if (commentsError) {
      console.error("[v0] Error fetching post comments:", commentsError)
    }

    console.log("[v0] Fetched comments for post", id, ":", comments?.length || 0, "comments")
    console.log("[v0] Comments data:", comments)

    let kolBudget = 0
    if (post.campaign_id && post.kol_channels?.kols?.id) {
      const { data: campaignKols, error: campaignKolsError } = await supabase
        .from("campaign_kols")
        .select("kol_id, allocated_budget")
        .eq("campaign_id", post.campaign_id)

      if (campaignKolsError) {
        console.error("[v0] Error fetching campaign_kols:", campaignKolsError)
      }

      kolBudget = campaignKols?.find((ck: any) => ck.kol_id === post.kol_channels?.kols?.id)?.allocated_budget || 0
    }

    const boostBudget = post.boost_budget ? parseFloat(post.boost_budget.toString()) : 0
    const totalBudget = parseFloat(kolBudget.toString()) + boostBudget
    
    console.log("[v0] Budget calculation:", { kolBudget, boostBudget, totalBudget })

    // Get latest metrics
    const latestMetrics = metrics?.[0] || {}
    console.log("[v0] Latest metrics:", latestMetrics)
    
    const impressionsOrganic = latestMetrics.impressions_organic || 0
    const impressionsBoost = latestMetrics.impressions_boost || 0
    const totalImpressions = impressionsOrganic + impressionsBoost

    const reachOrganic = latestMetrics.reach_organic || 0
    const reachBoost = latestMetrics.reach_boost || 0
    const totalReach = reachOrganic + reachBoost

    const likes = latestMetrics.likes || 0
    const commentsCount = latestMetrics.comments || 0
    const shares = latestMetrics.shares || 0
    const saves = latestMetrics.saves || 0
    const totalEngage = likes + commentsCount + shares + saves

    const views = latestMetrics.views || 0
    const postClicks = latestMetrics.post_clicks || 0
    const linkClicks = latestMetrics.link_clicks || 0
    const retweets = latestMetrics.retweets || 0

    // Calculate cost metrics
    const cpr = totalReach > 0 ? totalBudget / totalReach : 0
    const cpe = totalEngage > 0 ? totalBudget / totalEngage : 0
    const cpv = views > 0 ? totalBudget / views : 0

    // Calculate ER%
    const erPercent = totalReach > 0 ? (totalEngage / totalReach) * 100 : 0

    return {
      ...post,
      post_name: post.post_name || "",
      remark: post.remark || post.notes || "",
      kol_budget: parseFloat(kolBudget),
      boost_budget: boostBudget,
      total_budget: totalBudget,
      post_metrics: metrics || [],
      latest_metrics: latestMetrics,
      // Calculated metrics
      impressions_organic: impressionsOrganic,
      impressions_boost: impressionsBoost,
      total_impressions: totalImpressions,
      reach_organic: reachOrganic,
      reach_boost: reachBoost,
      total_reach: totalReach,
      likes: likes,
      comments: commentsCount,
      shares: shares,
      saves: saves,
      post_clicks: postClicks,
      link_clicks: linkClicks,
      retweets: retweets,
      total_engage: totalEngage,
      views: views,
      vdo_view: views, // Keep for backward compatibility
      cpr: cpr,
      cpe: cpe,
      cpv: cpv,
      er_percent: erPercent,
      comments: comments || [],
    }
  } catch (error) {
    console.error("[v0] Error fetching post:", error)
    return null
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return <PostDetailClient post={post} />
}
