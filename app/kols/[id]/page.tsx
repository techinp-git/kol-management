import { notFound } from "next/navigation"
import { KOLDetailClient } from "@/components/kol-detail-client"
import { createClient } from "@/lib/supabase/server"

type KOLStatus = "active" | "inactive" | "draft" | "ban"

export default async function KOLDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()

  // Try to fetch with follower_history first, fallback to without it if column doesn't exist
  let { data: kol, error } = await supabase
    .from("kols")
    .select(`
      *,
      kol_channels (
        id,
        channel_type,
        handle,
        external_id,
        profile_url,
        follower_count,
        avg_likes,
        avg_comments,
        engagement_rate,
        verified,
        status,
        follower_history
      )
    `)
    .eq("id", id)
    .single()

  // If error is due to missing column, try again without follower_history
  if (error && (error.code === "42703" || error.message?.includes("column") || error.message?.includes("follower_history"))) {
    console.warn("[v0] follower_history column not found, fetching without it:", error.message)
    const result = await supabase
      .from("kols")
      .select(`
        *,
        kol_channels (
          id,
          channel_type,
          handle,
          external_id,
          profile_url,
          follower_count,
          avg_likes,
          avg_comments,
          engagement_rate,
          verified,
          status
        )
      `)
      .eq("id", id)
      .single()
    
    kol = result.data
    error = result.error
    
    // Set follower_history to empty array for all channels if column doesn't exist
    if (kol && kol.kol_channels) {
      kol.kol_channels = kol.kol_channels.map((channel: any) => ({
        ...channel,
        follower_history: [],
      }))
    }
  }

  if (error || !kol) {
    console.error("[v0] Error fetching KOL:", error)
    console.error("[v0] Error details:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    })
    notFound()
  }

  // Fetch posts for each channel
  const channelIds = kol.kol_channels?.map((ch: any) => ch.id) || []
  let postsByChannel: Record<string, any[]> = {}
  let totalPostsCount = 0
  let uniqueCampaignsCount = 0

  if (channelIds.length > 0) {
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        post_name,
        url,
        content_type,
        posted_at,
        status,
        kol_channel_id,
        campaign_id,
        kol_budget,
        boost_budget,
        campaigns (
          id,
          name
        ),
        post_metrics (
          impressions_organic,
          impressions_boost,
          reach_organic,
          reach_boost,
          likes,
          comments,
          shares,
          saves,
          post_clicks,
          link_clicks,
          retweets,
          views,
          captured_at
        )
      `)
      .in("kol_channel_id", channelIds)
      .order("posted_at", { ascending: false })
      .limit(50)

    if (!postsError && posts) {
      totalPostsCount = posts.length
      const postIds = (posts as any[]).map((p: any) => p.id)

      // Sentiment ต่อโพสต์: จาก comments + master_post_intention
      let sentimentByPostId: Record<string, { positive: number; neutral: number; negative: number; unclassified: number }> = {}
      if (postIds.length > 0) {
        const [commentsRes, masterRes] = await Promise.all([
          supabase.from("comments").select("post_id, post_intention").in("post_id", postIds),
          supabase
            .from("master_post_intention")
            .select("post_intention, sentiment")
            .eq("is_active", true),
        ])
        const commentsList = commentsRes.data || []
        const intentionToSentiment = new Map<string, string>()
        ;(masterRes.data || []).forEach((row: any) => {
          if (row.post_intention && !intentionToSentiment.has(row.post_intention)) {
            intentionToSentiment.set(row.post_intention, row.sentiment || "Neutral")
          }
        })
        commentsList.forEach((c: any) => {
          const sentiment = c.post_intention ? (intentionToSentiment.get(c.post_intention) || "Neutral") : null
          if (!sentimentByPostId[c.post_id]) {
            sentimentByPostId[c.post_id] = { positive: 0, neutral: 0, negative: 0, unclassified: 0 }
          }
          const bucket = sentiment === "Positive" ? "positive" : sentiment === "Negative" ? "negative" : sentiment === "Neutral" ? "neutral" : "unclassified"
          sentimentByPostId[c.post_id][bucket]++
        })
      }

      // Take latest metric per post and add computed fields
      const postsWithStats = (posts as any[]).map((post: any) => {
        const metrics = post.post_metrics || []
        const latest = [...metrics].sort(
          (a: any, b: any) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()
        )[0]
        const imp = (latest?.impressions_organic || 0) + (latest?.impressions_boost || 0)
        const reach = (latest?.reach_organic || 0) + (latest?.reach_boost || 0)
        const engage =
          (latest?.likes || 0) +
          (latest?.comments || 0) +
          (latest?.shares || 0) +
          (latest?.saves || 0) +
          (latest?.post_clicks || 0) +
          (latest?.link_clicks || 0) +
          (latest?.retweets || 0)
        const kolBudget = parseFloat(post.kol_budget?.toString() || "0") || 0
        const boostBudget = parseFloat(post.boost_budget?.toString() || "0") || 0
        const totalCost = kolBudget + boostBudget
        const sent = sentimentByPostId[post.id]
        const sentimentLabel =
          sent && (sent.positive + sent.neutral + sent.negative + sent.unclassified) > 0
            ? [
                sent.positive ? `⊕${sent.positive}` : null,
                sent.negative ? `⊖${sent.negative}` : null,
                sent.neutral ? `○${sent.neutral}` : null,
                sent.unclassified ? `?${sent.unclassified}` : null,
              ]
                .filter(Boolean)
                .join(" ")
            : null
        return {
          ...post,
          _impression: imp,
          _reach: reach,
          _engage: engage,
          _cost: totalCost,
          _sentiment: sentimentLabel,
          _sentimentDetail: sent || undefined,
        }
      })
      // Group posts by channel_id
      postsByChannel = postsWithStats.reduce((acc: Record<string, any[]>, post: any) => {
        const channelId = post.kol_channel_id
        if (!acc[channelId]) {
          acc[channelId] = []
        }
        acc[channelId].push(post)
        return acc
      }, {})
    }

    // Get actual total count and unique campaigns count from database
    const { count: totalCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .in("kol_channel_id", channelIds)
    
    if (totalCount !== null) {
      totalPostsCount = totalCount
    }

    // Count unique campaigns
    const { data: campaignData } = await supabase
      .from("posts")
      .select("campaign_id")
      .in("kol_channel_id", channelIds)
      .not("campaign_id", "is", null)

    if (campaignData) {
      const uniqueCampaignIds = new Set(
        campaignData
          .map((post: any) => post.campaign_id)
          .filter((id: any) => id !== null && id !== undefined)
      )
      uniqueCampaignsCount = uniqueCampaignIds.size
    }
  }

  return <KOLDetailClient kol={kol} postsByChannel={postsByChannel} totalPostsCount={totalPostsCount} uniqueCampaignsCount={uniqueCampaignsCount} />
}
