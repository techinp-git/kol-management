import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { status, reason } = body

    // Update KOL status
    const { data: kol, error: kolError } = await supabase
      .from("kols")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (kolError) {
      console.error("[v0] Error updating KOL status:", kolError)
      return NextResponse.json({ error: kolError.message }, { status: 400 })
    }

    // Log status change in status_changes table
    if (reason) {
      await supabase.from("status_changes").insert({
        entity_type: "kol",
        entity_id: id,
        old_status: kol.status,
        new_status: status,
        reason,
      })
    }

    return NextResponse.json(kol)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/kols/[id]/status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
