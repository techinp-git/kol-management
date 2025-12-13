import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const COMMENTS_COLUMNS =
  "id, file_name, post_link, update_post, kol_post_detail, post_intention, post_message, sentiment, tags, flag_use, import_date, status, error_message, raw_payload"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")
    const limitParam = searchParams.get("limit")
    // Use high limit or no limit for summary (we need all data to calculate accurate counts)
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined

    if (fileName) {
      // For specific file, fetch all rows (no limit) to show complete data
      let query = supabase
        .from("import_post_comments")
        .select(COMMENTS_COLUMNS)
        .eq("file_name", fileName)
        .order("import_date", { ascending: false })
      
      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching import_post_comments rows:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ rows: data ?? [] })
    }

    // For summary, we need to get accurate counts per file_name
    // Supabase PostgREST has a default limit of 1000, so we use pagination to fetch all rows
    // or use aggregate queries per file_name
    
    // First, get all unique file names with their latest import_date
    // Use a high limit and pagination to ensure we get all unique file names
    const allFileNames = new Set<string>()
    let page = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data: fileData, error: fileError } = await supabase
        .from("import_post_comments")
        .select("file_name, import_date")
        .not("file_name", "is", null)
        .order("import_date", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (fileError) {
        console.error("[v0] Error fetching file names:", fileError)
        return NextResponse.json({ error: fileError.message }, { status: 400 })
      }

      if (!fileData || fileData.length === 0) {
        hasMore = false
        break
      }

      fileData.forEach((row) => {
        if (row.file_name && row.file_name.trim()) {
          allFileNames.add(row.file_name.trim())
        }
      })

      // If we got less than pageSize, we've reached the end
      if (fileData.length < pageSize) {
        hasMore = false
      } else {
        page++
      }
    }

    console.log(`[v0] Found ${allFileNames.size} unique file names`)

    // Now calculate summary for each file using aggregate queries
    const summaryPromises = Array.from(allFileNames).map(async (fileName) => {
      // Get total count
      const { count: totalCount, error: totalError } = await supabase
        .from("import_post_comments")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)

      if (totalError) {
        console.error(`[v0] Error counting total for ${fileName}:`, totalError)
        return null
      }

      // Get success count
      const { count: successCount, error: successError } = await supabase
        .from("import_post_comments")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)
        .in("status", ["queued", "processed", "success"])

      if (successError) {
        console.error(`[v0] Error counting success for ${fileName}:`, successError)
      }

      // Get failed count
      const { count: failedCount, error: failedError } = await supabase
        .from("import_post_comments")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)
        .in("status", ["invalid", "failed", "error"])

      if (failedError) {
        console.error(`[v0] Error counting failed for ${fileName}:`, failedError)
      }

      // Get latest import_date
      const { data: latestData, error: latestError } = await supabase
        .from("import_post_comments")
        .select("import_date")
        .eq("file_name", fileName)
        .order("import_date", { ascending: false })
        .limit(1)

      if (latestError) {
        console.error(`[v0] Error getting latest date for ${fileName}:`, latestError)
      }

      // Get transferred count (flag_use = true or status = 'processed')
      const { count: transferredCount, error: transferredError } = await supabase
        .from("import_post_comments")
        .select("*", { count: "exact", head: true })
        .eq("file_name", fileName)
        .eq("flag_use", true)

      if (transferredError) {
        console.error(`[v0] Error counting transferred for ${fileName}:`, transferredError)
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
    const summary = summaryResults
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (!a.lastImportDate || !b.lastImportDate) return 0
        return a.lastImportDate > b.lastImportDate ? -1 : 1
      })

    console.log(`[v0] Returning ${summary.length} summary items`)
    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/import-post-comments:", error)
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

    const { error } = await supabase.from("import_post_comments").delete().eq("file_name", fileName)

    if (error) {
      console.error("[v0] Error deleting import_post_comments rows:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in DELETE /api/import-post-comments:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

