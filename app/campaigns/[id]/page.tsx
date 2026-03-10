import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CampaignDetailClient } from "@/components/campaign-detail-client"

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // ชุด query เดียวกับหน้า list: campaign + projects
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
      )
    `)
    .eq("id", id)
    .single()

  if (error || !campaign) {
    console.error("[v0] Error fetching campaign:", error)
    notFound()
  }

  // ดึง campaign_kols แยก สำหรับตาราง "KOL ที่เลือก" (join kols/kol_channels เอง)
  const { data: campaignKolsRows } = await supabase
    .from("campaign_kols")
    .select("id, kol_id, kol_channel_id, allocated_budget, status, notes")
    .eq("campaign_id", id)

  const kolIds = [...new Set((campaignKolsRows || []).map((r: any) => r.kol_id).filter(Boolean))]
  const channelIds = [...new Set((campaignKolsRows || []).map((r: any) => r.kol_channel_id).filter(Boolean))]

  let kolsMap: Record<string, any> = {}
  let kolChannelsMap: Record<string, any> = {}
  if (kolIds.length > 0) {
    const { data: kolsData } = await supabase.from("kols").select("id, name, handle").in("id", kolIds)
    kolsData?.forEach((k: any) => { kolsMap[k.id] = k })
  }
  if (channelIds.length > 0) {
    const { data: channelsData } = await supabase.from("kol_channels").select("id, channel_type, handle, follower_count").in("id", channelIds)
    channelsData?.forEach((c: any) => { kolChannelsMap[c.id] = c })
  }

  const campaignKolsMapped = (campaignKolsRows || []).map((ck: any) => ({
    ...ck,
    kol: ck.kol_id ? kolsMap[ck.kol_id] ?? null : null,
    kol_channel: ck.kol_channel_id ? kolChannelsMap[ck.kol_channel_id] ?? null : null,
  }))

  // map campaign แบบเดียวกับ list (ใช้ campaign.projects เหมือน list)
  const project = campaign.projects
  const mappedCampaign = {
    id: campaign.id,
    name: campaign.name,
    project_id: campaign.project_id,
    project: project
      ? {
          id: project.id,
          name: project.name,
          account: project.accounts ? { id: project.accounts.id, name: project.accounts.name } : null,
        }
      : null,
    objective: campaign.objective ?? null,
    kpi_targets: campaign.kpi_targets ?? null,
    start_date: campaign.start_date ?? null,
    end_date: campaign.end_date ?? null,
    channels: Array.isArray(campaign.channels) ? campaign.channels : campaign.channels ? [campaign.channels] : [],
    status: campaign.status ?? "draft",
    budget: campaign.budget != null && campaign.budget !== "" ? parseFloat(String(campaign.budget)) : null,
    notes: campaign.notes ?? null,
    campaign_kols: campaignKolsMapped,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at,
  }

  // ชุด query posts เดียวกับ list (ใช้ผลเดียวกันทั้ง aggregate และรายการโพสต์)
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
        kol_id,
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

  const kolIdsFromPosts = new Set<string>()
  const channelTypesFromPosts = new Set<string>()
  let costFromPosts = 0
  ;(posts || []).forEach((p: any) => {
    const kolId = p.kol_channels?.kol_id
    if (kolId) kolIdsFromPosts.add(kolId)
    const ch = p.kol_channels?.channel_type
    if (ch) channelTypesFromPosts.add(ch)
    costFromPosts += parseFloat(p.kol_budget?.toString() || "0") + parseFloat(p.boost_budget?.toString() || "0")
  })

  const mappedCampaignWithStats = {
    ...mappedCampaign,
    kols_count: kolIdsFromPosts.size,
    channels_count: Math.max(channelTypesFromPosts.size, mappedCampaign.channels?.length ?? 0),
    total_allocated_from_posts: costFromPosts,
    channels_display: mappedCampaign.channels?.length ? mappedCampaign.channels : [...channelTypesFromPosts],
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

  return <CampaignDetailClient campaign={mappedCampaignWithStats} posts={mappedPosts} />
}
