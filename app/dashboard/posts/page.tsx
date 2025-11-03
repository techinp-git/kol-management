"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Edit,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const mockPosts = [
  {
    id: "1",
    caption: "รีวิวสินค้าใหม่ล่าสุด! คุณภาพดีมาก แนะนำเลยค่ะ #review #beauty",
    url: "https://www.tiktok.com/@user/video/123456",
    posted_at: "2024-01-15T10:30:00Z",
    content_type: "Video",
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
    },
    post_metrics: {
      views: 1250000,
      likes: 85000,
      comments: 3200,
      shares: 12500,
      saves: 5600,
      engagement_rate: 8.5,
    },
  },
  {
    id: "2",
    caption: "New collection drop! 🔥 Link in bio for exclusive discount",
    url: "https://www.instagram.com/p/ABC123",
    posted_at: "2024-01-14T14:20:00Z",
    content_type: "Carousel",
    kol_channels: {
      id: "2",
      channel_type: "Instagram",
      handle: "fashionista_bkk",
      kols: {
        id: "2",
        name: "แฟชั่นนิสต้า BKK",
      },
    },
    campaigns: {
      id: "2",
      name: "Fashion Week Campaign",
    },
    post_metrics: {
      likes: 45000,
      comments: 890,
      saves: 3200,
      reach: 125000,
      impressions: 180000,
      engagement_rate: 6.2,
    },
  },
  {
    id: "3",
    caption: "สอนทำอาหารง่ายๆ ที่บ้าน ทำตามได้แน่นอน! 👨‍🍳",
    url: "https://www.youtube.com/watch?v=xyz789",
    posted_at: "2024-01-13T09:00:00Z",
    content_type: "Video",
    kol_channels: {
      id: "3",
      channel_type: "YouTube",
      handle: "cookingwithlove",
      kols: {
        id: "3",
        name: "Chef Love",
      },
    },
    campaigns: {
      id: "3",
      name: "Kitchen Appliance Promotion",
    },
    post_metrics: {
      views: 580000,
      likes: 32000,
      comments: 1850,
      shares: 4200,
      watch_time_hours: 12500,
      engagement_rate: 6.8,
    },
  },
  {
    id: "4",
    caption: "เปิดตัวสินค้าใหม่! มาดูกันว่าดีแค่ไหน พร้อมโปรโมชั่นพิเศษ",
    url: "https://www.facebook.com/post/456789",
    posted_at: "2024-01-12T16:45:00Z",
    content_type: "Video",
    kol_channels: {
      id: "4",
      channel_type: "Facebook",
      handle: "techreview.th",
      kols: {
        id: "4",
        name: "Tech Review TH",
      },
    },
    campaigns: {
      id: "1",
      name: "Tech Product Launch",
    },
    post_metrics: {
      views: 320000,
      reactions: 15000,
      comments: 680,
      shares: 2100,
      reach: 95000,
      engagement_rate: 5.5,
    },
  },
  {
    id: "5",
    caption: "Daily vlog: A day in my life 🌟 #lifestyle #vlog",
    url: "https://www.tiktok.com/@user/video/789012",
    posted_at: "2024-01-11T12:00:00Z",
    content_type: "Video",
    kol_channels: {
      id: "5",
      channel_type: "TikTok",
      handle: "lifestyle_diary",
      kols: {
        id: "5",
        name: "Lifestyle Diary",
      },
    },
    campaigns: {
      id: "2",
      name: "Lifestyle Brand Partnership",
    },
    post_metrics: {
      views: 890000,
      likes: 62000,
      comments: 2100,
      shares: 8500,
      saves: 4200,
      engagement_rate: 8.6,
    },
  },
  {
    id: "6",
    caption: "Fitness tips for beginners 💪 Save this for later!",
    url: "https://www.instagram.com/reel/DEF456",
    posted_at: "2024-01-10T07:30:00Z",
    content_type: "Reel",
    kol_channels: {
      id: "6",
      channel_type: "Instagram",
      handle: "fitlife_coach",
      kols: {
        id: "6",
        name: "Fit Life Coach",
      },
    },
    campaigns: {
      id: "3",
      name: "Fitness Equipment Campaign",
    },
    post_metrics: {
      views: 420000,
      likes: 38000,
      comments: 1200,
      saves: 8900,
      reach: 180000,
      impressions: 250000,
      watch_time_hours: 12500,
      engagement_rate: 11.2,
    },
  },
]

