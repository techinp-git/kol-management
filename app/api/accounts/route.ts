import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Try to fetch with social channels, fallback to without them if table doesn't exist
    let { data: accounts, error } = await supabase
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
          status
        )
      `)
      .order("created_at", { ascending: false })

    // If error is due to missing table, try again without social channels
    if (error && (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("account_channels"))) {
      console.warn("[v0] account_channels table not found, fetching without social channels:", error.message)
      const result = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false })
      
      accounts = result.data
      error = result.error
      
      // Set account_channels to empty array for all accounts if table doesn't exist
      if (accounts) {
        accounts = accounts.map((account: any) => ({
          ...account,
          account_channels: [],
        }))
      }
    }

    if (error) {
      console.error("[v0] Error fetching accounts:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(accounts || [])
  } catch (error: any) {
    console.error("[v0] Error in GET /api/accounts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
    const validStatus = status && validStatuses.includes(status) ? status : "active"

    const { data: account, error } = await supabase
      .from("accounts")
      .insert({
        name,
        company_name,
        logo_url,
        tax_id,
        billing_address,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
        currency: currency || "THB",
        credit_terms: credit_terms || 30,
        msa_document_url,
        status: validStatus,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating account:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      console.error("[v0] Error hint:", error.hint)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!account || !account.id) {
      console.error("[v0] Account created but no ID returned")
      return NextResponse.json(
        {
          error: "Account created but unable to retrieve ID. This is likely an RLS (Row Level Security) issue.",
        },
        { status: 500 }
      )
    }

    console.log("[v0] Account created successfully with ID:", account.id)

    // Insert social channels if provided
    if (social_channels && social_channels.length > 0) {
      console.log("[v0] Inserting social channels:", social_channels.length, "channels")
      
      // Filter out empty handles and validate data
      const channelsToInsert = social_channels
        .filter((ch: any) => ch.handle && ch.handle.trim() !== "") // Filter out empty handles
        .map((channel: any) => ({
          account_id: account.id,
          channel_type: channel.channel_type || "Instagram",
          handle: channel.handle.trim(),
          profile_url: channel.profile_url?.trim() || null,
          follower_count: Number.parseInt(String(channel.follower_count || 0)) || 0,
          verified: Boolean(channel.verified) || false,
          status: "active",
        }))

      console.log("[v0] Channels to insert:", JSON.stringify(channelsToInsert, null, 2))

      let { error: channelsError } = await supabase.from("account_channels").insert(channelsToInsert)

      // If error is due to missing table, log warning but don't fail
      if (channelsError && (channelsError.code === "42P01" || channelsError.message?.includes("does not exist"))) {
        console.warn("[v0] account_channels table not found, skipping social channels:", channelsError.message)
        console.warn("[v0] Please run SQL script: scripts/009_create_account_channels.sql")
      } else if (channelsError) {
        console.error("[v0] Error creating social channels:", channelsError)
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
            error: "Account created but failed to save social channels",
            details: channelsError.message,
            channelError: channelsError,
          },
          { status: 500 }
        )
      } else {
        console.log("[v0] Social channels created successfully")
      }
    } else {
      console.log("[v0] No social channels to insert")
    }

    return NextResponse.json(account)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/accounts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

