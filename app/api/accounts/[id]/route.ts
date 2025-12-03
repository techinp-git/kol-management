import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Try to fetch with social channels, fallback to without them if table doesn't exist
    let { data: account, error } = await supabase
      .from("accounts")
      .select(`
        *,
        account_channels (
          id,
          channel_type,
          handle,
          profile_url,
          follower_count,
          verified,
          status,
          follower_history
        )
      `)
      .eq("id", id)
      .single()

    // If error is due to missing table or column, try again without social channels
    if (error && (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("account_channels"))) {
      console.warn("[v0] account_channels table not found, fetching without social channels:", error.message)
      const result = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single()
      
      account = result.data
      error = result.error
      
      // Set account_channels to empty array if table doesn't exist
      if (account) {
        account.account_channels = []
      }
    }

    if (error) {
      console.error("[v0] Error fetching account:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/accounts/[id]:", error)
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
      company_name,
      logo_url,
      tax_id,
      billing_address,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      currency,
      credit_terms,
      msa_document_url,
      status,
      notes,
      social_channels,
    } = body

    // Validate status
    const validStatuses = ["active", "inactive", "suspended"]
    const validStatus = status && validStatuses.includes(status) ? status : undefined

    const updateData: any = {
      name,
      company_name,
      logo_url,
      tax_id,
      billing_address,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      currency,
      credit_terms,
      msa_document_url,
      notes,
      updated_at: new Date().toISOString(),
    }

    // Only update status if it's valid
    if (validStatus !== undefined) {
      updateData.status = validStatus
    }

    const { data: account, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating account:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update social channels if provided
    if (social_channels !== undefined) {
      console.log("[v0] Updating social channels for account:", id)
      console.log("[v0] Channels data:", JSON.stringify(social_channels, null, 2))

      // Check if account_channels table exists by trying to select
      let { error: tableCheckError } = await supabase
        .from("account_channels")
        .select("id")
        .eq("account_id", id)
        .limit(1)

      if (tableCheckError && (tableCheckError.code === "42P01" || tableCheckError.message?.includes("does not exist"))) {
        console.warn("[v0] account_channels table not found, skipping social channels update")
        console.warn("[v0] Please run SQL script: scripts/009_create_account_channels.sql")
      } else {
        // Delete all existing channels for this account
        const { error: deleteError } = await supabase.from("account_channels").delete().eq("account_id", id)
        
        if (deleteError) {
          console.error("[v0] Error deleting existing channels:", deleteError)
        }

        // Insert new channels
        if (social_channels && social_channels.length > 0) {
          // Filter out temp channels and empty handles
          const channelsToInsert = social_channels
            .filter((ch: any) => !ch._tempId && ch.handle && ch.handle.trim() !== "") // Filter out temp channels and empty handles
            .map((channel: any) => ({
              account_id: id,
              channel_type: channel.channel_type || "Instagram",
              handle: channel.handle.trim(),
              profile_url: channel.profile_url?.trim() || null,
              follower_count: Number.parseInt(String(channel.follower_count || 0)) || 0,
              verified: Boolean(channel.verified) || false,
              status: channel.status || "active",
            }))

          if (channelsToInsert.length > 0) {
            console.log("[v0] Inserting channels:", channelsToInsert.length)
            const { error: channelsError } = await supabase.from("account_channels").insert(channelsToInsert)

            if (channelsError) {
              console.error("[v0] Error inserting social channels:", channelsError)
              console.error("[v0] Error code:", channelsError.code)
              console.error("[v0] Error details:", channelsError.details)
              console.error("[v0] Error message:", channelsError.message)
              console.error("[v0] Error hint:", channelsError.hint)
              
              // If RLS error, provide helpful message
              if (channelsError.code === "42501" || channelsError.message?.includes("row-level security")) {
                console.error("[v0] RLS policy error - please run: scripts/fix-account-channels-rls.sql")
              }
              
              // Return error to frontend so user knows
              return NextResponse.json(
                {
                  error: "Account updated but failed to save social channels",
                  details: channelsError.message,
                  channelError: channelsError,
                },
                { status: 500 }
              )
            } else {
              console.log("[v0] Social channels updated successfully")
            }
          } else {
            console.log("[v0] No channels to insert (all were temp channels)")
          }
        } else {
          console.log("[v0] No social channels provided, all channels deleted")
        }
      }
    }

    return NextResponse.json(account)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/accounts/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("accounts").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting account:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/accounts/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

