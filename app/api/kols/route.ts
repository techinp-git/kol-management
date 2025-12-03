import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25))
    const offset = (page - 1) * limit
    
    // Search and filter parameters
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const category = searchParams.get("category") || ""
    const country = searchParams.get("country") || ""
    const tier = searchParams.get("tier") || ""
    
    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"
    
    console.log("[v0] KOL API GET - page:", page, "limit:", limit, "offset:", offset)
    console.log("[v0] KOL API GET - search:", search, "status:", status, "category:", category)

    // Get total count for pagination
    let countQuery = supabase
      .from("kols")
      .select("*", { count: "exact", head: true })

    // Apply filters to count query
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,handle.ilike.%${search}%,bio.ilike.%${search}%`)
    }
    if (status) {
      countQuery = countQuery.eq("status", status)
    }
    if (category) {
      countQuery = countQuery.contains("category", [category])
    }
    if (country) {
      countQuery = countQuery.eq("country", country)
    }
    if (tier) {
      countQuery = countQuery.eq("kol_tier", tier)
    }

    const { count: totalCount } = await countQuery

    // Try to fetch with follower_history first, fallback to without it if column doesn't exist
    let dataQuery = supabase
      .from("kols")
      .select(`
        *,
        kol_channels (
          id,
          channel_type,
          handle,
          follower_count,
          engagement_rate,
          follower_history
        )
      `)

    // Apply filters to data query
    if (search) {
      dataQuery = dataQuery.or(`name.ilike.%${search}%,handle.ilike.%${search}%,bio.ilike.%${search}%`)
    }
    if (status) {
      dataQuery = dataQuery.eq("status", status)
    }
    if (category) {
      dataQuery = dataQuery.contains("category", [category])
    }
    if (country) {
      dataQuery = dataQuery.eq("country", country)
    }
    if (tier) {
      dataQuery = dataQuery.eq("kol_tier", tier)
    }

    // Apply sorting and pagination
    dataQuery = dataQuery
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1)

    let { data: kols, error } = await dataQuery

    // If error is due to missing column, try again without follower_history
    if (error && (error.code === "42703" || error.message?.includes("column") || error.message?.includes("follower_history"))) {
      console.warn("[v0] follower_history column not found, fetching without it:", error.message)
      
      dataQuery = supabase
        .from("kols")
        .select(`
          *,
          kol_channels (
            id,
            channel_type,
            handle,
            follower_count,
            engagement_rate
          )
        `)

      // Reapply filters
      if (search) {
        dataQuery = dataQuery.or(`name.ilike.%${search}%,handle.ilike.%${search}%,bio.ilike.%${search}%`)
      }
      if (status) {
        dataQuery = dataQuery.eq("status", status)
      }
      if (category) {
        dataQuery = dataQuery.contains("category", [category])
      }
      if (country) {
        dataQuery = dataQuery.eq("country", country)
      }
      if (tier) {
        dataQuery = dataQuery.eq("kol_tier", tier)
      }

      dataQuery = dataQuery
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1)

      const result = await dataQuery
      kols = result.data
      error = result.error
      
      // Set follower_history to empty array for all channels if column doesn't exist
      if (kols) {
        kols = kols.map((kol: any) => ({
          ...kol,
          kol_channels: kol.kol_channels?.map((channel: any) => ({
            ...channel,
            follower_history: [],
          })) || [],
        }))
      }
    }

    if (error) {
      console.error("[v0] Error fetching KOLs:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      data: kols || [],
      pagination: {
        page,
        limit,
        totalCount: totalCount || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        status,
        category,
        country,
        tier,
        sortBy,
        sortOrder,
      }
    })
  } catch (error: any) {
    console.error("[v0] Error in GET /api/kols:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, handle, category, country, contact_email, contact_phone, bio, notes, kol_tier, status, channels } = body

    // Insert KOL
    // Validate status - allow: 'active', 'inactive', 'blacklisted', 'draft', 'ban'
    const validStatuses = ['active', 'inactive', 'blacklisted', 'draft', 'ban']
    const validStatus = status && validStatuses.includes(status) 
      ? status 
      : 'active'
    
    // First, try to insert and get the result back
    const { data: kol, error: kolError } = await supabase
      .from("kols")
      .insert({
        name,
        handle,
        category,
        country,
        contact_email,
        contact_phone,
        bio,
        notes,
        kol_tier: kol_tier ? String(kol_tier).trim() || null : null,
        status: validStatus,
      })
      .select()
      .single()

    if (kolError) {
      console.error("[v0] Error creating KOL:", kolError)
      console.error("[v0] Error code:", kolError.code)
      console.error("[v0] Error details:", kolError.details)
      console.error("[v0] Error hint:", kolError.hint)
      return NextResponse.json({ error: kolError.message }, { status: 400 })
    }

    // Check if KOL was created and has ID
    if (!kol || !kol.id) {
      console.error("[v0] KOL created but no ID returned")
      console.error("[v0] Returned data:", JSON.stringify(kol, null, 2))
      console.error("[v0] This is likely an RLS (Row Level Security) issue")
      console.error("[v0] The KOL was inserted but cannot be read back due to permissions")
      return NextResponse.json({ 
        error: "KOL created but unable to retrieve ID. This is likely an RLS (Row Level Security) issue. Please check database permissions." 
      }, { status: 500 })
    }

    console.log("[v0] KOL created successfully with ID:", kol.id)

    // Insert channels if provided
    if (channels && channels.length > 0) {
      console.log("[v0] Inserting channels:", channels.length, "channels")
      
      const channelsToInsert = channels.map((channel: any) => ({
        kol_id: kol.id,
        channel_type: channel.channel_type,
        handle: channel.handle,
        profile_url: channel.profile_url,
        follower_count: channel.follower_count || 0,
        status: channel.status || "active",
        follower_history: channel.history && Array.isArray(channel.history) && channel.history.length > 0
          ? channel.history.map((h: any) => ({
              date: h.date,
              follower_count: h.follower_count || 0,
            }))
          : [],
      }))

      console.log("[v0] Channels to insert:", JSON.stringify(channelsToInsert, null, 2))

      let { error: channelsError } = await supabase.from("kol_channels").insert(channelsToInsert)

      // If error is due to missing follower_history column, try again without it
      if (channelsError && (channelsError.code === "42703" || channelsError.message?.includes("follower_history"))) {
        console.warn("[v0] follower_history column not found, inserting without it:", channelsError.message)
        const channelsWithoutHistory = channelsToInsert.map((ch: any) => {
          const { follower_history, ...rest } = ch
          return rest
        })
        const result = await supabase.from("kol_channels").insert(channelsWithoutHistory)
        channelsError = result.error
      }

      if (channelsError) {
        console.error("[v0] Error creating channels:", channelsError)
        console.error("[v0] Error code:", channelsError.code)
        console.error("[v0] Error details:", channelsError.details)
        console.error("[v0] Error hint:", channelsError.hint)
        console.error("[v0] Error message:", channelsError.message)
        // Return error to show to user
        return NextResponse.json({ 
          error: `Failed to create channels: ${channelsError.message}`,
          kol_id: kol.id 
        }, { status: 400 })
      }
      
      console.log("[v0] Channels created successfully")
    } else {
      console.log("[v0] No channels to insert")
    }

    return NextResponse.json(kol)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/kols:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
