"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, Download, Loader2, Trophy, Users as UsersIcon, Eye, Heart, MessageSquare, Share2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface BestPerformingKOLsDashboardProps {
  initialAccounts: any[]
  initialProjects: any[]
  initialCampaigns: any[]
}

interface KOLCardData {
  kolName: string
  ratecard: number
  boostPost: number
  budgetTotal: number
  follower: number
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  totalEngage: number
  er: number
  view: number
  cpr: number
  cpv: number
  cpe: number
}

interface SortingTableRow {
  kolName: string
  channel: string
  follower: number
  imp: number
  reach: number
  engage: number
  view: number
  er: number
  cpr: number
  cpe: number
  cpv: number
  linkClick: number
  budgetBoost: number
}

type RankingKPI = "er" | "engagement" | "reach" | "view" | "cpr"
type SortField = "kolName" | "channel" | "follower" | "imp" | "reach" | "engage" | "view" | "er" | "cpr" | "cpe" | "cpv" | "linkClick" | "budgetBoost"
type SortOrder = "asc" | "desc"

const CHANNEL_TYPES = ["facebook", "instagram", "tiktok", "youtube", "twitter", "line", "other"]
const RANKING_KPIS: { value: RankingKPI; label: string }[] = [
  { value: "er", label: "Highest ER" },
  { value: "engagement", label: "Highest Engagement" },
  { value: "reach", label: "Highest Reach" },
  { value: "view", label: "Highest View" },
  { value: "cpr", label: "Lowest CPR" },
]

