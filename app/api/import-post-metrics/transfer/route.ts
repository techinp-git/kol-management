import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type TransferRequestBody = {
  fileName?: string
  ids?: string[]
  dryRun?: boolean
}

type ImportPostMetricsRow = {
  id: string
  file_name: string
  post_link: string | null
  update_post: string | null
  impression_organic: number | string | null
  impression_boost_post: number | string | null
  reach_organic: number | string | null
  reach_boost_post: number | string | null
  engage_likes: number | string | null
  engange_comments: number | string | null
  engage_shares: number | string | null
  engage_save: number | string | null
  post_click: number | string | null
  link_click: number | string | null
  retweet: number | string | null
  vdo_view: number | string | null
  flag_use: boolean | null
  import_date: string | null
  status: string | null
  error_message: string | null
  raw_payload: Record<string, any> | null
}

type TransferResultRow = {
  importId: string
  fileName: string
  status: "inserted" | "updated" | "skipped" | "failed"
  message?: string
  metricId?: string
}

const normalizeUrl = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    url.hash = ""
    if (url.pathname && url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+/g, "/").replace(/\/+$/, "") || "/"
    }
    return url.toString()
  } catch {
    return trimmed.replace(/\/+/g, "/").replace(/\/+$/, "")
  }
}

const toNumber = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  const cleaned = value
    .toString()
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "")
    .trim()
  if (!cleaned) return null
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const toCapturedAt = (value?: string | null, fallback?: string | null) => {
  const parse = (input?: string | null) => {
    if (!input) return null
    const raw = input.toString().trim()
    if (!raw) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return `${raw}T00:00:00Z`
    }
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) {
      return null
    }
    return parsed.toISOString()
  }
  return parse(value) ?? parse(fallback) ?? new Date().toISOString()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    let adminClient: ReturnType<typeof createAdminClient>

    try {
      adminClient = createAdminClient()
    } catch (error: any) {
      console.error("[v0] Failed to create admin client for metrics transfer:", error)
      return NextResponse.json({ error: error?.message ?? "Missing admin client configuration" }, { status: 500 })
    }

    let body: TransferRequestBody = {}
    try {
      body = (await request.json()) ?? {}
    } catch {
      // ignore invalid JSON and treat as empty
    }

    const { fileName, ids, dryRun } = body

    if ((!fileName || !fileName.trim()) && (!ids || ids.length === 0)) {
      return NextResponse.json({ error: "ต้องระบุ fileName หรือ ids สำหรับการถ่ายโอน" }, { status: 400 })
    }

    let rowsQuery = supabase.from("import_post_metrics").select("*")
    if (ids?.length) {
      rowsQuery = rowsQuery.in("id", ids)
    } else if (fileName) {
      rowsQuery = rowsQuery.eq("file_name", fileName)
    }
    rowsQuery = rowsQuery.order("import_date", { ascending: true }).limit(1000)

    const { data: rows, error } = await rowsQuery

    if (error) {
      console.error("[v0] Error fetching import_post_metrics rows:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        message: "ไม่พบข้อมูลที่พร้อมสำหรับการถ่ายโอน",
        attempts: 0,
        inserted: 0,
        updated: 0,
        failed: 0,
        results: [],
      })
    }

    const postCache = new Map<string, string | null>()
    const results: TransferResultRow[] = []
    let insertedCount = 0
    let updatedCount = 0
    let failedCount = 0

    for (const rawRow of rows as ImportPostMetricsRow[]) {
      const row = rawRow
      const payload = row.raw_payload ?? {}
      const normalizedUrl = normalizeUrl(row.post_link ?? payload.post_link ?? null)
      const rowMessages: string[] = []
      let status: TransferResultRow["status"] = "failed"
      let metricId: string | undefined

      if (!normalizedUrl) {
        rowMessages.push("post_link ว่างหรือไม่ถูกต้อง")
      }

      let postId: string | null = null
      if (normalizedUrl) {
        if (postCache.has(normalizedUrl)) {
          postId = postCache.get(normalizedUrl) ?? null
        } else {
          const { data: postRecord, error: postLookupError } = await adminClient
            .from("posts")
            .select("id")
            .eq("url", normalizedUrl)
            .maybeSingle()

          if (postLookupError) {
            console.error("[v0] Error looking up post for metrics transfer:", postLookupError)
            rowMessages.push("ไม่สามารถค้นหาโพสต์จาก post_link ได้")
          }

          postId = postRecord?.id ?? null
          postCache.set(normalizedUrl, postId)
        }

        if (!postId) {
          rowMessages.push("ไม่พบโพสต์ปลายทางจาก post_link")
        }
      }

      const capturedAt = toCapturedAt(
        row.update_post ?? (payload.update_post as string | null),
        row.import_date ?? (payload.import_date as string | null),
      )

      if (!capturedAt) {
        rowMessages.push("update_post ไม่ถูกต้องหรือว่าง")
      }

      const impressionsOrganic = toNumber(row.impression_organic) ?? 0
      const impressionsBoost = toNumber(row.impression_boost_post) ?? 0
      const reachOrganic = toNumber(row.reach_organic) ?? 0
      const reachBoost = toNumber(row.reach_boost_post) ?? 0
      const likes = toNumber(row.engage_likes) ?? 0
      const comments = toNumber(row.engange_comments ?? payload.engage_comments) ?? 0
      const shares = toNumber(row.engage_shares) ?? 0
      const saves = toNumber(row.engage_save ?? payload.engage_saves) ?? 0
      const postClicks = toNumber(row.post_click) ?? 0
      const linkClicks = toNumber(row.link_click) ?? 0
      const retweets = toNumber(row.retweet) ?? 0
      const views = toNumber(row.vdo_view) ?? 0

      if (rowMessages.length > 0) {
        failedCount += 1
        if (!dryRun) {
          await supabase
            .from("import_post_metrics")
            .update({
              status: "failed",
              error_message: rowMessages.join("; "),
            })
            .eq("id", row.id)
        }

        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "failed",
          message: rowMessages.join("; "),
        })
        continue
      }

      if (dryRun) {
        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "skipped",
          message: "Dry-run mode, ไม่ได้อัปเดต post_metrics",
        })
        continue
      }

      const metricPayload: Record<string, any> = {
        post_id: postId,
        captured_at: capturedAt,
        post_link: normalizedUrl,
        impressions_organic: impressionsOrganic,
        impressions_boost: impressionsBoost,
        impressions: impressionsOrganic + impressionsBoost,
        reach_organic: reachOrganic,
        reach_boost: reachBoost,
        reach: reachOrganic + reachBoost,
        likes,
        comments,
        shares,
        saves,
        views,
        post_clicks: postClicks,
        link_clicks: linkClicks,
        retweets,
      }

      const { data: insertedMetric, error: insertError } = await adminClient
        .from("post_metrics")
        .insert(metricPayload)
        .select("id")
        .single()

      if (insertError) {
        failedCount += 1
        const errorMessage =
          insertError.code === "23505"
            ? "พบ Metrics ซ้ำ (post_id + captured_at) ไม่สามารถเพิ่มใหม่ได้"
            : insertError.message
        console.error("[v0] Failed to insert post_metrics:", insertError)
        await supabase
          .from("import_post_metrics")
          .update({
            status: "failed",
            error_message: errorMessage,
          })
          .eq("id", row.id)

        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "failed",
          message: errorMessage,
        })
        continue
      }

      metricId = insertedMetric?.id
      insertedCount += 1
      status = "inserted"

      await supabase
        .from("import_post_metrics")
        .update({
          flag_use: true,
          status: "processed",
          error_message: "สร้าง Metrics ใหม่",
        })
        .eq("id", row.id)

      results.push({
        importId: row.id,
        fileName: row.file_name,
        status,
        message: "เพิ่ม Metrics ใหม่",
        metricId,
      })
    }

    return NextResponse.json({
      fileName: fileName ?? null,
      attempts: rows.length,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failedCount,
      results,
    })
  } catch (error: any) {
    console.error("[v0] Unexpected error in POST /api/import-post-metrics/transfer:", error)
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 })
  }
}


