import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const {
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
      captured_at,
    } = body

    // Convert datetime-local to ISO string if needed
    let capturedAt = captured_at
    if (captured_at && !captured_at.includes("T")) {
      // If it's in datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
      capturedAt = new Date(captured_at).toISOString()
    } else if (!captured_at) {
      capturedAt = new Date().toISOString()
    }

    const { data: postRecord, error: postLookupError } = await supabase.from("posts").select("url").eq("id", id).single()

    if (postLookupError || !postRecord) {
      console.error("[v0] Error fetching post for metrics insert:", postLookupError)
      return NextResponse.json({ error: "ไม่พบโพสต์สำหรับบันทึก Metrics" }, { status: 400 })
    }

    // Insert post metrics
    const { data: metric, error } = await supabase
      .from("post_metrics")
      .insert({
        post_id: id,
        post_link: postRecord.url ?? null,
        impressions_organic: impressions_organic ? parseInt(impressions_organic.toString()) : 0,
        impressions_boost: impressions_boost ? parseInt(impressions_boost.toString()) : 0,
        reach_organic: reach_organic ? parseInt(reach_organic.toString()) : 0,
        reach_boost: reach_boost ? parseInt(reach_boost.toString()) : 0,
        likes: likes ? parseInt(likes.toString()) : 0,
        comments: comments ? parseInt(comments.toString()) : 0,
        shares: shares ? parseInt(shares.toString()) : 0,
        saves: saves ? parseInt(saves.toString()) : 0,
        post_clicks: post_clicks ? parseInt(post_clicks.toString()) : 0,
        link_clicks: link_clicks ? parseInt(link_clicks.toString()) : 0,
        retweets: retweets ? parseInt(retweets.toString()) : 0,
        views: views ? parseInt(views.toString()) : 0,
        captured_at: capturedAt,
        // Calculate totals
        impressions: (impressions_organic || 0) + (impressions_boost || 0),
        reach: (reach_organic || 0) + (reach_boost || 0),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating post metrics:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)

      // Check if it's an RLS error
      if (error.code === "42501") {
        console.error("[v0] RLS Error: User does not have permission to insert into post_metrics")
        return NextResponse.json(
          {
            error: "Permission denied. Please check Row Level Security policies for post_metrics table.",
            details: error.message,
          },
          { status: 403 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Post metrics created successfully:", metric.id)
    return NextResponse.json(metric)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/posts/[id]/metrics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const {
      metric_id,
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
      captured_at,
    } = body

    if (!metric_id) {
      return NextResponse.json({ error: "metric_id is required" }, { status: 400 })
    }

    // Convert datetime-local to ISO string if needed
    let capturedAt = captured_at
    if (captured_at && !captured_at.includes("T")) {
      capturedAt = new Date(captured_at).toISOString()
    }

    const { data: postRecord, error: postLookupError } = await supabase.from("posts").select("url").eq("id", id).single()
    if (postLookupError || !postRecord) {
      console.error("[v0] Error fetching post for metrics update:", postLookupError)
      return NextResponse.json({ error: "ไม่พบโพสต์สำหรับอัปเดต Metrics" }, { status: 400 })
    }

    // Update post metrics
    const updateData: any = {
      post_link: postRecord.url ?? null,
      impressions_organic: impressions_organic ? parseInt(impressions_organic.toString()) : 0,
      impressions_boost: impressions_boost ? parseInt(impressions_boost.toString()) : 0,
      reach_organic: reach_organic ? parseInt(reach_organic.toString()) : 0,
      reach_boost: reach_boost ? parseInt(reach_boost.toString()) : 0,
      likes: likes ? parseInt(likes.toString()) : 0,
      comments: comments ? parseInt(comments.toString()) : 0,
      shares: shares ? parseInt(shares.toString()) : 0,
      saves: saves ? parseInt(saves.toString()) : 0,
      post_clicks: post_clicks ? parseInt(post_clicks.toString()) : 0,
      link_clicks: link_clicks ? parseInt(link_clicks.toString()) : 0,
      retweets: retweets ? parseInt(retweets.toString()) : 0,
      views: views ? parseInt(views.toString()) : 0,
      // Calculate totals
      impressions: (impressions_organic || 0) + (impressions_boost || 0),
      reach: (reach_organic || 0) + (reach_boost || 0),
    }

    if (capturedAt) {
      updateData.captured_at = capturedAt
    }

    const { data: metric, error } = await supabase
      .from("post_metrics")
      .update(updateData)
      .eq("id", metric_id)
      .eq("post_id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating post metrics:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)

      // Check if it's an RLS error
      if (error.code === "42501") {
        console.error("[v0] RLS Error: User does not have permission to update post_metrics")
        return NextResponse.json(
          {
            error: "Permission denied. Please check Row Level Security policies for post_metrics table.",
            details: error.message,
          },
          { status: 403 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Post metrics updated successfully:", metric.id)
    return NextResponse.json(metric)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/posts/[id]/metrics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const url = new URL(request.url)
    const metricId = url.searchParams.get("metric_id")

    if (!metricId) {
      return NextResponse.json({ error: "metric_id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("post_metrics")
      .delete()
      .eq("id", metricId)
      .eq("post_id", id)

    if (error) {
      console.error("[v0] Error deleting post metrics:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Post metrics deleted successfully:", metricId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/posts/[id]/metrics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

