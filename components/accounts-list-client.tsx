"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Building2, FolderKanban, Megaphone, Users, Star, LayoutGrid, List, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Account = {
  id: string
  name: string
  company_name: string | null
  primary_contact_email: string | null
  status: string
  created_at: string
  projects_count?: number
  campaigns_count?: number
  kols_count?: number
  total_budget?: number
}

export function AccountsListClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [statusReason, setStatusReason] = useState("")
  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleStatusChange = (accountId: string) => {
    setSelectedAccount(accountId)
    setStatusDialogOpen(true)
  }

  const handleAddMemo = (accountId: string) => {
    setSelectedAccount(accountId)
    setMemoDialogOpen(true)
  }

  const handleDelete = (accountId: string) => {
    setSelectedAccount(accountId)
    setDeleteDialogOpen(true)
  }

  const handleStatusChangeInline = async (accountId: string, newStatus: string) => {
    setUpdatingStatus(accountId)
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }

      // Update local state immediately without page refresh
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === accountId ? { ...account, status: newStatus } : account
        )
      )

      toast.success(`เปลี่ยนสถานะเป็น "${getStatusText(newStatus)}" สำเร็จ`)
    } catch (err: any) {
      console.error("[v0] Error updating status:", err)
      toast.error(err.message || "ไม่สามารถอัปเดตสถานะได้")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const saveStatusChange = async () => {
    if (!selectedAccount || !newStatus) return

    try {
      const response = await fetch(`/api/accounts/${selectedAccount}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }

      // Update local state immediately
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === selectedAccount ? { ...account, status: newStatus } : account
        )
      )

      toast.success(`เปลี่ยนสถานะเป็น "${getStatusText(newStatus)}" สำเร็จ`)
      setStatusDialogOpen(false)
      setNewStatus("")
      setStatusReason("")
      setSelectedAccount(null)
    } catch (err: any) {
      console.error("[v0] Error updating status:", err)
      toast.error(err.message || "ไม่สามารถอัปเดตสถานะได้")
    }
  }

  const saveMemo = () => {
    console.log("[v0] Memo saved:", { selectedAccount, memoText, memoRating })
    setMemoDialogOpen(false)
    setMemoText("")
    setMemoRating(0)
    setSelectedAccount(null)
  }

  const confirmDelete = async () => {
    if (!selectedAccount) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/accounts/${selectedAccount}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete account")
      }

      // Refresh the page
      router.refresh()
      setDeleteDialogOpen(false)
      setSelectedAccount(null)
    } catch (err: any) {
      console.error("[v0] Error deleting account:", err)
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
      case "suspended":
        return "bg-red-500/10 text-red-700 border-red-500/20"
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
      case "suspended":
        return "ระงับ"
      default:
        return status
    }
  }

  return (
    <>
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
                    <Link href={`/accounts/${account.id}`} className="block">
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black">
                              <Building2 className="h-7 w-7 text-[#FFFF00]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 truncate">{account.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{account.company_name || ""}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {account.primary_contact_email || ""}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                disabled={updatingStatus === account.id}
                                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Badge className={`${getStatusColor(account.status)} border shrink-0 ml-2 cursor-pointer hover:opacity-80 transition-opacity`}>
                                  {updatingStatus === account.id ? (
                                    <span className="animate-pulse">...</span>
                                  ) : (
                                    getStatusText(account.status)
                                  )}
                                </Badge>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => handleStatusChangeInline(account.id, "active")}
                                disabled={account.status === "active" || updatingStatus === account.id}
                                className="cursor-pointer"
                              >
                                <span className="text-green-700 font-medium">ใช้งาน</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChangeInline(account.id, "inactive")}
                                disabled={account.status === "inactive" || updatingStatus === account.id}
                                className="cursor-pointer"
                              >
                                <span className="text-gray-700 font-medium">ไม่ใช้งาน</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChangeInline(account.id, "suspended")}
                                disabled={account.status === "suspended" || updatingStatus === account.id}
                                className="cursor-pointer"
                              >
                                <span className="text-red-700 font-medium">ระงับ</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-4 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-black">{account.projects_count || 0}</p>
                            <p className="text-xs text-muted-foreground">โปรเจกต์</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-black">{account.campaigns_count || 0}</p>
                            <p className="text-xs text-muted-foreground">แคมเปญ</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-black">{account.kols_count || 0}</p>
                            <p className="text-xs text-muted-foreground">KOLs</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <span className="text-xs text-muted-foreground">฿</span>
                            </div>
                            <p className="text-lg font-bold text-black">
                              {account.total_budget ? (account.total_budget / 1000000).toFixed(1) : "0"}M
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
                        <Link href={`/accounts/${account.id}`} className="block hover:underline">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black shrink-0">
                              <Building2 className="h-5 w-5 text-[#FFFF00]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{account.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{account.company_name || ""}</p>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={updatingStatus === account.id}
                              className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Badge className={`${getStatusColor(account.status)} border cursor-pointer hover:opacity-80 transition-opacity`}>
                                {updatingStatus === account.id ? (
                                  <span className="animate-pulse">...</span>
                                ) : (
                                  getStatusText(account.status)
                                )}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              onClick={() => handleStatusChangeInline(account.id, "active")}
                              disabled={account.status === "active" || updatingStatus === account.id}
                              className="cursor-pointer"
                            >
                              <span className="text-green-700 font-medium">ใช้งาน</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChangeInline(account.id, "inactive")}
                              disabled={account.status === "inactive" || updatingStatus === account.id}
                              className="cursor-pointer"
                            >
                              <span className="text-gray-700 font-medium">ไม่ใช้งาน</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChangeInline(account.id, "suspended")}
                              disabled={account.status === "suspended" || updatingStatus === account.id}
                              className="cursor-pointer"
                            >
                              <span className="text-red-700 font-medium">ระงับ</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xl font-bold">{account.projects_count || 0}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xl font-bold">{account.campaigns_count || 0}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xl font-bold">{account.kols_count || 0}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold">
                          ฿{account.total_budget ? (account.total_budget / 1000000).toFixed(1) : "0"}M
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Link href={`/accounts/${account.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(account.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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
                  <SelectItem value="suspended">ระงับ</SelectItem>
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
                  <button
                    key={star}
                    type="button"
                    onClick={() => setMemoRating(star)}
                    className="transition-colors"
                  >
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบบัญชี</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้? การกระทำนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
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

