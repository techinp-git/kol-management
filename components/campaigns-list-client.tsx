"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Target, Edit, Trash2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
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
import { useRouter } from "next/navigation"

type Campaign = {
  id: string
  name: string
  project_id: string
  project?: {
    id: string
    name: string
    account?: {
      id: string
      name: string
    }
  }
  objective?: string
  start_date?: string
  end_date?: string
  budget?: number
  status: string
  post_count?: number
  created_at: string
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

export function CampaignsListClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusChange = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setNewStatus(campaign.status)
    setStatusDialogOpen(true)
  }

  const handleMemoLog = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setMemoDialogOpen(true)
  }

  const handleDelete = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setDeleteDialogOpen(true)
  }

  const saveStatusChange = async () => {
    if (!selectedCampaign || !newStatus) return

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }

      router.refresh()
      setStatusDialogOpen(false)
      setNewStatus("")
      setSelectedCampaign(null)
    } catch (err: any) {
      console.error("[v0] Error updating status:", err)
      alert(err.message)
    }
  }

  const saveMemoLog = async () => {
    if (!selectedCampaign || !memoText || memoRating === 0) return

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}/memos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo: memoText,
          rating: memoRating,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add memo")
      }

      router.refresh()
      setMemoDialogOpen(false)
      setMemoText("")
      setMemoRating(0)
      setSelectedCampaign(null)
      alert("เพิ่ม memo สำเร็จ!")
    } catch (err: any) {
      console.error("[v0] Error adding memo:", err)
      alert(err.message)
    }
  }

  const confirmDelete = async () => {
    if (!selectedCampaign) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete campaign")
      }

      router.refresh()
      setDeleteDialogOpen(false)
      setSelectedCampaign(null)
    } catch (err: any) {
      console.error("[v0] Error deleting campaign:", err)
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter campaigns by search query
  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase()
    return (
      campaign.name.toLowerCase().includes(query) ||
      campaign.project?.name.toLowerCase().includes(query) ||
      campaign.project?.account?.name.toLowerCase().includes(query) ||
      campaign.status.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาแคมเปญ..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">ยังไม่มีแคมเปญในระบบ</p>
              <Link href="/campaigns/new">
                <Button className="mt-4">
                  เพิ่มแคมเปญแรก
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="transition-colors hover:bg-accent/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Target className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg hover:underline">{campaign.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {campaign.project && (
                                <>
                                  <span className="font-medium text-foreground">{campaign.project.name}</span>
                                  {campaign.project.account && (
                                    <>
                                      <span>•</span>
                                      <span>{campaign.project.account.name}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            {campaign.start_date && campaign.end_date && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{new Date(campaign.start_date).toLocaleDateString("th-TH")}</span>
                                <span>-</span>
                                <span>{new Date(campaign.end_date).toLocaleDateString("th-TH")}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm mt-2">
                              {campaign.post_count !== undefined && (
                                <span className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">{campaign.post_count}</span> โพสต์
                                </span>
                              )}
                              {campaign.budget && (
                                <span className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">
                                    {campaign.budget.toLocaleString()}
                                  </span>{" "}
                                  ฿
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="flex flex-col items-end gap-3">
                        <Badge className={`${getStatusColor(campaign.status)} border`}>
                          {getStatusText(campaign.status)}
                        </Badge>
                        <div className="flex gap-2">
                          <Link href={`/campaigns/${campaign.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              แก้ไข
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleStatusChange(campaign)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            สถานะ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleMemoLog(campaign)
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Memo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDelete(campaign)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะแคมเปญ</DialogTitle>
            <DialogDescription>เปลี่ยนสถานะของ {selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
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
            <Button onClick={saveStatusChange} className="bg-black text-[#FFFF00] hover:bg-black/90">
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={memoDialogOpen} onOpenChange={setMemoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Memo Log</DialogTitle>
            <DialogDescription>เพิ่มบันทึกการทำงานสำหรับ {selectedCampaign?.name}</DialogDescription>
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
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {star <= memoRating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              {memoRating > 0 && <p className="text-sm text-muted-foreground">คุณให้คะแนน {memoRating} ดาว</p>}
            </div>
            <div className="space-y-2">
              <Label>บันทึก</Label>
              <Textarea placeholder="เขียนบันทึกการทำงาน..." rows={4} value={memoText} onChange={(e) => setMemoText(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemoDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={saveMemoLog} disabled={!memoText || memoRating === 0} className="bg-black text-[#FFFF00] hover:bg-black/90">
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบแคมเปญ</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ที่จะลบแคมเปญนี้? การกระทำนี้ไม่สามารถยกเลิกได้</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              ยกเลิก
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "กำลังลบ..." : "ลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

