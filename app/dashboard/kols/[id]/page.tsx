"use client"

import { useState, use } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Mail, Phone, Globe, TrendingUp, TrendingDown, Plus, ExternalLink, Star, FileText } from "lucide-react"
import Link from "next/link"

type KOLStatus = "active" | "inactive" | "draft" | "ban"

export default function KOLDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [newFollowerCount, setNewFollowerCount] = useState("")
  const [newHistoryDate, setNewHistoryDate] = useState("")

  const [currentStatus, setCurrentStatus] = useState<KOLStatus>("active")
  const [newStatus, setNewStatus] = useState<KOLStatus>("active")
  const [statusChangeReason, setStatusChangeReason] = useState("")

  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)
  const [memoLogs, setMemoLogs] = useState([
    {
      id: "1",
      author: "Admin User",
      date: "2025-01-28",
      rating: 5,
      memo: "ทำงานได้ดีมาก ส่งงานตรงเวลา คอนเทนต์มีคุณภาพสูง",
      type: "performance",
    },
    {
      id: "2",
      author: "Marketing Team",
      date: "2025-01-20",
      rating: 4,
      memo: "แคมเปญ Summer Collection ได้ผลดี Engagement สูงกว่าที่คาดไว้",
      type: "campaign",
    },
    {
      id: "3",
      author: "Project Manager",
      date: "2025-01-15",
      rating: 5,
      memo: "ติดต่อสื่อสารสะดวก มีความเป็นมืออาชีพ",
      type: "communication",
    },
  ])

  const mockKOLs = [
    {
      id: "1",
      name: "สมชาย ใจดี",
      handle: "somchai_jaidee",
      country: "Thailand",
      status: "active" as KOLStatus,
      category: ["Fashion", "Lifestyle"],
      bio: "Fashion influencer และ lifestyle blogger ที่มีผู้ติดตามมากกว่า 500K คน",
      notes: "ทำงานร่วมกับแบรนด์ชั้นนำหลายแบรนด์",
      contact_email: "somchai@example.com",
      contact_phone: "+66 81 234 5678",
      kol_channels: [
        {
          id: "1",
          channel_type: "Instagram",
          handle: "somchai_jaidee",
          profile_url: "https://instagram.com/somchai_jaidee",
          follower_count: 520000,
          engagement_rate: 4.5,
          verified: true,
          status: "active",
          history: [
            { date: "2025-01-30", follower_count: 520000, change: 5000 },
            { date: "2025-01-23", follower_count: 515000, change: 3000 },
            { date: "2025-01-16", follower_count: 512000, change: 2000 },
            { date: "2025-01-09", follower_count: 510000, change: 4000 },
            { date: "2025-01-02", follower_count: 506000, change: 6000 },
          ],
        },
        {
          id: "2",
          channel_type: "TikTok",
          handle: "somchai.jaidee",
          profile_url: "https://tiktok.com/@somchai.jaidee",
          follower_count: 350000,
          engagement_rate: 6.2,
          verified: true,
          status: "active",
          history: [
            { date: "2025-01-30", follower_count: 350000, change: 8000 },
            { date: "2025-01-23", follower_count: 342000, change: 5000 },
            { date: "2025-01-16", follower_count: 337000, change: 7000 },
            { date: "2025-01-09", follower_count: 330000, change: 10000 },
            { date: "2025-01-02", follower_count: 320000, change: 15000 },
          ],
        },
      ],
      rate_cards: [
        {
          id: "1",
          version: 2,
          effective_from: "2025-01-01",
          effective_to: null,
          currency: "THB",
          rate_items: [
            {
              id: "1",
              channel_type: "Instagram",
              content_type: "Post",
              base_rate: 50000,
              addons: { story: 10000, reel: 15000 },
            },
            {
              id: "2",
              channel_type: "TikTok",
              content_type: "Video",
              base_rate: 40000,
              addons: { live: 20000 },
            },
          ],
        },
      ],
      posts: [
        {
          id: "1",
          account: "Siam Beauty Co.",
          project: "Summer Collection 2025",
          campaign: "New Skincare Launch",
          post_title: "รีวิวครีมกันแดดใหม่",
          post_url: "https://instagram.com/p/abc123",
          post_type: "Instagram Post",
          channel: "Instagram",
          engagement: {
            likes: 45000,
            comments: 1200,
            shares: 850,
            views: 520000,
          },
          posted_date: "2025-01-25",
        },
        {
          id: "2",
          account: "Fashion House Thailand",
          project: "Spring Fashion Week",
          campaign: "Designer Collaboration",
          post_title: "แฟชั่นโชว์คอลเลคชั่นใหม่",
          post_url: "https://tiktok.com/@somchai.jaidee/video/xyz789",
          post_type: "TikTok Video",
          channel: "TikTok",
          engagement: {
            views: 850000,
            likes: 68000,
            comments: 2400,
            shares: 3200,
            saves: 5600,
          },
          posted_date: "2025-01-20",
        },
        {
          id: "3",
          account: "Lifestyle Brand Co.",
          project: "Wellness Campaign",
          campaign: "Healthy Living 2025",
          post_title: "วิถีชีวิตสุขภาพดี",
          post_url: "https://instagram.com/p/def456",
          post_type: "Instagram Reel",
          channel: "Instagram",
          engagement: {
            likes: 52000,
            comments: 980,
            shares: 1100,
            views: 620000,
          },
          posted_date: "2025-01-15",
        },
      ],
    },
    {
      id: "2",
      name: "มาลี สวยงาม",
      handle: "malee_beauty",
      country: "Thailand",
      status: "active" as KOLStatus,
      category: ["Beauty", "Skincare"],
      bio: "Beauty guru และ skincare expert",
      contact_email: "malee@example.com",
      contact_phone: "+66 82 345 6789",
      kol_channels: [
        {
          id: "3",
          channel_type: "YouTube",
          handle: "MaleeBeauty",
          profile_url: "https://youtube.com/@MaleeBeauty",
          follower_count: 280000,
          engagement_rate: 5.8,
          verified: true,
          status: "active",
          history: [
            { date: "2025-01-30", follower_count: 280000, change: 3000 },
            { date: "2025-01-23", follower_count: 277000, change: 2000 },
            { date: "2025-01-16", follower_count: 275000, change: 5000 },
            { date: "2025-01-09", follower_count: 270000, change: 4000 },
            { date: "2025-01-02", follower_count: 266000, change: 6000 },
          ],
        },
      ],
      rate_cards: [],
      posts: [],
    },
  ]

  const kol = mockKOLs.find((k) => k.id === id)

  if (!kol) {
    notFound()
  }

  const activeRateCard = kol.rate_cards?.find((rc: any) => !rc.effective_to) || kol.rate_cards?.[0]

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString)
    const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    return `${thaiDays[date.getDay()]} ${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
  }

  const handleAddFollowerHistory = () => {
    console.log("[v0] Adding follower history:", {
      channelId: selectedChannel,
      date: newHistoryDate,
      followerCount: newFollowerCount,
    })
    setNewFollowerCount("")
    setNewHistoryDate("")
    setSelectedChannel(null)
  }

  const handleStatusChange = () => {
    console.log("[v0] Changing status:", {
      kolId: id,
      oldStatus: currentStatus,
      newStatus: newStatus,
      reason: statusChangeReason,
    })
    setCurrentStatus(newStatus)
    setStatusChangeReason("")
  }

  const handleAddMemo = () => {
    const newMemo = {
      id: Date.now().toString(),
      author: "Current User",
      date: new Date().toISOString().split("T")[0],
      rating: memoRating,
      memo: memoText,
      type: "general",
    }
    console.log("[v0] Adding memo log:", newMemo)
    setMemoLogs([newMemo, ...memoLogs])
    setMemoText("")
    setMemoRating(0)
  }

  const getStatusBadgeVariant = (status: KOLStatus) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "draft":
        return "outline"
      case "ban":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: KOLStatus) => {
    switch (status) {
      case "active":
        return "ใช้งาน"
      case "inactive":
        return "ไม่ใช้งาน"
      case "draft":
        return "แบบร่าง"
      case "ban":
        return "ระงับ"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{kol.name}</h1>
          <p className="text-muted-foreground">รายละเอียด KOL</p>
        </div>
        <Link href={`/dashboard/kols/${id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            แก้ไข
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ชื่อ</p>
                <p className="text-lg font-semibold">{kol.name}</p>
              </div>
              {kol.handle && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Handle</p>
                  <p className="text-lg font-semibold">@{kol.handle}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">ประเทศ</p>
                <p className="text-lg font-semibold">{kol.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">สถานะ</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(currentStatus)}>{getStatusLabel(currentStatus)}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        เปลี่ยนสถานะ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>เปลี่ยนสถานะ KOL</DialogTitle>
                        <DialogDescription>เปลี่ยนสถานะของ {kol.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>สถานะปัจจุบัน</Label>
                          <div>
                            <Badge variant={getStatusBadgeVariant(currentStatus)}>
                              {getStatusLabel(currentStatus)}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-status">สถานะใหม่</Label>
                          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as KOLStatus)}>
                            <SelectTrigger id="new-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">ใช้งาน</SelectItem>
                              <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                              <SelectItem value="draft">แบบร่าง</SelectItem>
                              <SelectItem value="ban">ระงับ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status-reason">เหตุผล</Label>
                          <Textarea
                            id="status-reason"
                            placeholder="ระบุเหตุผลในการเปลี่ยนสถานะ..."
                            value={statusChangeReason}
                            onChange={(e) => setStatusChangeReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleStatusChange}>บันทึก</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {kol.category && kol.category.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">หมวดหมู่</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {kol.category.map((cat: string) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {kol.bio && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ประวัติ</p>
                <p className="mt-1 text-sm">{kol.bio}</p>
              </div>
            )}

            {kol.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">หมายเหตุ</p>
                <p className="mt-1 text-sm text-muted-foreground">{kol.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลติดต่อ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kol.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${kol.contact_email}`} className="text-sm hover:underline">
                  {kol.contact_email}
                </a>
              </div>
            )}
            {kol.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${kol.contact_phone}`} className="text-sm hover:underline">
                  {kol.contact_phone}
                </a>
              </div>
            )}
            {!kol.contact_email && !kol.contact_phone && <p className="text-sm text-muted-foreground">ไม่มีข้อมูลติดต่อ</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              บันทึกการทำงาน (Memo Log)
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มบันทึก
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เพิ่มบันทึกการทำงาน</DialogTitle>
                  <DialogDescription>บันทึกข้อมูลการทำงานและให้คะแนนสำหรับ {kol.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>ให้คะแนน (ดาว)</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMemoRating(star)}
                          className="transition-colors"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= memoRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {memoRating > 0 && <p className="text-sm text-muted-foreground">คุณให้คะแนน {memoRating} ดาว</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memo-text">บันทึก</Label>
                    <Textarea
                      id="memo-text"
                      placeholder="เขียนบันทึกการทำงาน ความคิดเห็น หรือข้อสังเกต..."
                      value={memoText}
                      onChange={(e) => setMemoText(e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMemo} disabled={!memoText || memoRating === 0}>
                    บันทึก
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {memoLogs.length > 0 ? (
            <div className="space-y-4">
              {memoLogs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {log.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{log.author}</p>
                          <p className="text-xs text-muted-foreground">{formatThaiDate(log.date)}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= log.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{log.memo}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {log.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">ยังไม่มีบันทึกการทำงาน</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ช่องทางโซเชียลมีเดีย</CardTitle>
        </CardHeader>
        <CardContent>
          {kol.kol_channels && kol.kol_channels.length > 0 ? (
            <div className="space-y-6">
              {kol.kol_channels.map((channel: any) => (
                <Card key={channel.id}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge>{channel.channel_type}</Badge>
                          <span className="font-semibold">@{channel.handle}</span>
                          {channel.verified && <Badge variant="secondary">Verified</Badge>}
                        </div>
                        {channel.profile_url && (
                          <a
                            href={channel.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            {channel.profile_url}
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{channel.follower_count?.toLocaleString() || 0}</p>
                        <p className="text-sm text-muted-foreground">ผู้ติดตาม</p>
                        {channel.engagement_rate && (
                          <p className="text-sm text-muted-foreground">ER: {channel.engagement_rate}%</p>
                        )}
                      </div>
                    </div>

                    {/* Follower History */}
                    {channel.history && channel.history.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold">ประวัติผู้ติดตาม</h4>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedChannel(channel.id)}>
                                <Plus className="mr-2 h-4 w-4" />
                                เพิ่มประวัติ
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>เพิ่มประวัติผู้ติดตาม</DialogTitle>
                                <DialogDescription>
                                  เพิ่มข้อมูลจำนวนผู้ติดตามสำหรับ {channel.channel_type} (@{channel.handle})
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="history-date">วันที่</Label>
                                  <Input
                                    id="history-date"
                                    type="date"
                                    value={newHistoryDate}
                                    onChange={(e) => setNewHistoryDate(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="follower-count">จำนวนผู้ติดตาม</Label>
                                  <Input
                                    id="follower-count"
                                    type="number"
                                    placeholder="520000"
                                    value={newFollowerCount}
                                    onChange={(e) => setNewFollowerCount(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleAddFollowerHistory}>บันทึก</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="space-y-2">
                          {channel.history.map((record: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{formatThaiDate(record.date)}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="font-semibold">{record.follower_count.toLocaleString()}</p>
                                <div
                                  className={`flex items-center gap-1 ${
                                    record.change > 0
                                      ? "text-green-600"
                                      : record.change < 0
                                        ? "text-red-600"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {record.change > 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : record.change < 0 ? (
                                    <TrendingDown className="h-4 w-4" />
                                  ) : null}
                                  <span className="font-medium">
                                    {record.change > 0 ? "+" : ""}
                                    {record.change.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีช่องทางโซเชียลมีเดีย</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>อัตราค่าบริการ</CardTitle>
            <div className="flex items-center gap-2">
              {activeRateCard && <Badge variant="secondary">Version {activeRateCard.version}</Badge>}
              <Link href={`/dashboard/rate-cards/new?kol_id=${id}`}>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่ม Rate Card
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeRateCard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">มีผลตั้งแต่</span>
                <span>{new Date(activeRateCard.effective_from).toLocaleDateString("th-TH")}</span>
              </div>
              {activeRateCard.rate_items && activeRateCard.rate_items.length > 0 && (
                <div className="space-y-2">
                  {activeRateCard.rate_items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">
                          {item.channel_type} - {item.content_type}
                        </p>
                        {item.addons && Object.keys(item.addons).length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Add-ons: {Object.keys(item.addons).join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold">
                        {item.base_rate.toLocaleString()} {activeRateCard.currency}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มี Rate Card</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการทำงาน</CardTitle>
        </CardHeader>
        <CardContent>
          {kol.posts && kol.posts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>บัญชีลูกค้า</TableHead>
                    <TableHead>โปรเจค</TableHead>
                    <TableHead>แคมเปญ</TableHead>
                    <TableHead>โพสต์</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ช่องทาง</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kol.posts.map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(post.posted_date).toLocaleDateString("th-TH")}
                      </TableCell>
                      <TableCell className="font-medium">{post.account}</TableCell>
                      <TableCell>{post.project}</TableCell>
                      <TableCell>{post.campaign}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <Link
                          href={`/dashboard/posts/${post.id}`}
                          className="truncate hover:underline hover:text-primary"
                        >
                          {post.post_title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.post_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{post.channel}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground">Views:</span>
                            <span className="font-semibold">{post.engagement.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground">Likes:</span>
                            <span className="font-semibold">{post.engagement.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground">Comments:</span>
                            <span className="font-semibold">{post.engagement.comments.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground">Shares:</span>
                            <span className="font-semibold">{post.engagement.shares.toLocaleString()}</span>
                          </div>
                          {post.channel === "TikTok" && post.engagement.saves && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-muted-foreground">Saves:</span>
                              <span className="font-semibold">{post.engagement.saves.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีประวัติการทำงาน</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
