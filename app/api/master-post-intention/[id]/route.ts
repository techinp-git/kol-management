import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { group_intention, post_intention, description, sentiment, sort_order, is_active } = body

    // Validate sentiment if provided
    if (sentiment !== undefined && sentiment !== null && !['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      return NextResponse.json(
        { error: "sentiment must be one of: Positive, Negative, Neutral" },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {}
    if (group_intention !== undefined) updateData.group_intention = group_intention.trim()
    if (post_intention !== undefined) updateData.post_intention = post_intention.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (sentiment !== undefined) updateData.sentiment = sentiment || null
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("master_post_intention")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating master post intention:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "Master post intention not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Unexpected error in PATCH /api/master-post-intention/[id]:", error)
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("master_post_intention")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting master post intention:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Master post intention deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Unexpected error in DELETE /api/master-post-intention/[id]:", error)
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 })
  }
}
