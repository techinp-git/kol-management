import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignForm } from "@/components/campaign-form"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch campaign data
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select(`
      *,
      campaign_kols (
        id,
        kol_id,
        kol_channel_id,
        allocated_budget,
        status,
        notes
      )
    `)
    .eq("id", id)
    .single()

  if (campaignError || !campaign) {
    console.error("[v0] Error fetching campaign:", campaignError)
    notFound()
  }

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      accounts:account_id (
        id,
        name
      )
    `)
    .in("status", ["planning", "active"])

  // Fetch KOLs
  const { data: kols } = await supabase
    .from("kols")
    .select(`
      id,
      name,
      handle,
      category,
      kol_channels (
        id,
        channel_type,
        handle,
        follower_count
      )
    `)
    .eq("status", "active")

  // Map campaign data for form
  const initialData = {
    id: campaign.id,
    project_id: campaign.project_id,
    name: campaign.name,
    objective: campaign.objective,
    kpi_targets: campaign.kpi_targets,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
    channels: campaign.channels || [],
    status: campaign.status,
    budget: campaign.budget ? parseFloat(campaign.budget).toString() : "",
    notes: campaign.notes,
    campaign_kols: campaign.campaign_kols || [],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขแคมเปญ</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูลแคมเปญ {campaign.name}</p>
      </div>

      <CampaignForm
        projects={projects || []}
        kols={kols || []}
        initialData={initialData}
      />
    </div>
  )
}
