import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { memo, rating } = body

    // Get current user (you may need to implement auth)
    // For now, we'll use a placeholder
    const author = "Current User"

    // Insert memo log
    const { data: memoLog, error } = await supabase
      .from("memo_logs")
      .insert({
        entity_type: "kol",
        entity_id: id,
        memo,
        rating,
        author,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating memo log:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(memoLog)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/kols/[id]/memos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch memo logs for this KOL
    const { data: memoLogs, error } = await supabase
      .from("memo_logs")
      .select("*")
      .eq("entity_type", "kol")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching memo logs:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(memoLogs)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/kols/[id]/memos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
