import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
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

    // Get KOL budget from campaign_kols
    const { data: campaignKols } = await supabase
      .from("campaign_kols")
      .select("kol_id, allocated_budget")
      .eq("campaign_id", post.campaign_id)

    const kolBudget =
      campaignKols?.find((ck: any) => ck.kol_id === post.kol_channels?.kols?.id)?.allocated_budget || 0

    const boostBudget = post.boost_budget ? parseFloat(post.boost_budget) : 0
    const totalBudget = parseFloat(kolBudget) + boostBudget

    // Get latest metrics
    const latestMetrics = metrics?.[0] || {}
    const impressionsOrganic = latestMetrics.impressions_organic || 0
    const impressionsBoost = latestMetrics.impressions_boost || 0
    const totalImpressions = impressionsOrganic + impressionsBoost

    const reachOrganic = latestMetrics.reach_organic || 0
    const reachBoost = latestMetrics.reach_boost || 0
    const totalReach = reachOrganic + reachBoost

    const likes = latestMetrics.likes || 0
    const comments = latestMetrics.comments || 0
    const shares = latestMetrics.shares || 0
    const saves = latestMetrics.saves || 0
    const sharesAndSaves = shares + saves
    const totalEngage = likes + comments + shares + saves

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

    return NextResponse.json({
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
      comments: comments,
      shares: shares,
      saves: saves,
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
    })
  } catch (error: any) {
    console.error("[v0] Error in GET /api/posts/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const {
      post_name,
      url,
      content_type,
      caption,
      posted_at,
      boost_budget,
      remark,
      campaign_id,
      kol_channel_id,
    } = body

    const { data: post, error: postError } = await supabase
      .from("posts")
      .update({
        post_name: post_name || null,
        url: url || null,
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
        notes: remark || null,
        campaign_id: campaign_id || null,
        kol_channel_id: kol_channel_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (postError) {
      console.error("[v0] Error updating post:", postError)
      console.error("[v0] Error code:", postError.code)
      console.error("[v0] Error details:", postError.details)

      // Check if it's an RLS error
      if (postError.code === "42501") {
        console.error("[v0] RLS Error: User does not have permission to update posts")
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

    console.log("[v0] Post updated successfully:", post.id)
    return NextResponse.json(post)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/posts/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting post:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/posts/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

