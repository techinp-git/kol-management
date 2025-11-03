"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, FolderKanban, Megaphone, Users, Star, LayoutGrid, List } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AccountsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [statusReason, setStatusReason] = useState("")
  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)

  const accounts = [
    {
      id: "1",
      name: "บริษัท เทคโนโลยี จำกัด",
      company_name: "Tech Solutions Co., Ltd.",
      primary_contact_email: "contact@techsolutions.com",
      status: "active",
      created_at: "2024-01-10",
      projects_count: 5,
      campaigns_count: 12,
      kols_count: 8,
      total_budget: 2500000,
    },
    {
      id: "2",
      name: "แบรนด์เครื่องสำอาง ABC",
      company_name: "ABC Cosmetics",
      primary_contact_email: "marketing@abccosmetics.com",
      status: "active",
      created_at: "2024-01-15",
      projects_count: 3,
      campaigns_count: 8,
      kols_count: 15,
      total_budget: 1800000,
    },
    {
      id: "3",
      name: "ร้านอาหารออนไลน์",
      company_name: "FoodDelivery Plus",
      primary_contact_email: "pr@fooddelivery.com",
      status: "inactive",
      created_at: "2024-02-01",
      projects_count: 2,
      campaigns_count: 5,
      kols_count: 6,
      total_budget: 950000,
    },
    {
      id: "4",
      name: "แฟชั่นสตรีท",
      company_name: "Street Fashion Brand",
      primary_contact_email: "info@streetfashion.com",
      status: "active",
      created_at: "2024-02-10",
      projects_count: 4,
      campaigns_count: 10,
      kols_count: 12,
      total_budget: 3200000,
    },
  ]

  const handleStatusChange = (accountId: string) => {
    setSelectedAccount(accountId)
    setStatusDialogOpen(true)
  }

  const handleAddMemo = (accountId: string) => {
    setSelectedAccount(accountId)
    setMemoDialogOpen(true)
  }

  const saveStatusChange = () => {
    console.log("[v0] Status changed:", { selectedAccount, newStatus, statusReason })
    setStatusDialogOpen(false)
    setNewStatus("")
    setStatusReason("")
  }

  const saveMemo = () => {
    console.log("[v0] Memo saved:", { selectedAccount, memoText, memoRating })
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">บัญชีลูกค้า</h1>
          <p className="text-muted-foreground mt-1">จัดการบัญชีลูกค้าและแบรนด์</p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มบัญชี
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ค้นหาบัญชีลูกค้า..." className="pl-9" />
            </div>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-black text-[#FFFF00]" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-black text-[#FFFF00]" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2">
              {accounts.map((account) => (
                <Card key={account.id} className="overflow-hidden border-2 hover:border-[#FFFF00]/50 transition-colors">
                  <CardContent className="p-0">
                    <Link href={`/dashboard/accounts/${account.id}`} className="block">
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black">
                              <Building2 className="h-7 w-7 text-[#FFFF00]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 truncate">{account.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{account.company_name}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {account.primary_contact_email}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(account.status)} border shrink-0 ml-2`}>
                            {getStatusText(account.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-4 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-black">{account.projects_count}</p>
                            <p className="text-xs text-muted-foreground">โปรเจกต์</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-black">{account.campaigns_count}</p>
                            <p className="text-xs text-muted-foreground">แคมเปญ</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-black">{account.kols_count}</p>
                            <p className="text-xs text-muted-foreground">KOLs</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <span className="text-xs text-muted-foreground">฿</span>
                            </div>
                            <p className="text-lg font-bold text-black">
                              {(account.total_budget / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-xs text-muted-foreground">งบประมาณ</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="flex gap-2 p-4 bg-muted/30 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.preventDefault()
                          handleStatusChange(account.id)
                        }}
                      >
                        เปลี่ยนสถานะ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddMemo(account.id)
                        }}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        เพิ่มบันทึก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">บัญชี</TableHead>
                    <TableHead className="font-bold">สถานะ</TableHead>
                    <TableHead className="font-bold text-center">โปรเจกต์</TableHead>
                    <TableHead className="font-bold text-center">แคมเปญ</TableHead>
                    <TableHead className="font-bold text-center">KOLs</TableHead>
                    <TableHead className="font-bold text-right">งบประมาณ</TableHead>
                    <TableHead className="font-bold text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Link href={`/dashboard/accounts/${account.id}`} className="block hover:underline">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black shrink-0">
                              <Building2 className="h-5 w-5 text-[#FFFF00]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{account.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{account.company_name}</p>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(account.status)} border`}>
                          {getStatusText(account.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xl font-bold">{account.projects_count}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xl font-bold">{account.campaigns_count}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xl font-bold">{account.kols_count}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold">฿{(account.total_budget / 1000000).toFixed(1)}M</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(account.id)}>
                            สถานะ
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddMemo(account.id)}>
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