function getChannelBadgeColor(channelType: string) {
  switch (channelType) {
    case "TikTok":
      return "bg-pink-500 text-white hover:bg-pink-600 border-pink-600"
    case "Instagram":
      return "bg-purple-500 text-white hover:bg-purple-600 border-purple-600"
    case "YouTube":
      return "bg-red-500 text-white hover:bg-red-600 border-red-600"
    case "Facebook":
      return "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
    default:
      return "bg-gray-500 text-white hover:bg-gray-600 border-gray-600"
  }
}

function renderMetrics(channelType: string, metrics: any) {
  switch (channelType) {
    case "TikTok":
      return (
        <>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <p className="text-xs">Views</p>
            </div>
            <p className="font-semibold">{metrics.views?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-3 w-3" />
              <p className="text-xs">Likes</p>
            </div>
            <p className="font-semibold">{metrics.likes?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <p className="text-xs">Comments</p>
            </div>
            <p className="font-semibold">{metrics.comments?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Share2 className="h-3 w-3" />
              <p className="text-xs">Shares</p>
            </div>
            <p className="font-semibold">{metrics.shares?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              <p className="text-xs">Saves</p>
            </div>
            <p className="font-semibold">{metrics.saves?.toLocaleString() || 0}</p>
          </div>
        </>
      )
    case "Instagram":
      return (
        <>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-3 w-3" />
              <p className="text-xs">Likes</p>
            </div>
            <p className="font-semibold">{metrics.likes?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <p className="text-xs">Comments</p>
            </div>
            <p className="font-semibold">{metrics.comments?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              <p className="text-xs">Saves</p>
            </div>
            <p className="font-semibold">{metrics.saves?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <p className="text-xs">Reach</p>
            </div>
            <p className="font-semibold">{metrics.reach?.toLocaleString() || 0}</p>
          </div>
        </>
      )
    case "YouTube":
      return (
        <>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Play className="h-3 w-3" />
              <p className="text-xs">Views</p>
            </div>
            <p className="font-semibold">{metrics.views?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-3 w-3" />
              <p className="text-xs">Likes</p>
            </div>
            <p className="font-semibold">{metrics.likes?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <p className="text-xs">Comments</p>
            </div>
            <p className="font-semibold">{metrics.comments?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Share2 className="h-3 w-3" />
              <p className="text-xs">Shares</p>
            </div>
            <p className="font-semibold">{metrics.shares?.toLocaleString() || 0}</p>
          </div>
        </>
      )
    case "Facebook":
      return (
        <>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <p className="text-xs">Views</p>
            </div>
            <p className="font-semibold">{metrics.views?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-3 w-3" />
              <p className="text-xs">Reactions</p>
            </div>
            <p className="font-semibold">{metrics.reactions?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <p className="text-xs">Comments</p>
            </div>
            <p className="font-semibold">{metrics.comments?.toLocaleString() || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Share2 className="h-3 w-3" />
              <p className="text-xs">Shares</p>
            </div>
            <p className="font-semibold">{metrics.shares?.toLocaleString() || 0}</p>
          </div>
        </>
      )
    default:
      return null
  }
}

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [statsForm, setStatsForm] = useState({
    capturedDate: new Date().toISOString().split("T")[0],
    capturedTime: new Date().toTimeString().slice(0, 5),
    views: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    reactions: "",
    reach: "",
    impressions: "",
    watch_time_hours: "",
  })

  const filteredPosts = mockPosts.filter(
    (post) =>
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.kol_channels?.kols?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.kol_channels?.channel_type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openStatsDialog = (post: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedPost(post)
    const now = new Date()
    setStatsForm({
      capturedDate: now.toISOString().split("T")[0],
      capturedTime: now.toTimeString().slice(0, 5),
      views: post.post_metrics.views?.toString() || "",
      likes: post.post_metrics.likes?.toString() || "",
      comments: post.post_metrics.comments?.toString() || "",
      shares: post.post_metrics.shares?.toString() || "",
      saves: post.post_metrics.saves?.toString() || "",
      reactions: post.post_metrics.reactions?.toString() || "",
      reach: post.post_metrics.reach?.toString() || "",
      impressions: post.post_metrics.impressions?.toString() || "",
      watch_time_hours: post.post_metrics.watch_time_hours?.toString() || "",
    })
    setStatsDialogOpen(true)
  }

  const handleSaveStats = () => {
    console.log("[v0] Saving statistics for post:", selectedPost?.id, statsForm)
    setStatsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">โพสต์</h1>
          <p className="text-muted-foreground">จัดการโพสต์และสถิติ Engagement แยกตามแต่ละ Channel</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มโพสต์
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาโพสต์ตาม KOL, Channel หรือเนื้อหา..."
          className="pl-10 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={post.id} className="group overflow-hidden transition-all hover:shadow-md border-2">
              <Link href={`/dashboard/posts/${post.id}`}>
                <CardContent className="p-6 space-y-4">
                  {/* Header Section */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-lg">{post.kol_channels?.kols?.name}</span>
                    <Badge className={getChannelBadgeColor(post.kol_channels?.channel_type)}>
                      {post.kol_channels?.channel_type}
                    </Badge>
                    <Badge variant="outline" className="font-medium border-2">
                      {post.content_type}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">@{post.kol_channels?.handle}</span>
                  </div>

                  {/* Caption */}
                  {post.caption && <p className="line-clamp-2 text-sm leading-relaxed">{post.caption}</p>}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {post.campaigns && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{post.campaigns.name}</span>
                      </div>
                    )}
                    {post.posted_at && (
                      <span className="font-medium text-muted-foreground">
                        {new Date(post.posted_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Engagement Rate Highlight */}
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 border-2 border-primary/30 p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-bold">Engagement Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {post.post_metrics.engagement_rate?.toFixed(2)}%
                    </span>
                  </div>

                  {/* Metrics Grid - Now at the bottom */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {post.kol_channels?.channel_type === "TikTok" && (
                      <>
                        <MetricCard icon={Eye} label="Views" value={post.post_metrics.views} />
                        <MetricCard icon={Heart} label="Likes" value={post.post_metrics.likes} />
                        <MetricCard icon={MessageCircle} label="Comments" value={post.post_metrics.comments} />
                        <MetricCard icon={Share2} label="Shares" value={post.post_metrics.shares} />
                        <MetricCard icon={Bookmark} label="Saves" value={post.post_metrics.saves} />
                      </>
                    )}
                    {post.kol_channels?.channel_type === "Instagram" && (
                      <>
                        <MetricCard icon={Heart} label="Likes" value={post.post_metrics.likes} />
                        <MetricCard icon={MessageCircle} label="Comments" value={post.post_metrics.comments} />
                        <MetricCard icon={Bookmark} label="Saves" value={post.post_metrics.saves} />
                        <MetricCard icon={Eye} label="Reach" value={post.post_metrics.reach} />
                      </>
                    )}
                    {post.kol_channels?.channel_type === "YouTube" && (
                      <>
                        <MetricCard icon={Play} label="Views" value={post.post_metrics.views} />
                        <MetricCard icon={Heart} label="Likes" value={post.post_metrics.likes} />
                        <MetricCard icon={MessageCircle} label="Comments" value={post.post_metrics.comments} />
                        <MetricCard icon={Share2} label="Shares" value={post.post_metrics.shares} />
                      </>
                    )}
                    {post.kol_channels?.channel_type === "Facebook" && (
                      <>
                        <MetricCard icon={Eye} label="Views" value={post.post_metrics.views} />
                        <MetricCard icon={Heart} label="Reactions" value={post.post_metrics.reactions} />
                        <MetricCard icon={MessageCircle} label="Comments" value={post.post_metrics.comments} />
                        <MetricCard icon={Share2} label="Shares" value={post.post_metrics.shares} />
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 font-medium bg-transparent"
                      onClick={(e) => openStatsDialog(post, e)}
                    >
                      <Edit className="mr-2 h-3.5 w-3.5" />
                      แก้ไขสถิติ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 bg-transparent"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto max-w-sm space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{searchQuery ? "ไม่พบโพสต์ที่ค้นหา" : "ยังไม่มีโพสต์"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "ลองค้นหาด้วยคำอื่นหรือเพิ่มโพสต์ใหม่" : "เริ่มต้นด้วยการเพิ่มโพสต์แรกของคุณ"}
                  </p>
                </div>
                {!searchQuery && (
                  <Link href="/dashboard/posts/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่มโพสต์แรก
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-pink-200 bg-pink-50 p-4 dark:border-pink-900/50 dark:bg-pink-900/10">
              <h4 className="mb-2 font-semibold text-pink-700 dark:text-pink-400">TikTok</h4>
              <p className="text-sm text-muted-foreground">Views, Likes, Comments, Shares, Saves, Engagement Rate</p>
            </div>
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-900/10">
              <h4 className="mb-2 font-semibold text-purple-700 dark:text-purple-400">Instagram</h4>
              <p className="text-sm text-muted-foreground">
                Likes, Comments, Saves, Reach, Impressions, Engagement Rate
              </p>
            </div>
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
              <h4 className="mb-2 font-semibold text-red-700 dark:text-red-400">YouTube</h4>
              <p className="text-sm text-muted-foreground">
                Views, Likes, Comments, Shares, Watch Time, Engagement Rate
              </p>
            </div>
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/10">
              <h4 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">Facebook</h4>
              <p className="text-sm text-muted-foreground">
                Views, Reactions, Comments, Shares, Reach, Engagement Rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>แก้ไขสถิติโพสต์</DialogTitle>
            <DialogDescription>
              {selectedPost?.kol_channels?.kols?.name} • {selectedPost?.kol_channels?.channel_type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="capturedDate">วันที่บันทึก</Label>
                <Input
                  id="capturedDate"
                  type="date"
                  value={statsForm.capturedDate}
                  onChange={(e) => setStatsForm({ ...statsForm, capturedDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capturedTime">เวลา</Label>
                <Input
                  id="capturedTime"
                  type="time"
                  value={statsForm.capturedTime}
                  onChange={(e) => setStatsForm({ ...statsForm, capturedTime: e.target.value })}
                />
              </div>
            </div>

            {selectedPost?.kol_channels?.channel_type === "TikTok" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    type="number"
                    value={statsForm.views}
                    onChange={(e) => setStatsForm({ ...statsForm, views: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={statsForm.likes}
                    onChange={(e) => setStatsForm({ ...statsForm, likes: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    value={statsForm.comments}
                    onChange={(e) => setStatsForm({ ...statsForm, comments: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={statsForm.shares}
                    onChange={(e) => setStatsForm({ ...statsForm, shares: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="saves">Saves</Label>
                  <Input
                    id="saves"
                    type="number"
                    value={statsForm.saves}
                    onChange={(e) => setStatsForm({ ...statsForm, saves: e.target.value })}
                  />
                </div>
              </>
            )}
            {selectedPost?.kol_channels?.channel_type === "Instagram" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={statsForm.likes}
                    onChange={(e) => setStatsForm({ ...statsForm, likes: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    value={statsForm.comments}
                    onChange={(e) => setStatsForm({ ...statsForm, comments: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="saves">Saves</Label>
                  <Input
                    id="saves"
                    type="number"
                    value={statsForm.saves}
                    onChange={(e) => setStatsForm({ ...statsForm, saves: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reach">Reach</Label>
                  <Input
                    id="reach"
                    type="number"
                    value={statsForm.reach}
                    onChange={(e) => setStatsForm({ ...statsForm, reach: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="impressions">Impressions</Label>
                  <Input
                    id="impressions"
                    type="number"
                    value={statsForm.impressions}
                    onChange={(e) => setStatsForm({ ...statsForm, impressions: e.target.value })}
                  />
                </div>
              </>
            )}
            {selectedPost?.kol_channels?.channel_type === "YouTube" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    type="number"
                    value={statsForm.views}
                    onChange={(e) => setStatsForm({ ...statsForm, views: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={statsForm.likes}
                    onChange={(e) => setStatsForm({ ...statsForm, likes: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    value={statsForm.comments}
                    onChange={(e) => setStatsForm({ ...statsForm, comments: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={statsForm.shares}
                    onChange={(e) => setStatsForm({ ...statsForm, shares: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="watch_time_hours">Watch Time (hours)</Label>
                  <Input
                    id="watch_time_hours"
                    type="number"
                    value={statsForm.watch_time_hours}
                    onChange={(e) => setStatsForm({ ...statsForm, watch_time_hours: e.target.value })}
                  />
                </div>
              </>
            )}
            {selectedPost?.kol_channels?.channel_type === "Facebook" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    type="number"
                    value={statsForm.views}
                    onChange={(e) => setStatsForm({ ...statsForm, views: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reactions">Reactions</Label>
                  <Input
                    id="reactions"
                    type="number"
                    value={statsForm.reactions}
                    onChange={(e) => setStatsForm({ ...statsForm, reactions: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    value={statsForm.comments}
                    onChange={(e) => setStatsForm({ ...statsForm, comments: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={statsForm.shares}
                    onChange={(e) => setStatsForm({ ...statsForm, shares: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reach">Reach</Label>
                  <Input
                    id="reach"
                    type="number"
                    value={statsForm.reach}
                    onChange={(e) => setStatsForm({ ...statsForm, reach: e.target.value })}
                  />
                </div>
              </>
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

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value?: number }) {
  return (
    <div className="rounded-lg bg-card border-2 p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-bold">{label}</p>
      </div>
      <p className="text-base font-bold">{value?.toLocaleString() || 0}</p>
    </div>
  )
}
