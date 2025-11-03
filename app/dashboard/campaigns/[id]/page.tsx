"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Target,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  ExternalLink,
  Edit,
  MessageSquare,
  Star,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)

  const campaignData: Record<string, any> = {
    "1": {
      id: "1",
      name: "แคมเปญเปิดตัวสินค้าใหม่",
      start_date: "2024-03-01",
      end_date: "2024-03-31",
      budget: 500000,
      status: "active",
      objective: "เพิ่มการรับรู้แบรนด์และสร้าง Engagement กับกลุ่มเป้าหมาย",
      channels: ["Instagram", "TikTok", "Facebook"],
      notes: "เน้นการสร้างคอนเทนต์ที่มีความคิดสร้างสรรค์และเข้าถึงกลุ่มเป้าหมายวัยรุ่น",
      created_at: "2024-02-15",
      projects: {
        id: "1",
        name: "โปรเจกต์ Q1 2024",
        accounts: {
          id: "1",
          name: "บริษัท เทคโนโลยี จำกัด",
          currency: "THB",
        },
      },
      memo_logs: [
        {
          id: "1",
          content: "เริ่มแคมเปญเป็นที่เรียบร้อย KOL ทุกคนตอบรับดี",
          rating: 5,
          created_by: "สมชาย ผู้จัดการ",
          created_at: "2024-03-01T10:00:00",
        },
        {
          id: "2",
          content: "โพสต์แรกได้รับ engagement ดีมาก เกินคาด 20%",
          rating: 5,
          created_by: "สมหญิง ผู้ประสานงาน",
          created_at: "2024-03-05T15:30:00",
        },
        {
          id: "3",
          content: "มี KOL 1 คนขอเลื่อนโพสต์ออกไป 2 วัน",
          rating: 3,
          created_by: "ปิยะ ผู้ช่วย",
          created_at: "2024-03-10T09:15:00",
        },
      ],
      campaign_kols: [
        {
          id: "1",
          allocated_budget: 150000,
          status: "active",
          kols: {
            id: "1",
            name: "สมชาย ใจดี",
            handle: "somchai_tech",
          },
          kol_channels: {
            id: "1",
            channel_type: "Instagram",
            handle: "somchai_tech",
            follower_count: 250000,
          },
        },
        {
          id: "2",
          allocated_budget: 120000,
          status: "active",
          kols: {
            id: "2",
            name: "สมหญิง รักเทค",
            handle: "somying_review",
          },
          kol_channels: {
            id: "2",
            channel_type: "TikTok",
            handle: "somying_review",
            follower_count: 180000,
          },
        },
        {
          id: "3",
          allocated_budget: 100000,
          status: "active",
          kols: {
            id: "3",
            name: "ปิยะ เทคโนโลยี",
            handle: "piya_gadget",
          },
          kol_channels: {
            id: "3",
            channel_type: "Instagram",
            handle: "piya_gadget",
            follower_count: 150000,
          },
        },
      ],
      posts: [
        {
          id: "1",
          title: "รีวิวสินค้าใหม่ล่าสุด",
          post_url: "https://instagram.com/p/abc123",
          post_type: "Reel",
          channel: "Instagram",
          published_date: "2024-03-05",
          kol_name: "สมชาย ใจดี",
          kol_id: "1",
          engagement: {
            views: 85000,
            likes: 12500,
            comments: 450,
            shares: 320,
          },
        },
        {
          id: "2",
          title: "Unboxing Experience",
          post_url: "https://tiktok.com/@somying_review/video/xyz789",
          post_type: "Video",
          channel: "TikTok",
          published_date: "2024-03-08",
          kol_name: "สมหญิง รักเทค",
          kol_id: "2",
          engagement: {
            views: 120000,
            likes: 18500,
            comments: 680,
            shares: 520,
            saves: 3200,
          },
        },
        {
          id: "3",
          title: "เปรียบเทียบกับคู่แข่ง",
          post_url: "https://instagram.com/p/def456",
          post_type: "Carousel",
          channel: "Instagram",
          published_date: "2024-03-12",
          kol_name: "ปิยะ เทคโนโลยี",
          kol_id: "3",
          engagement: {
            views: 65000,
            likes: 9800,
            comments: 320,
            shares: 180,
          },
        },
      ],
    },
  }

  const campaign = campaignData[id]

  if (!campaign) {
    notFound()
  }

  const totalAllocated = campaign.campaign_kols?.reduce((sum: number, ck: any) => sum + (ck.allocated_budget || 0), 0)
  const totalEngagement = campaign.posts?.reduce((sum: number, post: any) => {
    return sum + (post.engagement.views || 0)
  }, 0)
  const totalLikes = campaign.posts?.reduce((sum: number, post: any) => {
    return sum + (post.engagement.likes || 0)
  }, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">ใช้งาน</Badge>
      case "inactive":
        return <Badge variant="secondary">ไม่ใช้งาน</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">
              <Link href={`/dashboard/projects/${campaign.projects?.id}`} className="hover:underline font-medium">
                {campaign.projects?.name}
              </Link>
              {" • "}
              <Link href={`/dashboard/accounts/${campaign.projects?.accounts?.id}`} className="hover:underline">
                {campaign.projects?.accounts?.name}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(campaign.status)}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/campaigns/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            เปลี่ยนสถานะ
          </Button>
          <Button variant="outline" onClick={() => setMemoDialogOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            เพิ่ม Memo Log
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งบประมาณรวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.budget?.toLocaleString() || 0} ฿</p>
            <p className="text-xs text-muted-foreground">จัดสรรแล้ว: {totalAllocated?.toLocaleString() || 0} ฿</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ระยะเวลา</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {campaign.start_date &&
                new Date(campaign.start_date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
            </p>
            <p className="text-xs text-muted-foreground">
              ถึง{" "}
              {campaign.end_date
                ? new Date(campaign.end_date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KOL</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.campaign_kols?.length || 0}</p>
            <p className="text-xs text-muted-foreground">{campaign.posts?.length || 0} โพสต์</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEngagement?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">{totalLikes?.toLocaleString() || 0} Likes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดแคมเปญ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.objective && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">วัตถุประสงค์</p>
              <p className="mt-1">{campaign.objective}</p>
            </div>
          )}

          {campaign.channels && campaign.channels.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ช่องทางที่ใช้</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {campaign.channels.map((channel: string) => (
                  <Badge key={channel} variant="secondary">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {campaign.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">หมายเหตุ</p>
              <p className="mt-1 text-sm text-muted-foreground">{campaign.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>KOL ที่เลือก</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {campaign.campaign_kols && campaign.campaign_kols.length > 0 ? (
            <div className="space-y-3">
              {campaign.campaign_kols.map((ck: any) => (
                <Card key={ck.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {ck.kols?.name?.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/dashboard/kols/${ck.kols?.id}`}>
                          <h4 className="font-semibold hover:underline">{ck.kols?.name}</h4>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{ck.kol_channels?.channel_type}</Badge>
                          <span>@{ck.kol_channels?.handle}</span>
                          <span>•</span>
                          <span>{ck.kol_channels?.follower_count?.toLocaleString()} followers</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ck.allocated_budget && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">งบประมาณ</p>
                          <p className="font-semibold">
                            {ck.allocated_budget.toLocaleString()} {campaign.projects?.accounts?.currency}
                          </p>
                        </div>
                      )}
                      <Badge variant="secondary">{ck.status === "active" ? "ใช้งาน" : ck.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : campaign.posts && campaign.posts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">ตรวจพบ KOL จากโพสต์ (ยังไม่ได้เพิ่มในแคมเปญ)</p>
              {Array.from(new Set(campaign.posts.map((p: any) => p.kol_id))).map((kolId: any) => {
                const post = campaign.posts.find((p: any) => p.kol_id === kolId)
                return (
                  <Card key={kolId} className="border-dashed">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {post.kol_name?.charAt(0)}
                        </div>
                        <div>
                          <Link href={`/dashboard/kols/${kolId}`}>
                            <h4 className="font-semibold hover:underline">{post.kol_name}</h4>
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{post.channel}</Badge>
                            <span>มี {campaign.posts.filter((p: any) => p.kol_id === kolId).length} โพสต์</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/campaigns/${id}/edit`}>เพิ่มใน Campaign</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มี KOL</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>โพสต์ทั้งหมด</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {campaign.posts && campaign.posts.length > 0 ? (
            <div className="space-y-3">
              {campaign.posts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/posts/${post.id}`}>
                            <h4 className="font-semibold hover:underline">{post.title}</h4>
                          </Link>
                          <Badge variant="outline">{post.post_type}</Badge>
                          <Badge variant="secondary">{post.channel}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link href={`/dashboard/kols/${post.kol_id}`} className="hover:underline">
                            {post.kol_name}
                          </Link>
                          <span>•</span>
                          <span>
                            {new Date(post.published_date).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <a
                            href={post.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline"
                          >
                            ดูโพสต์ <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {post.engagement.views?.toLocaleString()}
                            </span>{" "}
                            Views
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {post.engagement.likes?.toLocaleString()}
                            </span>{" "}
                            Likes
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {post.engagement.comments?.toLocaleString()}
                            </span>{" "}
                            Comments
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {post.engagement.shares?.toLocaleString()}
                            </span>{" "}
                            Shares
                          </span>
                          {post.engagement.saves && (
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                {post.engagement.saves?.toLocaleString()}
                              </span>{" "}
                              Saves
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">ยังไม่มีโพสต์</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Memo Log</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setMemoDialogOpen(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              เพิ่มบันทึก
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaign.memo_logs && campaign.memo_logs.length > 0 ? (
            <div className="space-y-4">
              {campaign.memo_logs.map((log: any) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm">{log.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{log.created_by}</span>
                          <span>•</span>
                          <span>
                            {new Date(log.created_at).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < log.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">ยังไม่มีบันทึก</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะแคมเปญ</DialogTitle>
            <DialogDescription>เปลี่ยนสถานะของ {campaign.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select defaultValue={campaign.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>เหตุผล</Label>
              <Textarea placeholder="ระบุเหตุผลในการเปลี่ยนสถานะ..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={() => setStatusDialogOpen(false)}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={memoDialogOpen} onOpenChange={setMemoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Memo Log</DialogTitle>
            <DialogDescription>เพิ่มบันทึกการทำงานสำหรับ {campaign.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>บันทึก</Label>
              <Textarea placeholder="เขียนบันทึกการทำงาน..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>ให้คะแนน</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= selectedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemoDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={() => setMemoDialogOpen(false)}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
