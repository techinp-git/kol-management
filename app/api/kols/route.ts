import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, handle, category, country, contact_email, contact_phone, bio, notes, status, channels } = body

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
      const channelsToInsert = channels.map((channel: any) => ({
        kol_id: kol.id,
        channel_type: channel.channel_type,
        handle: channel.handle,
        profile_url: channel.profile_url,
        follower_count: channel.follower_count || 0,
        status: channel.status || "active",
      }))

      const { error: channelsError } = await supabase.from("kol_channels").insert(channelsToInsert)

      if (channelsError) {
        console.error("[v0] Error creating channels:", channelsError)
        // Don't fail the whole operation, just log the error
      }
    }

    return NextResponse.json(kol)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/kols:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
