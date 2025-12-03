import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch campaign with related data
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        projects:project_id (
          id,
          name,
          accounts:account_id (
            id,
            name
          )
        ),
        campaign_kols (
          id,
          kol_id,
          kol_channel_id,
          target_metrics,
          allocated_budget,
          status,
          notes,
          kol:kol_id (
            id,
            name,
            handle
          ),
          kol_channel:kol_channel_id (
            id,
            channel_type,
            handle,
            follower_count
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching campaign:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Map campaign data
    const mappedCampaign = {
      id: campaign.id,
      name: campaign.name,
      project_id: campaign.project_id,
      project: campaign.projects ? {
        id: campaign.projects.id,
        name: campaign.projects.name,
        account: campaign.projects.accounts ? {
          id: campaign.projects.accounts.id,
          name: campaign.projects.accounts.name,
        } : null,
      } : null,
      objective: campaign.objective,
      kpi_targets: campaign.kpi_targets,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      channels: campaign.channels || [],
      status: campaign.status,
      budget: campaign.budget ? parseFloat(campaign.budget) : null,
      notes: campaign.notes,
      campaign_kols: campaign.campaign_kols || [],
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
    }

    return NextResponse.json(mappedCampaign)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/campaigns/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const {
      project_id,
      name,
      objective,
      kpi_targets,
      start_date,
      end_date,
      channels,
      status,
      budget,
      notes,
    } = body

    // Build update object
    const updateData: any = {}
    if (project_id !== undefined) updateData.project_id = project_id
    if (name !== undefined) updateData.name = name
    if (objective !== undefined) updateData.objective = objective
    if (kpi_targets !== undefined) updateData.kpi_targets = kpi_targets
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (channels !== undefined) updateData.channels = channels
    if (status !== undefined) {
      // Validate status
      const validStatuses = ['draft', 'review', 'approved', 'live', 'completed', 'cancelled']
      if (validStatuses.includes(status)) {
        updateData.status = status
      }
    }
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null
    if (notes !== undefined) updateData.notes = notes

    // Update campaign
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating campaign:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.error("[v0] RLS Error: User does not have permission to update campaigns")
        return NextResponse.json({ 
          error: "Permission denied. Please check Row Level Security policies for campaigns table.",
          details: error.message 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    console.log("[v0] Campaign updated successfully:", campaign.id)
    return NextResponse.json(campaign)
  } catch (error: any) {
    console.error("[v0] Error in PATCH /api/campaigns/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Delete campaign (cascade will delete campaign_kols)
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting campaign:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.error("[v0] RLS Error: User does not have permission to delete campaigns")
        return NextResponse.json({ 
          error: "Permission denied. Please check Row Level Security policies for campaigns table.",
          details: error.message 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Campaign deleted successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/campaigns/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

