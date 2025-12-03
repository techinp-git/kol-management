import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Try to fetch with follower_history first, fallback to without it if column doesn't exist
    let { data: kol, error } = await supabase
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
          status,
          follower_history
        )
      `,
      )
      .eq("id", id)
      .single()

    // If error is due to missing column, try again without follower_history
    if (error && (error.code === "42703" || error.message?.includes("column") || error.message?.includes("follower_history"))) {
      console.warn("[v0] follower_history column not found, fetching without it:", error.message)
      const result = await supabase
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
      
      kol = result.data
      error = result.error
      
      // Set follower_history to empty array for all channels if column doesn't exist
      if (kol && kol.kol_channels) {
        kol.kol_channels = kol.kol_channels.map((channel: any) => ({
          ...channel,
          follower_history: [],
        }))
      }
    }

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

    const { name, handle, category, country, contact_email, contact_phone, bio, notes, kol_tier, status, channels } = body

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
      kol_tier: kol_tier !== undefined ? (kol_tier ? String(kol_tier).trim() : null) : undefined,
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
      console.log("[v0] Updating channels for KOL:", id)
      console.log("[v0] Channels data:", JSON.stringify(channels, null, 2))
      
      // Delete existing channels that are not in the new list
      const existingChannelIds = channels.filter((c: any) => c.id && !c._tempId).map((c: any) => c.id)

      if (existingChannelIds.length > 0) {
        console.log("[v0] Keeping existing channels:", existingChannelIds)
        await supabase
          .from("kol_channels")
          .delete()
          .eq("kol_id", id)
          .not("id", "in", `(${existingChannelIds.join(",")})`)
      } else {
        console.log("[v0] Deleting all existing channels")
        await supabase.from("kol_channels").delete().eq("kol_id", id)
      }

      // Update or insert channels
      for (const channel of channels) {
        // Skip if it has _tempId and no real id (it's a new channel)
        const historyData = channel.history && Array.isArray(channel.history) && channel.history.length > 0
          ? channel.history.map((h: any) => ({
              date: h.date,
              follower_count: h.follower_count || 0,
            }))
          : []

        const channelData: any = {
          channel_type: channel.channel_type,
          handle: channel.handle,
          profile_url: channel.profile_url,
          follower_count: channel.follower_count || 0,
          status: channel.status || "active",
        }

        // Try to include follower_history, fallback if column doesn't exist
        let error: any = null
        
        if (channel.id && !channel._tempId) {
          // Update existing channel
          console.log("[v0] Updating channel:", channel.id)
          channelData.follower_history = historyData
          let result = await supabase
            .from("kol_channels")
            .update(channelData)
            .eq("id", channel.id)
          
          error = result.error
          
          // If error due to missing column, try without follower_history
          if (error && (error.code === "42703" || error.message?.includes("follower_history"))) {
            console.warn("[v0] follower_history column not found, updating without it")
            const { follower_history, ...dataWithoutHistory } = channelData
            result = await supabase
              .from("kol_channels")
              .update(dataWithoutHistory)
              .eq("id", channel.id)
            error = result.error
          }
        } else {
          // Insert new channel
          console.log("[v0] Inserting new channel")
          channelData.kol_id = id
          channelData.follower_history = historyData
          
          let result = await supabase.from("kol_channels").insert(channelData)
          error = result.error
          
          // If error due to missing column, try without follower_history
          if (error && (error.code === "42703" || error.message?.includes("follower_history"))) {
            console.warn("[v0] follower_history column not found, inserting without it")
            const { follower_history, ...dataWithoutHistory } = channelData
            result = await supabase.from("kol_channels").insert(dataWithoutHistory)
            error = result.error
          }
        }
        
        if (error) {
          console.error("[v0] Error saving channel:", error)
          console.error("[v0] Error code:", error.code)
          console.error("[v0] Error details:", error.details)
          console.error("[v0] Error message:", error.message)
          return NextResponse.json({ 
            error: `Failed to save channel: ${error.message}` 
          }, { status: 400 })
        }
      }
      
      console.log("[v0] All channels saved successfully")
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
