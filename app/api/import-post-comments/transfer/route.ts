import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type TransferRequestBody = {
  fileName?: string
  ids?: string[]
  dryRun?: boolean
}

type ImportPostCommentRow = {
  id: string
  file_name: string
  post_link: string | null
  update_post: string | null
  kol_post_detail: string | null
  post_intention: string | null
  post_message: string | null
  sentiment: string | null
  tags: string[] | null
  flag_use: boolean | null
  import_date: string | null
  status: string | null
  error_message: string | null
  raw_payload: Record<string, any> | null
}

type TransferResultRow = {
  importId: string
  fileName: string
  status: "inserted" | "skipped" | "failed"
  message?: string
  commentId?: string
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

const toTimestamp = (value?: string | null, fallback?: string | null) => {
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    let adminClient: ReturnType<typeof createAdminClient>

    try {
      adminClient = createAdminClient()
    } catch (error: any) {
      console.error("[v0] Failed to create admin client for comments transfer:", error)
      return NextResponse.json({ error: error?.message ?? "Missing admin client configuration" }, { status: 500 })
    }

    let body: TransferRequestBody = {}
    try {
      body = (await request.json()) ?? {}
    } catch {
      // ignore invalid json
    }

    const { fileName, ids, dryRun } = body

    if ((!fileName || !fileName.trim()) && (!ids || ids.length === 0)) {
      return NextResponse.json({ error: "ต้องระบุ fileName หรือ ids สำหรับการถ่ายโอน" }, { status: 400 })
    }

    // Fetch all rows using pagination (Supabase default limit is 1000 rows per request)
    // Only fetch rows that haven't been transferred yet (flag_use = false or null)
    let allRows: ImportPostCommentRow[] = []
    const pageSize = 1000
    let currentPage = 0
    let hasMore = true

    while (hasMore) {
      // Build query for current page - only get rows that haven't been transferred
      let pageQuery = supabase
        .from("import_post_comments")
        .select("*", { count: "exact" })
        .or("flag_use.is.null,flag_use.eq.false")
        .order("import_date", { ascending: true })
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)

      if (ids?.length) {
        pageQuery = pageQuery.in("id", ids)
      } else if (fileName) {
        pageQuery = pageQuery.eq("file_name", fileName)
      }

      const { data: pageRows, error: pageError, count } = await pageQuery

      if (pageError) {
        console.error("[v0] Error fetching import_post_comments rows:", pageError)
        return NextResponse.json({ error: pageError.message }, { status: 400 })
      }

      if (pageRows && pageRows.length > 0) {
        allRows = [...allRows, ...(pageRows as ImportPostCommentRow[])]
      }

      // Check if there are more rows to fetch
      const totalRows = count ?? allRows.length
      hasMore = pageRows && pageRows.length === pageSize && allRows.length < totalRows
      currentPage++

      // Safety limit: prevent infinite loops (max 100,000 rows)
      if (currentPage >= 100) {
        console.warn(`[v0] Reached safety limit of ${currentPage} pages (${allRows.length} rows), stopping pagination`)
        break
      }
    }

    const rows = allRows

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        message: "ไม่พบข้อมูลที่พร้อมสำหรับการถ่ายโอน",
        attempts: 0,
        inserted: 0,
        failed: 0,
        results: [],
      })
    }

    const postCache = new Map<string, string | null>()
    const results: TransferResultRow[] = []
    let insertedCount = 0
    let failedCount = 0

    for (const rawRow of rows as ImportPostCommentRow[]) {
      const row = rawRow
      const payload = row.raw_payload ?? {}
      const normalizedUrl = normalizeUrl(row.post_link ?? payload.post_link ?? null)
      const rowMessages: string[] = []
      let status: TransferResultRow["status"] = "failed"
      let commentId: string | undefined

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
            console.error("[v0] Error looking up post for comment transfer:", postLookupError)
            rowMessages.push("ไม่สามารถค้นหาโพสต์จาก post_link ได้")
          }

          postId = postRecord?.id ?? null
          postCache.set(normalizedUrl, postId)
        }

        if (!postId) {
          rowMessages.push("ไม่พบโพสต์ปลายทางจาก post_link")
        }
      }

      const commentText = row.post_message?.trim() || payload.post_message?.trim()
      if (!commentText) {
        rowMessages.push("post_message ว่าง ไม่สามารถสร้างคอมเมนต์ได้")
      }

      const author =
        row.kol_post_detail?.trim() ||
        (payload.author && payload.author.toString().trim()) ||
        "ไม่ระบุผู้เขียน"

      const timestamp = toTimestamp(row.update_post ?? (payload.update_post as string | null), row.import_date)

      if (!timestamp) {
        rowMessages.push("update_post ไม่ถูกต้องหรือว่าง")
      }

      const externalCommentId =
        payload.external_comment_id?.toString().trim() ??
        payload.comment_id?.toString().trim() ??
        row.id.replace(/[^a-zA-Z0-9]/g, "")

      const likeCount = toNumber(payload.like_count ?? (payload.likes as number | string)) ?? 0

      if (rowMessages.length > 0) {
        failedCount += 1
        if (!dryRun) {
          await supabase
            .from("import_post_comments")
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
          message: "Dry-run mode, ไม่ได้เพิ่มคอมเมนต์",
        })
        continue
      }

      const postIntention = row.post_intention?.trim() || payload.post_intention?.toString().trim() || null

      const commentPayload: Record<string, any> = {
        external_comment_id: externalCommentId,
        post_id: postId,
        post_link: normalizedUrl,
        author,
        text: commentText,
        timestamp,
        like_count: likeCount,
        post_intention: postIntention,
        file_name: row.file_name, // Store source file name for grouping
      }

      const { data: insertedComment, error: insertError } = await adminClient
        .from("comments")
        .insert(commentPayload)
        .select("id")
        .single()

      if (insertError) {
        failedCount += 1
        const errorMessage =
          insertError.code === "23505"
            ? "พบคอมเมนต์ซ้ำ (external_comment_id + post_id) ไม่สามารถเพิ่มใหม่ได้"
            : insertError.message
        console.error("[v0] Failed to insert comment:", insertError)
        await supabase
          .from("import_post_comments")
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

      commentId = insertedComment?.id
      insertedCount += 1
      status = "inserted"

      await supabase
        .from("import_post_comments")
        .update({
          flag_use: true,
          status: "processed",
          error_message: "สร้างคอมเมนต์ใหม่",
        })
        .eq("id", row.id)

      results.push({
        importId: row.id,
        fileName: row.file_name,
        status,
        message: "เพิ่มคอมเมนต์ใหม่",
        commentId,
      })
    }

    return NextResponse.json({
      fileName: fileName ?? null,
      attempts: rows.length,
      inserted: insertedCount,
      failed: failedCount,
      results,
    })
  } catch (error: any) {
    console.error("[v0] Unexpected error in POST /api/import-post-comments/transfer:", error)
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 })
  }
}


