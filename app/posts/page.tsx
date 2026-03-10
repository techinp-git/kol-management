import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PostsListClient } from "@/components/posts-list-client"

export const revalidate = 0
export const dynamic = "force-dynamic"

const PAGE_SIZE = 10

type PostsPageProps = {
  searchParams?: Promise<{
    page?: string
  }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const supabase = await createClient()

  // --- Pagination ---
  const resolvedSearchParams = await searchParams
  const rawPage = Number(resolvedSearchParams?.page ?? 1)
  const requestedPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
    
  console.log("[v0] Posts page - fetching all data for client-side search")

  // --- Fetch posts ตาม join + post_metrics แบบฝังใน query เดียว (เหมือนหน้า campaign) ---
  const {
    data: allPosts,
    error,
    count,
  } = await supabase
    .from("posts")
    .select(
      `
      *,
      kol_channels!left (
        id,
        channel_type,
        handle,
        follower_count,
        kols (
          id,
          name,
          category
        )
      ),
      campaigns!left (
        id,
        name,
        project_id,
        projects (
          id,
          name,
          accounts (
            id,
            name
          )
        )
      ),
      comments!left (
        id
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
        views,
        captured_at
      )
    `,
      { count: "exact" }
    )
    .order("posted_at", { ascending: false })

  const resolvedTotalCount = count ?? 0
  const totalPages =
    resolvedTotalCount > 0
      ? Math.ceil(resolvedTotalCount / PAGE_SIZE)
      : 1

  // ปรับ currentPage ให้อยู่ในช่วง 1..totalPages
  const currentPage =
    resolvedTotalCount === 0
      ? 1
      : Math.min(Math.max(requestedPage, 1), totalPages)

  let posts = allPosts ?? []

  console.log("[v0] Posts fetch result:", {
    hasData: !!posts && posts.length > 0,
    count: posts?.length || 0,
    hasError: !!error,
    totalCount: resolvedTotalCount,
  })

  if (error) {
    console.error("[v0] Error fetching posts:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
  }

  // --- Empty state ---
  if (!posts || posts.length === 0) {
    console.log("[v0] No posts found, returning empty state")
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">โพสต์</h1>
            <p className="text-muted-foreground mt-1">
              จัดการโพสต์และสถิติ
            </p>
          </div>
          <Link href="/posts/new">
            <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มโพสต์
            </Button>
          </Link>
        </div>
        <PostsListClient
          initialPosts={[]}
          pagination={{
            currentPage: 1,
            pageSize: PAGE_SIZE,
            totalCount: resolvedTotalCount,
            totalPages: 1,
          }}
          useClientSideSearch={true}
        />
      </div>
    )
  }

  // helper: ดึง metric ล่าสุดจาก post (post_metrics ฝังใน query แล้ว)
  const getLatestMetrics = (post: any) => {
    const arr = post.post_metrics
    if (!Array.isArray(arr) || arr.length === 0) return {}
    const sorted = [...arr].sort(
      (a: any, b: any) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()
    )
    return sorted[0] ?? {}
  }

  const getKolFromChannel = (kolChannel: any) =>
    kolChannel?.kols ?? kolChannel?.kol ?? null

  const buildPostViewModel = (post: any) => {
    const metrics = getLatestMetrics(post)

    // budget: ใช้จาก posts.kol_budget / posts.boost_budget โดยตรง (เหมือนหน้า campaign / post detail)
    const kolBudget = post.kol_budget != null && post.kol_budget !== ""
      ? Number(post.kol_budget)
      : 0
    const boostBudget = post.boost_budget != null && post.boost_budget !== ""
      ? Number(post.boost_budget)
      : 0
    const totalBudget = kolBudget + boostBudget

    // metrics base
    const impressionsOrganic = metrics.impressions_organic ?? 0
    const impressionsBoost = metrics.impressions_boost ?? 0
    const totalImpressions = impressionsOrganic + impressionsBoost

    const reachOrganic = metrics.reach_organic ?? 0
    const reachBoost = metrics.reach_boost ?? 0
    const totalReach = reachOrganic + reachBoost

    const likes = metrics.likes ?? 0
    const comments = metrics.comments ?? 0
    const shares = metrics.shares ?? 0
    const saves = metrics.saves ?? 0
    const sharesAndSaves = shares + saves
    const totalEngage = likes + comments + shares + saves

    const views = metrics.views ?? 0
    const postClicks = metrics.post_clicks ?? 0
    const linkClicks = metrics.link_clicks ?? 0
    const retweets = metrics.retweets ?? 0

    // cost metrics
    const cpr = totalReach > 0 ? totalBudget / totalReach : 0
    const cpe = totalEngage > 0 ? totalBudget / totalEngage : 0
    const cpv = views > 0 ? totalBudget / views : 0

    // ER%
    const erPercent = totalReach > 0 ? (totalEngage / totalReach) * 100 : 0

    const kol = getKolFromChannel(post.kol_channels)
    return {
      id: post.id,
      post_name: post.post_name || "",
      kol_name: kol?.name || "Unknown",
      kol_category: Array.isArray(kol?.category) ? kol.category : [],
      platform: post.kol_channels?.channel_type || "unknown",
      follower: Number(post.kol_channels?.follower_count) || 0,
      posted_at: post.posted_at,
      remark: post.remark || post.notes || "",
      campaign_name: post.campaigns?.name || null,

      impressions_organic: impressionsOrganic,
      impressions_boost: impressionsBoost,
      total_impressions: totalImpressions,

      reach_organic: reachOrganic,
      reach_boost: reachBoost,
      total_reach: totalReach,

      likes,
      comments,
      shares_and_saves: sharesAndSaves,
      post_clicks: postClicks,
      link_clicks: linkClicks,
      retweets,
      total_engage: totalEngage,

      vdo_view: views,
      kol_budget: kolBudget,
      boost_budget: boostBudget,
      total_budget: totalBudget,
      campaign_id: post.campaign_id,

      cpr,
      cpe,
      cpv,
      er_percent: erPercent,
      total_comment: comments,

      url: post.url,
      caption: post.caption,
      content_type: post.content_type,
    }
  }

  const postsWithMetrics = (posts || []).map(buildPostViewModel)

  console.log("[v0] Posts with metrics processed:", {
    count: postsWithMetrics.length,
    sample: postsWithMetrics[0]
      ? {
          id: postsWithMetrics[0].id,
          kol_name: postsWithMetrics[0].kol_name,
          hasMetrics: !!postsWithMetrics[0].total_reach,
        }
      : null,
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">โพสต์</h1>
          <p className="text-muted-foreground mt-1">
            จัดการโพสต์และสถิติ
          </p>
        </div>
        <Link href="/posts/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มโพสต์
          </Button>
        </Link>
      </div>

      <PostsListClient
        initialPosts={postsWithMetrics}
        pagination={{
          currentPage,
          pageSize: PAGE_SIZE,
          totalCount: resolvedTotalCount,
          totalPages,
        }}
        useClientSideSearch={true}
      />
    </div>
  )
}
