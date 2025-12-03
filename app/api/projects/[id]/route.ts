import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        *,
        accounts (
          id,
          name,
          currency
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching project:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/projects/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const {
      name,
      description,
      scope,
      brief_document_url,
      total_budget,
      start_date,
      end_date,
      status,
      account_id,
      owner_id,
      notes,
    } = body

    // Validate status
    const validStatuses = ["planning", "active", "completed", "cancelled"]
    const validStatus = status && validStatuses.includes(status) ? status : undefined

    const updateData: any = {
      name,
      description,
      scope,
      brief_document_url,
      total_budget: total_budget ? Number.parseFloat(String(total_budget)) : null,
      start_date: start_date || null,
      end_date: end_date || null,
      account_id,
      owner_id,
      notes,
      updated_at: new Date().toISOString(),
    }

    // Only update status if it's valid
    if (validStatus !== undefined) {
      updateData.status = validStatus
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating project:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(project)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/projects/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting project:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/projects/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

