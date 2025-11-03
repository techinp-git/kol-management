"use client"

import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, MessageSquare, Plus, ArrowUpRight, ArrowDownRight, Pencil } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const mockPostsData: any = {
  "1": {
    id: "1",
    caption: "รีวิวสินค้าใหม่ล่าสุด! คุณภาพดีมาก แนะนำเลยค่ะ #review #beauty",
    url: "https://www.tiktok.com/@user/video/123456",
    posted_at: "2024-01-15T10:30:00Z",
    content_type: "Video",
    external_post_id: "123456",
    kol_channels: {
      id: "1",
      channel_type: "TikTok",
      handle: "beautyqueen_th",
      kols: {
        id: "1",
        name: "สาวสวย Beauty",
      },
    },
    campaigns: {
      id: "1",
      name: "Beauty Product Launch Q1",
      projects: {
        accounts: {
          name: "Beauty Brand Co.",
        },
      },
    },
    post_metrics: [
      {
        id: "1-1",
        captured_at: "2024-01-20T10:00:00Z",
        views: 1250000,
        likes: 85000,
        comments: 3200,
        shares: 12500,
        saves: 5600,
        engagement_rate: 8.5,
      },
      {
        id: "1-2",
        captured_at: "2024-01-18T10:00:00Z",
        views: 980000,
        likes: 72000,
        comments: 2800,
        shares: 10200,
        saves: 4800,
        engagement_rate: 9.2,
      },
      {
        id: "1-3",
        captured_at: "2024-01-16T10:00:00Z",
        views: 650000,
        likes: 48000,
        comments: 1900,
        shares: 6800,
        saves: 3200,
        engagement_rate: 9.3,
      },
    ],
    comments: [
      {
        id: "c1",
        author: "user123",
        text: "สินค้าดีมากค่ะ ใช้แล้วชอบ",
        timestamp: "2024-01-15T11:00:00Z",
        like_count: 45,
      },
      {
        id: "c2",
        author: "beauty_lover",
        text: "ซื้อที่ไหนได้บ้างคะ",
        timestamp: "2024-01-15T12:30:00Z",
        like_count: 23,
      },
    ],
  },
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const post = mockPostsData[id]

  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [statsForm, setStatsForm] = useState({
    views: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
  })

  if (!post) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">ไม่พบโพสต์</p>
      </div>
    )
  }

  const latestMetrics = post.post_metrics?.[0]
  const sortedMetrics = post.post_metrics?.sort(
    (a: any, b: any) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
  )

  const openAddStatsDialog = () => {
    setStatsForm({
      views: "",
      likes: "",
      comments: "",
      shares: "",
      saves: "",
    })
    setStatsDialogOpen(true)
  }

  const handleSaveStats = () => {
    console.log("[v0] Adding new statistics:", statsForm)
    setStatsDialogOpen(false)
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href={`/dashboard/kols/${post.kol_channels?.kols?.id}`} className="hover:underline">
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
            <p className="text-2xl font-bold">{latestMetrics?.views?.toLocaleString() || 0}</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].views, sortedMetrics[1].views) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].views, sortedMetrics[1].views).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].views, sortedMetrics[1].views).toFixed(1)}%
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
            <p className="text-2xl font-bold">{latestMetrics?.likes?.toLocaleString() || 0}</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].likes, sortedMetrics[1].likes) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].likes, sortedMetrics[1].likes).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].likes, sortedMetrics[1].likes).toFixed(1)}%
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
            <p className="text-2xl font-bold">{latestMetrics?.comments?.toLocaleString() || 0}</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].comments, sortedMetrics[1].comments) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].comments, sortedMetrics[1].comments).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].comments, sortedMetrics[1].comments).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{latestMetrics?.engagement_rate?.toFixed(2) || 0}%</p>
            {sortedMetrics && sortedMetrics.length > 1 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {calculateChange(sortedMetrics[0].engagement_rate, sortedMetrics[1].engagement_rate) > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{calculateChange(sortedMetrics[0].engagement_rate, sortedMetrics[1].engagement_rate).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      {calculateChange(sortedMetrics[0].engagement_rate, sortedMetrics[1].engagement_rate).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ข้อมูลโพสต์</CardTitle>
              <Link href={`/dashboard/posts/${id}/edit`}>
                <Button size="sm" className="bg-[#FFFF00] text-black hover:bg-[#FFFF00]/90">
                  <Pencil className="mr-2 h-4 w-4" />
                  แก้ไข
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Post ID</p>
              <p className="font-mono text-sm">{post.external_post_id}</p>
            </div>

            {post.campaigns && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">แคมเปญ</p>
                <Link href={`/dashboard/campaigns/${post.campaigns.id}`} className="hover:underline">
                  <p className="font-semibold">{post.campaigns.name}</p>
                </Link>
                <p className="text-sm text-muted-foreground">{post.campaigns.projects?.accounts?.name}</p>
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
                <p className="font-semibold">{new Date(post.posted_at).toLocaleString("th-TH")}</p>
              </div>
            )}

            {post.caption && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caption</p>
                <p className="text-sm">{post.caption}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>สถิติเพิ่มเติม</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestMetrics?.views && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-semibold">{latestMetrics.views.toLocaleString()}</span>
              </div>
            )}
            {latestMetrics?.reach && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reach</span>
                <span className="font-semibold">{latestMetrics.reach.toLocaleString()}</span>
              </div>
            )}
            {latestMetrics?.impressions && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Impressions</span>
                <span className="font-semibold">{latestMetrics.impressions.toLocaleString()}</span>
              </div>
            )}
            {latestMetrics?.saves && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Saves</span>
                <span className="font-semibold">{latestMetrics.saves.toLocaleString()}</span>
              </div>
            )}
            {latestMetrics?.ctr && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CTR</span>
                <span className="font-semibold">{latestMetrics.ctr.toFixed(2)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {sortedMetrics && sortedMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติสถิติ (เรียงจากล่าสุด)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedMetrics.map((metric: any, index: number) => {
                const previousMetric = sortedMetrics[index + 1]
                return (
                  <div key={metric.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">
                        {new Date(metric.captured_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </span>
                      {index === 0 && <Badge variant="secondary">ล่าสุด</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-semibold">{metric.views?.toLocaleString()}</p>
                        {previousMetric && (
                          <p
                            className={`text-xs ${calculateChange(metric.views, previousMetric.views) > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {calculateChange(metric.views, previousMetric.views) > 0 ? "+" : ""}
                            {calculateChange(metric.views, previousMetric.views).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Likes</p>
                        <p className="font-semibold">{metric.likes?.toLocaleString()}</p>
                        {previousMetric && (
                          <p
                            className={`text-xs ${calculateChange(metric.likes, previousMetric.likes) > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {calculateChange(metric.likes, previousMetric.likes) > 0 ? "+" : ""}
                            {calculateChange(metric.likes, previousMetric.likes).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Comments</p>
                        <p className="font-semibold">{metric.comments?.toLocaleString()}</p>
                        {previousMetric && (
                          <p
                            className={`text-xs ${calculateChange(metric.comments, previousMetric.comments) > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {calculateChange(metric.comments, previousMetric.comments) > 0 ? "+" : ""}
                            {calculateChange(metric.comments, previousMetric.comments).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Shares</p>
                        <p className="font-semibold">{metric.shares?.toLocaleString()}</p>
                        {previousMetric && (
                          <p
                            className={`text-xs ${calculateChange(metric.shares, previousMetric.shares) > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {calculateChange(metric.shares, previousMetric.shares) > 0 ? "+" : ""}
                            {calculateChange(metric.shares, previousMetric.shares).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">ER%</p>
                        <p className="font-semibold">{metric.engagement_rate?.toFixed(2)}%</p>
                        {previousMetric && (
                          <p
                            className={`text-xs ${calculateChange(metric.engagement_rate, previousMetric.engagement_rate) > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {calculateChange(metric.engagement_rate, previousMetric.engagement_rate) > 0 ? "+" : ""}
                            {calculateChange(metric.engagement_rate, previousMetric.engagement_rate).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>คอมเมนต์</CardTitle>
            </div>
            <Badge variant="secondary">{post.comments?.length || 0} คอมเมนต์</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.slice(0, 5).map((comment: any) => (
                <div key={comment.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{comment.author}</p>
                      <p className="mt-1 text-sm">{comment.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  {comment.like_count > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">{comment.like_count} likes</p>
                  )}
                </div>
              ))}
              {post.comments.length > 5 && (
                <Link href={`/dashboard/comments?post_id=${post.id}`}>
                  <p className="text-center text-sm text-primary hover:underline">
                    ดูคอมเมนต์ทั้งหมด ({post.comments.length})
                  </p>
                </Link>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีคอมเมนต์</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>เพิ่มสถิติใหม่</DialogTitle>
            <DialogDescription>บันทึกสถิติปัจจุบันของโพสต์</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="views">Views</Label>
              <Input
                id="views"
                type="number"
                value={statsForm.views}
                onChange={(e) => setStatsForm({ ...statsForm, views: e.target.value })}
                placeholder={latestMetrics?.views?.toString()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="likes">Likes</Label>
              <Input
                id="likes"
                type="number"
                value={statsForm.likes}
                onChange={(e) => setStatsForm({ ...statsForm, likes: e.target.value })}
                placeholder={latestMetrics?.likes?.toString()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comments">Comments</Label>
              <Input
                id="comments"
                type="number"
                value={statsForm.comments}
                onChange={(e) => setStatsForm({ ...statsForm, comments: e.target.value })}
                placeholder={latestMetrics?.comments?.toString()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                value={statsForm.shares}
                onChange={(e) => setStatsForm({ ...statsForm, shares: e.target.value })}
                placeholder={latestMetrics?.shares?.toString()}
              />
            </div>
            {post.kol_channels?.channel_type === "TikTok" && (
              <div className="grid gap-2">
                <Label htmlFor="saves">Saves</Label>
                <Input
                  id="saves"
                  type="number"
                  value={statsForm.saves}
                  onChange={(e) => setStatsForm({ ...statsForm, saves: e.target.value })}
                  placeholder={latestMetrics?.saves?.toString()}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStatsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleSaveStats}>บันทึก</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
