"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Pencil, Mail, Phone, Globe, Plus, Star, FileText, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type KOLStatus = "active" | "inactive" | "draft" | "ban"

export function KOLDetailClient({ 
  kol, 
  postsByChannel = {}, 
  totalPostsCount = 0, 
  uniqueCampaignsCount = 0 
}: { 
  kol: any; 
  postsByChannel?: Record<string, any[]>; 
  totalPostsCount?: number; 
  uniqueCampaignsCount?: number; 
}) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<KOLStatus>(kol.status)
  const [newStatus, setNewStatus] = useState<KOLStatus>(kol.status)
  const [statusChangeReason, setStatusChangeReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)
  const [memoLogs, setMemoLogs] = useState<any[]>([])

  // Fetch memo logs on component mount
  useEffect(() => {
    const fetchMemoLogs = async () => {
      try {
        const response = await fetch(`/api/kols/${kol.id}/memos`)
        if (response.ok) {
          const logs = await response.json()
          setMemoLogs(logs || [])
        } else {
          console.error("[v0] Failed to fetch memo logs")
        }
      } catch (error) {
        console.error("[v0] Error fetching memo logs:", error)
      }
    }

    fetchMemoLogs()
  }, [kol.id])

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`/api/kols/${kol.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: statusChangeReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      setCurrentStatus(newStatus)
      setStatusChangeReason("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
  }

  const handleAddMemo = async () => {
    try {
      console.log("[v0] Adding memo:", { memo: memoText, rating: memoRating })
      
      const response = await fetch(`/api/kols/${kol.id}/memos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo: memoText,
          rating: memoRating,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to add memo:", errorData)
        alert(`เพิ่ม memo ไม่สำเร็จ: ${errorData.error || 'Unknown error'}`)
        throw new Error(errorData.error || "Failed to add memo")
      }

      const newMemo = await response.json()
      console.log("[v0] Memo added successfully:", newMemo)
      setMemoLogs([newMemo, ...memoLogs])
      setMemoText("")
      setMemoRating(0)
      router.refresh()
      alert("เพิ่ม memo สำเร็จ!")
    } catch (error: any) {
      console.error("[v0] Error adding memo:", error)
      console.error("[v0] Error message:", error.message)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kols/${kol.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete KOL")

      router.push("/dashboard/kols")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting KOL:", error)
      setIsDeleting(false)
    }
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

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString)
    const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    return `${thaiDays[date.getDay()]} ${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{kol.name}</h1>
          <p className="text-muted-foreground">รายละเอียด KOL</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/kols/${kol.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบ KOL</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณแน่ใจหรือไม่ที่จะลบ {kol.name}? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "กำลังลบ..." : "ลบ"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">จำนวนโพสต์</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPostsCount.toLocaleString()}</p>
            <Link href={`/dashboard/posts?kol_id=${kol.id}`}>
              <p className="text-xs text-muted-foreground mt-1 hover:underline">ดูโพสต์ทั้งหมด</p>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">จำนวนแคมเปญ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{uniqueCampaignsCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">แคมเปญที่เกี่ยวข้อง</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">จำนวนช่องทาง</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(kol.kol_channels?.length || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">ช่องทางโซเชียลมีเดีย</p>
          </CardContent>
        </Card>
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
                <p className="text-lg font-semibold">{kol.country || "ไม่ระบุ"}</p>
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
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tier</p>
                <p className="text-lg font-semibold">{kol.kol_tier || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">จำนวนโพสต์</p>
                <p className="text-lg font-semibold">{totalPostsCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">จำนวนแคมเปญ</p>
                <p className="text-lg font-semibold">{uniqueCampaignsCount.toLocaleString()}</p>
              </div>
            </div>

            {kol.category && Array.isArray(kol.category) && kol.category.length > 0 && (
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
                          {log.author?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{log.author || "User"}</p>
                          <p className="text-xs text-muted-foreground">{formatThaiDate(log.created_at)}</p>
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

                    {/* ประวัติผู้ติดตามแยกตามช่องทาง */}
                    {channel.follower_history && Array.isArray(channel.follower_history) && channel.follower_history.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="mb-3 text-sm font-semibold">ประวัติผู้ติดตาม</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {(() => {
                            // Sort history by date descending (newest first)
                            const sortedHistory = [...channel.follower_history].sort((a: any, b: any) => {
                              const dateA = new Date(a.date).getTime()
                              const dateB = new Date(b.date).getTime()
                              return dateB - dateA
                            })

                            return sortedHistory.map((history: any, index: number) => {
                              // Calculate change from previous entry (index+1 is previous in sorted desc order)
                              const prevHistory = sortedHistory[index + 1]
                              const change = prevHistory
                                ? history.follower_count - prevHistory.follower_count
                                : 0

                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm">
                                      <p className="font-medium">
                                        {new Date(history.date).toLocaleDateString("th-TH", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(history.date).toLocaleDateString("th-TH", {
                                          weekday: "long",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="font-semibold">{history.follower_count?.toLocaleString() || 0}</p>
                                      {change !== 0 && (
                                        <p className={`text-xs ${change > 0 ? "text-green-500" : "text-red-500"}`}>
                                          {change > 0 ? "+" : ""}
                                          {change.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )}

                    {/* แสดงโพสต์ของช่องทางนี้ */}
                    {(() => {
                      const channelPosts = postsByChannel[channel.id] || []
                      if (channelPosts.length === 0) return null

                      return (
                        <div className="border-t pt-4 mt-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold">โพสต์ ({channelPosts.length})</h4>
                            <Link href={`/dashboard/posts?kol_channel_id=${channel.id}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                ดูทั้งหมด
                              </Button>
                            </Link>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {channelPosts.slice(0, 10).map((post: any) => (
                              <Link
                                key={post.id}
                                href={`/dashboard/posts/${post.id}`}
                                className="block rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{post.post_name || "ไม่มีชื่อ"}</p>
                                    {post.posted_at && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(post.posted_at).toLocaleDateString("th-TH", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                    )}
                                    {post.campaigns && (
                                      <p className="text-xs text-muted-foreground">
                                        แคมเปญ: {post.campaigns.name}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {post.content_type && (
                                      <Badge variant="outline" className="text-xs">
                                        {post.content_type}
                                      </Badge>
                                    )}
                                    <Badge
                                      variant={post.status === "published" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {post.status === "published" ? "เผยแพร่" : post.status || "รอดำเนินการ"}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            ))}
                            {channelPosts.length > 10 && (
                              <p className="text-xs text-center text-muted-foreground pt-2">
                                แสดง 10 จาก {channelPosts.length} โพสต์
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีช่องทางโซเชียลมีเดีย</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
