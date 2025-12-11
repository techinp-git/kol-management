"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  FolderKanban,
  Calendar,
  Building2,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  DollarSign,
} from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  created_at: string
  accounts?: {
    id: string
    name: string
  } | null
  campaigns_count?: number
}

export function ProjectsListClient({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusChange = (projectId: string) => {
    setSelectedProject(projectId)
    setStatusDialogOpen(true)
  }

  const handleDelete = (projectId: string) => {
    setSelectedProject(projectId)
    setDeleteDialogOpen(true)
  }

  const saveStatusChange = async () => {
    if (!selectedProject || !newStatus) return

    try {
      const response = await fetch(`/api/projects/${selectedProject}`, {
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
      setSelectedProject(null)
    } catch (err: any) {
      console.error("[v0] Error updating status:", err)
      alert(err.message)
    }
  }

  const confirmDelete = async () => {
    if (!selectedProject) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${selectedProject}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete project")
      }

      router.refresh()
      setDeleteDialogOpen(false)
      setSelectedProject(null)
    } catch (err: any) {
      console.error("[v0] Error deleting project:", err)
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "planning":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "completed":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "กำลังดำเนินการ"
      case "planning":
        return "วางแผน"
      case "completed":
        return "เสร็จสิ้น"
      case "cancelled":
        return "ยกเลิก"
      default:
        return status
    }
  }

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase()
    return (
      project.name.toLowerCase().includes(query) ||
      project.accounts?.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาโปรเจกต์..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden border-2 hover:border-[#FFFF00]/50 transition-colors"
                >
                  <CardContent className="p-0">
                    <Link href={`/projects/${project.id}`} className="block">
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black">
                              <FolderKanban className="h-7 w-7 text-[#FFFF00]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 truncate">{project.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {project.accounts?.name || "ไม่มีบัญชี"}
                              </p>
                              {project.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(project.status)} border shrink-0 ml-2`}>
                            {getStatusText(project.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-black">
                              {project.start_date
                                ? new Date(project.start_date).toLocaleDateString("th-TH", {
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">เริ่มต้น</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-black">
                              {project.end_date
                                ? new Date(project.end_date).toLocaleDateString("th-TH", {
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">สิ้นสุด</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-bold text-black">
                              {project.total_budget
                                ? (project.total_budget / 1000000).toFixed(1)
                                : "0"}
                              M
                            </p>
                            <p className="text-xs text-muted-foreground">งบประมาณ</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="flex gap-2 p-4 bg-muted/30 border-t">
                      <Link href={`/projects/${project.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Pencil className="mr-2 h-4 w-4" />
                          แก้ไข
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.preventDefault()
                          handleStatusChange(project.id)
                        }}
                      >
                        สถานะ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(project.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">ไม่พบโปรเจกต์</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">โปรเจกต์</TableHead>
                    <TableHead className="font-bold">บัญชี</TableHead>
                    <TableHead className="font-bold">สถานะ</TableHead>
                    <TableHead className="font-bold">วันที่เริ่มต้น</TableHead>
                    <TableHead className="font-bold">วันที่สิ้นสุด</TableHead>
                    <TableHead className="font-bold text-right">งบประมาณ</TableHead>
                    <TableHead className="font-bold text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <p className="text-muted-foreground">ไม่พบโปรเจกต์</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Link href={`/projects/${project.id}`} className="block hover:underline">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black shrink-0">
                                <FolderKanban className="h-5 w-5 text-[#FFFF00]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{project.name}</p>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                                )}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{project.accounts?.name || "ไม่มีบัญชี"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(project.status)} border`}>
                            {getStatusText(project.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.start_date
                            ? new Date(project.start_date).toLocaleDateString("th-TH")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {project.end_date ? new Date(project.end_date).toLocaleDateString("th-TH") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-bold">
                            {project.total_budget ? `฿${(project.total_budget / 1000000).toFixed(1)}M` : "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Link href={`/projects/${project.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(project.id)}
                            >
                              สถานะ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะโปรเจกต์</DialogTitle>
            <DialogDescription>เลือกสถานะใหม่</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>สถานะใหม่</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">วางแผน</SelectItem>
                  <SelectItem value="active">กำลังดำเนินการ</SelectItem>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบโปรเจกต์</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้? การกระทำนี้ไม่สามารถยกเลิกได้
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

