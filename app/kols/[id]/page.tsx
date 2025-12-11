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
        campaigns (
          id,
          name
        )
      `)
      .in("kol_channel_id", channelIds)
      .order("posted_at", { ascending: false })
      .limit(50)

    if (!postsError && posts) {
      totalPostsCount = posts.length
      
      // Group posts by channel_id
      postsByChannel = posts.reduce((acc: Record<string, any[]>, post: any) => {
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
