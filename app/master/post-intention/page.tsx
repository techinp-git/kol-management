"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"

type MasterPostIntention = {
  id: string
  group_intention: string
  post_intention: string
  description: string | null
  sentiment: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function MasterPostIntentionPage() {
  const [data, setData] = useState<MasterPostIntention[]>([])
  const [grouped, setGrouped] = useState<Record<string, MasterPostIntention[]>>({})
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterPostIntention | null>(null)
  const [includeInactive, setIncludeInactive] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    group_intention: "",
    post_intention: "",
    description: "",
    sentiment: "",
    sort_order: 0,
    is_active: true,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = includeInactive
        ? "/api/master-post-intention?includeInactive=true"
        : "/api/master-post-intention"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch data")

      const result = await response.json()
      setData(result.data || [])
      setGrouped(result.grouped || {})
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("ไม่สามารถโหลดข้อมูลได้: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [includeInactive])

  const handleOpenDialog = (item?: MasterPostIntention) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        group_intention: item.group_intention,
        post_intention: item.post_intention,
        description: item.description || "",
        sentiment: item.sentiment || "",
        sort_order: item.sort_order,
        is_active: item.is_active,
      })
    } else {
      setEditingItem(null)
      setFormData({
        group_intention: "",
        post_intention: "",
        description: "",
        sentiment: "",
        sort_order: 0,
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      group_intention: "",
      post_intention: "",
      description: "",
      sentiment: "",
      sort_order: 0,
      is_active: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem
        ? `/api/master-post-intention/${editingItem.id}`
        : "/api/master-post-intention"
      const method = editingItem ? "PATCH" : "POST"

      console.log("[master-post-intention] Submitting:", {
        url,
        method,
        formData,
        editingItem: editingItem?.id,
      })

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      // Try to parse response as JSON, but handle empty or invalid responses
      let responseData: any = {}
      try {
        const text = await response.text()
        if (text && text.trim()) {
          try {
            responseData = JSON.parse(text)
          } catch (parseError) {
            console.error("[master-post-intention] Error parsing JSON response:", parseError, "Text:", text)
            responseData = { error: text || "Invalid response from server" }
          }
        } else {
          // Empty response body
          responseData = { error: "Empty response from server" }
        }
      } catch (textError) {
        console.error("[master-post-intention] Error reading response text:", textError)
        responseData = { error: "Failed to read response" }
      }

      if (!response.ok) {
        console.error("[master-post-intention] Error response:", {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
          data: responseData,
          isEmpty: Object.keys(responseData).length === 0,
        })
        
        // Provide more helpful error message
        let errorMessage = responseData.error 
          || responseData.details 
          || responseData.message
        
        // Handle specific error cases
        if (response.status === 403) {
          errorMessage = errorMessage || "คุณไม่มีสิทธิ์ในการบันทึกข้อมูลนี้"
          if (responseData.details) {
            errorMessage += ` (${responseData.details})`
          }
        } else if (response.status === 500) {
          errorMessage = errorMessage || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"
        } else if (response.status === 401) {
          errorMessage = errorMessage || "กรุณาเข้าสู่ระบบใหม่"
        } else {
          errorMessage = errorMessage || "ไม่สามารถบันทึกข้อมูลได้"
        }
        
        throw new Error(errorMessage)
      }

      console.log("[master-post-intention] Success:", responseData)
      toast.success(editingItem ? "อัปเดตสำเร็จ" : "สร้างสำเร็จ")
      handleCloseDialog()
      fetchData()
    } catch (error: any) {
      console.error("[master-post-intention] Error saving:", {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      
      // Provide more helpful error message
      let errorMessage = "ไม่สามารถบันทึกข้อมูลได้"
      if (error.message) {
        errorMessage += ": " + error.message
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage += ": ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
      } else {
        errorMessage += ": เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      }
      
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return

    try {
      const response = await fetch(`/api/master-post-intention/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete")
      }

      toast.success("ลบสำเร็จ")
      fetchData()
    } catch (error: any) {
      console.error("Error deleting:", error)
      toast.error("ไม่สามารถลบข้อมูลได้: " + error.message)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Post Intention</h1>
          <p className="text-muted-foreground mt-1">
            จัดการการจัดกลุ่ม post_intention สำหรับ categorizing comments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="include-inactive"
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
            />
            <Label htmlFor="include-inactive" className="cursor-pointer">
              แสดงรายการที่ปิดใช้งาน
            </Label>
          </div>
          <Button onClick={() => fetchData()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "แก้ไข Master Post Intention" : "เพิ่ม Master Post Intention"}
                  </DialogTitle>
                  <DialogDescription>
                    กรุณากรอกข้อมูลการจัดกลุ่ม post_intention
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group_intention">Group Intention *</Label>
                    <Input
                      id="group_intention"
                      value={formData.group_intention}
                      onChange={(e) =>
                        setFormData({ ...formData, group_intention: e.target.value })
                      }
                      placeholder="เช่น Brand, Product, Service"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post_intention">Post Intention *</Label>
                    <Input
                      id="post_intention"
                      value={formData.post_intention}
                      onChange={(e) =>
                        setFormData({ ...formData, post_intention: e.target.value })
                      }
                      placeholder="เช่น Brand-สนใจสินค้า"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="คำอธิบายเพิ่มเติม"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sentiment">Sentiment</Label>
                    <Select
                      value={formData.sentiment}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sentiment: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Positive">Positive</SelectItem>
                        <SelectItem value="Negative">Negative</SelectItem>
                        <SelectItem value="Neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      เปิดใช้งาน
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">บันทึก</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">กำลังโหลด...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, items]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">{group}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({items.length} รายการ)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Post Intention</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px] text-center">Sentiment</TableHead>
                      <TableHead className="w-[100px] text-center">Sort Order</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                      <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.post_intention}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.sentiment ? (
                            <Badge
                              variant={
                                item.sentiment === "Positive"
                                  ? "default"
                                  : item.sentiment === "Negative"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {item.sentiment}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{item.sort_order}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          {Object.keys(grouped).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                ไม่มีข้อมูล
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
