"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Download, Loader2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface KOLSentimentDashboardProps {
  initialAccounts: any[]
  initialProjects: any[]
  initialCampaigns: any[]
}

interface CommentClassification {
  type: "KOL" | "BRAND" | "OTHER"
  sentiment: "Positive" | "Negative" | "Neutral"
}

interface CampaignSentimentRow {
  projectName: string
  campaignName: string
  kolName: string
  totalComment: number
  kolLike: number
  kolNeutral: number
  kolDislike: number
  brandPositive: number
  brandNeutral: number
  brandNegative: number
  otherPositive: number
  otherNeutral: number
  otherNegative: number
}

export default function KOLSentimentDashboard({
  initialAccounts,
  initialProjects,
  initialCampaigns,
}: KOLSentimentDashboardProps) {
  const supabase = createClient()
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)
  const [postDropdownOpen, setPostDropdownOpen] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const campaignDropdownRef = useRef<HTMLDivElement>(null)
  const postDropdownRef = useRef<HTMLDivElement>(null)
  const [accounts, setAccounts] = useState(initialAccounts)
  const [projects, setProjects] = useState(initialProjects)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Chart data
  const [totalCommentByType, setTotalCommentByType] = useState<any[]>([])
  const [totalCommentCount, setTotalCommentCount] = useState(0)
  const [kolCommentBySentiment, setKolCommentBySentiment] = useState<any[]>([])
  const [kolCommentCount, setKolCommentCount] = useState(0)
  const [brandCommentBySentiment, setBrandCommentBySentiment] = useState<any[]>([])
  const [brandCommentCount, setBrandCommentCount] = useState(0)

  // Table data
  const [campaignSentimentTable, setCampaignSentimentTable] = useState<CampaignSentimentRow[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(100)
  const [totalRows, setTotalRows] = useState(0)

  // No longer using keyword-based classification
  // Using JOIN query with master_post_intention instead

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

  // Fetch posts based on selected campaigns (with pagination to get all posts)
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
            .select("id, caption, external_post_id, campaign_id, kol_channels(kols(id, name))")
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

        setPosts(allPosts)
      } else {
        setPosts([])
      }
      setSelectedPosts([])
    }
    fetchPosts()
  }, [selectedCampaigns, supabase])

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
      if (postDropdownRef.current && !postDropdownRef.current.contains(e.target as Node)) {
        setPostDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch and analyze comments
  const fetchSentimentData = useCallback(async () => {
    if (!selectedAccount || !selectedProject || selectedCampaigns.length === 0 || selectedPosts.length === 0) {
      setError(null)
      setTotalCommentByType([])
      setTotalCommentCount(0)
      setKolCommentBySentiment([])
      setKolCommentCount(0)
      setBrandCommentBySentiment([])
      setBrandCommentCount(0)
      setCampaignSentimentTable([])
      setTotalRows(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
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

      if (campaignsError) {
        throw new Error(`Error fetching campaigns: ${campaignsError.message}`)
      }

      if (!campaignsData || campaignsData.length === 0) {
        setError("ไม่พบ Campaign ใน Account/Project ที่เลือก")
        setLoading(false)
        return
      }

      const campaignIds = campaignsData.map((c) => c.id)

      // 2. Get posts (with pagination to bypass 1000-row limit)
      const postSelectFields = `
        id,
        caption,
        external_post_id,
        campaign_id,
        kol_channel_id,
        kol_channels(
          id,
          kols(
            id,
            name
          )
        ),
        campaigns(
          id,
          name,
          project_id,
          projects(
            id,
            name
          )
        )
      `
      // Always fetch ALL posts from campaigns (same as kol-performance-dashboard)
      let allPostsData: any[] = []
      const postPageSize = 500
      let postPage = 0
      let hasMorePosts = true

      while (hasMorePosts) {
        const { data: pagePosts, error: postsError } = await supabase
          .from("posts")
          .select(postSelectFields)
          .in("campaign_id", campaignIds)
          .order("id")
          .range(postPage * postPageSize, (postPage + 1) * postPageSize - 1)

        if (postsError) {
          throw new Error(`Error fetching posts: ${postsError.message}`)
        }

        if (pagePosts) {
          allPostsData = [...allPostsData, ...pagePosts]
        }

        hasMorePosts = (pagePosts?.length || 0) === postPageSize
        postPage++
        if (postPage >= 50) break
      }

      if (allPostsData.length === 0) {
        setError("ไม่พบ Posts ใน Campaigns ที่เลือก")
        setLoading(false)
        return
      }

      // If specific posts selected (not all), filter in memory for display
      const allPostsSelected = selectedPosts.length === posts.length || selectedPosts.length === allPostsData.length
      const displayPosts = allPostsSelected ? allPostsData : allPostsData.filter((p) => selectedPosts.includes(p.id))

      const postIds = allPostsData.map((p) => p.id)
      const displayPostIds = new Set(displayPosts.map((p) => p.id))
      const postsMap = new Map<string, any>()
      allPostsData.forEach((p) => postsMap.set(p.id, p))

      console.log("[Sentiment Dashboard] Posts:", {
        allPosts: allPostsData.length,
        displayPosts: displayPosts.length,
        allPostsSelected,
        selectedPostsCount: selectedPosts.length,
        dropdownPostsCount: posts.length,
      })

      // 3. Fetch all comments with pagination (same method as kol-performance-dashboard)
      let commentsOnly: any[] = []
      const commentPageSize = 1000
      let commentPage = 0
      let hasMoreComments = true

      while (hasMoreComments) {
        const { data: pageComments, error: pageError } = await supabase
          .from("comments")
          .select("id, text, post_intention, post_id")
          .in("post_id", postIds)
          .order("id")
          .range(commentPage * commentPageSize, (commentPage + 1) * commentPageSize - 1)

        if (pageError) {
          console.warn("[Sentiment Dashboard] Error fetching comments:", pageError)
          break
        }

        if (pageComments && pageComments.length > 0) {
          commentsOnly = [...commentsOnly, ...pageComments]
        }

        hasMoreComments = pageComments && pageComments.length === commentPageSize
        commentPage++
        if (commentPage >= 100) break
      }

      // Fetch master_post_intention (with order for deterministic results)
      const { data: masterIntentions, error: masterError } = await supabase
        .from("master_post_intention")
        .select("post_intention, group_intention, sentiment")
        .eq("is_active", true)
        .order("post_intention")

      if (masterError) {
        throw new Error(`Error fetching master_post_intention: ${masterError.message}`)
      }

      // Create lookup map (keep first occurrence for duplicates — same as performance dashboard)
      const intentionMap = new Map<string, { group_intention: string; sentiment: string | null }>()
      if (masterIntentions) {
        masterIntentions.forEach((item) => {
          if (item.post_intention && !intentionMap.has(item.post_intention)) {
            intentionMap.set(item.post_intention, {
              group_intention: item.group_intention || "Other",
              sentiment: item.sentiment || null,
            })
          }
        })
      }

      // LEFT JOIN: comments c LEFT JOIN master_post_intention m ON c.post_intention = m.post_intention
      const commentsWithIntention = commentsOnly.map((comment) => {
        const intentionData = comment.post_intention ? intentionMap.get(comment.post_intention) : undefined
        const groupIntention = intentionData?.group_intention || null
        const sentiment = intentionData?.sentiment || null

        let type: "KOL" | "BRAND" | "OTHER" | "UNCLASSIFIED"
        if (groupIntention === "KOL") type = "KOL"
        else if (groupIntention === "Brand") type = "BRAND"
        else if (groupIntention) type = "OTHER"
        else type = "UNCLASSIFIED"

        return {
          comment_id: comment.id,
          post_id: comment.post_id,
          text: comment.text,
          posts: postsMap.get(comment.post_id),
          group_intention: groupIntention,
          sentiment: sentiment,
          classification: {
            type,
            sentiment: (sentiment || "Neutral") as "Positive" | "Negative" | "Neutral",
          },
        }
      })

      const matchedCount = commentsWithIntention.filter((c) => c.group_intention !== null).length
      console.log("[Sentiment Dashboard] Comments LEFT JOIN result:", {
        totalComments: commentsWithIntention.length,
        matched: matchedCount,
        unmatched: commentsWithIntention.length - matchedCount,
        pagesFetched: commentPage,
      })

      // LEFT JOIN: filter by selected posts for display
      const displayComments = allPostsSelected
        ? commentsWithIntention
        : commentsWithIntention.filter((c: any) => displayPostIds.has(c.post_id))

      // LEFT JOIN: total = displayComments.length, no separate count query needed
      const totalRawCommentCount = displayComments.length

      // 5. Calculate chart data — group by group_intention directly from LEFT JOIN
      const typeCounts = { KOL: 0, BRAND: 0, OTHER: 0, UNCLASSIFIED: 0 }

      displayComments.forEach((c: any) => {
        typeCounts[c.classification.type as keyof typeof typeCounts]++
      })

      const typeChartData: any[] = [
        { name: "BRAND", value: typeCounts.BRAND, color: "#f97316" },
        { name: "KOL", value: typeCounts.KOL, color: "#9333ea" },
        { name: "OTHER", value: typeCounts.OTHER, color: "#6b7280" },
      ]
      if (typeCounts.UNCLASSIFIED > 0) {
        typeChartData.push({ name: "ไม่ระบุ", value: typeCounts.UNCLASSIFIED, color: "#d1d5db" })
      }
      setTotalCommentByType(typeChartData)
      setTotalCommentCount(totalRawCommentCount)

      console.log("[Sentiment Dashboard] LEFT JOIN group counts:", {
        total: totalRawCommentCount,
        brand: typeCounts.BRAND,
        kol: typeCounts.KOL,
        other: typeCounts.OTHER,
        unclassified: typeCounts.UNCLASSIFIED,
        allPostsSelected,
      })

      // KOL Comment by Sentiment (only KOL type comments)
      const kolComments = displayComments.filter((c: any) => c.classification.type === "KOL")
      const kolSentimentCounts = {
        Positive: 0,
        Neutral: 0,
        Negative: 0,
      }

      kolComments.forEach((c: any) => {
        if (c.classification.sentiment === "Positive") kolSentimentCounts.Positive++
        else if (c.classification.sentiment === "Negative") kolSentimentCounts.Negative++
        else kolSentimentCounts.Neutral++
      })

      setKolCommentBySentiment([
        { name: "Positive", value: kolSentimentCounts.Positive, color: "#22c55e" },
        { name: "Neutral", value: kolSentimentCounts.Neutral, color: "#6b7280" },
        { name: "Negative", value: kolSentimentCounts.Negative, color: "#ef4444" },
      ])
      setKolCommentCount(kolComments.length)

      // Brand Comment by Sentiment (only BRAND type comments)
      const brandComments = displayComments.filter((c: any) => c.classification.type === "BRAND")
      const brandSentimentCounts = {
        Positive: 0,
        Neutral: 0,
        Negative: 0,
      }

      brandComments.forEach((c: any) => {
        brandSentimentCounts[c.classification.sentiment]++
      })

      setBrandCommentBySentiment([
        { name: "Positive", value: brandSentimentCounts.Positive, color: "#22c55e" },
        { name: "Neutral", value: brandSentimentCounts.Neutral, color: "#6b7280" },
        { name: "Negative", value: brandSentimentCounts.Negative, color: "#ef4444" },
      ])
      setBrandCommentCount(brandComments.length)

      // 6. Build Campaign Sentiment Table
      const tableDataMap = new Map<string, CampaignSentimentRow>()

      displayComments.forEach((comment: any) => {
        const post = comment.posts
        if (!post) return

        const campaign = post.campaigns
        const project = campaign?.projects
        const kol = post.kol_channels?.kols

        if (!campaign || !project || !kol) return

        const key = `${project.id}-${campaign.id}-${kol.id}`
        const row = tableDataMap.get(key) || {
          projectName: project.name || "Unknown",
          campaignName: campaign.name || "Unknown",
          kolName: kol.name || "Unknown",
          totalComment: 0,
          kolLike: 0,
          kolNeutral: 0,
          kolDislike: 0,
          brandPositive: 0,
          brandNeutral: 0,
          brandNegative: 0,
          otherPositive: 0,
          otherNeutral: 0,
          otherNegative: 0,
        }

        row.totalComment++

        const { type, sentiment } = comment.classification

        if (type === "KOL") {
          if (sentiment === "Positive") row.kolLike++
          else if (sentiment === "Negative") row.kolDislike++
          else row.kolNeutral++
        } else if (type === "BRAND") {
          if (sentiment === "Positive") row.brandPositive++
          else if (sentiment === "Negative") row.brandNegative++
          else row.brandNeutral++
        } else {
          if (sentiment === "Positive") row.otherPositive++
          else if (sentiment === "Negative") row.otherNegative++
          else row.otherNeutral++
        }

        tableDataMap.set(key, row)
      })

      const tableData = Array.from(tableDataMap.values())
      setTotalRows(tableData.length)
      setCampaignSentimentTable(tableData)
    } catch (error: any) {
      console.error("[Sentiment Dashboard] Error:", error)
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล")
    } finally {
      setLoading(false)
    }
  }, [selectedAccount, selectedProject, selectedCampaigns, selectedPosts, posts.length, supabase])

  useEffect(() => {
    fetchSentimentData()
  }, [fetchSentimentData])

  const handleExport = () => {
    // TODO: Implement CSV export
    alert("Export feature coming soon!")
  }

  const paginatedTableData = campaignSentimentTable.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(totalRows / pageSize)

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold">Total Sentiment by KOL</h1>
          <p className="text-muted-foreground">วิเคราะห์ Sentiment เชิงลึกที่เกี่ยวข้องกับ KOL, Brand และประเภทความคิดเห็น</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="relative z-[100]">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Account</label>
              <div className="relative" ref={accountDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <span className="truncate text-left">
                    {selectedAccount ? accounts.find((a) => a.id === selectedAccount)?.name || "Unknown" : "Select Account"}
                  </span>
                  <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {accountDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm ${selectedAccount === account.id ? "bg-accent font-medium" : ""}`}
                        onClick={() => { setSelectedAccount(account.id); setAccountDropdownOpen(false) }}
                      >
                        {account.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <div className="relative" ref={projectDropdownRef}>
                <button
                  type="button"
                  disabled={!selectedAccount}
                  onClick={() => setProjectDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {selectedProject ? projects.find((p) => p.id === selectedProject)?.name || "Unknown" : "Select Project"}
                  </span>
                  <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {projectDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm ${selectedProject === project.id ? "bg-accent font-medium" : ""}`}
                        onClick={() => { setSelectedProject(project.id); setProjectDropdownOpen(false) }}
                      >
                        {project.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign</label>
              <div className="relative" ref={campaignDropdownRef}>
                <button
                  type="button"
                  disabled={!selectedProject}
                  onClick={() => setCampaignDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {selectedCampaigns.length === 0
                      ? `All Campaigns (${campaigns.length})`
                      : selectedCampaigns.length === 1
                        ? campaigns.find((c) => c.id === selectedCampaigns[0])?.name || "1 selected"
                        : `${selectedCampaigns.length}/${campaigns.length} campaigns`}
                  </span>
                  <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {campaignDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                    <div className="p-2 border-b">
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setSelectedCampaigns(selectedCampaigns.length === campaigns.length ? [] : campaigns.map((c) => c.id))}
                      >
                        {selectedCampaigns.length === campaigns.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    {campaigns.map((campaign) => (
                      <label key={campaign.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm">
                        <Checkbox
                          checked={selectedCampaigns.includes(campaign.id)}
                          onCheckedChange={(checked) =>
                            setSelectedCampaigns((prev) => checked ? [...prev, campaign.id] : prev.filter((id) => id !== campaign.id))
                          }
                        />
                        <span className="truncate">{campaign.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Post Name</label>
              <div className="relative" ref={postDropdownRef}>
                <button
                  type="button"
                  disabled={selectedCampaigns.length === 0}
                  onClick={() => setPostDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {selectedPosts.length === 0
                      ? `All Posts (${posts.length})`
                      : selectedPosts.length === 1
                        ? (() => {
                            const p = posts.find((pt) => pt.id === selectedPosts[0])
                            return p ? `${p.kol_channels?.kols?.name || "Unknown"} (${p.external_post_id || p.id.substring(0, 8)})` : "1 selected"
                          })()
                        : `${selectedPosts.length}/${posts.length} posts`}
                  </span>
                  <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {postDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                    <div className="p-2 border-b">
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setSelectedPosts(selectedPosts.length === posts.length ? [] : posts.map((p) => p.id))}
                      >
                        {selectedPosts.length === posts.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    {posts.map((post) => {
                      const kolName = post.kol_channels?.kols?.name || "Unknown KOL"
                      const postId = post.external_post_id || post.id.substring(0, 8)
                      return (
                        <label key={post.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm">
                          <Checkbox
                            checked={selectedPosts.includes(post.id)}
                            onCheckedChange={(checked) =>
                              setSelectedPosts((prev) => checked ? [...prev, post.id] : prev.filter((id) => id !== post.id))
                            }
                          />
                          <span className="truncate">{kolName} ({postId})</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info message when filters are incomplete */}
      {!loading && (!selectedAccount || !selectedProject || selectedCampaigns.length === 0 || selectedPosts.length === 0) && !error && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">กรุณาเลือก Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {!selectedAccount
                ? "กรุณาเลือก Account"
                : !selectedProject
                  ? "กรุณาเลือก Project"
                  : selectedCampaigns.length === 0
                    ? "กรุณาเลือกอย่างน้อย 1 Campaign"
                    : "กรุณาเลือกอย่างน้อย 1 Post Name"}
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

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!loading && selectedAccount && selectedProject && selectedCampaigns.length > 0 && selectedPosts.length > 0 && (
        <>
          {/* Summary Charts */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Total Comment by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Comment by Type {totalCommentCount > 0 && <span className="text-sm font-normal text-muted-foreground">(รวม {totalCommentCount.toLocaleString()})</span>}</CardTitle>
              </CardHeader>
              <CardContent>
                {totalCommentByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={totalCommentByType}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (percent < 0.05) return ""
                          return `${name} ${(percent * 100).toFixed(2)}%`
                        }}
                        outerRadius={65}
                        innerRadius={0}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {totalCommentByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${props.payload.name}: ${value} (${(props.payload.percent * 100).toFixed(2)}%)`,
                          ""
                        ]}
                      />
                      <Legend 
                        formatter={(value, entry: any) => `${value}: ${entry.payload.value} (${(entry.payload.percent * 100).toFixed(2)}%)`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KOL Comment by Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KOL Comment by Sentiment {kolCommentCount > 0 && <span className="text-sm font-normal text-muted-foreground">(รวม {kolCommentCount.toLocaleString()})</span>}</CardTitle>
              </CardHeader>
              <CardContent>
                {kolCommentBySentiment.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={kolCommentBySentiment}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (percent < 0.05) return ""
                          return `${name} ${(percent * 100).toFixed(2)}%`
                        }}
                        outerRadius={65}
                        innerRadius={0}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {kolCommentBySentiment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${props.payload.name}: ${value} (${(props.payload.percent * 100).toFixed(2)}%)`,
                          ""
                        ]}
                      />
                      <Legend 
                        formatter={(value, entry: any) => `${value}: ${entry.payload.value} (${(entry.payload.percent * 100).toFixed(2)}%)`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Brand Comment by Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Comment by Sentiment {brandCommentCount > 0 && <span className="text-sm font-normal text-muted-foreground">(รวม {brandCommentCount.toLocaleString()})</span>}</CardTitle>
              </CardHeader>
              <CardContent>
                {brandCommentBySentiment.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={brandCommentBySentiment}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (percent < 0.05) return ""
                          return `${name} ${(percent * 100).toFixed(2)}%`
                        }}
                        outerRadius={65}
                        innerRadius={0}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {brandCommentBySentiment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${props.payload.name}: ${value} (${(props.payload.percent * 100).toFixed(2)}%)`,
                          ""
                        ]}
                      />
                      <Legend 
                        formatter={(value, entry: any) => `${value}: ${entry.payload.value} (${(entry.payload.percent * 100).toFixed(2)}%)`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Campaign Sentiment Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campaign Sentiment Table</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {totalRows > 0 && (
                    <>
                      {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRows)} / {totalRows}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {paginatedTableData.length > 0 ? (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-[1100px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Project</TableHead>
                          <TableHead className="whitespace-nowrap">Campaign</TableHead>
                          <TableHead className="whitespace-nowrap">KOL Name</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                          <TableHead className="text-right whitespace-nowrap">KOL+</TableHead>
                          <TableHead className="text-right whitespace-nowrap">KOL~</TableHead>
                          <TableHead className="text-right whitespace-nowrap">KOL-</TableHead>
                          <TableHead className="text-right whitespace-nowrap">BRAND+</TableHead>
                          <TableHead className="text-right whitespace-nowrap">BRAND~</TableHead>
                          <TableHead className="text-right whitespace-nowrap">BRAND-</TableHead>
                          <TableHead className="text-right whitespace-nowrap">OTHER+</TableHead>
                          <TableHead className="text-right whitespace-nowrap">OTHER~</TableHead>
                          <TableHead className="text-right whitespace-nowrap">OTHER-</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTableData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.projectName}</TableCell>
                            <TableCell>{row.campaignName}</TableCell>
                            <TableCell>{row.kolName}</TableCell>
                            <TableCell className="text-right">{row.totalComment.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.kolLike.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.kolNeutral.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.kolDislike.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.brandPositive.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.brandNeutral.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.brandNegative.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.otherPositive.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.otherNeutral.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.otherNegative.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
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
        </>
      )}
    </div>
  )
}

