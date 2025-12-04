"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  kolDislike: number
  brandPositive: number
  brandNeutral: number
  brandNegative: number
  otherNeutral: number
}

export default function KOLSentimentDashboard({
  initialAccounts,
  initialProjects,
  initialCampaigns,
}: KOLSentimentDashboardProps) {
  const supabase = createClient()
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [selectedPost, setSelectedPost] = useState<string>("")
  const [accounts, setAccounts] = useState(initialAccounts)
  const [projects, setProjects] = useState(initialProjects)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Chart data
  const [totalCommentByType, setTotalCommentByType] = useState<any[]>([])
  const [kolCommentBySentiment, setKolCommentBySentiment] = useState<any[]>([])
  const [brandCommentBySentiment, setBrandCommentBySentiment] = useState<any[]>([])

  // Table data
  const [campaignSentimentTable, setCampaignSentimentTable] = useState<CampaignSentimentRow[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(100)
  const [totalRows, setTotalRows] = useState(0)

  // Keyword lists for classification
  const kolKeywords = ["kol", "influencer", "พี่", "เขา", "คนนี้", "คนนั้น", "influencer", "creator"]
  const brandKeywords = ["brand", "product", "สินค้า", "แบรนด์", "ยี่ห้อ", "ของ", "product"]
  const positiveKeywords = ["good", "great", "love", "amazing", "excellent", "perfect", "best", "awesome", "fantastic", "wonderful", "ดี", "สุด", "ชอบ", "รัก", "เยี่ยม"]
  const negativeKeywords = ["bad", "worst", "hate", "terrible", "awful", "disappointed", "poor", "fail", "wrong", "sucks", "แย่", "ไม่ดี", "เกลียด", "ห่วย"]

  // Classify comment type and sentiment
  const classifyComment = (text: string): CommentClassification => {
    const lowerText = text.toLowerCase()

    // Check for KOL mention
    const hasKolMention = kolKeywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))

    // Check for Brand mention
    const hasBrandMention = brandKeywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))

    // Determine type
    let type: "KOL" | "BRAND" | "OTHER"
    if (hasKolMention && !hasBrandMention) {
      type = "KOL"
    } else if (hasBrandMention) {
      type = "BRAND"
    } else {
      type = "OTHER"
    }

    // Determine sentiment
    const hasPositive = positiveKeywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
    const hasNegative = negativeKeywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))

    let sentiment: "Positive" | "Negative" | "Neutral"
    if (hasPositive && !hasNegative) {
      sentiment = "Positive"
    } else if (hasNegative && !hasPositive) {
      sentiment = "Negative"
    } else {
      sentiment = "Neutral"
    }

    return { type, sentiment }
  }

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
      setSelectedPost("")
    }
    fetchPosts()
  }, [selectedCampaign, supabase])

  // Fetch and analyze comments
  const fetchSentimentData = useCallback(async () => {
    if (!selectedAccount) {
      setError(null)
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

      if (selectedCampaign) {
        campaignsQuery = campaignsQuery.eq("id", selectedCampaign)
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

      // 2. Get posts
      let postsQuery = supabase
        .from("posts")
        .select(`
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
        `)
        .in("campaign_id", campaignIds)

      if (selectedPost) {
        postsQuery = postsQuery.eq("id", selectedPost)
      }

      const { data: postsData, error: postsError } = await postsQuery

      if (postsError) {
        throw new Error(`Error fetching posts: ${postsError.message}`)
      }

      if (!postsData || postsData.length === 0) {
        setError("ไม่พบ Posts ใน Campaigns ที่เลือก")
        setLoading(false)
        return
      }

      const postIds = postsData.map((p) => p.id)

      // 3. Get all comments for these posts
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          id,
          text,
          post_id,
          posts(
            id,
            campaign_id,
            kol_channel_id,
            kol_channels(
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
          )
        `)
        .in("post_id", postIds)

      if (commentsError) {
        throw new Error(`Error fetching comments: ${commentsError.message}`)
      }

      const comments = commentsData || []

      // 4. Classify all comments
      const classifiedComments = comments.map((comment: any) => {
        const classification = classifyComment(comment.text || "")
        return {
          ...comment,
          classification,
        }
      })

      // 5. Calculate chart data
      // Total Comment by Type
      const typeCounts = {
        KOL: 0,
        BRAND: 0,
        OTHER: 0,
      }

      classifiedComments.forEach((c: any) => {
        typeCounts[c.classification.type]++
      })

      setTotalCommentByType([
        { name: "KOL", value: typeCounts.KOL, color: "#3b82f6" },
        { name: "BRAND", value: typeCounts.BRAND, color: "#10b981" },
        { name: "OTHER", value: typeCounts.OTHER, color: "#6b7280" },
      ])

      // KOL Comment by Sentiment (only KOL type comments)
      const kolComments = classifiedComments.filter((c: any) => c.classification.type === "KOL")
      const kolSentimentCounts = {
        Positive: 0,
        Negative: 0,
      }

      kolComments.forEach((c: any) => {
        if (c.classification.sentiment === "Positive") kolSentimentCounts.Positive++
        if (c.classification.sentiment === "Negative") kolSentimentCounts.Negative++
      })

      setKolCommentBySentiment([
        { name: "Positive", value: kolSentimentCounts.Positive, color: "#22c55e" },
        { name: "Negative", value: kolSentimentCounts.Negative, color: "#ef4444" },
      ])

      // Brand Comment by Sentiment (only BRAND type comments)
      const brandComments = classifiedComments.filter((c: any) => c.classification.type === "BRAND")
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

      // 6. Build Campaign Sentiment Table
      const tableDataMap = new Map<string, CampaignSentimentRow>()

      classifiedComments.forEach((comment: any) => {
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
          kolDislike: 0,
          brandPositive: 0,
          brandNeutral: 0,
          brandNegative: 0,
          otherNeutral: 0,
        }

        row.totalComment++

        const { type, sentiment } = comment.classification

        if (type === "KOL") {
          if (sentiment === "Positive") row.kolLike++
          if (sentiment === "Negative") row.kolDislike++
        } else if (type === "BRAND") {
          if (sentiment === "Positive") row.brandPositive++
          if (sentiment === "Neutral") row.brandNeutral++
          if (sentiment === "Negative") row.brandNegative++
        } else if (type === "OTHER") {
          if (sentiment === "Neutral") row.otherNeutral++
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
  }, [selectedAccount, selectedProject, selectedCampaign, selectedPost, supabase])

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Total Sentiment by KOL</h1>
          <p className="text-muted-foreground">วิเคราะห์ Sentiment เชิงลึกที่เกี่ยวข้องกับ KOL, Brand และประเภทความคิดเห็น</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
              <label className="text-sm font-medium mb-2 block">Post Name</label>
              <Select
                value={selectedPost}
                onValueChange={setSelectedPost}
                disabled={!selectedCampaign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Post" />
                </SelectTrigger>
                <SelectContent>
                  {posts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.caption ? (post.caption.length > 50 ? post.caption.substring(0, 50) + "..." : post.caption) : post.external_post_id || `Post ${post.id.substring(0, 8)}`}
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Charts */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Total Comment by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Comment by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {totalCommentByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={totalCommentByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {totalCommentByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KOL Comment by Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KOL Comment by Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                {kolCommentBySentiment.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={kolCommentBySentiment}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {kolCommentBySentiment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Brand Comment by Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Comment by Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                {brandCommentBySentiment.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={brandCommentBySentiment}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {brandCommentBySentiment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
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
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Campaign</TableHead>
                          <TableHead>KOL Name</TableHead>
                          <TableHead className="text-right">Total Comment</TableHead>
                          <TableHead className="text-right">KOL-LIKE</TableHead>
                          <TableHead className="text-right">KOL-DISLIKE</TableHead>
                          <TableHead className="text-right">BRAND-POSITIVE</TableHead>
                          <TableHead className="text-right">BRAND-NEUTRAL</TableHead>
                          <TableHead className="text-right">BRAND-NEGATIVE</TableHead>
                          <TableHead className="text-right">OTHER-NEUTRAL</TableHead>
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
                            <TableCell className="text-right">{row.kolDislike.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.brandPositive.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.brandNeutral.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.brandNegative.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.otherNeutral.toLocaleString()}</TableCell>
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

