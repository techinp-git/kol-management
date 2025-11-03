"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Target, MessageSquare, Edit } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState } from "react"
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

export default function CampaignsPage() {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)

  const campaigns = [
    {
      id: "1",
      name: "แคมเปญเปิดตัวสินค้าใหม่",
      start_date: "2024-03-01",
      end_date: "2024-03-31",
      budget: 500000,
      status: "active",
      created_at: "2024-02-15",
      kol_count: 5,
      post_count: 12,
      total_engagement: 125000,
      projects: {
        id: "1",
        name: "โปรเจกต์ Q1 2024",
        accounts: {
          id: "1",
          name: "บริษัท เทคโนโลยี จำกัด",
        },
      },
    },
    {
      id: "2",
      name: "Beauty Summer Campaign",
      start_date: "2024-04-01",
      end_date: "2024-06-30",
      budget: 800000,
      status: "inactive",
      created_at: "2024-02-20",
      kol_count: 8,
      post_count: 0,
      total_engagement: 0,
      projects: {
        id: "2",
        name: "Summer Collection 2024",
        accounts: {
          id: "2",
          name: "แบรนด์เครื่องสำอาง ABC",
        },
      },
    },
    {
      id: "3",
      name: "Food Festival Promotion",
      start_date: "2024-03-15",
      end_date: "2024-04-15",
      budget: 350000,
      status: "active",
      created_at: "2024-03-01",
      kol_count: 3,
      post_count: 8,
      total_engagement: 85000,
      projects: {
        id: "3",
        name: "Food Marketing 2024",
        accounts: {
          id: "3",
          name: "ร้านอาหารออนไลน์",
        },
      },
    },
  ]

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

  const handleStatusChange = (campaign: any) => {
    setSelectedCampaign(campaign)
    setStatusDialogOpen(true)
  }

  const handleMemoLog = (campaign: any) => {
    setSelectedCampaign(campaign)
    setMemoDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แคมเปญ</h1>
          <p className="text-muted-foreground">จัดการแคมเปญและ KOL</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มแคมเปญ
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ค้นหาแคมเปญ..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="transition-colors hover:bg-accent/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/dashboard/campaigns/${campaign.id}`} className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg hover:underline">{campaign.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{campaign.projects.name}</span>
                            <span>•</span>
                            <span>{campaign.projects.accounts.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(campaign.start_date).toLocaleDateString("th-TH")}</span>
                            <span>-</span>
                            <span>{new Date(campaign.end_date).toLocaleDateString("th-TH")}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">{campaign.kol_count}</span> KOLs
                            </span>
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">{campaign.post_count}</span> โพสต์
                            </span>
                            {campaign.total_engagement > 0 && (
                              <span className="text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                  {campaign.total_engagement.toLocaleString()}
                                </span>{" "}
                                Engagement
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(campaign.status)}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">งบประมาณ</p>
                        <p className="font-semibold text-lg">{campaign.budget.toLocaleString()} ฿</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            handleStatusChange(campaign)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          เปลี่ยนสถานะ
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
                          Memo Log
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Select defaultValue={selectedCampaign?.status}>
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
            <DialogTitle>Memo Log</DialogTitle>
            <DialogDescription>เพิ่มบันทึกการทำงานสำหรับ {selectedCampaign?.name}</DialogDescription>
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
                  <button key={star} className="text-2xl hover:scale-110 transition-transform">
                    ⭐
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
