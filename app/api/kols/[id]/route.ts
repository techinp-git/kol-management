import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: kol, error } = await supabase
      .from("kols")
      .select(
        `
        *,
        kol_channels (
          id,
          channel_type,
          handle,
          external_id,
          profile_url,
          follower_count,
          avg_likes,
          avg_comments,
          engagement_rate,
          verified,
          status
        )
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching KOL:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(kol)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/kols/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { name, handle, category, country, contact_email, contact_phone, bio, notes, status, channels } = body

    // Validate status - allow: 'active', 'inactive', 'blacklisted', 'draft', 'ban'
    const validStatuses = ['active', 'inactive', 'blacklisted', 'draft', 'ban']
    const validStatus = status && validStatuses.includes(status) 
      ? status 
      : undefined // Don't update status if invalid

    // Update KOL
    const updateData: any = {
      name,
      handle,
      category,
      country,
      contact_email,
      contact_phone,
      bio,
      notes,
      updated_at: new Date().toISOString(),
    }

    // Only update status if it's valid
    if (validStatus !== undefined) {
      updateData.status = validStatus
    }

    const { data: kol, error: kolError } = await supabase
      .from("kols")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (kolError) {
      console.error("[v0] Error updating KOL:", kolError)
      return NextResponse.json({ error: kolError.message }, { status: 400 })
    }

    // Update channels if provided
    if (channels) {
      // Delete existing channels that are not in the new list
      const existingChannelIds = channels.filter((c: any) => c.id).map((c: any) => c.id)

      if (existingChannelIds.length > 0) {
        await supabase
          .from("kol_channels")
          .delete()
          .eq("kol_id", id)
          .not("id", "in", `(${existingChannelIds.join(",")})`)
      } else {
        // Delete all existing channels if no IDs provided
        await supabase.from("kol_channels").delete().eq("kol_id", id)
      }

      // Update or insert channels
      for (const channel of channels) {
        if (channel.id) {
          // Update existing channel
          await supabase
            .from("kol_channels")
            .update({
              channel_type: channel.channel_type,
              handle: channel.handle,
              profile_url: channel.profile_url,
              follower_count: channel.follower_count || 0,
              status: channel.status || "active",
            })
            .eq("id", channel.id)
        } else {
          // Insert new channel
          await supabase.from("kol_channels").insert({
            kol_id: id,
            channel_type: channel.channel_type,
            handle: channel.handle,
            profile_url: channel.profile_url,
            follower_count: channel.follower_count || 0,
            status: channel.status || "active",
          })
        }
      }
    }

    return NextResponse.json(kol)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/kols/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Delete KOL channels first (foreign key constraint)
    await supabase.from("kol_channels").delete().eq("kol_id", id)

    // Delete KOL
    const { error } = await supabase.from("kols").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting KOL:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/kols/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
