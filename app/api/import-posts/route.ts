import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type ImportPostRow = {
  id: string
  file_name: string
  import_date: string | null
  status: string | null
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 1000

    if (fileName) {
      const { data, error } = await supabase
        .from("import_post")
        .select(
          "id, file_name, kol_name, post_name, kol_category, post_note, post_type, content_type, platform, kol_tier, follower, kol_budget, boost_budget, post_link, post_date, campaign_name, flag_use, import_date, status, error_message, raw_payload",
        )
        .eq("file_name", fileName)
        .order("import_date", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[v0] Error fetching import_post rows by file:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ rows: data ?? [] })
    }

    const { data, error } = await supabase
      .from("import_post")
      .select("id, file_name, import_date, status")
      .order("import_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching import_post summary:", error)
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
      if (status === "processed" || status === "success") {
        current.successCount += 1
      } else if (status === "failed" || status === "error") {
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
    console.error("[v0] Unexpected error in GET /api/import-posts:", error)
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

    const { error } = await supabase.from("import_post").delete().eq("file_name", fileName)

    if (error) {
      console.error("[v0] Error deleting import_post rows:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in DELETE /api/import-posts:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
