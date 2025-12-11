import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaign_id")

    // Build query to fetch posts with latest metrics
    let query = supabase
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
          campaign_kols (
            kol_id,
            allocated_budget
          )
        )
      `)
      .order("posted_at", { ascending: false })

    // Filter by campaign if provided
    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("[v0] Error fetching posts:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch latest metrics for each post
    const postsWithMetrics = await Promise.all(
      (posts || []).map(async (post: any) => {
        // Get latest metrics for this post
        const { data: latestMetrics } = await supabase
          .from("post_metrics")
          .select("*")
          .eq("post_id", post.id)
          .order("captured_at", { ascending: false })
          .limit(1)
          .single()

        // Get KOL budget from campaign_kols
        const kolBudget =
          post.campaigns?.campaign_kols?.find((ck: any) => ck.kol_id === post.kol_channels?.kols?.id)
            ?.allocated_budget || 0

        const boostBudget = post.boost_budget ? parseFloat(post.boost_budget) : 0
        const totalBudget = parseFloat(kolBudget) + boostBudget

        // Calculate metrics
        const metrics = latestMetrics || {}
        const impressionsOrganic = metrics.impressions_organic || 0
        const impressionsBoost = metrics.impressions_boost || 0
        const totalImpressions = impressionsOrganic + impressionsBoost

        const reachOrganic = metrics.reach_organic || 0
        const reachBoost = metrics.reach_boost || 0
        const totalReach = reachOrganic + reachBoost

        const likes = metrics.likes || 0
        const comments = metrics.comments || 0
        const shares = metrics.shares || 0
        const saves = metrics.saves || 0
        const sharesAndSaves = shares + saves
        const totalEngage = likes + comments + shares + saves

        const views = metrics.views || 0
        const postClicks = metrics.post_clicks || 0
        const linkClicks = metrics.link_clicks || 0
        const retweets = metrics.retweets || 0

        // Calculate cost metrics
        const cpr = totalReach > 0 ? totalBudget / totalReach : 0
        const cpe = totalEngage > 0 ? totalBudget / totalEngage : 0
        const cpv = views > 0 ? totalBudget / views : 0

        // Calculate ER%
        const erPercent = totalReach > 0 ? (totalEngage / totalReach) * 100 : 0

        return {
          id: post.id,
          external_post_id: post.external_post_id,
          post_name: post.post_name || "",
          url: post.url,
          caption: post.caption,
          content_type: post.content_type,
          posted_at: post.posted_at,
          status: post.status,
          notes: post.notes,
          remark: post.remark || post.notes || "",
          kol_name: post.kol_channels?.kols?.name || "",
          kol_category: post.kol_channels?.kols?.category || [],
          platform: post.kol_channels?.channel_type || "",
          follower: post.kol_channels?.follower_count || 0,
          kol_budget: parseFloat(kolBudget),
          boost_budget: boostBudget,
          total_budget: totalBudget,
          campaign_name: post.campaigns?.name || "",
          // Metrics
          impressions_organic: impressionsOrganic,
          impressions_boost: impressionsBoost,
          total_impressions: totalImpressions,
          reach_organic: reachOrganic,
          reach_boost: reachBoost,
          total_reach: totalReach,
          likes: likes,
          comments: comments,
          shares_and_saves: sharesAndSaves,
          post_clicks: postClicks,
          link_clicks: linkClicks,
          retweets: retweets,
          total_engage: totalEngage,
          vdo_view: views,
          cpr: cpr,
          cpe: cpe,
          cpv: cpv,
          er_percent: erPercent,
          total_comment: comments,
          // Raw metrics for reference
          metrics: latestMetrics,
        }
      })
    )

    return NextResponse.json(postsWithMetrics)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/posts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      external_post_id,
      post_name,
      campaign_id,
      kol_channel_id,
      url,
      content_type,
      caption,
      posted_at,
      boost_budget,
      remark,
      metrics,
    } = body

    // Validate required fields
    if (!external_post_id || !campaign_id || !kol_channel_id || !url) {
      return NextResponse.json(
        { error: "Missing required fields: external_post_id, campaign_id, kol_channel_id, url" },
        { status: 400 }
      )
    }

    // Insert post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        external_post_id,
        post_name: post_name || null,
        campaign_id,
        kol_channel_id,
        url,
        content_type: content_type || null,
        caption: caption || null,
        // Convert to DATE format (YYYY-MM-DD) - posted_at is now DATE type in database
        posted_at: posted_at 
          ? (typeof posted_at === 'string' 
              ? (posted_at.includes("T") ? posted_at.split("T")[0] : posted_at.slice(0, 10))
              : new Date(posted_at).toISOString().slice(0, 10))
          : null,
        boost_budget: boost_budget || 0,
        remark: remark || null,
        notes: remark || null, // Also save to notes for backward compatibility
        status: "published",
      })
      .select()
      .single()

    if (postError) {
      console.error("[v0] Error creating post:", postError)
      console.error("[v0] Error code:", postError.code)
      console.error("[v0] Error details:", postError.details)

      // Check if it's an RLS error
      if (postError.code === "42501") {
        console.error("[v0] RLS Error: User does not have permission to insert into posts")
        return NextResponse.json(
          {
            error: "Permission denied. Please check Row Level Security policies for posts table.",
            details: postError.message,
          },
          { status: 403 }
        )
      }

      return NextResponse.json({ error: postError.message }, { status: 400 })
    }

    // Insert initial metrics if provided
    if (metrics && post) {
      const { error: metricsError } = await supabase.from("post_metrics").insert({
        post_id: post.id,
        post_link: post.url ?? null,
        impressions_organic: metrics.impressions_organic || 0,
        impressions_boost: metrics.impressions_boost || 0,
        reach_organic: metrics.reach_organic || 0,
        reach_boost: metrics.reach_boost || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        shares: metrics.shares || 0,
        saves: metrics.saves || 0,
        post_clicks: metrics.post_clicks || 0,
        link_clicks: metrics.link_clicks || 0,
        retweets: metrics.retweets || 0,
        views: metrics.views || 0,
        impressions: (metrics.impressions_organic || 0) + (metrics.impressions_boost || 0),
        reach: (metrics.reach_organic || 0) + (metrics.reach_boost || 0),
      })

      if (metricsError) {
        console.error("[v0] Error creating post metrics:", metricsError)
        // Don't fail the request if metrics insertion fails
      }
    }

    console.log("[v0] Post created successfully:", post.id)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/posts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
