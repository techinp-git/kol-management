import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { KOLsListClient } from "@/components/kols-list-client"
import { Suspense } from "react"

type KOLsPageProps = {
  searchParams?: Promise<{
    page?: string
  }>
}

export default async function KOLsPage({ searchParams }: KOLsPageProps) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const rawPage = Number(resolvedSearchParams?.page ?? 1)
  const currentPage = Math.max(1, rawPage)
  const itemsPerPage = 25

  console.log("[v0] KOLs page - currentPage:", currentPage)

  // Fetch ALL KOLs for client-side search and pagination
  // Try to fetch with follower_history first, fallback to without it if column doesn't exist
  let { data: allKols, error } = await supabase
    .from("kols")
    .select(`
      *,
      kol_channels (
        id,
        channel_type,
        handle,
        follower_count,
        engagement_rate,
        follower_history
      )
    `)
    .order("created_at", { ascending: false })

  // If error is due to missing column, try again without follower_history
  if (error && (error.code === "42703" || error.message?.includes("column") || error.message?.includes("follower_history"))) {
    console.warn("[v0] follower_history column not found, fetching without it:", error.message)
    const result = await supabase
      .from("kols")
      .select(`
        *,
        kol_channels (
          id,
          channel_type,
          handle,
          follower_count,
          engagement_rate
        )
      `)
      .order("created_at", { ascending: false })
    
    allKols = result.data
    error = result.error
    
    // Set follower_history to empty array for all channels if column doesn't exist
    if (allKols) {
      allKols = allKols.map((kol: any) => ({
        ...kol,
        kol_channels: kol.kol_channels?.map((channel: any) => ({
          ...channel,
          follower_history: [],
        })) || [],
      }))
    }
  }

  if (error) {
    console.error("[v0] Error fetching KOLs:", error)
  }

  // Fetch campaigns for filter
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("name", { ascending: true })

  // Build campaign_id -> kol_id[] จาก posts (เทียบเท่า query: posts ⋈ kol_channels ⋈ kols)
  // เลือก campaign แล้วจะแสดงเฉพาะ KOL ที่มีโพสต์ใน campaign นั้นจริง
  const { data: postsForCampaign } = await supabase
    .from("posts")
    .select("campaign_id, kol_channels(kol_id)")
  const campaignKolIds: Record<string, string[]> = {}
  postsForCampaign?.forEach((row: any) => {
    const cid = row.campaign_id
    const kolId = row.kol_channels?.kol_id
    if (cid && kolId) {
      if (!campaignKolIds[cid]) campaignKolIds[cid] = []
      if (!campaignKolIds[cid].includes(kolId)) campaignKolIds[cid].push(kolId)
    }
  })

  // Build kol_id -> { postCount, totalPaid } from posts
  const { data: postsForStats } = await supabase
    .from("posts")
    .select("kol_channel_id, kol_budget, boost_budget, kol_channels(kol_id)")
  const kolStats: Record<string, { postCount: number; totalPaid: number }> = {}
  postsForStats?.forEach((row: any) => {
    const kolId = row.kol_channels?.kol_id
    if (!kolId) return
    if (!kolStats[kolId]) kolStats[kolId] = { postCount: 0, totalPaid: 0 }
    kolStats[kolId].postCount += 1
    const kolBudget = parseFloat(row.kol_budget?.toString() || "0") || 0
    const boostBudget = parseFloat(row.boost_budget?.toString() || "0") || 0
    kolStats[kolId].totalPaid += kolBudget + boostBudget
  })

  const totalCount = allKols?.length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KOL</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูล KOL และช่องทางโซเชียลมีเดีย</p>
        </div>
        <Link href="/kols/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่ม KOL
          </Button>
        </Link>
      </div>

      <KOLsListClient
        initialKOLs={allKols || []}
        initialCampaigns={campaigns || []}
        campaignKolIds={campaignKolIds}
        kolStats={kolStats}
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / itemsPerPage)}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        useClientSideSearch={true}
      />
    </div>
  )
}
