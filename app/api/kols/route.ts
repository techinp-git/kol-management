import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, handle, category, country, contact_email, contact_phone, bio, notes, status, channels } = body

    // Insert KOL
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
        status: status || "draft",
      })
      .select()
      .single()

    if (kolError) {
      console.error("[v0] Error creating KOL:", kolError)
      return NextResponse.json({ error: kolError.message }, { status: 400 })
    }

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
