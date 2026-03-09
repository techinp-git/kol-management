import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""

/**
 * GET /api/dashboard/comment-count?campaignIds=id1,id2,id3
 * Returns total comment count for all posts in the given campaigns (by campaign_id).
 * Uses admin client so the count matches reports that bypass RLS (e.g. SQL Editor).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignIdsParam = searchParams.get("campaignIds")
    if (!campaignIdsParam || campaignIdsParam.trim() === "") {
      return NextResponse.json({ error: "campaignIds required" }, { status: 400 })
    }
    const campaignIds = campaignIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
    if (campaignIds.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    if (
      !SERVICE_ROLE_KEY ||
      SERVICE_ROLE_KEY.trim() === "" ||
      SERVICE_ROLE_KEY === "your_service_role_key_here"
    ) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY not configured", count: null },
        { status: 503 }
      )
    }

    const supabase = createAdminClient()
    const pageSize = 1000

    // Path 1: posts by campaign_id
    let postIdsByCampaign: string[] = []
    let p1 = 0
    let m1 = true
    while (m1) {
      const { data, error } = await supabase
        .from("posts").select("id").in("campaign_id", campaignIds)
        .range(p1 * pageSize, (p1 + 1) * pageSize - 1)
      if (error) {
        console.error("[dashboard/comment-count] posts by campaign error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      if (data?.length) postIdsByCampaign = [...postIdsByCampaign, ...data.map((r) => r.id)]
      m1 = (data?.length ?? 0) === pageSize
      p1++
      if (p1 >= 100) break
    }

    // Path 2: posts by kol_channel_id via campaign_kols
    let postIdsByChannel: string[] = []
    const { data: ckData } = await supabase
      .from("campaign_kols").select("kol_channel_id").in("campaign_id", campaignIds)
    const channelIds = (ckData || []).map((r) => r.kol_channel_id).filter(Boolean)
    if (channelIds.length > 0) {
      let p2 = 0
      let m2 = true
      while (m2) {
        const { data, error } = await supabase
          .from("posts").select("id").in("kol_channel_id", channelIds)
          .range(p2 * pageSize, (p2 + 1) * pageSize - 1)
        if (error) { console.warn("[dashboard/comment-count] posts by channel error:", error); break }
        if (data?.length) postIdsByChannel = [...postIdsByChannel, ...data.map((r) => r.id)]
        m2 = (data?.length ?? 0) === pageSize
        p2++
        if (p2 >= 100) break
      }
    }

    // Merge & deduplicate
    const postIds = [...new Set([...postIdsByCampaign, ...postIdsByChannel])]

    if (postIds.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Count comments in chunks (PostgREST can limit .in() size)
    const chunkSize = 200
    let totalCount = 0
    for (let i = 0; i < postIds.length; i += chunkSize) {
      const chunk = postIds.slice(i, i + chunkSize)
      const { count, error: countError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .in("post_id", chunk)
      if (countError) {
        console.error("[dashboard/comment-count] count error:", countError)
        return NextResponse.json({ error: countError.message }, { status: 500 })
      }
      totalCount += count ?? 0
    }

    console.log("[dashboard/comment-count] Result:", {
      byCampaign: postIdsByCampaign.length,
      byChannel: postIdsByChannel.length,
      merged: postIds.length,
      totalCount,
    })
    return NextResponse.json({ count: totalCount })
  } catch (err) {
    console.error("[dashboard/comment-count]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
