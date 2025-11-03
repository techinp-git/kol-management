"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Mail, Phone, Globe, TrendingUp, TrendingDown, Star, Edit } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockAccounts = [
  {
    id: "1",
    name: "Siam Paragon",
    company_name: "Siam Paragon Development Co., Ltd.",
    tax_id: "0105536001122",
    billing_address: "991 Rama I Road, Pathumwan, Bangkok 10330",
    primary_contact_name: "คุณสมชาย ใจดี",
    primary_contact_email: "somchai@siamparagon.co.th",
    primary_contact_phone: "02-610-8000",
    currency: "THB",
    credit_terms: 30,
    status: "active",
    notes: "ลูกค้า VIP - ต้องการใบกำกับภาษีทุกครั้ง",
    memo_logs: [
      {
        id: "1",
        author: "สมชาย ใจดี",
        date: "2024-01-30T10:30:00",
        rating: 5,
        memo: "ลูกค้าให้ความร่วมมือดีมาก ตอบกลับเร็ว และให้ข้อมูลครบถ้วน โปรเจกต์เดินหน้าได้อย่างราบรื่น",
      },
      {
        id: "2",
        author: "วิภา สุขใจ",
        date: "2024-01-25T14:15:00",
        rating: 4,
        memo: "การประชุมเป็นไปด้วยดี มีการนำเสนอไอเดียใหม่ๆ ที่น่าสนใจ แต่ต้องรอการอนุมัติจากผู้บริหาร",
      },
      {
        id: "3",
        author: "ประเสริฐ มั่นคง",
        date: "2024-01-20T09:00:00",
        rating: 5,
        memo: "ลูกค้าชำระเงินตรงเวลา และให้ feedback ที่เป็นประโยชน์ต่อการพัฒนาแคมเปญ",
      },
    ],
    social_channels: [
      {
        id: "1",
        channel_type: "Instagram",
        handle: "siamparagon_official",
        profile_url: "https://instagram.com/siamparagon_official",
        follower_count: 850000,
        verified: true,
        status: "active",
        follower_history: [
          { date: "2024-01-30", count: 850000, change: 15000 },
          { date: "2024-01-23", count: 835000, change: 12000 },
          { date: "2024-01-16", count: 823000, change: 8000 },
          { date: "2024-01-09", count: 815000, change: 10000 },
          { date: "2024-01-02", count: 805000, change: 5000 },
        ],
      },
      {
        id: "2",
        channel_type: "Facebook",
        handle: "SiamParagonOfficial",
        profile_url: "https://facebook.com/SiamParagonOfficial",
        follower_count: 1200000,
        verified: true,
        status: "active",
        follower_history: [
          { date: "2024-01-30", count: 1200000, change: 20000 },
          { date: "2024-01-23", count: 1180000, change: 18000 },
          { date: "2024-01-16", count: 1162000, change: 15000 },
          { date: "2024-01-09", count: 1147000, change: 12000 },
          { date: "2024-01-02", count: 1135000, change: 10000 },
        ],
      },
      {
        id: "3",
        channel_type: "TikTok",
        handle: "siamparagon",
        profile_url: "https://tiktok.com/@siamparagon",
        follower_count: 450000,
        verified: true,
        status: "active",
        follower_history: [
          { date: "2024-01-30", count: 450000, change: 25000 },
          { date: "2024-01-23", count: 425000, change: 30000 },
          { date: "2024-01-16", count: 395000, change: 22000 },
          { date: "2024-01-09", count: 373000, change: 18000 },
          { date: "2024-01-02", count: 355000, change: 15000 },
        ],
      },
    ],
    projects: [
      {
        id: "1",
        name: "Summer Campaign 2024",
        status: "active",
        start_date: "2024-06-01",
        end_date: "2024-08-31",
        total_budget: 5000000,
      },
    ],
  },
  {
    id: "2",
    name: "Central World",
    company_name: "Central Pattana Public Company Limited",
    tax_id: "0107536000746",
    billing_address: "999/9 Rama I Road, Pathumwan, Bangkok 10330",
    primary_contact_name: "คุณวิภา สุขใจ",
    primary_contact_email: "wipa@centralworld.co.th",
    primary_contact_phone: "02-613-1111",
    currency: "THB",
    credit_terms: 45,
    status: "active",
    social_channels: [
      {
        id: "4",
        channel_type: "Instagram",
        handle: "centralworld",
        profile_url: "https://instagram.com/centralworld",
        follower_count: 620000,
        verified: true,
        status: "active",
        follower_history: [
          { date: "2024-01-30", count: 620000, change: 10000 },
          { date: "2024-01-23", count: 610000, change: 8000 },
          { date: "2024-01-16", count: 602000, change: 7000 },
          { date: "2024-01-09", count: 595000, change: 5000 },
          { date: "2024-01-02", count: 590000, change: 6000 },
        ],
      },
      {
        id: "5",
        channel_type: "LINE",
        handle: "@centralworld",
        profile_url: "https://line.me/R/ti/p/@centralworld",
        follower_count: 980000,
        verified: true,
        status: "active",
        follower_history: [
          { date: "2024-01-30", count: 980000, change: 15000 },
          { date: "2024-01-23", count: 965000, change: 12000 },
          { date: "2024-01-16", count: 953000, change: 10000 },
          { date: "2024-01-09", count: 943000, change: 8000 },
          { date: "2024-01-02", count: 935000, change: 7000 },
        ],
      },
    ],
    projects: [],
  },
]

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusReason, setStatusReason] = useState("")
  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)

  const account = mockAccounts.find((acc) => acc.id === id)

  if (!account) {
    notFound()
  }

  const saveStatusChange = () => {
    console.log("[v0] Status changed:", { newStatus, statusReason })
    setStatusDialogOpen(false)
    setNewStatus("")
    setStatusReason("")
  }

  const saveMemo = () => {
    console.log("[v0] Memo saved:", { memoText, memoRating })
    setMemoDialogOpen(false)
    setMemoText("")
    setMemoRating(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "ใช้งาน"
      case "inactive":
        return "ไม่ใช้งาน"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-black">
            <Building2 className="h-8 w-8 text-[#FFFF00]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">{account.company_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            เปลี่ยนสถานะ
          </Button>
          <Badge className={`${getStatusColor(account.status)} border`}>{getStatusText(account.status)}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ข้อมูลบัญชี</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {account.tax_id && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">เลขผู้เสียภาษี</p>
                  <p className="text-lg font-semibold">{account.tax_id}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">สกุลเงิน</p>
                <p className="text-lg font-semibold">{account.currency}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">เครดิตเทอม</p>
                <p className="text-lg font-semibold">{account.credit_terms} วัน</p>
              </div>
            </div>

            {account.billing_address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ที่อยู่ใบกำกับภาษี</p>
                <p className="mt-1 text-sm">{account.billing_address}</p>
              </div>
            )}

            {account.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">หมายเหตุ</p>
                <p className="mt-1 text-sm text-muted-foreground">{account.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ผู้ติดต่อหลัก</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {account.primary_contact_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ชื่อ</p>
                <p className="font-semibold">{account.primary_contact_name}</p>
              </div>
            )}
            {account.primary_contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${account.primary_contact_email}`} className="text-sm hover:underline">
                  {account.primary_contact_email}
                </a>
              </div>
            )}
            {account.primary_contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${account.primary_contact_phone}`} className="text-sm hover:underline">
                  {account.primary_contact_phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ช่องทางโซเชียลมีเดีย</CardTitle>
        </CardHeader>
        <CardContent>
          {account.social_channels && account.social_channels.length > 0 ? (
            <div className="space-y-6">
              {account.social_channels.map((channel: any) => (
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
                      </div>
                    </div>

                    {channel.follower_history && channel.follower_history.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="mb-3 text-sm font-semibold">ประวัติผู้ติดตาม</h4>
                        <div className="space-y-2">
                          {channel.follower_history.map((history: any, index: number) => (
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
                                  <p className="font-semibold">{history.count.toLocaleString()}</p>
                                  <div className="flex items-center gap-1 text-xs">
                                    {history.change > 0 ? (
                                      <>
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                        <span className="text-green-500">+{history.change.toLocaleString()}</span>
                                      </>
                                    ) : history.change < 0 ? (
                                      <>
                                        <TrendingDown className="h-3 w-3 text-red-500" />
                                        <span className="text-red-500">{history.change.toLocaleString()}</span>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">ไม่เปลี่ยนแปลง</span>
                                    )}
                                  </div>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>โปรเจกต์</CardTitle>
          <Link href={`/dashboard/projects/new?account_id=${account.id}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มโปรเจกต์
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {account.projects && account.projects.length > 0 ? (
            <div className="space-y-3">
              {account.projects.map((project: any) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="transition-colors hover:bg-accent">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.start_date && new Date(project.start_date).toLocaleDateString("th-TH")}
                          {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString("th-TH")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {project.total_budget && (
                          <p className="text-sm font-semibold">
                            {project.total_budget.toLocaleString()} {account.currency}
                          </p>
                        )}
                        <Badge variant="secondary">{project.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีโปรเจกต์</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>บันทึกการทำงาน</CardTitle>
          <Button onClick={() => setMemoDialogOpen(true)} className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มบันทึก
          </Button>
        </CardHeader>
        <CardContent>
          {account.memo_logs && account.memo_logs.length > 0 ? (
            <div className="space-y-4">
              {account.memo_logs.map((log: any) => (
                <Card key={log.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{log.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= log.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-300"
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

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะบัญชี</DialogTitle>
            <DialogDescription>เลือกสถานะใหม่และระบุเหตุผล</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>สถานะใหม่</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>เหตุผล</Label>
              <Textarea
                placeholder="ระบุเหตุผลในการเปลี่ยนสถานะ..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
              />
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
            <DialogTitle>เพิ่มบันทึกการทำงาน</DialogTitle>
            <DialogDescription>บันทึกข้อมูลและให้คะแนนการทำงานกับบัญชีนี้</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>คะแนน</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setMemoRating(star)} className="transition-colors">
                    <Star
                      className={`h-8 w-8 ${star <= memoRating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>บันทึก</Label>
              <Textarea
                placeholder="เขียนบันทึกการทำงาน..."
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemoDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={saveMemo} className="bg-black text-[#FFFF00] hover:bg-black/90">
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
