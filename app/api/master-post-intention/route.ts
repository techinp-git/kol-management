import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get user to check permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin" || profile?.role === "analyst"
    const includeInactive = isAdmin && searchParams.get("includeInactive") === "true"

    let query = supabase
      .from("master_post_intention")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("group_intention", { ascending: true })
      .order("post_intention", { ascending: true })

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching master post intentions:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Group by group_intention
    const grouped = (data || []).reduce((acc, item) => {
      const group = item.group_intention
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(item)
      return acc
    }, {} as Record<string, typeof data>)

    return NextResponse.json({
      data: data || [],
      grouped,
    })
  } catch (error: any) {
    console.error("[v0] Unexpected error in GET /api/master-post-intention:", error)
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { group_intention, post_intention, description, sentiment, sort_order, is_active } = body

    if (!group_intention || !post_intention) {
      return NextResponse.json(
        { error: "group_intention and post_intention are required" },
        { status: 400 }
      )
    }

    // Validate sentiment if provided
    if (sentiment && !['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      return NextResponse.json(
        { error: "sentiment must be one of: Positive, Negative, Neutral" },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("master_post_intention")
      .insert({
        group_intention: group_intention.trim(),
        post_intention: post_intention.trim(),
        description: description?.trim() || null,
        sentiment: sentiment || null,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating master post intention:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Unexpected error in POST /api/master-post-intention:", error)
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 })
  }
}
