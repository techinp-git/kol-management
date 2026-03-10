import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CampaignsListClient } from "@/components/campaigns-list-client"

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data: campaigns, error } = await supabase
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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching campaigns:", error)
  }

  const campaignIds = (campaigns || []).map((c: any) => c.id)
  type CampaignStats = {
    posts_count: number
    comments_count: number
    kol_ids: Set<string>
    impression: number
    reach: number
    engage: number
    cost: number
    sentiment: { positive: number; neutral: number; negative: number }
  }
  const statsByCampaign: Record<string, CampaignStats> = {}
  campaignIds.forEach((id: string) => {
    statsByCampaign[id] = {
      posts_count: 0,
      comments_count: 0,
      kol_ids: new Set(),
      impression: 0,
      reach: 0,
      engage: 0,
      cost: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    }
  })

  // ดึงข้อมูลแบบ join ครบ: posts ⋈ kol_channels ⋈ kols ⋈ campaigns ⋈ projects ⋈ accounts ⋈ comments
  // (เทียบเท่า query ที่ user ให้มา – ใช้ nested select ของ Supabase)
  if (campaignIds.length > 0) {
    const { data: masterIntentions } = await supabase
      .from("master_post_intention")
      .select("post_intention, sentiment")
      .eq("is_active", true)
    const intentionToSentiment: Record<string, string> = {}
    ;(masterIntentions || []).forEach((row: any) => {
      if (row.post_intention && intentionToSentiment[row.post_intention] === undefined) {
        intentionToSentiment[row.post_intention] = row.sentiment || "Neutral"
      }
    })

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        campaign_id,
        kol_channel_id,
        kol_budget,
        boost_budget,
        campaigns (
          id,
          project_id,
          projects (
            account_id,
            accounts (
              id,
              name
            )
          )
        ),
        kol_channels (
          kol_id,
          kols (
            id,
            name
          )
        ),
        comments (
          id,
          post_intention
        ),
        post_metrics (
          impressions_organic,
          impressions_boost,
          reach_organic,
          reach_boost,
          likes,
          comments,
          shares,
          saves,
          post_clicks,
          link_clicks,
          retweets,
          captured_at
        )
      `)
      .in("campaign_id", campaignIds)

    if (postsError) {
      console.error("[v0] Campaigns page posts query:", postsError)
    }

    ;(posts || []).forEach((p: any) => {
      const cid = p.campaign_id
      if (!cid || !statsByCampaign[cid]) return
      const s = statsByCampaign[cid]
      s.posts_count += 1
      const kolId = p.kol_channels?.kol_id
      if (kolId) s.kol_ids.add(kolId)
      const kol = parseFloat(p.kol_budget?.toString() || "0") || 0
      const boost = parseFloat(p.boost_budget?.toString() || "0") || 0
      s.cost += kol + boost
      const metrics = p.post_metrics || []
      const latest = [...metrics].sort(
        (a: any, b: any) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()
      )[0]
      if (latest) {
        s.impression += (latest.impressions_organic || 0) + (latest.impressions_boost || 0)
        s.reach += (latest.reach_organic || 0) + (latest.reach_boost || 0)
        s.engage +=
          (latest.likes || 0) +
          (latest.comments || 0) +
          (latest.shares || 0) +
          (latest.saves || 0) +
          (latest.post_clicks || 0) +
          (latest.link_clicks || 0) +
          (latest.retweets || 0)
      }
      // Comments มากับ post จาก join แล้ว (นับจำนวน + sentiment)
      const comments = p.comments || []
      s.comments_count += comments.length
      comments.forEach((c: any) => {
        const sent = c.post_intention ? (intentionToSentiment[c.post_intention] || "Neutral") : "Neutral"
        if (sent === "Positive") s.sentiment.positive += 1
        else if (sent === "Negative") s.sentiment.negative += 1
        else s.sentiment.neutral += 1
      })
    })
  }

  const mappedCampaigns = (campaigns || []).map((campaign: any) => {
    const s = statsByCampaign[campaign.id]
    const sent = s?.sentiment
    const sentimentLabel =
      sent && sent.positive + sent.neutral + sent.negative > 0
        ? [sent.positive ? `⊕${sent.positive}` : null, sent.negative ? `⊖${sent.negative}` : null, sent.neutral ? `○${sent.neutral}` : null]
            .filter(Boolean)
            .join(" ")
        : null
    return {
      id: campaign.id,
      name: campaign.name,
      project_id: campaign.project_id,
      project: campaign.projects
        ? {
            id: campaign.projects.id,
            name: campaign.projects.name,
            account: campaign.projects.accounts
              ? { id: campaign.projects.accounts.id, name: campaign.projects.accounts.name }
              : null,
          }
        : null,
      objective: campaign.objective,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      budget: campaign.budget ? parseFloat(campaign.budget) : null,
      status: campaign.status,
      post_count: s?.posts_count ?? 0,
      comments_count: s?.comments_count ?? 0,
      kols_count: s ? s.kol_ids.size : 0,
      impression: s?.impression ?? 0,
      reach: s?.reach ?? 0,
      engage: s?.engage ?? 0,
      cost: s?.cost ?? 0,
      sentiment: sentimentLabel,
      created_at: campaign.created_at,
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แคมเปญ</h1>
          <p className="text-muted-foreground mt-1">จัดการแคมเปญและ KOL</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มแคมเปญ
          </Button>
        </Link>
      </div>

      <CampaignsListClient initialCampaigns={mappedCampaigns} />
    </div>
  )
}