export default function BestPerformingKOLsDashboard({
  initialAccounts,
  initialProjects,
  initialCampaigns,
}: BestPerformingKOLsDashboardProps) {
  const supabase = createClient()
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [selectedChannel, setSelectedChannel] = useState<string>("all")
  const [selectedPost, setSelectedPost] = useState<string>("all")
  const [rankingKPI, setRankingKPI] = useState<RankingKPI>("er")
  const [accounts, setAccounts] = useState(initialAccounts)
  const [projects, setProjects] = useState(initialProjects)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data
  const [top5KOLs, setTop5KOLs] = useState<KOLCardData[]>([])
  const [sortingTableData, setSortingTableData] = useState<SortingTableRow[]>([])
  const [sortField, setSortField] = useState<SortField>("er")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Fetch projects based on selected account
  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedAccount) {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, account_id")
          .eq("account_id", selectedAccount)
          .order("name", { ascending: true })
        if (error) {
          console.error("Error fetching projects:", error)
          setProjects([])
        } else {
          setProjects(data || [])
        }
      } else {
        setProjects(initialProjects)
      }
      setSelectedProject("")
      setSelectedCampaign("")
      setSelectedPost("")
    }
    fetchProjects()
  }, [selectedAccount, initialProjects, supabase])

  // Fetch campaigns based on selected project
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (selectedProject) {
        const { data, error } = await supabase
          .from("campaigns")
          .select("id, name, project_id")
          .eq("project_id", selectedProject)
          .order("name", { ascending: true })
        if (error) {
          console.error("Error fetching campaigns:", error)
          setCampaigns([])
        } else {
          setCampaigns(data || [])
        }
      } else {
        setCampaigns(initialCampaigns)
      }
      setSelectedCampaign("")
      setSelectedPost("")
    }
    fetchCampaigns()
  }, [selectedProject, initialCampaigns, supabase])

  // Fetch posts based on selected campaign
  useEffect(() => {
    const fetchPosts = async () => {
      if (selectedCampaign) {
        const { data, error } = await supabase
          .from("posts")
          .select("id, caption, external_post_id, campaign_id")
          .eq("campaign_id", selectedCampaign)
          .order("created_at", { ascending: false })
        if (error) {
          console.error("Error fetching posts:", error)
          setPosts([])
        } else {
          setPosts(data || [])
        }
      } else {
        setPosts([])
      }
      setSelectedPost("all")
    }
    fetchPosts()
  }, [selectedCampaign, supabase])

  // Fetch and process data
  const fetchBestPerformingData = useCallback(async () => {
    if (!selectedAccount) {
      setError(null)
      setTop5KOLs([])
      setSortingTableData([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Get relevant campaign IDs
      let campaignsQuery = supabase
        .from("campaigns")
        .select(`
          id,
          name,
          project_id,
          projects!inner(
            id,
            name,
            account_id
          )
        `)
        .eq("projects.account_id", selectedAccount)

      if (selectedProject) {
        campaignsQuery = campaignsQuery.eq("project_id", selectedProject)
      }

      if (selectedCampaign) {
        campaignsQuery = campaignsQuery.eq("id", selectedCampaign)
      }

      const { data: campaignsData, error: campaignsError } = await campaignsQuery

      if (campaignsError) {
        throw new Error(`Error fetching campaigns: ${campaignsError.message}`)
      }

      if (!campaignsData || campaignsData.length === 0) {
        setError("ไม่พบ Campaign ใน Account/Project ที่เลือก")
        setTop5KOLs([])
        setSortingTableData([])
        setLoading(false)
        return
      }

      const campaignIds = campaignsData.map((c) => c.id)

      // 2. Get campaign_kols for budget data
      const { data: campaignKolsData } = await supabase
        .from("campaign_kols")
        .select(`
          kol_channel_id,
          allocated_budget
        `)
        .in("campaign_id", campaignIds)

      const budgetMap = new Map<string, number>()
      const kolChannelIds: string[] = []
      campaignKolsData?.forEach((ck) => {
        if (ck.kol_channel_id) {
          kolChannelIds.push(ck.kol_channel_id)
          const existing = budgetMap.get(ck.kol_channel_id) || 0
          budgetMap.set(ck.kol_channel_id, existing + (parseFloat(ck.allocated_budget?.toString() || "0") || 0))
        }
      })

      // 3. Get posts with all related data
      let postsQuery = supabase
        .from("posts")
        .select(`
          id,
          caption,
          content_type,
          campaign_id,
          kol_channel_id,
          kol_budget,
          boost_budget,
          kol_channels(
            id,
            channel_type,
            follower_count,
            kols(
              id,
              name
            )
          ),
          campaigns(
            id,
            name
          ),
          post_metrics(
            id,
            impressions,
            impressions_organic,
            impressions_boost,
            reach,
            reach_organic,
            reach_boost,
            likes,
            comments,
            shares,
            saves,
            views,
            post_clicks,
            link_clicks,
            retweets,
            captured_at,
            created_at
          )
        `)

      if (selectedPost && selectedPost !== "all") {
        postsQuery = postsQuery.eq("id", selectedPost)
      } else if (kolChannelIds.length > 0) {
        postsQuery = postsQuery.in("kol_channel_id", kolChannelIds)
      } else {
        postsQuery = postsQuery.in("campaign_id", campaignIds)
      }

      const { data: postsData, error: postsError } = await postsQuery

      if (postsError) {
        throw new Error(`Error fetching posts: ${postsError.message}`)
      }

      // Filter by channel and campaign client-side
      let filteredPosts = (postsData || []).filter((post: any) => {
        if (selectedChannel && selectedChannel !== "all" && post.kol_channels?.channel_type !== selectedChannel) {
          return false
        }
        if (selectedCampaign) {
          return post.campaign_id === selectedCampaign || post.campaign_id === null
        }
        return !post.campaign_id || campaignIds.includes(post.campaign_id)
      })

      if (!filteredPosts || filteredPosts.length === 0) {
        setError("ไม่พบ Posts ใน Campaigns ที่เลือก")
        setTop5KOLs([])
        setSortingTableData([])
        setLoading(false)
        return
      }

      // 4. Process KOL Level Data
      const kolDataMap = new Map<string, {
        kolId: string
        kolName: string
        channel: string
        follower: number
        imprOrganic: number
        imprPaid: number
        imprTotal: number
        reachOrganic: number
        reachPaid: number
        reachTotal: number
        likes: number
        comments: number
        shares: number
        engageTotal: number
        vdoView: number
        linkClick: number
        budgetKol: number
        budgetBoost: number
        budgetTotal: number
      }>()

      filteredPosts.forEach((post: any) => {
        const kolChannel = post.kol_channels
        if (!kolChannel || !kolChannel.kols) return

        const kolId = kolChannel.kols.id
        const kolName = kolChannel.kols.name || "Unknown"
        const follower = kolChannel.follower_count || 0
        const channelType = kolChannel.channel_type || "other"
        const channelDisplay = channelType.toUpperCase().substring(0, 2) === "FB" ? "FB" :
          channelType.toUpperCase().substring(0, 2) === "IG" ? "IG" :
          channelType.toUpperCase() === "TIKTOK" ? "TIKTOK" :
          channelType.toUpperCase() === "YOUTUBE" ? "YT" :
          channelType.toUpperCase() === "TWITTER" ? "X" :
          channelType.toUpperCase()

        // Get budget from post (kol_budget + boost_budget)
        const postKolBudget = parseFloat(post.kol_budget?.toString() || "0") || 0
        const postBoostBudget = parseFloat(post.boost_budget?.toString() || "0") || 0
        
        // Get budget from campaign_kols (allocated_budget) - use as fallback if post budget is 0
        const campaignKolBudget = budgetMap.get(kolChannel.id) || 0

        const existing = kolDataMap.get(kolId) || {
          kolId,
          kolName,
          channel: channelDisplay,
          follower,
          imprOrganic: 0,
          imprPaid: 0,
          imprTotal: 0,
          reachOrganic: 0,
          reachPaid: 0,
          reachTotal: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engageTotal: 0,
          vdoView: 0,
          linkClick: 0,
          budgetKol: 0,
          budgetBoost: 0,
          budgetTotal: 0,
        }

        // Get latest metric
        const metrics = post.post_metrics || []
        const sortedMetrics = [...metrics].sort(
          (a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()
        )
        const latestMetric = sortedMetrics[0] || {}

        const impressionOrganic = latestMetric.impressions_organic || 0
        const impressionPaid = latestMetric.impressions_boost || 0
        const impressionTotal = impressionOrganic + impressionPaid || latestMetric.impressions || 0

        const reachOrganic = latestMetric.reach_organic || 0
        const reachPaid = latestMetric.reach_boost || 0
        const reachTotal = reachOrganic + reachPaid || latestMetric.reach || 0

        const likes = latestMetric.likes || 0
        const comments = latestMetric.comments || 0
        const shares = latestMetric.shares || 0
        const postClick = latestMetric.post_clicks || 0
        const linkClick = latestMetric.link_clicks || 0
        const retweet = latestMetric.retweets || 0
        const engagementTotal = likes + comments + shares + postClick + linkClick + retweet
        const view = latestMetric.views || 0

        existing.imprOrganic += impressionOrganic
        existing.imprPaid += impressionPaid
        existing.imprTotal += impressionTotal
        existing.reachOrganic += reachOrganic
        existing.reachPaid += reachPaid
        existing.reachTotal += reachTotal
        existing.likes += likes
        existing.comments += comments
        existing.shares += shares
        existing.engageTotal += engagementTotal
        existing.vdoView += view
        existing.linkClick += linkClick
        
        // Accumulate budget from all posts
        // Priority: Use post budget (kol_budget + boost_budget) if available
        // Fallback: Use campaign_kols allocated_budget if post budget is 0
        if (postKolBudget > 0) {
          // Use post kol_budget
          existing.budgetKol += postKolBudget
        } else if (campaignKolBudget > 0 && existing.budgetKol === 0) {
          // Use campaign_kols budget only once if no post budget exists yet
          existing.budgetKol += campaignKolBudget
        }
        
        // Always add boost_budget from post
        existing.budgetBoost += postBoostBudget
        
        // Recalculate total budget
        existing.budgetTotal = existing.budgetKol + existing.budgetBoost

        kolDataMap.set(kolId, existing)
      })

      // 5. Calculate metrics and create table data
      const kolNameToDataMap = new Map<string, {
        kolId: string
        kolName: string
        channel: string
        follower: number
        imprOrganic: number
        imprPaid: number
        imprTotal: number
        reachOrganic: number
        reachPaid: number
        reachTotal: number
        likes: number
        comments: number
        shares: number
        engageTotal: number
        vdoView: number
        linkClick: number
        budgetKol: number
        budgetBoost: number
        budgetTotal: number
      }>()
      kolDataMap.forEach((data) => {
        kolNameToDataMap.set(data.kolName, data)
      })

      const tableRows: SortingTableRow[] = Array.from(kolDataMap.values()).map((row) => {
        // Calculate Engagement Rate (%ER)
        // ER = (Total Engagement / Total Reach) * 100
        const er = row.reachTotal > 0 ? (row.engageTotal / row.reachTotal) * 100 : 0
        
        // Calculate Cost Per Reach (CPR)
        // CPR = Total Budget / Total Reach
        const cpr = row.reachTotal > 0 ? row.budgetTotal / row.reachTotal : 0
        
        // Calculate Cost Per Engagement (CPE)
        // CPE = Total Budget / Total Engagement
        const cpe = row.engageTotal > 0 ? row.budgetTotal / row.engageTotal : 0
        
        // Calculate Cost Per View (CPV)
        // CPV = Total Budget / Total Views
        const cpv = row.vdoView > 0 ? row.budgetTotal / row.vdoView : 0

        return {
          kolName: row.kolName,
          channel: row.channel,
          follower: row.follower,
          imp: row.imprTotal,
          reach: row.reachTotal,
          engage: row.engageTotal,
          view: row.vdoView,
          er,
          cpr,
          cpe,
          cpv,
          linkClick: row.linkClick,
          budgetBoost: row.budgetTotal,
        }
      })

      // 6. Sort and get Top 5 based on ranking KPI
      let sortedForTop5 = [...tableRows]
      if (rankingKPI === "er") {
        sortedForTop5.sort((a, b) => b.er - a.er)
      } else if (rankingKPI === "engagement") {
        sortedForTop5.sort((a, b) => b.engage - a.engage)
      } else if (rankingKPI === "reach") {
        sortedForTop5.sort((a, b) => b.reach - a.reach)
      } else if (rankingKPI === "view") {
        sortedForTop5.sort((a, b) => b.view - a.view)
      } else if (rankingKPI === "cpr") {
        sortedForTop5.sort((a, b) => a.cpr - b.cpr) // Lowest CPR is best
      }

      const top5 = sortedForTop5.slice(0, 5)

      // 7. Create KOL Card Data
      const kolCards: KOLCardData[] = top5.map((row) => {
        const kolData = kolNameToDataMap.get(row.kolName)
        return {
          kolName: row.kolName,
          ratecard: kolData?.budgetKol || 0,
          boostPost: kolData?.budgetBoost || 0,
          budgetTotal: row.budgetBoost,
          follower: row.follower,
          impressions: row.imp,
          reach: row.reach,
          likes: kolData?.likes || 0,
          comments: kolData?.comments || 0,
          shares: kolData?.shares || 0,
          totalEngage: row.engage,
          er: row.er,
          view: row.view,
          cpr: row.cpr,
          cpv: row.cpv,
          cpe: row.cpe,
        }
      })

      setTop5KOLs(kolCards)

      // 8. Sort table data
      let sortedTableData = [...tableRows]
      sortedTableData.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (typeof aVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
      })

      setSortingTableData(sortedTableData)
    } catch (error: any) {
      console.error("[Best Performing KOLs] Error:", error)
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล")
      setTop5KOLs([])
      setSortingTableData([])
    } finally {
      setLoading(false)
    }
  }, [selectedAccount, selectedProject, selectedCampaign, selectedChannel, selectedPost, rankingKPI, sortField, sortOrder, supabase])

  useEffect(() => {
    fetchBestPerformingData()
  }, [fetchBestPerformingData])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const handleExport = () => {
    alert("Export feature coming soon!")
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? "↑" : "↓"
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Best Performing KOLs</h1>
          <p className="text-sm md:text-base text-muted-foreground">จัดอันดับ KOL ที่มีประสิทธิภาพดีที่สุดตาม KPI ที่เลือก</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={!selectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign</label>
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
                disabled={!selectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Channel</label>
              <Select
                value={selectedChannel || "all"}
                onValueChange={(value) => setSelectedChannel(value === "all" ? "" : value)}
                disabled={!selectedCampaign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {CHANNEL_TYPES.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channel.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Post Name</label>
              <Select
                value={selectedPost || "all"}
                onValueChange={(value) => setSelectedPost(value === "all" ? "" : value)}
                disabled={!selectedCampaign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  {posts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.caption ? (post.caption.length > 50 ? post.caption.substring(0, 50) + "..." : post.caption) : post.external_post_id || `Post ${post.id.substring(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ranking KPI</label>
              <Select value={rankingKPI} onValueChange={(value) => setRankingKPI(value as RankingKPI)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select KPI" />
                </SelectTrigger>
                <SelectContent>
                  {RANKING_KPIS.map((kpi) => (
                    <SelectItem key={kpi.value} value={kpi.value}>
                      {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info message when no account selected */}
      {!selectedAccount && !loading && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">กรุณาเลือก Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              กรุณาเลือก Account เพื่อดูข้อมูล Best Performing KOLs
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* TOP SECTION: Top 5 Best Performing KOLs */}
          <div>
            <h2 className="text-xl font-bold mb-4">Top 5 Best Performing KOLs</h2>
            {top5KOLs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-5">
                {top5KOLs.map((kol, index) => (
                  <Card key={index} className="relative">
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-1">
                        <Trophy className="h-4 w-4" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{kol.kolName}</CardTitle>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Ratecard: {kol.ratecard.toLocaleString()} THB</p>
                        <p>Boost Post: {kol.boostPost.toLocaleString()} THB</p>
                        <p className="font-semibold">Budget Total: {kol.budgetTotal.toLocaleString()} THB</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-muted-foreground">Follower</p>
                          <p className="font-semibold">{kol.follower.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Impressions</p>
                          <p className="font-semibold">{kol.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reach</p>
                          <p className="font-semibold">{kol.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">L, C, S</p>
                          <p className="font-semibold">{kol.likes.toLocaleString()} / {kol.comments.toLocaleString()} / {kol.shares.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Engage</p>
                          <p className="font-semibold">{kol.totalEngage.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">%ER</p>
                          <p className="font-semibold">{kol.er.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">View</p>
                          <p className="font-semibold">{kol.view.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CPR</p>
                          <p className="font-semibold">{kol.cpr.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CPV</p>
                          <p className="font-semibold">{kol.cpv.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CPE</p>
                          <p className="font-semibold">{kol.cpe.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No Data
                </CardContent>
              </Card>
            )}
          </div>

          {/* LOWER SECTION: Sorting Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sorting Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {sortingTableData.length > 0 ? (
                <div className="rounded-md border overflow-x-auto -mx-2 sm:mx-0">
                  <Table className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("kolName")}>
                          KOL Name <SortIcon field="kolName" />
                        </TableHead>
                        <TableHead className="min-w-[80px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("channel")}>
                          Channel <SortIcon field="channel" />
                        </TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("follower")}>
                          Follower <SortIcon field="follower" />
                        </TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("imp")}>
                          Imp <SortIcon field="imp" />
                        </TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("reach")}>
                          Reach <SortIcon field="reach" />
                        </TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("engage")}>
                          Engage <SortIcon field="engage" />
                        </TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("view")}>
                          View <SortIcon field="view" />
                        </TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("er")}>
                          %ER <SortIcon field="er" />
                        </TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("cpr")}>
                          CPR <SortIcon field="cpr" />
                        </TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("cpe")}>
                          CPE <SortIcon field="cpe" />
                        </TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("cpv")}>
                          CPV <SortIcon field="cpv" />
                        </TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("linkClick")}>
                          Link Click <SortIcon field="linkClick" />
                        </TableHead>
                        <TableHead className="text-right min-w-[100px] text-xs cursor-pointer hover:bg-muted" onClick={() => handleSort("budgetBoost")}>
                          Budget + Boost <SortIcon field="budgetBoost" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortingTableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">{row.kolName}</TableCell>
                          <TableCell className="text-xs">{row.channel}</TableCell>
                          <TableCell className="text-right text-xs">{row.follower.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.imp.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.reach.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.engage.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.view.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.er.toFixed(2)}%</TableCell>
                          <TableCell className="text-right text-xs">{row.cpr.toFixed(2)} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.cpe.toFixed(2)} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.cpv.toFixed(2)} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.linkClick.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.budgetBoost.toLocaleString()} THB</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

