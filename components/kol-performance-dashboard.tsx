"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "lucide-react"
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
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
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
      setSelectedCampaign("")
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
    if (!selectedAccount) {
      setDashboardData(null)
      return
    }

    fetchDashboardData()
  }, [selectedAccount, selectedProject, selectedCampaign])

  async function fetchDashboardData() {
    setLoading(true)
    setError(null)
    
    try {
      console.log("[Dashboard] Starting fetch with filters:", {
        account: selectedAccount,
        project: selectedProject,
        campaign: selectedCampaign,
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

      if (selectedCampaign && selectedCampaign !== "all") {
        // If specific campaign is selected, only use that campaign
        if (campaignIds.includes(selectedCampaign)) {
          campaignIds = [selectedCampaign]
        } else {
          // Campaign not found in filtered list
          console.warn("[Dashboard] Selected campaign not found in filtered list:", selectedCampaign)
          setError("ไม่พบ Campaign ที่เลือกในรายการ")
          setDashboardData(null)
          setLoading(false)
          return
        }
      }

      // Get KOL channel IDs from campaign_kols that belong to these campaigns
      // This way we can get posts even if they don't have campaign_id set
      const { data: campaignKolsData, error: campaignKolsError } = await supabase
        .from("campaign_kols")
        .select(`
          kol_channel_id,
          campaign_id,
          allocated_budget
        `)
        .in("campaign_id", campaignIds)

      console.log("[Dashboard] Campaign KOLs query result:", {
        data: campaignKolsData,
        error: campaignKolsError,
        errorCode: campaignKolsError?.code,
        count: campaignKolsData?.length || 0,
        campaignIds,
      })

      if (campaignKolsError) {
        console.error("[Dashboard] Error fetching campaign KOLs:", campaignKolsError)
        // Don't fail here - try to get posts directly by campaign_id
        console.warn("[Dashboard] Will try to fetch posts directly by campaign_id")
      }

      const kolChannelIds = campaignKolsData
        ?.map((ck) => ck.kol_channel_id)
        .filter((id): id is string => id !== null) || []

      console.log("[Dashboard] KOL Channel IDs from campaign_kols:", {
        kolChannelIds,
        count: kolChannelIds.length,
        campaignKolsCount: campaignKolsData?.length || 0,
      })

      // If no KOL channels from campaign_kols, try to get posts directly by campaign_id
      // This handles cases where posts are linked to campaigns but campaign_kols table is empty
      let useDirectCampaignQuery = false
      if (kolChannelIds.length === 0) {
        console.warn("[Dashboard] No KOL channels found in campaign_kols, trying direct campaign_id query")
        useDirectCampaignQuery = true
      }

      // Now fetch posts - get all posts from KOL channels in these campaigns
      // This includes posts with or without campaign_id
      let allPosts: any[] = []
      let postsError: any = null

      if (useDirectCampaignQuery) {
        // Fallback: Get posts directly by campaign_id
        console.log("[Dashboard] Fetching posts directly by campaign_id:", campaignIds)
        const { data, error } = await supabase
          .from("posts")
          .select(`
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
          `)
          .in("campaign_id", campaignIds)

        allPosts = data || []
        postsError = error

        console.log("[Dashboard] Posts query (direct by campaign_id) result:", {
          allPostsCount: allPosts.length,
          error: postsError,
          errorCode: postsError?.code,
        })
      } else {
        // Normal: Get posts by kol_channel_id
        console.log("[Dashboard] Fetching posts by kol_channel_id:", kolChannelIds.slice(0, 3))
        const { data, error } = await supabase
          .from("posts")
          .select(`
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
          `)
          .in("kol_channel_id", kolChannelIds)

        allPosts = data || []
        postsError = error

        console.log("[Dashboard] Posts query (by kol_channel_id) result:", {
          allPostsCount: allPosts.length,
          error: postsError,
          errorCode: postsError?.code,
        })
      }

      console.log("[Dashboard] Posts query result:", {
        allPostsCount: allPosts?.length || 0,
        error: postsError,
        errorCode: postsError?.code,
        errorMessage: postsError?.message,
        sample: allPosts?.[0],
        queryMethod: useDirectCampaignQuery ? "direct_by_campaign_id" : "by_kol_channel_id",
        kolChannelIdsUsed: kolChannelIds.slice(0, 3), // Show first 3 IDs
      })

      if (postsError) {
        console.error("[Dashboard] Error fetching posts:", postsError)
        setError(`Error fetching posts: ${postsError.message || "Unknown error"}. Code: ${postsError.code || "N/A"}`)
        setDashboardData(null)
        setLoading(false)
        return
      }

      if (!allPosts || allPosts.length === 0) {
        console.warn("[Dashboard] No posts found", {
          queryMethod: useDirectCampaignQuery ? "direct_by_campaign_id" : "by_kol_channel_id",
          campaignIds,
          kolChannelIds,
        })
        setError("ไม่พบ Posts ใน Campaigns ที่เลือก กรุณาตรวจสอบว่ามี Posts ที่เชื่อมโยงกับ Campaign นี้หรือไม่")
        setDashboardData(null)
        setLoading(false)
        return
      }

      // Filter posts based on campaign selection
      // If specific campaign is selected, only include posts with that campaign_id or null
      // If no specific campaign, include posts with any campaign_id in our list or null
      let posts = allPosts || []
      const beforeFilterCount = posts.length
      
      if (selectedCampaign) {
        posts = posts.filter((p) => p.campaign_id === selectedCampaign || p.campaign_id === null)
      } else {
        // Include posts that belong to any of our campaigns OR have no campaign_id
        posts = posts.filter((p) => p.campaign_id === null || campaignIds.includes(p.campaign_id))
      }

      console.log("[Dashboard] Posts after filter:", {
        beforeFilter: beforeFilterCount,
        afterFilter: posts.length,
        withCampaignId: posts.filter((p) => p.campaign_id).length,
        withoutCampaignId: posts.filter((p) => !p.campaign_id).length,
        samplePost: posts[0],
        samplePostMetrics: posts[0]?.post_metrics?.[0],
      })

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
        try {
          // Try to use RPC function for JOIN query
          const { data: commentsData, error: commentsError } = await supabase
            .rpc('get_comments_with_intention', { p_post_ids: postIds })

          if (commentsError) {
            throw commentsError
          }

          console.log("[Dashboard] Comments with intention (RPC JOIN) result:", {
            commentsCount: commentsData?.length || 0,
            postIdsCount: postIds.length,
          })

          // Use data from RPC function (already joined with master_post_intention)
          commentsWithIntention = commentsData || []
        } catch (rpcError: any) {
          // Fallback: fetch separately and join in memory (simulates JOIN)
          console.warn("[Dashboard] RPC function not available or failed, using fallback JOIN:", rpcError?.message)
          
          const { data: commentsOnly, error: commentsOnlyError } = await supabase
            .from("comments")
            .select("id, text, post_intention, post_id")
            .in("post_id", postIds)

          const { data: masterIntentions, error: masterError } = await supabase
            .from("master_post_intention")
            .select("post_intention, group_intention, sentiment")
            .eq("is_active", true)

          if (commentsOnlyError) {
            console.warn("[Dashboard] Error fetching comments:", commentsOnlyError)
          }
          if (masterError) {
            console.warn("[Dashboard] Error fetching master_post_intention:", masterError)
          }

          // Create lookup map from master_post_intention (simulates JOIN)
          const intentionMap = new Map<string, { group_intention: string; sentiment: string | null }>()
          if (masterIntentions) {
            masterIntentions.forEach((item) => {
              if (item.post_intention) {
                intentionMap.set(item.post_intention, {
                  group_intention: item.group_intention || "Other",
                  sentiment: item.sentiment || null,
                })
              }
            })
          }

          // Join comments with master_post_intention data (simulates: comments c INNER JOIN master_post_intention mp ON c.post_intention = mp.post_intention)
          commentsWithIntention = (commentsOnly || [])
            .filter((comment) => comment.post_intention && intentionMap.has(comment.post_intention)) // INNER JOIN filter
            .map((comment) => {
              const intentionData = intentionMap.get(comment.post_intention!)!

              return {
                comment_id: comment.id,
                post_id: comment.post_id,
                group_intention: intentionData.group_intention,
                sentiment: intentionData.sentiment,
              }
            })

          console.log("[Dashboard] Comments with intention (fallback JOIN) result:", {
            totalComments: commentsWithIntention.length,
            withGroupIntention: commentsWithIntention.filter((c) => c.group_intention !== "Other").length,
            withSentiment: commentsWithIntention.filter((c) => c.sentiment).length,
          })
        }
      } else {
        console.log("[Dashboard] No post IDs to fetch comments")
      }

      // Calculate sentiment and group mention from joined data
      let brandMention = 0
      let kolMention = 0
      let other = 0
      let positive = 0
      let negative = 0
      let neutral = 0

      commentsWithIntention.forEach((comment) => {
        const groupIntention = comment.group_intention || "Other"
        const sentiment = comment.sentiment

        // Count by group_intention
        if (groupIntention === "Brand") {
          brandMention++
        } else if (groupIntention === "KOL") {
          kolMention++
        } else {
          other++
        }

        // Count by sentiment
        if (sentiment === "Positive") {
          positive++
        } else if (sentiment === "Negative") {
          negative++
        } else {
          neutral++
        }
      })

      const totalSentiment = positive + negative + neutral
      const positivePercent = totalSentiment > 0 ? (positive / totalSentiment) * 100 : 0
      const neutralPercent = totalSentiment > 0 ? (neutral / totalSentiment) * 100 : 0
      const negativePercent = totalSentiment > 0 ? (negative / totalSentiment) * 100 : 0

      const totalCommentsForMention = commentsWithIntention.length
      const brandMentionPercent = totalCommentsForMention > 0 ? (brandMention / totalCommentsForMention) * 100 : 0
      const kolMentionPercent = totalCommentsForMention > 0 ? (kolMention / totalCommentsForMention) * 100 : 0
      const otherPercent = totalCommentsForMention > 0 ? (other / totalCommentsForMention) * 100 : 0

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
          comments: totalComments,
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
          positive: positivePercent,
          positiveCount: positive,
          neutral: neutralPercent,
          neutralCount: neutral,
          negative: negativePercent,
          negativeCount: negative,
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
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
                value={selectedCampaign || "all"}
                onValueChange={(value) => setSelectedCampaign(value === "all" ? "" : value)}
                disabled={!selectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
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
              กรุณาเลือก Account เพื่อดูข้อมูล Sentiment by KOL
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
          {/* Primary KPI Summary - Large Blue Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Primary KPI Summary</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Post</CardTitle>
                  <BarChart2 className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.primaryKPIs.totalPosts.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Follower</CardTitle>
                  <Users className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.primaryKPIs.totalFollowers.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Impression</CardTitle>
                  <Eye className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.primaryKPIs.totalImpressions.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Reach</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.primaryKPIs.totalReach.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total View</CardTitle>
                  <Eye className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.secondaryKPIs.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white border-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData.secondaryKPIs.totalEngagement.toLocaleString()}</div>
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
                      dashboardData.sentiment.otherCount
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

