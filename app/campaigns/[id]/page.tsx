import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignDetailClient } from "@/components/campaign-detail-client"

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (error || !campaign) {
    console.error("[v0] Error fetching campaign:", error)
    notFound()
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

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      post_name,
      caption,
      content_type,
      posted_at,
      url,
      status,
      boost_budget,
      kol_budget,
      kol_channels (
        id,
        channel_type,
        handle,
        kols (
          id,
          name
        )
      )
    `)
    .eq("campaign_id", id)
    .order("posted_at", { ascending: false })

  if (postsError) {
    console.error("[v0] Error fetching campaign posts:", postsError)
  }

  const mappedPosts =
    posts?.map((post: any) => ({
      id: post.id,
      post_name: post.post_name ?? "",
      caption: post.caption ?? "",
      content_type: post.content_type ?? "",
      posted_at: post.posted_at,
      url: post.url ?? "",
      status: post.status ?? "published",
      boost_budget: post.boost_budget ? Number(post.boost_budget) : null,
      kol_budget: post.kol_budget ? Number(post.kol_budget) : null,
      platform: post.kol_channels?.channel_type ?? null,
      kol_channel: post.kol_channels
        ? {
            id: post.kol_channels.id,
            handle: post.kol_channels.handle,
          }
        : null,
      kol: post.kol_channels?.kols
        ? {
            id: post.kol_channels.kols.id,
            name: post.kol_channels.kols.name,
          }
        : null,
    })) ?? []

  return <CampaignDetailClient campaign={mappedCampaign} posts={mappedPosts} />
}
