"use client"

import { useState } from "react"
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

export function AccountDetailClient({ account }: { account: any }) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusReason, setStatusReason] = useState("")
  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)

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

  // Map account_channels to social_channels format for display
  const socialChannels = (account.account_channels || []).map((ch: any) => ({
    ...ch,
    follower_history: ch.follower_history || [],
  }))

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
          <Link href={`/accounts/${account.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข
            </Button>
          </Link>
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
          {socialChannels && socialChannels.length > 0 ? (
            <div className="space-y-6">
              {socialChannels.map((channel: any) => (
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

                    {channel.follower_history && Array.isArray(channel.follower_history) && channel.follower_history.length > 0 && (
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
                                    {new Date(history.date || history.count ? new Date().toISOString() : history.date).toLocaleDateString("th-TH", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(history.date || history.count ? new Date().toISOString() : history.date).toLocaleDateString("th-TH", {
                                      weekday: "long",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-semibold">{(history.count || history.follower_count || 0).toLocaleString()}</p>
                                  <div className="flex items-center gap-1 text-xs">
                                    {history.change && history.change > 0 ? (
                                      <>
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                        <span className="text-green-500">+{history.change.toLocaleString()}</span>
                                      </>
                                    ) : history.change && history.change < 0 ? (
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

