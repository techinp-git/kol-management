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
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 1000

    if (fileName) {
      const { data, error } = await supabase
        .from("import_post_comments")
        .select(COMMENTS_COLUMNS)
        .eq("file_name", fileName)
        .order("import_date", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[v0] Error fetching import_post_comments rows:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ rows: data ?? [] })
    }

    const { data, error } = await supabase
      .from("import_post_comments")
      .select("file_name, import_date, status")
      .order("import_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching import_post_comments summary:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const summaryMap = new Map<
      string,
      {
        fileName: string
        totalRows: number
        lastImportDate: string | null
        successCount: number
        failedCount: number
      }
    >()

    data?.forEach((row) => {
      const key = row.file_name
      const current = summaryMap.get(key) ?? {
        fileName: key,
        totalRows: 0,
        lastImportDate: null as string | null,
        successCount: 0,
        failedCount: 0,
      }

      current.totalRows += 1
      if (!current.lastImportDate || (row.import_date && row.import_date > current.lastImportDate)) {
        current.lastImportDate = row.import_date
      }

      const status = row.status?.toLowerCase()
      if (status === "queued" || status === "processed" || status === "success") {
        current.successCount += 1
      } else if (status === "invalid" || status === "failed" || status === "error") {
        current.failedCount += 1
      }

      summaryMap.set(key, current)
    })

    const summary = Array.from(summaryMap.values()).sort((a, b) => {
      if (!a.lastImportDate || !b.lastImportDate) return 0
      return a.lastImportDate > b.lastImportDate ? -1 : 1
    })

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

