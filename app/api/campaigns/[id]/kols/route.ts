import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { kols } = body

    if (!kols || !Array.isArray(kols)) {
      return NextResponse.json({ error: "kols array is required" }, { status: 400 })
    }

    // Insert campaign KOLs
    const { data: campaignKols, error } = await supabase
      .from("campaign_kols")
      .insert(
        kols.map((kol: any) => ({
          campaign_id: id,
          kol_id: kol.kol_id,
          kol_channel_id: kol.kol_channel_id,
          allocated_budget: kol.allocated_budget || null,
          status: kol.status || "pending",
          notes: kol.notes || null,
        }))
      )
      .select()

    if (error) {
      console.error("[v0] Error creating campaign KOLs:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.error("[v0] RLS Error: User does not have permission to insert into campaign_kols")
        return NextResponse.json({ 
          error: "Permission denied. Please check Row Level Security policies for campaign_kols table.",
          details: error.message 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Campaign KOLs created successfully:", campaignKols)
    return NextResponse.json(campaignKols)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/campaigns/[id]/kols:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Delete all campaign KOLs for this campaign
    const { error } = await supabase
      .from("campaign_kols")
      .delete()
      .eq("campaign_id", id)

    if (error) {
      console.error("[v0] Error deleting campaign KOLs:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.error("[v0] RLS Error: User does not have permission to delete from campaign_kols")
        return NextResponse.json({ 
          error: "Permission denied. Please check Row Level Security policies for campaign_kols table.",
          details: error.message 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Campaign KOLs deleted successfully for campaign:", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/campaigns/[id]/kols:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

