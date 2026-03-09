"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users,
  Eye,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  MousePointerClick,
  Link as LinkIcon,
  Download,
  BarChart2,
  DollarSign,
  Smile,
  Meh,
  Frown,
  Loader2,
  Building2,
  FolderKanban,
  Target,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
// import html2canvas from "html2canvas" // Temporarily disabled - module not found

interface DashboardData {
  primaryKPIs: {
    totalPosts: number
    totalFollowers: number
    totalImpressions: number
    totalReach: number
  }
  secondaryKPIs: {
    totalViews: number
    totalEngagement: number
    likes: number
    comments: number
    shares: number
    saves: number
    postClicks: number
    linkClicks: number
    retweets: number
  }
  sentiment: {
    brandMention: number
    brandMentionCount: number
    kolMention: number
    kolMentionCount: number
    other: number
    otherCount: number
    unclassified: number
    unclassifiedCount: number
    positive: number
    positiveCount: number
    neutral: number
    neutralCount: number
    negative: number
    negativeCount: number
  }
  costEfficiency: {
    totalCost: number
    cpr: number
    cpe: number
    cpv: number
    er: number
  }
}

export function KOLPerformanceDashboard() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const campaignDropdownRef = useRef<HTMLDivElement>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const dashboardRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, name")
        .eq("status", "active")
        .order("name")

      if (!error && data) {
        setAccounts(data)
      }
    }
    fetchAccounts()
  }, [supabase])

  // Fetch projects when account is selected
  useEffect(() => {
    if (!selectedAccount) {
      setProjects([])
      setSelectedProject("")
      return
    }

    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("account_id", selectedAccount)
        .order("name")

      if (!error && data) {
        setProjects(data)
      }
    }
    fetchProjects()
  }, [selectedAccount, supabase])

  // Fetch campaigns when project is selected
  useEffect(() => {
    if (!selectedProject) {
      setCampaigns([])
      setSelectedCampaigns([])
      return
    }

    async function fetchCampaigns() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("project_id", selectedProject)
        .order("name")

      if (!error && data) {
        setCampaigns(data)
      }
    }
    fetchCampaigns()
  }, [selectedProject, supabase])

  // Fetch dashboard data when filters change
  useEffect(() => {
    if (!selectedAccount || !selectedProject || selectedCampaigns.length === 0) {
      setDashboardData(null)
      return
    }

    fetchDashboardData()
  }, [selectedAccount, selectedProject, selectedCampaigns])

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
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    setError(null)
    
    try {
      console.log("[Dashboard] Starting fetch with filters:", {
        account: selectedAccount,
        project: selectedProject,
        campaigns: selectedCampaigns,
      })

      // Check if account is selected
      if (!selectedAccount || selectedAccount === "" || selectedAccount === "all") {
        console.warn("[Dashboard] No account selected")
        setError(null)
        setDashboardData(null)
        setLoading(false)
        return
      }

      // First, get campaign IDs based on filters
      let campaignsQuery = supabase
        .from("campaigns")
        .select(`
          id,
          project_id,
          projects!inner(
            id,
            account_id
          )
        `)
        .eq("projects.account_id", selectedAccount)

      if (selectedProject && selectedProject !== "all") {
        campaignsQuery = campaignsQuery.eq("project_id", selectedProject)
      }

      const { data: campaignsData, error: campaignsError } = await campaignsQuery

      console.log("[Dashboard] Campaigns query result:", {
        data: campaignsData,
        error: campaignsError,
        errorCode: campaignsError?.code,
        errorMessage: campaignsError?.message,
        count: campaignsData?.length || 0,
        selectedAccount,
        selectedProject,
      })

      if (campaignsError) {
        console.error("[Dashboard] Error fetching campaigns:", campaignsError)
        setError(`Error fetching campaigns: ${campaignsError.message || "Unknown error"}. Code: ${campaignsError.code || "N/A"}`)
        setDashboardData(null)
        setLoading(false)
        return
      }

      if (!campaignsData || campaignsData.length === 0) {
        console.warn("[Dashboard] No campaigns found for filters:", {
          selectedAccount,
          selectedProject,
        })
        setError("ไม่พบ Campaign ใน Account/Project ที่เลือก กรุณาลองเลือก Account หรือ Project อื่น")
        setDashboardData(null)
        setLoading(false)
        return
      }

      let campaignIds = campaignsData.map((c) => c.id)

      if (selectedCampaigns.length > 0) {
        const filtered = campaignIds.filter((id) => selectedCampaigns.includes(id))
        if (filtered.length > 0) {
          campaignIds = filtered
        } else {
          console.warn("[Dashboard] Selected campaigns not found in filtered list:", selectedCampaigns)
          setError("ไม่พบ Campaign ที่เลือกในรายการ")
          setDashboardData(null)
          setLoading(false)
          return
        }
      }

      // Fetch posts by campaign_id with pagination (consistent with sentiment dashboard)
      const postSelectFields = `
        id,
        campaign_id,
        kol_channel_id,
        kol_budget,
        boost_budget,
        kol_channels(
          id,
          kol_id,
          follower_count,
          kols(
            id,
            name
          )
        ),
        post_metrics(
          id,
          impressions,
          reach,
          views,
          likes,
          comments,
          shares,
          saves,
          impressions_organic,
          impressions_boost,
          reach_organic,
          reach_boost,
          post_clicks,
          link_clicks,
          retweets,
          ctr,
          engagement_rate,
          captured_at,
          created_at
        )
      `
      let posts: any[] = []
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
          console.error("[Dashboard] Error fetching posts:", postsError)
          setError(`Error fetching posts: ${postsError.message || "Unknown error"}`)
          setDashboardData(null)
          setLoading(false)
          return
        }

        if (pagePosts) {
          posts = [...posts, ...pagePosts]
        }

        hasMorePosts = (pagePosts?.length || 0) === postPageSize
        postPage++
        if (postPage >= 50) break
      }

      console.log("[Dashboard] Posts fetched:", { total: posts.length, pages: postPage })

      if (posts.length === 0) {
        setError("ไม่พบ Posts ใน Campaigns ที่เลือก กรุณาตรวจสอบว่ามี Posts ที่เชื่อมโยงกับ Campaign นี้หรือไม่")
        setDashboardData(null)
        setLoading(false)
        return
      }

      // Calculate total cost from posts table: kol_budget + boost_budget
      let totalCost = 0
      posts?.forEach((post) => {
        const kolBudget = parseFloat(post.kol_budget?.toString() || "0") || 0
        const boostBudget = parseFloat(post.boost_budget?.toString() || "0") || 0
        totalCost += kolBudget + boostBudget
      })

      // Get unique KOL IDs from posts
      const uniqueKolIds = new Set<string>()
      posts?.forEach((post) => {
        const kolChannel = post.kol_channels
        if (kolChannel?.kols?.id) {
          uniqueKolIds.add(kolChannel.kols.id)
        }
      })

      // Fetch latest follower_count for each KOL from kol_channels table
      const kolFollowersMap = new Map<string, number>()
      if (uniqueKolIds.size > 0) {
        const kolIdsArray = Array.from(uniqueKolIds)
        const { data: kolChannelsData, error: kolChannelsError } = await supabase
          .from("kol_channels")
          .select(`
            kol_id,
            follower_count,
            updated_at
          `)
          .in("kol_id", kolIdsArray)
          .order("updated_at", { ascending: false })

        if (kolChannelsError) {
          console.warn("[Dashboard] Error fetching KOL channels for followers:", kolChannelsError)
        } else {
          // Get latest follower_count per KOL (use max follower_count if multiple channels)
          kolChannelsData?.forEach((channel) => {
            const kolId = channel.kol_id
            const followerCount = channel.follower_count || 0
            const existing = kolFollowersMap.get(kolId) || 0
            // Use max follower count (in case same KOL has multiple channels)
            if (followerCount > existing) {
              kolFollowersMap.set(kolId, followerCount)
            }
          })
        }
      }

      // Calculate metrics
      let totalPosts = posts?.length || 0
      let totalFollowers = 0
      let totalImpressions = 0
      let totalReach = 0
      let totalViews = 0
      let totalLikes = 0
      let totalComments = 0
      let totalShares = 0
      let totalSaves = 0
      let postClicks = 0
      let linkClicks = 0
      let totalRetweets = 0
      let postsWithMetrics = 0
      let totalCTR = 0
      let totalER = 0

      posts?.forEach((post) => {

        if (post.post_metrics && post.post_metrics.length > 0) {
          postsWithMetrics++
          
          // Get latest metric (sorted by captured_at desc)
          const sortedMetrics = [...post.post_metrics].sort(
            (a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()
          )
          const latestMetric = sortedMetrics[0]

          // Always use organic + boost
          const impressions = 
            (latestMetric.impressions_organic || 0) + (latestMetric.impressions_boost || 0)
          const reach =
            (latestMetric.reach_organic || 0) + (latestMetric.reach_boost || 0) || latestMetric.reach || 0

          totalImpressions += impressions
          totalReach += reach
          totalViews += latestMetric.views || 0
          totalLikes += latestMetric.likes || 0
          totalComments += latestMetric.comments || 0
          totalShares += latestMetric.shares || 0
          totalSaves += latestMetric.saves || 0
          postClicks += latestMetric.post_clicks || 0
          linkClicks += latestMetric.link_clicks || 0
          totalRetweets += latestMetric.retweets || 0
          
          // Sum up CTR and ER for average calculation
          if (latestMetric.ctr) {
            totalCTR += parseFloat(latestMetric.ctr.toString()) || 0
          }
          if (latestMetric.engagement_rate) {
            totalER += parseFloat(latestMetric.engagement_rate.toString()) || 0
          }
        }
      })

      // Sum up unique KOL followers (using latest follower_count from kol_channels table)
      kolFollowersMap.forEach((followerCount) => {
        totalFollowers += followerCount
      })

      // Calculate total engagement (include retweets for Twitter/X)
      const totalEngagement = totalLikes + totalComments + totalShares + totalSaves + totalRetweets
      
      // Calculate average CTR and ER
      const avgCTR = postsWithMetrics > 0 ? totalCTR / postsWithMetrics : 0
      const avgER = postsWithMetrics > 0 ? totalER / postsWithMetrics : 0

      // Fetch comments with JOIN to master_post_intention
      // Using database function that performs: SELECT * FROM comments c 
      // INNER JOIN master_post_intention mp ON c.post_intention = mp.post_intention
      const postIds = posts?.map((p) => p.id) || []
      let commentsWithIntention: any[] = []
      
      if (postIds.length > 0) {
        // Always use fallback method with pagination to ensure we get ALL comments
        // RPC function may have limits (1000 rows), so we'll use direct query with pagination
        console.log("[Dashboard] Using fallback method with pagination to fetch all comments")
        
        // Fetch comments with pagination to get all records (Supabase default limit is 1000)
        let commentsOnly: any[] = []
        const pageSize = 1000
        let currentPage = 0
        let hasMore = true
        let commentsOnlyError: any = null
        
        while (hasMore) {
          const { data: pageComments, error: pageError } = await supabase
            .from("comments")
            .select("id, text, post_intention, post_id")
            .in("post_id", postIds)
            .order("id")
            .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)
          
          if (pageError) {
            commentsOnlyError = pageError
            console.warn("[Dashboard] Error fetching comments:", pageError)
            break
          }
          
          if (pageComments && pageComments.length > 0) {
            commentsOnly = [...commentsOnly, ...pageComments]
          }
          
          // Check if there are more rows
          hasMore = pageComments && pageComments.length === pageSize
          currentPage++
          
          // Safety limit: prevent infinite loops (max 100,000 rows)
          if (currentPage >= 100) {
            console.warn(`[Dashboard] Reached safety limit of ${currentPage} pages (${commentsOnly.length} comments), stopping pagination`)
            break
          }
        }
        
        // Count total comments fetched (before filtering)
        const totalCommentsFetched = commentsOnly.length
        const commentsWithPostIntentionCount = commentsOnly.filter((c) => c.post_intention).length
        const commentsWithoutPostIntention = totalCommentsFetched - commentsWithPostIntentionCount
        
        console.log("[Dashboard] Comments fetched (fallback):", {
          totalCommentsFetched,
          commentsWithPostIntention: commentsWithPostIntentionCount,
          commentsWithoutPostIntention,
          pagesFetched: currentPage,
        })

        // Fetch master_post_intention (should be small, no pagination needed)
          const { data: masterIntentions, error: masterError } = await supabase
            .from("master_post_intention")
            .select("post_intention, group_intention, sentiment")
            .eq("is_active", true)
            .order("post_intention")

          if (commentsOnlyError) {
            console.warn("[Dashboard] Error fetching comments:", commentsOnlyError)
          }
          if (masterError) {
            console.warn("[Dashboard] Error fetching master_post_intention:", masterError)
          }

          // Create lookup map from master_post_intention (keep first occurrence for duplicates)
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
        commentsWithIntention = (commentsOnly || []).map((comment) => {
          const intentionData = comment.post_intention ? intentionMap.get(comment.post_intention) : undefined
          return {
            comment_id: comment.id,
            post_id: comment.post_id,
            group_intention: intentionData?.group_intention || null,
            sentiment: intentionData?.sentiment || null,
          }
        })

        const matchedCount = commentsWithIntention.filter((c) => c.group_intention !== null).length
        console.log("[Dashboard] Comments LEFT JOIN result:", {
          totalComments: commentsWithIntention.length,
          matched: matchedCount,
          unmatched: commentsWithIntention.length - matchedCount,
          masterIntentionCount: intentionMap.size,
        })
      } else {
        console.log("[Dashboard] No post IDs to fetch comments")
      }

      // LEFT JOIN: total = all comments, no separate count query needed
      const actualTotalComments = commentsWithIntention.length

      // Group by group_intention (Brand, KOL, Other, null=ไม่ระบุ)
      let brandMention = 0
      let kolMention = 0
      let other = 0
      let unclassifiedCount = 0

      let brandPositive = 0
      let brandNegative = 0
      let brandNeutral = 0

      commentsWithIntention.forEach((comment) => {
        const groupIntention = comment.group_intention
        const sentiment = comment.sentiment

        if (groupIntention === "Brand") {
          brandMention++
          if (sentiment === "Positive") brandPositive++
          else if (sentiment === "Negative") brandNegative++
          else brandNeutral++
        } else if (groupIntention === "KOL") {
          kolMention++
        } else if (groupIntention) {
          other++
        } else {
          unclassifiedCount++
        }
      })

      const totalBrandSentiment = brandPositive + brandNegative + brandNeutral
      const brandPositivePercent = totalBrandSentiment > 0 ? (brandPositive / totalBrandSentiment) * 100 : 0
      const brandNeutralPercent = totalBrandSentiment > 0 ? (brandNeutral / totalBrandSentiment) * 100 : 0
      const brandNegativePercent = totalBrandSentiment > 0 ? (brandNegative / totalBrandSentiment) * 100 : 0

      const totalCommentsForMention = actualTotalComments
      const brandMentionPercent = totalCommentsForMention > 0 ? (brandMention / totalCommentsForMention) * 100 : 0
      const kolMentionPercent = totalCommentsForMention > 0 ? (kolMention / totalCommentsForMention) * 100 : 0
      const otherPercent = totalCommentsForMention > 0 ? (other / totalCommentsForMention) * 100 : 0
      const unclassifiedPercent = totalCommentsForMention > 0 ? (unclassifiedCount / totalCommentsForMention) * 100 : 0

      console.log("[Dashboard] LEFT JOIN group_intention counts:", {
        total: actualTotalComments,
        brand: brandMention,
        kol: kolMention,
        other,
        unclassified: unclassifiedCount,
        brandSentiment: { positive: brandPositive, neutral: brandNeutral, negative: brandNegative },
      })

      // Calculate cost efficiency
      // CPR = (kol_budget + boost_budget) / (reach_organic + reach_boost)
      // totalReach already includes reach_organic + reach_boost from latest metrics
      const cpr = totalReach > 0 ? totalCost / totalReach : 0
      const cpe = totalEngagement > 0 ? totalCost / totalEngagement : 0
      const cpv = totalViews > 0 ? totalCost / totalViews : 0
      const er = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0

      console.log("[Dashboard] Final metrics:", {
        totalPosts,
        totalFollowers,
        totalImpressions,
        totalReach,
        totalEngagement,
        totalCost,
        cpr,
        cpe,
        cpv,
        er,
      })

      setDashboardData({
        primaryKPIs: {
          totalPosts,
          totalFollowers,
          totalImpressions,
          totalReach,
        },
        secondaryKPIs: {
          totalViews,
          totalEngagement,
          likes: totalLikes,
          comments: actualTotalComments, // Use actual count from comments table
          shares: totalShares,
          saves: totalSaves,
          postClicks,
          linkClicks,
          retweets: totalRetweets,
        },
        sentiment: {
          brandMention: brandMentionPercent,
          brandMentionCount: brandMention,
          kolMention: kolMentionPercent,
          kolMentionCount: kolMention,
          other: otherPercent,
          otherCount: other,
          unclassified: unclassifiedPercent,
          unclassifiedCount,
          positive: brandPositivePercent,
          positiveCount: brandPositive,
          neutral: brandNeutralPercent,
          neutralCount: brandNeutral,
          negative: brandNegativePercent,
          negativeCount: brandNegative,
        },
        costEfficiency: {
          totalCost,
          cpr,
          cpe,
          cpv,
          er,
        },
      })
    } catch (error: any) {
      console.error("[Dashboard] Unexpected error:", error)
      setError(`Unexpected error: ${error?.message || "Unknown error"}`)
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  // Temporarily disabled - html2canvas module not found
  const handleExport = async (format: 'png' | 'jpg' = 'png') => {
    alert('Export function is temporarily disabled. Please install html2canvas package first.')
    return
    /* 
    if (!dashboardRef.current || !dashboardData) {
      alert("กรุณารอให้ dashboard โหลดข้อมูลเสร็จก่อน")
      return
    }

    setExporting(true)
    try {
      // 16:9 aspect ratio dimensions (1920x1080 for standard slide)
      const targetWidth = 1920
      const targetHeight = 1080
      
      // Get the dashboard content element
      const dashboardElement = dashboardRef.current
      
      // Get original dimensions
      const originalRect = dashboardElement.getBoundingClientRect()
      const originalWidth = originalRect.width
      const originalHeight = dashboardElement.scrollHeight
      
      // Calculate scale to fit in 16:9 container
      const padding = 60
      const availableWidth = targetWidth - (padding * 2)
      const availableHeight = targetHeight - (padding * 2)
      
      const scaleX = availableWidth / originalWidth
      const scaleY = availableHeight / originalHeight
      const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
      
      // Create a container with 16:9 aspect ratio
      const exportContainer = document.createElement('div')
      exportContainer.style.width = `${targetWidth}px`
      exportContainer.style.height = `${targetHeight}px`
      exportContainer.style.position = 'fixed'
      exportContainer.style.top = '-9999px'
      exportContainer.style.left = '-9999px'
      exportContainer.style.backgroundColor = '#ffffff'
      exportContainer.style.padding = `${padding}px`
      exportContainer.style.boxSizing = 'border-box'
      exportContainer.style.overflow = 'hidden'
      exportContainer.style.zIndex = '9999'
      
      // Clone dashboard
      const clonedContent = dashboardElement.cloneNode(true) as HTMLElement

      // Helper: inline all computed styles into cloned elements (colors will be rgb)
      const inlineComputedStyles = (element: Element) => {
        if (!(element instanceof HTMLElement)) return
        const computed = window.getComputedStyle(element)
        
        // Get all CSS properties and convert to inline styles
        const importantProps = [
          'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 
          'borderBottomColor', 'borderLeftColor', 'fontSize', 'fontWeight', 'fontFamily',
          'padding', 'margin', 'borderWidth', 'borderStyle', 'borderRadius',
          'width', 'height', 'display', 'flexDirection', 'gap', 'justifyContent', 'alignItems'
        ]
        
        importantProps.forEach(prop => {
          const value = computed.getPropertyValue(prop)
          if (value) {
            element.style.setProperty(prop, value, 'important')
          }
        })

        // Fix positioning to avoid fixed/sticky issues
        if (computed.position === 'fixed' || computed.position === 'sticky') {
          element.style.position = 'relative'
        }

        // Recurse
        Array.from(element.children).forEach(inlineComputedStyles)
      }

      inlineComputedStyles(clonedContent)

      // Sanitize any remaining lab/oklch colors in inline styles
      const sanitizeColors = (element: Element) => {
        if (!(element instanceof HTMLElement)) return
        const props = [
          'color',
          'backgroundColor',
          'borderColor',
          'borderTopColor',
          'borderRightColor',
          'borderBottomColor',
          'borderLeftColor',
        ]
        props.forEach((prop) => {
          const val = element.style.getPropertyValue(prop)
          if (val && (val.includes('oklch') || val.includes('lab') || val.includes('lch'))) {
            // fallback colors
            const fallback =
              prop.toLowerCase().includes('background') || prop.toLowerCase().includes('border')
                ? 'rgb(255, 255, 255)'
                : 'rgb(0, 0, 0)'
            element.style.setProperty(prop, fallback, 'important')
          }
        })

        // Also sanitize cssText directly
        if (element.style.cssText && /(oklch|lab|lch)\(/i.test(element.style.cssText)) {
          element.style.cssText = element.style.cssText.replace(/(oklch|lab|lch)\([^)]*\)/gi, 'rgb(0,0,0)')
        }

        Array.from(element.children).forEach(sanitizeColors)
      }

      sanitizeColors(clonedContent)

      // Apply transform styles to cloned content
      clonedContent.style.width = `${originalWidth}px`
      clonedContent.style.height = `${originalHeight}px`
      clonedContent.style.transform = `scale(${scale})`
      clonedContent.style.transformOrigin = 'top left'
      clonedContent.style.margin = '0'
      clonedContent.style.padding = '0'
      
      exportContainer.appendChild(clonedContent)
      document.body.appendChild(exportContainer)
      
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove any stylesheets inside exportContainer (we already inlined styles)
      const styleNodes = exportContainer.querySelectorAll('style, link[rel="stylesheet"]')
      styleNodes.forEach((node) => node.remove())

      // Capture the container
      const canvas = await html2canvas(exportContainer, {
        width: targetWidth,
        height: targetHeight,
        scale: 2, // Higher quality (2x for retina)
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        removeContainer: true,
        foreignObjectRendering: false,
      }).catch((error) => {
        console.error('html2canvas error:', error)
        throw new Error('Failed to export dashboard: ' + (error.message || 'Unknown error'))
      })
      
      // Clean up
      document.body.removeChild(exportContainer)
      
      // Convert to image
      const imageFormat = format === 'jpg' ? 'image/jpeg' : 'image/png'
      const quality = format === 'jpg' ? 0.95 : undefined
      const dataUrl = canvas.toDataURL(imageFormat, quality)
      
      // Download
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `kol-performance-dashboard-${timestamp}.${format}`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting dashboard:', error)
      alert('เกิดข้อผิดพลาดในการ export dashboard: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setExporting(false)
    }
    */
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KOL Performance Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมประสิทธิภาพของ KOL Performance</p>
        </div>
        {/* Export buttons temporarily disabled - html2canvas module not found */}
        {/* <div className="flex gap-2">
          <Button 
            onClick={() => handleExport('png')} 
            variant="outline"
            disabled={exporting || !dashboardData}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
          <Download className="mr-2 h-4 w-4" />
                Export PNG
              </>
            )}
        </Button>
          <Button 
            onClick={() => handleExport('jpg')} 
            variant="outline"
            disabled={exporting || !dashboardData}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export JPG
              </>
            )}
          </Button>
        </div> */}
      </div>

      {/* Filters */}
      <Card className="relative z-[100]">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {selectedCampaigns.length === 0
                      ? `All Campaigns (${campaigns.length})`
                      : selectedCampaigns.length === 1
                        ? campaigns.find((c) => c.id === selectedCampaigns[0])?.name || "1 selected"
                        : `${selectedCampaigns.length}/${campaigns.length} campaigns selected`}
                  </span>
                  <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {campaignDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                    <div className="p-2 border-b">
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => {
                          if (selectedCampaigns.length === campaigns.length) {
                            setSelectedCampaigns([])
                          } else {
                            setSelectedCampaigns(campaigns.map((c) => c.id))
                          }
                        }}
                      >
                        {selectedCampaigns.length === campaigns.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    {campaigns.map((campaign) => {
                      const isChecked = selectedCampaigns.includes(campaign.id)
                      return (
                        <label
                          key={campaign.id}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedCampaigns((prev) =>
                                checked
                                  ? [...prev, campaign.id]
                                  : prev.filter((id) => id !== campaign.id)
                              )
                            }}
                          />
                          <span className="truncate">{campaign.name}</span>
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
      {!loading && !dashboardData && !error && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">กรุณาเลือก Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {!selectedAccount
                ? "กรุณาเลือก Account เพื่อดูข้อมูล Dashboard"
                : !selectedProject
                  ? "กรุณาเลือก Project"
                  : "กรุณาเลือกอย่างน้อย 1 Campaign เพื่อแสดงข้อมูล"}
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
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      )}

      {!loading && dashboardData && (
        <div ref={dashboardRef} className="space-y-6">
          {/* Selected Filters Display - Beautiful Design (Replaces Primary KPI Summary Header) */}
          <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="h-6 w-6" />
                Primary KPI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {selectedAccount && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-shadow">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {accounts.find(a => a.id === selectedAccount)?.name || "Unknown"}
                    </span>
                  </div>
                )}
                {selectedProject && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-shadow">
                    <FolderKanban className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Project</span>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      {projects.find(p => p.id === selectedProject)?.name || "Unknown"}
                    </span>
                  </div>
                )}
                {selectedProject && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-shadow">
                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Campaign</span>
                    {selectedCampaigns.length === 0 ? (
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">All Campaigns</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedCampaigns.map((cId) => (
                          <Badge key={cId} variant="secondary" className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50">
                            {campaigns.find((c) => c.id === cId)?.name || cId}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Primary KPI Summary - Large Blue Cards */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-white">Post</CardTitle>
                  <BarChart2 className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="text-3xl font-bold text-white">{dashboardData.primaryKPIs.totalPosts.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-white">Follower</CardTitle>
                  <Users className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="text-3xl font-bold text-white">{dashboardData.primaryKPIs.totalFollowers.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-white">Impression</CardTitle>
                  <Eye className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="text-3xl font-bold text-white">{dashboardData.primaryKPIs.totalImpressions.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-white">Reach</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="text-3xl font-bold text-white">{dashboardData.primaryKPIs.totalReach.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-white">Total View</CardTitle>
                  <Eye className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="text-3xl font-bold text-white">{dashboardData.secondaryKPIs.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-white">Total Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="text-3xl font-bold text-white">{dashboardData.secondaryKPIs.totalEngagement.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Engagement Details - Smaller Light Blue Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Engagement Details</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Likes</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.secondaryKPIs.likes.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comments</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.secondaryKPIs.comments.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.secondaryKPIs.shares.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click Post</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.secondaryKPIs.postClicks.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Link Click</CardTitle>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.secondaryKPIs.linkClicks.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Comment Sentiment</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    รวม: {(
                      dashboardData.sentiment.brandMentionCount +
                      dashboardData.sentiment.kolMentionCount +
                      dashboardData.sentiment.otherCount +
                      dashboardData.sentiment.unclassifiedCount
                    ).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">BRAND</span>
                      <span className="text-sm font-medium">
                        {dashboardData.sentiment.brandMentionCount.toLocaleString()} ({dashboardData.sentiment.brandMention.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${dashboardData.sentiment.brandMention}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">KOL</span>
                      <span className="text-sm font-medium">
                        {dashboardData.sentiment.kolMentionCount.toLocaleString()} ({dashboardData.sentiment.kolMention.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.sentiment.kolMention}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">OTHER</span>
                      <span className="text-sm font-medium">
                        {dashboardData.sentiment.otherCount.toLocaleString()} ({dashboardData.sentiment.other.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.sentiment.other}%` }}
                      />
                    </div>
                  </div>
                  {dashboardData.sentiment.unclassifiedCount > 0 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-muted-foreground">ไม่ระบุ (Unclassified)</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {dashboardData.sentiment.unclassifiedCount.toLocaleString()} ({dashboardData.sentiment.unclassified.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-300 h-2 rounded-full"
                          style={{ width: `${dashboardData.sentiment.unclassified}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Total BRAND Sentiment</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    รวม: {(
                      dashboardData.sentiment.positiveCount +
                      dashboardData.sentiment.neutralCount +
                      dashboardData.sentiment.negativeCount
                    ).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Smile className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">POSITIVE</span>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardData.sentiment.positiveCount.toLocaleString()} ({dashboardData.sentiment.positive.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.sentiment.positive}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Meh className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">NEUTRAL</span>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardData.sentiment.neutralCount.toLocaleString()} ({dashboardData.sentiment.neutral.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.sentiment.neutral}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Frown className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">NEGATIVE</span>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardData.sentiment.negativeCount.toLocaleString()} ({dashboardData.sentiment.negative.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.sentiment.negative}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Efficiency Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Efficiency Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">CPR</div>
                  <div className="text-2xl font-bold">
                    {dashboardData.costEfficiency.cpr.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">CPE</div>
                  <div className="text-2xl font-bold">
                    {dashboardData.costEfficiency.cpe.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">CPV</div>
                  <div className="text-2xl font-bold">
                    {dashboardData.costEfficiency.cpv.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">%ER</div>
                  <div className="text-2xl font-bold">
                    {dashboardData.costEfficiency.er.toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !dashboardData && selectedAccount && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Please select an account to view dashboard data</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

