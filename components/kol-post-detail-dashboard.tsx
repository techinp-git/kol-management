"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface KOLPostDetailDashboardProps {
  initialAccounts: any[]
  initialProjects: any[]
  initialCampaigns: any[]
}

interface ChannelLevelRow {
  postName: string
  channel: string
  sow: string
  impressionOrganic: number
  impressionPaid: number
  impressionTotal: number
  reachOrganic: number
  reachPaid: number
  reachTotal: number
  likes: number
  comments: number
  shares: number
  engageBased: number
  postClick: number
  linkClick: number
  engagementTotal: number
  view: number
  retweet: number
}

interface KOLLevelRow {
  kolName: string
  follower: number
  imprOrganic: number
  imprPaid: number
  imprTotal: number
  reachOrganic: number
  reachPaid: number
  reachTotal: number
  engageTotal: number
  vdoView: number
  er: number
  budgetKol: number
  budgetBoost: number
  budgetTotal: number
  cpr: number
  cpe: number
  cpv: number
}

const CHANNEL_TYPES = ["facebook", "instagram", "tiktok", "youtube", "twitter", "line", "other"]

export default function KOLPostDetailDashboard({
  initialAccounts,
  initialProjects,
  initialCampaigns,
}: KOLPostDetailDashboardProps) {
  const supabase = createClient()
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [accounts, setAccounts] = useState(initialAccounts)
  const [projects, setProjects] = useState(initialProjects)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isDebugExpanded, setIsDebugExpanded] = useState(false)

  // Dropdown open states
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false)
  const [postDropdownOpen, setPostDropdownOpen] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const campaignDropdownRef = useRef<HTMLDivElement>(null)
  const channelDropdownRef = useRef<HTMLDivElement>(null)
  const postDropdownRef = useRef<HTMLDivElement>(null)

  // Table data
  const [channelLevelData, setChannelLevelData] = useState<ChannelLevelRow[]>([])
  const [kolLevelData, setKolLevelData] = useState<KOLLevelRow[]>([])
  const [grandTotal, setGrandTotal] = useState<ChannelLevelRow | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(100)
  const [totalRows, setTotalRows] = useState(0)

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
      setSelectedCampaigns([])
      setSelectedChannels([])
      setSelectedPosts([])
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
      setSelectedCampaigns([])
      setSelectedPosts([])
    }
    fetchCampaigns()
  }, [selectedProject, initialCampaigns, supabase])

  // Fetch posts based on selected campaigns + filter by channels (with pagination)
  useEffect(() => {
    const fetchPosts = async () => {
      if (selectedCampaigns.length > 0) {
        let allPosts: any[] = []
        const pageSize = 1000
        let page = 0
        let hasMore = true

        while (hasMore) {
          const { data, error } = await supabase
            .from("posts")
            .select("id, caption, external_post_id, campaign_id, kol_channels(channel_type, kols(id, name))")
            .in("campaign_id", selectedCampaigns)
            .order("created_at", { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1)

          if (error) {
            console.error("Error fetching posts:", error)
            break
          }
          if (data && data.length > 0) {
            allPosts = [...allPosts, ...data]
          }
          hasMore = (data?.length || 0) === pageSize
          page++
          if (page >= 50) break
        }

        // Filter by selected channels
        if (selectedChannels.length > 0) {
          allPosts = allPosts.filter((p: any) => selectedChannels.includes(p.kol_channels?.channel_type))
        }

        setPosts(allPosts)
      } else {
        setPosts([])
      }
      setSelectedPosts([])
    }
    fetchPosts()
  }, [selectedCampaigns, selectedChannels, supabase])

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false)
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false)
      }
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target as Node)) {
        setCampaignDropdownOpen(false)
      }
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(e.target as Node)) {
        setChannelDropdownOpen(false)
      }
      if (postDropdownRef.current && !postDropdownRef.current.contains(e.target as Node)) {
        setPostDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch and process data — only when all filters selected (Account, Project, Campaign, Channel, Post Name)
  const fetchPostDetailData = useCallback(async () => {
    const filtersComplete =
      selectedAccount &&
      selectedProject &&
      selectedCampaigns.length > 0 &&
      selectedChannels.length > 0 &&
      selectedPosts.length > 0

    if (!filtersComplete) {
      setError(null)
      setChannelLevelData([])
      setKolLevelData([])
      setGrandTotal(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("[Post Detail] Starting fetch with filters:", {
        account: selectedAccount,
        project: selectedProject,
        campaigns: selectedCampaigns,
        channels: selectedChannels,
        posts: selectedPosts,
      })

      // 1. Get relevant campaign IDs based on filters
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

      if (selectedCampaigns.length > 0) {
        campaignsQuery = campaignsQuery.in("id", selectedCampaigns)
      }

      const { data: campaignsData, error: campaignsError } = await campaignsQuery

      console.log("[Post Detail] Campaigns query result:", {
        data: campaignsData,
        error: campaignsError,
        count: campaignsData?.length || 0,
      })

      if (campaignsError) {
        throw new Error(`Error fetching campaigns: ${campaignsError.message}`)
      }

      if (!campaignsData || campaignsData.length === 0) {
        setError("ไม่พบ Campaign ใน Account/Project ที่เลือก")
        setChannelLevelData([])
        setKolLevelData([])
        setGrandTotal(null)
        setLoading(false)
        return
      }

      const campaignIds = campaignsData.map((c) => c.id)
      console.log("[Post Detail] Campaign IDs:", campaignIds)

      // 2. Get campaign_kols for budget data and kol_channel_ids
      const { data: campaignKolsData, error: campaignKolsError } = await supabase
        .from("campaign_kols")
        .select(`
          kol_channel_id,
          allocated_budget
        `)
        .in("campaign_id", campaignIds)

      console.log("[Post Detail] Campaign KOLs query result:", {
        data: campaignKolsData,
        error: campaignKolsError,
        count: campaignKolsData?.length || 0,
      })

      const budgetMap = new Map<string, number>()
      const kolChannelIds: string[] = []
      campaignKolsData?.forEach((ck) => {
        if (ck.kol_channel_id) {
          kolChannelIds.push(ck.kol_channel_id)
          const existing = budgetMap.get(ck.kol_channel_id) || 0
          budgetMap.set(ck.kol_channel_id, existing + (parseFloat(ck.allocated_budget?.toString() || "0") || 0))
        }
      })

      console.log("[Post Detail] KOL Channel IDs:", {
        kolChannelIds,
        count: kolChannelIds.length,
        budgetMapSize: budgetMap.size,
      })

      // 3. Get posts with all related data
      // Try to get posts by kol_channel_id first (includes posts with or without campaign_id)
      let postsQuery = supabase
        .from("posts")
        .select(`
          id,
          caption,
          content_type,
          campaign_id,
          kol_channel_id,
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

      if (selectedPosts.length > 0 && selectedPosts.length < posts.length) {
        postsQuery = postsQuery.in("id", selectedPosts)
      } else if (kolChannelIds.length > 0) {
        // Get posts from KOL channels in these campaigns (includes posts with or without campaign_id)
        postsQuery = postsQuery.in("kol_channel_id", kolChannelIds)
      } else {
        // Fallback: Get posts directly by campaign_id
        postsQuery = postsQuery.in("campaign_id", campaignIds)
      }

      const { data: postsData, error: postsError } = await postsQuery

      console.log("[Post Detail] Posts query result:", {
        postsCount: postsData?.length || 0,
        error: postsError,
        errorCode: postsError?.code,
        errorMessage: postsError?.message,
      })

      if (postsError) {
        throw new Error(`Error fetching posts: ${postsError.message}`)
      }

      // Filter by channel and campaign client-side
      let filteredPosts = (postsData || []).filter((post: any) => {
        // Filter by channels if selected
        if (selectedChannels.length > 0 && !selectedChannels.includes(post.kol_channels?.channel_type)) {
          return false
        }
        // Filter by campaigns
        if (selectedCampaigns.length > 0) {
          return selectedCampaigns.includes(post.campaign_id) || post.campaign_id === null
        }
        return !post.campaign_id || campaignIds.includes(post.campaign_id)
      })

      if (postsError) {
        throw new Error(`Error fetching posts: ${postsError.message}`)
      }

      if (!filteredPosts || filteredPosts.length === 0) {
        setError("ไม่พบ Posts ใน Campaigns ที่เลือก")
        setLoading(false)
        return
      }

      // 4. Process Channel Level Data
      const channelLevelRows: ChannelLevelRow[] = []

      filteredPosts.forEach((post: any) => {
        const kolChannel = post.kol_channels
        if (!kolChannel) return

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
        const engageBased = likes + comments + shares
        const postClick = latestMetric.post_clicks || 0
        const linkClick = latestMetric.link_clicks || 0
        const engagementTotal = engageBased + postClick + linkClick + (latestMetric.retweets || 0)
        const view = latestMetric.views || 0
        const retweet = latestMetric.retweets || 0

        const channelType = kolChannel.channel_type || "other"
        const channelDisplay = channelType.toUpperCase().substring(0, 2) === "FB" ? "FB" :
          channelType.toUpperCase().substring(0, 2) === "IG" ? "IG" :
          channelType.toUpperCase() === "TIKTOK" ? "TIKTOK" :
          channelType.toUpperCase() === "YOUTUBE" ? "YT" :
          channelType.toUpperCase() === "TWITTER" ? "X" :
          channelType.toUpperCase()

        channelLevelRows.push({
          postName: post.caption ? (post.caption.length > 50 ? post.caption.substring(0, 50) + "..." : post.caption) : post.external_post_id || `Post ${post.id.substring(0, 8)}`,
          channel: channelDisplay,
          sow: post.content_type || "N/A",
          impressionOrganic,
          impressionPaid,
          impressionTotal,
          reachOrganic,
          reachPaid,
          reachTotal,
          likes,
          comments,
          shares,
          engageBased,
          postClick,
          linkClick,
          engagementTotal,
          view,
          retweet,
        })
      })

      console.log("[Post Detail] Processed channel level rows:", channelLevelRows.length)
      setChannelLevelData(channelLevelRows)
      setTotalRows(channelLevelRows.length)

      // Calculate Grand Total
      const grandTotalRow: ChannelLevelRow = channelLevelRows.reduce(
        (acc, row) => ({
          postName: "Grand Total",
          channel: "",
          sow: "",
          impressionOrganic: acc.impressionOrganic + row.impressionOrganic,
          impressionPaid: acc.impressionPaid + row.impressionPaid,
          impressionTotal: acc.impressionTotal + row.impressionTotal,
          reachOrganic: acc.reachOrganic + row.reachOrganic,
          reachPaid: acc.reachPaid + row.reachPaid,
          reachTotal: acc.reachTotal + row.reachTotal,
          likes: acc.likes + row.likes,
          comments: acc.comments + row.comments,
          shares: acc.shares + row.shares,
          engageBased: acc.engageBased + row.engageBased,
          postClick: acc.postClick + row.postClick,
          linkClick: acc.linkClick + row.linkClick,
          engagementTotal: acc.engagementTotal + row.engagementTotal,
          view: acc.view + row.view,
          retweet: acc.retweet + row.retweet,
        }),
        {
          postName: "Grand Total",
          channel: "",
          sow: "",
          impressionOrganic: 0,
          impressionPaid: 0,
          impressionTotal: 0,
          reachOrganic: 0,
          reachPaid: 0,
          reachTotal: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engageBased: 0,
          postClick: 0,
          linkClick: 0,
          engagementTotal: 0,
          view: 0,
          retweet: 0,
        }
      )
      setGrandTotal(grandTotalRow)

      // 5. Process KOL Level Data
      const kolDataMap = new Map<string, KOLLevelRow>()

      filteredPosts.forEach((post: any) => {
        const kolChannel = post.kol_channels
        if (!kolChannel || !kolChannel.kols) return

        const kolId = kolChannel.kols.id
        const kolName = kolChannel.kols.name || "Unknown"
        const follower = kolChannel.follower_count || 0

        const existing = kolDataMap.get(kolId) || {
          kolName,
          follower,
          imprOrganic: 0,
          imprPaid: 0,
          imprTotal: 0,
          reachOrganic: 0,
          reachPaid: 0,
          reachTotal: 0,
          engageTotal: 0,
          vdoView: 0,
          er: 0,
          budgetKol: budgetMap.get(kolChannel.id) || 0,
          budgetBoost: 0, // TODO: Get from post level budget if available
          budgetTotal: budgetMap.get(kolChannel.id) || 0,
          cpr: 0,
          cpe: 0,
          cpv: 0,
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
        existing.engageTotal += engagementTotal
        existing.vdoView += view

        kolDataMap.set(kolId, existing)
      })

      // Calculate ER, CPR, CPE, CPV for each KOL
      const kolLevelRows: KOLLevelRow[] = Array.from(kolDataMap.values()).map((row) => {
        const er = row.reachTotal > 0 ? (row.engageTotal / row.reachTotal) * 100 : 0
        const cpr = row.reachTotal > 0 ? row.budgetTotal / row.reachTotal : 0
        const cpe = row.engageTotal > 0 ? row.budgetTotal / row.engageTotal : 0
        const cpv = row.vdoView > 0 ? row.budgetTotal / row.vdoView : 0

        return {
          ...row,
          er,
          cpr,
          cpe,
          cpv,
        }
      })

      console.log("[Post Detail] Processed KOL level rows:", kolLevelRows.length)
      setKolLevelData(kolLevelRows)

      // Set debug info (after all data is processed)
      setDebugInfo({
        campaignsFound: campaignsData.length,
        campaignIds,
        kolChannelsFound: kolChannelIds.length,
        postsFound: postsData?.length || 0,
        postsAfterFilter: filteredPosts.length,
        postsWithCampaignId: filteredPosts.filter((p: any) => p.campaign_id).length,
        postsWithoutCampaignId: filteredPosts.filter((p: any) => !p.campaign_id).length,
        channelLevelRows: channelLevelRows.length,
        kolLevelRows: kolLevelRows.length,
      })
    } catch (error: any) {
      console.error("[Post Detail Dashboard] Error:", error)
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล")
      setChannelLevelData([])
      setKolLevelData([])
      setGrandTotal(null)
    } finally {
      setLoading(false)
    }
  }, [selectedAccount, selectedProject, selectedCampaigns, selectedChannels, selectedPosts, posts.length, supabase])

  useEffect(() => {
    fetchPostDetailData()
  }, [fetchPostDetailData])

  const handleExport = () => {
    // TODO: Implement CSV export
    alert("Export feature coming soon!")
  }

  const paginatedChannelData = channelLevelData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(totalRows / pageSize)

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">KOLs/Post Detail Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">ติดตามประสิทธิภาพรายโพสต์ของทุก KOL ใน Campaign/Project</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="relative z-[100]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Account Dropdown */}
            <div ref={accountDropdownRef} className="relative">
              <label className="text-sm font-medium mb-2 block">Account</label>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              >
                <span className="truncate">
                  {selectedAccount ? accounts.find((a: any) => a.id === selectedAccount)?.name || "Select Account" : "Select Account"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
              {accountDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-y-auto">
                  {accounts.map((account: any) => (
                    <div
                      key={account.id}
                      className={`px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer text-sm ${selectedAccount === account.id ? "bg-accent font-medium" : ""}`}
                      onClick={() => {
                        setSelectedAccount(account.id)
                        setAccountDropdownOpen(false)
                      }}
                    >
                      {account.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Dropdown */}
            <div ref={projectDropdownRef} className="relative">
              <label className="text-sm font-medium mb-2 block">Project</label>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => selectedAccount && setProjectDropdownOpen(!projectDropdownOpen)}
                disabled={!selectedAccount}
              >
                <span className="truncate">
                  {selectedProject ? projects.find((p: any) => p.id === selectedProject)?.name || "Select Project" : "Select Project"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
              {projectDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-y-auto">
                  {projects.map((project: any) => (
                    <div
                      key={project.id}
                      className={`px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer text-sm ${selectedProject === project.id ? "bg-accent font-medium" : ""}`}
                      onClick={() => {
                        setSelectedProject(project.id)
                        setProjectDropdownOpen(false)
                      }}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Campaign Multi-Select */}
            <div ref={campaignDropdownRef} className="relative">
              <label className="text-sm font-medium mb-2 block">Campaign</label>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => selectedProject && setCampaignDropdownOpen(!campaignDropdownOpen)}
                disabled={!selectedProject}
              >
                <span className="truncate">
                  {selectedCampaigns.length === 0
                    ? "Select Campaign"
                    : selectedCampaigns.length === campaigns.length
                    ? `All Campaigns (${campaigns.length})`
                    : `${selectedCampaigns.length}/${campaigns.length} campaigns`}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
              {campaignDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-y-auto">
                  <div className="px-2 py-1.5 border-b mb-1">
                    <button
                      type="button"
                      className="text-xs text-foreground font-medium hover:underline"
                      onClick={() => {
                        if (selectedCampaigns.length === campaigns.length) {
                          setSelectedCampaigns([])
                        } else {
                          setSelectedCampaigns(campaigns.map((c: any) => c.id))
                        }
                      }}
                    >
                      {selectedCampaigns.length === campaigns.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  {campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                      onClick={() => {
                        setSelectedCampaigns((prev) =>
                          prev.includes(campaign.id) ? prev.filter((id) => id !== campaign.id) : [...prev, campaign.id]
                        )
                      }}
                    >
                      <Checkbox checked={selectedCampaigns.includes(campaign.id)} />
                      <span className="text-sm truncate">{campaign.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Channel Multi-Select */}
            <div ref={channelDropdownRef} className="relative">
              <label className="text-sm font-medium mb-2 block">Channel</label>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => selectedCampaigns.length > 0 && setChannelDropdownOpen(!channelDropdownOpen)}
                disabled={selectedCampaigns.length === 0}
              >
                <span className="truncate">
                  {selectedChannels.length === 0
                    ? "All Channels"
                    : selectedChannels.length === CHANNEL_TYPES.length
                    ? `All Channels (${CHANNEL_TYPES.length})`
                    : `${selectedChannels.length}/${CHANNEL_TYPES.length} channels`}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
              {channelDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-y-auto">
                  <div className="px-2 py-1.5 border-b mb-1">
                    <button
                      type="button"
                      className="text-xs text-foreground font-medium hover:underline"
                      onClick={() => {
                        if (selectedChannels.length === CHANNEL_TYPES.length) {
                          setSelectedChannels([])
                        } else {
                          setSelectedChannels([...CHANNEL_TYPES])
                        }
                      }}
                    >
                      {selectedChannels.length === CHANNEL_TYPES.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  {CHANNEL_TYPES.map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                      onClick={() => {
                        setSelectedChannels((prev) =>
                          prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
                        )
                      }}
                    >
                      <Checkbox checked={selectedChannels.includes(channel)} />
                      <span className="text-sm">{channel.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Name Multi-Select */}
            <div ref={postDropdownRef} className="relative">
              <label className="text-sm font-medium mb-2 block">Post Name</label>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => selectedCampaigns.length > 0 && setPostDropdownOpen(!postDropdownOpen)}
                disabled={selectedCampaigns.length === 0}
              >
                <span className="truncate">
                  {selectedPosts.length === 0
                    ? "All Posts"
                    : selectedPosts.length === posts.length
                    ? `All Posts (${posts.length})`
                    : `${selectedPosts.length}/${posts.length} posts`}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
              {postDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-y-auto">
                  <div className="px-2 py-1.5 border-b mb-1">
                    <button
                      type="button"
                      className="text-xs text-foreground font-medium hover:underline"
                      onClick={() => {
                        if (selectedPosts.length === posts.length) {
                          setSelectedPosts([])
                        } else {
                          setSelectedPosts(posts.map((p: any) => p.id))
                        }
                      }}
                    >
                      {selectedPosts.length === posts.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  {posts.map((post: any) => {
                    const kolName = post.kol_channels?.kols?.name || "Unknown KOL"
                    const postId = post.external_post_id || post.id.substring(0, 8)
                    const label = `${kolName} (${postId})`
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          setSelectedPosts((prev) =>
                            prev.includes(post.id) ? prev.filter((id) => id !== post.id) : [...prev, post.id]
                          )
                        }}
                      >
                        <Checkbox checked={selectedPosts.includes(post.id)} />
                        <span className="text-sm truncate">{label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info message when filters incomplete */}
      {!loading &&
        (!selectedAccount ||
          !selectedProject ||
          selectedCampaigns.length === 0 ||
          selectedChannels.length === 0 ||
          selectedPosts.length === 0) &&
        !error && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">กรุณาเลือก Filter ให้ครบ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                กรุณาเลือก Account, Project, Campaign, Channel และ Post Name อย่างน้อย 1 รายการ เพื่อดูข้อมูล KOL Post Detail
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

      {debugInfo &&
        selectedAccount &&
        selectedProject &&
        selectedCampaigns.length > 0 &&
        selectedChannels.length > 0 &&
        selectedPosts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Debug Info</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setIsDebugExpanded(!isDebugExpanded)}
              >
                {isDebugExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    ย่อ
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    ขยาย
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {isDebugExpanded && (
            <CardContent className="pt-0">
              <div className="text-xs space-y-2 text-muted-foreground">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold text-foreground">Filter Results:</p>
                    <p>Campaigns: {debugInfo.campaignsFound}</p>
                    <p>KOL Channels: {debugInfo.kolChannelsFound}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Posts Data:</p>
                    <p>Posts Found: {debugInfo.postsFound}</p>
                    <p>After Filter: {debugInfo.postsAfterFilter}</p>
                    <p>With Campaign ID: {debugInfo.postsWithCampaignId}</p>
                    <p>Without Campaign ID: {debugInfo.postsWithoutCampaignId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <p className="font-semibold text-foreground">Processed:</p>
                    <p>Channel Level Rows: {debugInfo.channelLevelRows}</p>
                    <p>KOL Level Rows: {debugInfo.kolLevelRows}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : selectedAccount &&
        selectedProject &&
        selectedCampaigns.length > 0 &&
        selectedChannels.length > 0 &&
        selectedPosts.length > 0 ? (
        <>
          {/* SECTION A: Channel Level Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-lg">SECTION A: Channel Level Summary</CardTitle>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {totalRows > 0 && (
                    <>
                      {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRows)} / {totalRows}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {paginatedChannelData.length > 0 ? (
                <>
                  <div className="rounded-md border overflow-x-auto -mx-2 sm:mx-0">
                    <Table className="min-w-[1400px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px] text-xs">Post Name</TableHead>
                          <TableHead className="min-w-[60px] text-xs">Channel</TableHead>
                          <TableHead className="min-w-[80px] text-xs">SOW</TableHead>
                          <TableHead className="text-right min-w-[90px] text-xs">Imp. Organic</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Imp. Paid</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Imp. Total</TableHead>
                          <TableHead className="text-right min-w-[90px] text-xs">Reach Organic</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Reach Paid</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Reach Total</TableHead>
                          <TableHead className="text-right min-w-[70px] text-xs">Likes</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Comments</TableHead>
                          <TableHead className="text-right min-w-[70px] text-xs">Shares</TableHead>
                          <TableHead className="text-right min-w-[100px] text-xs">Engage Based</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Post Click</TableHead>
                          <TableHead className="text-right min-w-[80px] text-xs">Link Click</TableHead>
                          <TableHead className="text-right min-w-[90px] text-xs">Engage Total</TableHead>
                          <TableHead className="text-right min-w-[70px] text-xs">View</TableHead>
                          <TableHead className="text-right min-w-[70px] text-xs">Retweet</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedChannelData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="max-w-[150px] truncate text-xs">{row.postName}</TableCell>
                            <TableCell className="text-xs">{row.channel}</TableCell>
                            <TableCell className="text-xs">{row.sow}</TableCell>
                            <TableCell className="text-right text-xs">{row.impressionOrganic.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.impressionPaid.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.impressionTotal.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.reachOrganic.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.reachPaid.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.reachTotal.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.likes.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.comments.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.shares.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.engageBased.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.postClick.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.linkClick.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.engagementTotal.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.view.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{row.retweet.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        {grandTotal && (
                          <TableRow className="font-bold bg-muted">
                            <TableCell className="text-xs">{grandTotal.postName}</TableCell>
                            <TableCell className="text-xs"></TableCell>
                            <TableCell className="text-xs"></TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.impressionOrganic.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.impressionPaid.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.impressionTotal.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.reachOrganic.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.reachPaid.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.reachTotal.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.likes.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.comments.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.shares.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.engageBased.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.postClick.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.linkClick.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.engagementTotal.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.view.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs">{grandTotal.retweet.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2 sm:px-0">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION B: KOLs Level Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">SECTION B: KOLs Level Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {kolLevelData.length > 0 ? (
                <div className="rounded-md border overflow-x-auto -mx-2 sm:mx-0">
                  <Table className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px] text-xs">KOL Name</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs">Follower</TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs">Impr. Organic</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs">Impr. Paid</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs">Impr. Total</TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs">Reach Organic</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs">Reach Paid</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs">Reach Total</TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs">Engage Total</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs">VDO View</TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs">%ER</TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs">Budget KOL</TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs">Budget Boost</TableHead>
                        <TableHead className="text-right min-w-[90px] text-xs">Budget Total</TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs">CPR</TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs">CPE</TableHead>
                        <TableHead className="text-right min-w-[70px] text-xs">CPV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kolLevelData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">{row.kolName}</TableCell>
                          <TableCell className="text-right text-xs">{row.follower.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.imprOrganic.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.imprPaid.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.imprTotal.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.reachOrganic.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.reachPaid.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.reachTotal.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.engageTotal.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.vdoView.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">{row.er.toFixed(2)}%</TableCell>
                          <TableCell className="text-right text-xs">{row.budgetKol.toLocaleString()} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.budgetBoost.toLocaleString()} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.budgetTotal.toLocaleString()} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.cpr.toFixed(2)} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.cpe.toFixed(2)} THB</TableCell>
                          <TableCell className="text-right text-xs">{row.cpv.toFixed(2)} THB</TableCell>
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
      ) : null}
    </div>
  )
}

