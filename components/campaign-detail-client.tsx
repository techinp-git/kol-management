"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CampaignDetailClient({ campaign: initialCampaign, posts: initialPosts = [] }: { campaign: any; posts?: any[] }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState(initialCampaign)
  const [posts] = useState(initialPosts)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [memoLogs, setMemoLogs] = useState<any[]>([])
  const [selectedRating, setSelectedRating] = useState(0)
  const [memoText, setMemoText] = useState("")
  const [newStatus, setNewStatus] = useState(campaign.status)

  // Fetch memo logs on component mount
  useEffect(() => {
    const fetchMemoLogs = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaign.id}/memos`)
        if (response.ok) {
          const logs = await response.json()
          setMemoLogs(logs || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching memo logs:", error)
      }
    }

    fetchMemoLogs()
  }, [campaign.id])

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }

      setCampaign({ ...campaign, status: newStatus })
      setStatusDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error updating status:", error)
      alert(error.message)
    }
  }

  const handleAddMemo = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/memos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo: memoText,
          rating: selectedRating,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add memo")
      }

      const newMemo = await response.json()
      setMemoLogs([newMemo, ...memoLogs])
      setMemoText("")
      setSelectedRating(0)
      setMemoDialogOpen(false)
      router.refresh()
      alert("เพิ่ม memo สำเร็จ!")
    } catch (error: any) {
      console.error("[v0] Error adding memo:", error)
      alert(error.message)
    }
  }

  const totalAllocated = campaign.campaign_kols?.reduce((sum: number, ck: any) => sum + (ck.allocated_budget || 0), 0) || 0
  const formatBudget = (value?: number | null) => {
    if (value === null || value === undefined) return "-"
    return `${value.toLocaleString()} ฿`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "approved":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "review":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "completed":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      case "draft":
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "กำลังดำเนินการ"
      case "approved":
        return "อนุมัติแล้ว"
      case "review":
        return "รอตรวจสอบ"
      case "completed":
        return "เสร็จสิ้น"
      case "cancelled":
        return "ยกเลิก"
      case "draft":
      default:
        return "แบบร่าง"
    }
  }

  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-black">
            <Target className="h-8 w-8 text-[#FFFF00]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">
              {campaign.project && (
                <>
                  <Link href={`/projects/${campaign.project.id}`} className="hover:underline font-medium">
                    {campaign.project.name}
                  </Link>
                  {campaign.project.account && (
                    <>
                      {" • "}
                      <Link href={`/accounts/${campaign.project.account.id}`} className="hover:underline">
                        {campaign.project.account.name}
                      </Link>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(campaign.status)} border`}>
            {getStatusText(campaign.status)}
          </Badge>
          <Link href={`/campaigns/${campaign.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          </Link>
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
            <p className="text-xs text-muted-foreground">จัดสรรแล้ว: {totalAllocated.toLocaleString()} ฿</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ระยะเวลา</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatThaiDate(campaign.start_date)}</p>
            <p className="text-xs text-muted-foreground">ถึง {formatThaiDate(campaign.end_date)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KOL</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.campaign_kols?.length || 0}</p>
            <p className="text-xs text-muted-foreground">KOLs ที่เลือก</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ช่องทาง</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.channels?.length || 0}</p>
            <p className="text-xs text-muted-foreground">ช่องทางที่ใช้</p>
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

      {campaign.campaign_kols && campaign.campaign_kols.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>KOL ที่เลือก</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.campaign_kols.map((ck: any) => (
                <Card key={ck.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {ck.kol?.name?.charAt(0) || "K"}
                      </div>
                      <div>
                        {ck.kol && (
                          <Link href={`/kols/${ck.kol.id}`}>
                            <h4 className="font-semibold hover:underline">{ck.kol.name}</h4>
                          </Link>
                        )}
                        {ck.kol_channel && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{ck.kol_channel.channel_type}</Badge>
                            <span>@{ck.kol_channel.handle}</span>
                            {ck.kol_channel.follower_count && (
                              <>
                                <span>•</span>
                                <span>{ck.kol_channel.follower_count.toLocaleString()} followers</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ck.allocated_budget && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">งบประมาณ</p>
                          <p className="font-semibold">{ck.allocated_budget.toLocaleString()} ฿</p>
                        </div>
                      )}
                      <Badge variant="secondary">{ck.status || "pending"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>โพสต์ภายใต้แคมเปญ ({posts.length})</CardTitle>
            </div>
            {posts.length > 0 && (
              <Link href={`/posts?campaign_id=${campaign.id}`} className="text-sm text-primary hover:underline">
                ดูทั้งหมด
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">ยังไม่มีโพสต์ในแคมเปญนี้</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>โพสต์</TableHead>
                    <TableHead>ช่องทาง</TableHead>
                    <TableHead>วันที่โพสต์</TableHead>
                    <TableHead>งบ KOL</TableHead>
                    <TableHead>งบ Boost</TableHead>
                    <TableHead>ลิงก์</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link href={`/posts/${post.id}`} className="font-semibold hover:underline">
                            {post.post_name || "ไม่ระบุชื่อโพสต์"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {post.kol?.name ? `โดย ${post.kol.name}` : "-"}
                          </p>
                          {post.content_type && <Badge variant="outline">{post.content_type}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {post.platform && <Badge variant="secondary">{post.platform}</Badge>}
                          {post.kol_channel?.handle && <span className="text-xs text-muted-foreground">@{post.kol_channel.handle}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {post.posted_at
                          ? new Date(post.posted_at).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatBudget(post.kol_budget)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatBudget(post.boost_budget)}</TableCell>
                      <TableCell>
                        {post.url ? (
                          <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1">
                            เปิดลิงก์
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
          {memoLogs.length > 0 ? (
            <div className="space-y-4">
              {memoLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm">{log.memo}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{log.author}</span>
                          <span>•</span>
                          <span>{formatThaiDate(log.created_at)}</span>
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
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="review">รอตรวจสอบ</SelectItem>
                  <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="live">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleStatusChange} className="bg-black text-[#FFFF00] hover:bg-black/90">
              บันทึก
            </Button>
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
              <Label>ให้คะแนน (ดาว)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
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
              {selectedRating > 0 && <p className="text-sm text-muted-foreground">คุณให้คะแนน {selectedRating} ดาว</p>}
            </div>
            <div className="space-y-2">
              <Label>บันทึก</Label>
              <Textarea
                placeholder="เขียนบันทึกการทำงาน..."
                rows={4}
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemoDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleAddMemo}
              disabled={!memoText || selectedRating === 0}
              className="bg-black text-[#FFFF00] hover:bg-black/90"
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

