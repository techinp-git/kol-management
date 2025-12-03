import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { memo, rating } = body

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    const createdBy = user?.id || null

    // Insert memo log
    // Note: Schema uses 'content' (not 'memo'), 'star_rating' (not 'rating'), 'created_by' (not 'author')
    const { data: memoLog, error } = await supabase
      .from("memo_logs")
      .insert({
        entity_type: "campaign",
        entity_id: id,
        content: memo, // Schema uses 'content' not 'memo'
        star_rating: rating, // Schema uses 'star_rating' not 'rating'
        created_by: createdBy, // Schema uses 'created_by' not 'author'
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating memo log:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      console.error("[v0] Error hint:", error.hint)
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.error("[v0] RLS Error: User does not have permission to insert into memo_logs")
        return NextResponse.json({ 
          error: "Permission denied. Please check Row Level Security policies for memo_logs table.",
          details: error.message 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Memo log created successfully:", memoLog)
    
    // Fetch creator info for response
    let authorName = "User"
    if (memoLog.created_by) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", memoLog.created_by)
        .single()
      
      authorName = profile?.full_name || profile?.email || "User"
    }
    
    // Map to frontend format
    const mappedLog = {
      id: memoLog.id,
      memo: memoLog.content, // Map 'content' to 'memo' for frontend
      rating: memoLog.star_rating, // Map 'star_rating' to 'rating' for frontend
      author: authorName,
      created_at: memoLog.created_at,
      updated_at: memoLog.updated_at,
    }
    
    return NextResponse.json(mappedLog)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/campaigns/[id]/memos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch memo logs for this campaign
    const { data: memoLogs, error } = await supabase
      .from("memo_logs")
      .select("*")
      .eq("entity_type", "campaign")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching memo logs:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch author names from profiles
    const mappedLogs = await Promise.all(
      (memoLogs || []).map(async (log: any) => {
        let authorName = "User"
        if (log.created_by) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", log.created_by)
            .single()
          
          authorName = profile?.full_name || profile?.email || "User"
        }
        
        return {
          id: log.id,
          memo: log.content, // Map 'content' to 'memo' for frontend
          rating: log.star_rating, // Map 'star_rating' to 'rating' for frontend
          author: authorName,
          created_at: log.created_at,
          updated_at: log.updated_at,
        }
      })
    )

    return NextResponse.json(mappedLogs)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/campaigns/[id]/memos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

