"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, MessageSquare, Plus, ArrowUpRight, ArrowDownRight, Pencil, Trash2, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PostDetailClient({ post }: { post: any }) {
  console.log("[v0] PostDetailClient - post.comments:", post.comments)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [commentsPage, setCommentsPage] = useState(1)
  const commentsPerPage = 20
  const [isSaving, setIsSaving] = useState(false)
  const [editingMetric, setEditingMetric] = useState<any>(null)
  const [statsForm, setStatsForm] = useState({
    impressions_organic: "",
    impressions_boost: "",
    reach_organic: "",
    reach_boost: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    post_clicks: "",
    link_clicks: "",
    retweets: "",
    views: "",
    captured_at: new Date().toISOString().slice(0, 16), // Default to current date/time
  })

  const latestMetrics = post.post_metrics?.[0] || post.latest_metrics || {}
  const sortedMetrics = (post.post_metrics || []).sort(
    (a: any, b: any) => new Date(b.captured_at || b.recorded_at).getTime() - new Date(a.captured_at || a.recorded_at).getTime(),
  )

  // Comments pagination logic
  const totalComments = post.comments?.length || 0
  const totalCommentsPages = Math.ceil(totalComments / commentsPerPage)
  const startIndex = (commentsPage - 1) * commentsPerPage
  const endIndex = startIndex + commentsPerPage
  const paginatedComments = post.comments?.slice(startIndex, endIndex) || []

  const handleCommentsPageChange = (page: number) => {
    if (page >= 1 && page <= totalCommentsPages) {
      setCommentsPage(page)
    }
  }

  const openAddStatsDialog = () => {
    setEditingMetric(null)
    setStatsForm({
      impressions_organic: "",
      impressions_boost: "",
      reach_organic: "",
      reach_boost: "",
      likes: "",
      comments: "",
      shares: "",
      saves: "",
      post_clicks: "",
      link_clicks: "",
      retweets: "",
      views: "",
      captured_at: new Date().toISOString().slice(0, 16),
    })
    setStatsDialogOpen(true)
  }

  const openEditStatsDialog = (metric: any) => {
    setEditingMetric(metric)
    const capturedAt = metric.captured_at || metric.recorded_at
    const dateStr = capturedAt ? new Date(capturedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
    
    setStatsForm({
      impressions_organic: metric.impressions_organic?.toString() || "",
      impressions_boost: metric.impressions_boost?.toString() || "",
      reach_organic: metric.reach_organic?.toString() || "",
      reach_boost: metric.reach_boost?.toString() || "",
      likes: metric.likes?.toString() || "",
      comments: metric.comments?.toString() || "",
      shares: metric.shares?.toString() || "",
      saves: metric.saves?.toString() || "",
      post_clicks: metric.post_clicks?.toString() || "",
      link_clicks: metric.link_clicks?.toString() || "",
      retweets: metric.retweets?.toString() || "",
      views: metric.views?.toString() || "",
      captured_at: dateStr,
    })
    setStatsDialogOpen(true)
  }

  const handleSaveStats = async () => {
    setIsSaving(true)
    try {
      const url = `/api/posts/${post.id}/metrics`
      const method = editingMetric ? "PATCH" : "POST"
      const body = editingMetric
        ? { ...statsForm, metric_id: editingMetric.id }
        : statsForm

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error || "ไม่สามารถบันทึกข้อมูลได้"}`)
        return
      }

      // Success - refresh the page to show new data
      window.location.reload()
    } catch (error: any) {
      console.error("[v0] Error saving stats:", error)
      alert(`เกิดข้อผิดพลาด: ${error.message || "ไม่สามารถบันทึกข้อมูลได้"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStats = async (metricId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสถิตินี้?")) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/metrics?metric_id=${metricId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error || "ไม่สามารถลบข้อมูลได้"}`)
        return
      }

      // Success - refresh the page to show new data
      window.location.reload()
    } catch (error: any) {
      console.error("[v0] Error deleting stats:", error)
      alert(`เกิดข้อผิดพลาด: ${error.message || "ไม่สามารถลบข้อมูลได้"}`)
    }
  }

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">รายละเอียดโพสต์</h1>
          {post.post_name && (
            <p className="text-lg text-muted-foreground mt-1">{post.post_name}</p>
          )}
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <Link href={`/kols/${post.kol_channels?.kols?.id}`} className="hover:underline">
              {post.kol_channels?.kols?.name}
            </Link>
            <span>•</span>
            <Badge variant="outline">{post.kol_channels?.channel_type}</Badge>
            <span>@{post.kol_channels?.handle}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddStatsDialog}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มสถิติ
          </Button>
          <a href={post.url} target="_blank" rel="noopener noreferrer">
            <Badge variant="outline" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              ดูโพสต์
            </Badge>
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(latestMetrics.views || 0).toLocaleString()}</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].views || 0, sortedMetrics[1].views || 0) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].views || 0, sortedMetrics[1].views || 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].views || 0, sortedMetrics[1].views || 0).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(latestMetrics.likes || 0).toLocaleString()}</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].likes || 0, sortedMetrics[1].likes || 0) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].likes || 0, sortedMetrics[1].likes || 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].likes || 0, sortedMetrics[1].likes || 0).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(latestMetrics.comments || 0).toLocaleString()}</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].comments || 0, sortedMetrics[1].comments || 0) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].comments || 0, sortedMetrics[1].comments || 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].comments || 0, sortedMetrics[1].comments || 0).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(post.total_engage || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ER: {post.er_percent?.toFixed(2) || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ข้อมูลโพสต์</CardTitle>
              <Link href={`/posts/${post.id}/edit`}>
                <Button size="sm" className="bg-[#FFFF00] text-black hover:bg-[#FFFF00]/90">
                  <Pencil className="mr-2 h-4 w-4" />
                  แก้ไข
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.post_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Post Name</p>
                <p className="font-semibold">{post.post_name}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Post ID</p>
              <p className="font-mono text-sm">{post.external_post_id || "-"}</p>
            </div>

            {post.url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">URL</p>
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {post.url}
                </a>
              </div>
            )}

            {post.kol_channels && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">KOL / Channel</p>
                <div className="space-y-1">
                  <Link href={`/kols/${post.kol_channels.kols?.id}`} className="hover:underline">
                    <p className="font-semibold">{post.kol_channels.kols?.name || "-"}</p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{post.kol_channels.channel_type || "-"}</Badge>
                    <span className="text-sm text-muted-foreground">@{post.kol_channels.handle || "-"}</span>
                  </div>
                  {post.kol_channels.follower_count && (
                    <p className="text-xs text-muted-foreground">
                      ผู้ติดตาม: {post.kol_channels.follower_count.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {post.campaigns && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">แคมเปญ</p>
                <div className="space-y-1">
                  <Link href={`/campaigns/${post.campaigns.id}`} className="hover:underline">
                    <p className="font-semibold">{post.campaigns.name}</p>
                  </Link>
                  {post.campaigns.projects && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        โปรเจกต์: {post.campaigns.projects.name || "-"}
                      </p>
                      {post.campaigns.projects.accounts && (
                        <p className="text-sm text-muted-foreground">
                          บัญชี: {post.campaigns.projects.accounts.name || "-"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {post.content_type && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ประเภทคอนเทนต์</p>
                <Badge>{post.content_type}</Badge>
              </div>
            )}

            {post.posted_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่โพสต์</p>
                <p className="font-semibold">
                  {new Date(post.posted_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {post.status && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">สถานะ</p>
                <Badge variant={post.status === "published" ? "default" : "secondary"}>
                  {post.status === "published" ? "เผยแพร่แล้ว" : post.status === "pending" ? "รอดำเนินการ" : "ถูกลบ"}
                </Badge>
              </div>
            )}

            {post.caption && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caption</p>
                <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
              </div>
            )}

            {post.hashtags && post.hashtags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {post.mentions && post.mentions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mentions</p>
                <div className="flex flex-wrap gap-1">
                  {post.mentions.map((mention: string, index: number) => (
                    <Badge key={index} variant="outline">
                      @{mention}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {post.remark && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remark</p>
                <p className="text-sm whitespace-pre-wrap">{post.remark}</p>
              </div>
            )}

            {post.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{post.notes}</p>
              </div>
            )}

            {post.screenshot_url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Screenshot</p>
                <a href={post.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {post.screenshot_url}
                </a>
              </div>
            )}

            {post.utm_params && Object.keys(post.utm_params).length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">UTM Parameters</p>
                <div className="space-y-1">
                  {Object.entries(post.utm_params).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{key}:</span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.created_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">สร้างเมื่อ</p>
                <p className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleString("th-TH")}</p>
              </div>
            )}

            {post.updated_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">อัพเดทเมื่อ</p>
                <p className="text-sm text-muted-foreground">{new Date(post.updated_at).toLocaleString("th-TH")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถิติ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Impressions</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Organic</p>
                    <p className="text-sm font-semibold">{(post.impressions_organic || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Boost</p>
                    <p className="text-sm font-semibold">{(post.impressions_boost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{(post.total_impressions || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reach</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Organic</p>
                    <p className="text-sm font-semibold">{(post.reach_organic || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Boost</p>
                    <p className="text-sm font-semibold">{(post.reach_boost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{(post.total_reach || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Engagement</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Shares</p>
                    <p className="text-sm font-semibold">{(post.shares || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saves</p>
                    <p className="text-sm font-semibold">{(post.saves || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Post Clicks</p>
                    <p className="text-sm font-semibold">{(post.post_clicks || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Link Clicks</p>
                    <p className="text-sm font-semibold">{(post.link_clicks || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Retweets</p>
                    <p className="text-sm font-semibold">{(post.retweets || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Views / VDO View</p>
                    <p className="text-sm font-semibold">{(post.views || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Cost Metrics</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">CPR</p>
                    <p className="text-sm font-semibold">฿{post.cpr?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CPE</p>
                    <p className="text-sm font-semibold">฿{post.cpe?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CPV</p>
                    <p className="text-sm font-semibold">฿{post.cpv?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Budget</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">KOL Budget</p>
                    <p className="text-sm font-semibold">฿{(post.kol_budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Boost Budget</p>
                    <p className="text-sm font-semibold">฿{(post.boost_budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Budget</p>
                    <p className="text-lg font-bold">฿{(post.total_budget || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics History */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>ประวัติสถิติ</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {sortedMetrics && sortedMetrics.length > 0 ? (
            <div className="space-y-4">
              {sortedMetrics.map((metric: any, index: number) => {
                const impressionsOrganic = metric.impressions_organic || 0
                const impressionsBoost = metric.impressions_boost || 0
                const totalImpressions = impressionsOrganic + impressionsBoost
                const reachOrganic = metric.reach_organic || 0
                const reachBoost = metric.reach_boost || 0
                const totalReach = reachOrganic + reachBoost
                const likes = metric.likes || 0
                const comments = metric.comments || 0
                const shares = metric.shares || 0
                const saves = metric.saves || 0
                const totalEngage = likes + comments + shares + saves
                const views = metric.views || 0
                const postClicks = metric.post_clicks || 0
                const linkClicks = metric.link_clicks || 0
                const retweets = metric.retweets || 0

                return (
                  <Card key={metric.id || index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {new Date(metric.captured_at || metric.recorded_at).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge variant="default" className="bg-blue-500">
                              ล่าสุด
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditStatsDialog(metric)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStats(metric.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Impressions */}
                        <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Impressions</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Organic:</span>
                              <span className="font-semibold">{impressionsOrganic.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Boost:</span>
                              <span className="font-semibold">{impressionsBoost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t">
                              <span className="font-medium">Total:</span>
                              <span className="font-bold text-blue-600">{totalImpressions.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reach */}
                        <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Reach</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Organic:</span>
                              <span className="font-semibold">{reachOrganic.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Boost:</span>
                              <span className="font-semibold">{reachBoost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t">
                              <span className="font-medium">Total:</span>
                              <span className="font-bold text-green-600">{totalReach.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Engagement */}
                        <div className="space-y-2 p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Engagement</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Likes:</span>
                              <span className="ml-1 font-semibold">{likes.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Comments:</span>
                              <span className="ml-1 font-semibold">{comments.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Shares:</span>
                              <span className="ml-1 font-semibold">{shares.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Saves:</span>
                              <span className="ml-1 font-semibold">{saves.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex justify-between pt-1 border-t">
                            <span className="font-medium">Total Engage:</span>
                            <span className="font-bold text-purple-600">{totalEngage.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Clicks & Views */}
                        <div className="space-y-2 p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Clicks & Views</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Post Clicks:</span>
                              <span className="font-semibold">{postClicks.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Link Clicks:</span>
                              <span className="font-semibold">{linkClicks.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Retweets:</span>
                              <span className="font-semibold">{retweets.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t">
                              <span className="text-muted-foreground">Views:</span>
                              <span className="font-bold text-orange-600">{views.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">ยังไม่มีประวัติสถิติ</p>
              <p className="text-sm mt-2">กดปุ่ม "เพิ่มสถิติ" เพื่อเพิ่มข้อมูลสถิติแรก</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMetric ? "แก้ไขสถิติ" : "เพิ่มสถิติ"}</DialogTitle>
            <DialogDescription>
              {editingMetric ? "แก้ไขสถิติสำหรับโพสต์นี้" : "เพิ่มสถิติใหม่สำหรับโพสต์นี้"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <Label htmlFor="captured_at">วันที่บันทึก</Label>
              <Input
                id="captured_at"
                type="datetime-local"
                value={statsForm.captured_at}
                onChange={(e) => setStatsForm({ ...statsForm, captured_at: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="impressions_organic">Impressions Organic</Label>
                <Input
                  id="impressions_organic"
                  type="number"
                  value={statsForm.impressions_organic}
                  onChange={(e) => setStatsForm({ ...statsForm, impressions_organic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="impressions_boost">Impressions Boost</Label>
                <Input
                  id="impressions_boost"
                  type="number"
                  value={statsForm.impressions_boost}
                  onChange={(e) => setStatsForm({ ...statsForm, impressions_boost: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reach_organic">Reach Organic</Label>
                <Input
                  id="reach_organic"
                  type="number"
                  value={statsForm.reach_organic}
                  onChange={(e) => setStatsForm({ ...statsForm, reach_organic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="reach_boost">Reach Boost</Label>
                <Input
                  id="reach_boost"
                  type="number"
                  value={statsForm.reach_boost}
                  onChange={(e) => setStatsForm({ ...statsForm, reach_boost: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  value={statsForm.likes}
                  onChange={(e) => setStatsForm({ ...statsForm, likes: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  type="number"
                  value={statsForm.comments}
                  onChange={(e) => setStatsForm({ ...statsForm, comments: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shares">Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  value={statsForm.shares}
                  onChange={(e) => setStatsForm({ ...statsForm, shares: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="saves">Saves</Label>
                <Input
                  id="saves"
                  type="number"
                  value={statsForm.saves}
                  onChange={(e) => setStatsForm({ ...statsForm, saves: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post_clicks">Post Clicks</Label>
                <Input
                  id="post_clicks"
                  type="number"
                  value={statsForm.post_clicks}
                  onChange={(e) => setStatsForm({ ...statsForm, post_clicks: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="link_clicks">Link Clicks</Label>
                <Input
                  id="link_clicks"
                  type="number"
                  value={statsForm.link_clicks}
                  onChange={(e) => setStatsForm({ ...statsForm, link_clicks: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="views">Views / VDO View</Label>
              <Input
                id="views"
                type="number"
                value={statsForm.views}
                onChange={(e) => setStatsForm({ ...statsForm, views: e.target.value })}
                placeholder="จำนวน views หรือ vdo views"
              />
            </div>

            <div>
              <Label htmlFor="retweets">Retweets</Label>
              <Input
                id="retweets"
                type="number"
                value={statsForm.retweets}
                onChange={(e) => setStatsForm({ ...statsForm, retweets: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setStatsDialogOpen(false)} disabled={isSaving}>
                ยกเลิก
              </Button>
              <Button onClick={handleSaveStats} disabled={isSaving}>
                {isSaving
                  ? editingMetric
                    ? "กำลังอัพเดท..."
                    : "กำลังบันทึก..."
                  : editingMetric
                    ? "อัพเดท"
                    : "บันทึก"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              ประวัติคอมเมนต์ ({totalComments})
            </div>
            {totalCommentsPages > 1 && (
              <div className="text-sm text-muted-foreground font-normal">
                หน้า {commentsPage} จาก {totalCommentsPages}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-6">
              {/* Comment Intention Summary */}
              {(() => {
                const intentionStats: Record<string, number> = {}
                post.comments.forEach((comment: any) => {
                  const intention = comment.post_intention || 'ไม่ระบุ'
                  intentionStats[intention] = (intentionStats[intention] || 0) + 1
                })
                
                const sortedStats = Object.entries(intentionStats)
                  .map(([intention, count]) => ({ intention, count }))
                  .sort((a, b) => b.count - a.count)

                return sortedStats.length > 0 && (
                  <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-900">สรุปเจตนาคอมเมนต์</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {sortedStats.map(({ intention, count }) => (
                        <div key={intention} className="bg-white rounded-lg p-3 shadow-sm border">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{count}</div>
                            <div className="text-xs text-gray-600 mt-1">{intention}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              ({((count / totalComments) * 100).toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      รวมคอมเมนต์ทั้งหมด: {totalComments} รายการ
                    </div>
                  </div>
                )
              })()}

              {/* Comments List */}
              <div className="space-y-4">
                {paginatedComments.map((comment: any, index: number) => (
                <div key={comment.id || (startIndex + index)} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author || 'ไม่ระบุผู้เขียน'}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp ? new Date(comment.timestamp).toLocaleString('th-TH') : ''}
                        </span>
                        {comment.like_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ❤️ {comment.like_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                      {comment.post_intention && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Intent: {comment.post_intention}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>

              {/* Comments Pagination */}
              {totalCommentsPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    แสดง {startIndex + 1} - {Math.min(endIndex, totalComments)} จาก {totalComments} คอมเมนต์
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCommentsPageChange(commentsPage - 1)}
                      disabled={commentsPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      ก่อนหน้า
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalCommentsPages) }, (_, i) => {
                        let pageNum
                        if (totalCommentsPages <= 5) {
                          pageNum = i + 1
                        } else if (commentsPage <= 3) {
                          pageNum = i + 1
                        } else if (commentsPage >= totalCommentsPages - 2) {
                          pageNum = totalCommentsPages - 4 + i
                        } else {
                          pageNum = commentsPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === commentsPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCommentsPageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCommentsPageChange(commentsPage + 1)}
                      disabled={commentsPage >= totalCommentsPages}
                    >
                      ถัดไป
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">ยังไม่มีคอมเมนต์สำหรับโพสต์นี้</p>
              <p className="text-sm mt-2">คอมเมนต์จะแสดงที่นี่เมื่อมีการ import ข้อมูล</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

