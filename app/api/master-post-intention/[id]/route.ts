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

    // Use admin client to query profiles to bypass RLS
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (adminError: any) {
      console.error("[master-post-intention] Failed to create admin client:", adminError)
      return NextResponse.json({ 
        error: "Server configuration error",
        details: adminError.message 
      }, { status: 500 })
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, role, email, full_name")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[master-post-intention] Error fetching profile:", {
        error: profileError,
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        userId: user.id,
        userEmail: user.email,
      })
      return NextResponse.json({ 
        error: "Failed to verify user role",
        details: profileError.message || "Profile not found or access denied"
      }, { status: 500 })
    }

    console.log("[master-post-intention] PATCH - User role check:", {
      userId: user.id,
      userEmail: user.email,
      profileId: profile?.id,
      profileEmail: profile?.email,
      profileName: profile?.full_name,
      role: profile?.role,
      isAdmin: profile?.role === "admin",
      isAnalyst: profile?.role === "analyst",
      allowed: profile?.role === "admin" || profile?.role === "analyst",
    })

    if (!profile) {
      console.error("[master-post-intention] Profile not found for user:", user.id)
      return NextResponse.json({ 
        error: "Profile not found",
        details: "Your user profile could not be found. Please contact administrator."
      }, { status: 404 })
    }

    if (profile.role !== "admin" && profile.role !== "analyst") {
      console.warn("[master-post-intention] Access denied - insufficient role:", {
        userId: user.id,
        userEmail: user.email,
        currentRole: profile.role,
        requiredRoles: ["admin", "analyst"],
      })
      return NextResponse.json({ 
        error: "Forbidden: Admin or Analyst access required",
        details: `Current role: "${profile.role || "null"}". Required roles: admin or analyst. Please contact administrator to update your role.`
      }, { status: 403 })
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

    // adminClient is already created above
    console.log("[master-post-intention] PATCH - Update data:", {
      id,
      updateData,
      updateDataKeys: Object.keys(updateData)
    })

    const { data, error } = await adminClient
      .from("master_post_intention")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[master-post-intention] Error updating master post intention:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        id,
        updateData
      })
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details 
      }, { status: 400 })
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

    // Use admin client to query profiles to bypass RLS
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (adminError: any) {
      console.error("[master-post-intention] Failed to create admin client:", adminError)
      return NextResponse.json({ 
        error: "Server configuration error",
        details: adminError.message 
      }, { status: 500 })
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[master-post-intention] Error fetching profile:", profileError)
      return NextResponse.json({ 
        error: "Failed to verify user role",
        details: profileError.message 
      }, { status: 500 })
    }

    if (profile?.role !== "admin" && profile?.role !== "analyst") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { id } = await params

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
