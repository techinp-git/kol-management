import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project_id")

    // Build query
    let query = supabase
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
          kol:kol_id (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: false })

    // Filter by project if provided
    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error("[v0] Error fetching campaigns:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map campaigns with counts
    const mappedCampaigns = (campaigns || []).map((campaign: any) => {
      const kolCount = campaign.campaign_kols?.length || 0
      
      return {
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
        kol_count: kolCount,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
      }
    })

    return NextResponse.json(mappedCampaigns)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/campaigns:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!project_id || !name) {
      return NextResponse.json(
        { error: "project_id and name are required" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['draft', 'review', 'approved', 'live', 'completed', 'cancelled']
    const validStatus = status && validStatuses.includes(status) ? status : 'draft'

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    const createdBy = user?.id || null

    // Insert campaign
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        project_id,
        name,
        objective,
        kpi_targets,
        start_date,
        end_date,
        channels: channels || [],
        status: validStatus,
        budget: budget ? parseFloat(budget) : null,
        notes,
        created_by: createdBy,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating campaign:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error details:", error.details)
      console.error("[v0] Error hint:", error.hint)
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.error("[v0] RLS Error: User does not have permission to insert into campaigns")
        return NextResponse.json({ 
          error: "Permission denied. Please check Row Level Security policies for campaigns table.",
          details: error.message 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if campaign was created
    if (!campaign || !campaign.id) {
      console.error("[v0] Campaign created but no ID returned")
      return NextResponse.json({ 
        error: "Campaign created but unable to retrieve ID. This is likely an RLS issue." 
      }, { status: 500 })
    }

    console.log("[v0] Campaign created successfully with ID:", campaign.id)
    return NextResponse.json(campaign)
  } catch (error: any) {
    console.error("[v0] Error in POST /api/campaigns:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

