import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const METRIC_COLUMNS =
  "id, file_name, post_link, update_post, impression_organic, impression_boost_post, reach_organic, reach_boost_post, engage_likes, engange_comments, engage_shares, engage_save, post_click, link_click, retweet, vdo_view, flag_use, import_date, status, error_message, raw_payload"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 1000

    if (fileName) {
      const { data, error } = await supabase
        .from("import_post_metrics")
        .select(METRIC_COLUMNS)
        .eq("file_name", fileName)
        .order("import_date", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[v0] Error fetching import_post_metrics rows:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ rows: data ?? [] })
    }

    const { data, error } = await supabase
      .from("import_post_metrics")
      .select("file_name, import_date, status")
      .order("import_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching import_post_metrics summary:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get all unique file names first
    const allFileNames = new Set<string>()
    data?.forEach((row) => {
      if (row.file_name) {
        allFileNames.add(row.file_name)
      }
    })

    // Calculate summary with transferred count using aggregate queries
    const summaryPromises = Array.from(allFileNames).map(async (fileName) => {
      // Get total count
      const { count: totalCount, error: totalError } = await supabase
        .from("import_post_metrics")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)

      if (totalError) {
        console.error(`[v0] Error counting total for ${fileName}:`, totalError)
        return null
      }

      // Get success count
      const { count: successCount, error: successError } = await supabase
        .from("import_post_metrics")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)
        .in("status", ["queued", "processed", "success"])

      if (successError) {
        console.error(`[v0] Error counting success for ${fileName}:`, successError)
      }

      // Get failed count
      const { count: failedCount, error: failedError } = await supabase
        .from("import_post_metrics")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)
        .in("status", ["invalid", "failed", "error"])

      if (failedError) {
        console.error(`[v0] Error counting failed for ${fileName}:`, failedError)
      }

      // Get transferred count (flag_use = true)
      const { count: transferredCount, error: transferredError } = await supabase
        .from("import_post_metrics")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)
        .eq("flag_use", true)

      if (transferredError) {
        console.error(`[v0] Error counting transferred for ${fileName}:`, transferredError)
      }

      // Get latest import_date
      const { data: latestData, error: latestError } = await supabase
        .from("import_post_metrics")
        .select("import_date")
        .eq("file_name", fileName)
        .order("import_date", { ascending: false })
        .limit(1)

      if (latestError) {
        console.error(`[v0] Error getting latest date for ${fileName}:`, latestError)
      }

      return {
        fileName,
        totalRows: totalCount || 0,
        lastImportDate: latestData?.[0]?.import_date || null,
        successCount: successCount || 0,
        failedCount: failedCount || 0,
        transferredCount: transferredCount || 0,
      }
    })

    const summaryResults = await Promise.all(summaryPromises)
    const summaryMap = new Map<string, typeof summaryResults[0]>()
    
    summaryResults.forEach((item) => {
      if (item) {
        summaryMap.set(item.fileName, item)
      }
    })

    const summary = Array.from(summaryMap.values())
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (!a.lastImportDate || !b.lastImportDate) return 0
        return a.lastImportDate > b.lastImportDate ? -1 : 1
      })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/import-post-metrics:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 })
    }

    const { error } = await supabase.from("import_post_metrics").delete().eq("file_name", fileName)

    if (error) {
      console.error("[v0] Error deleting import_post_metrics rows:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in DELETE /api/import-post-metrics:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

