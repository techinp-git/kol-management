"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Upload, FileSpreadsheet, X, Plus, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockCampaigns = [
  { id: "1", name: "Beauty Product Launch Q1" },
  { id: "2", name: "Summer Fashion 2024" },
  { id: "3", name: "Food Review Series" },
]

const mockKOLs = [
  { id: "1", name: "สาวสวย Beauty" },
  { id: "2", name: "แฟชั่นนิสต้า BKK" },
  { id: "3", name: "Chef Love" },
]

const mockTags = [
  { id: "1", name: "Positive", type: "sentiment", color: "#22c55e" },
  { id: "2", name: "Negative", type: "sentiment", color: "#ef4444" },
  { id: "3", name: "Neutral", type: "sentiment", color: "#6b7280" },
  { id: "4", name: "Product Review", type: "category", color: "#3b82f6" },
  { id: "5", name: "Question", type: "category", color: "#f59e0b" },
  { id: "6", name: "Complaint", type: "category", color: "#dc2626" },
  { id: "7", name: "Suggestion", type: "category", color: "#8b5cf6" },
  { id: "8", name: "Spam", type: "category", color: "#64748b" },
]

const mockComments = [
  {
    id: "1",
    author: "user_beauty123",
    text: "สินค้าดีมากค่ะ ใช้แล้วชอบ จะซื้ออีกแน่นอน",
    timestamp: "2024-01-15T14:30:00Z",
    like_count: 45,
    posts: {
      id: "1",
      external_post_id: "TikTok_123456",
      campaign_id: "1",
      campaign_name: "Beauty Product Launch Q1",
      kol_channels: {
        kols: {
          id: "1",
          name: "สาวสวย Beauty",
        },
      },
    },
    comment_tags: [
      {
        tags: {
          id: "1",
          name: "Positive",
          type: "sentiment",
          color: "#22c55e",
        },
      },
      {
        tags: {
          id: "4",
          name: "Product Review",
          type: "category",
          color: "#3b82f6",
        },
      },
    ],
  },
  {
    id: "2",
    author: "fashionlover_bkk",
    text: "ราคาเท่าไหร่คะ สนใจมาก",
    timestamp: "2024-01-15T13:20:00Z",
    like_count: 12,
    posts: {
      id: "2",
      external_post_id: "IG_ABC123",
      campaign_id: "2",
      campaign_name: "Summer Fashion 2024",
      kol_channels: {
        kols: {
          id: "2",
          name: "แฟชั่นนิสต้า BKK",
        },
      },
    },
    comment_tags: [
      {
        tags: {
          id: "5",
          name: "Question",
          type: "category",
          color: "#f59e0b",
        },
      },
    ],
  },
  {
    id: "3",
    author: "foodie_lover",
    text: "อยากลองทำตามบ้าง ดูง่ายดีค่ะ",
    timestamp: "2024-01-15T12:15:00Z",
    like_count: 28,
    posts: {
      id: "3",
      external_post_id: "YT_xyz789",
      campaign_id: "3",
      campaign_name: "Food Review Series",
      kol_channels: {
        kols: {
          id: "3",
          name: "Chef Love",
        },
      },
    },
    comment_tags: [
      {
        tags: {
          id: "1",
          name: "Positive",
          type: "sentiment",
          color: "#22c55e",
        },
      },
    ],
  },
]

const mockPosts = [
  { id: "1", external_post_id: "TikTok_123456", kol_name: "สาวสวย Beauty" },
  { id: "2", external_post_id: "IG_ABC123", kol_name: "แฟชั่นนิสต้า BKK" },
  { id: "3", external_post_id: "YT_xyz789", kol_name: "Chef Love" },
]

export default function CommentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<"all" | "specific">("all")
  const [selectedPostId, setSelectedPostId] = useState<string>("")

  const [filterPost, setFilterPost] = useState<string>("all")
  const [filterCampaign, setFilterCampaign] = useState<string>("all")
  const [filterKOL, setFilterKOL] = useState<string>("all")

  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<any>(null)
  const [commentTags, setCommentTags] = useState<{ [key: string]: any[] }>({})

  useState(() => {
    const initialTags: { [key: string]: any[] } = {}
    mockComments.forEach((comment) => {
      initialTags[comment.id] = comment.comment_tags?.map((ct) => ct.tags) || []
    })
    setCommentTags(initialTags)
  })

  const filteredComments = mockComments.filter((comment) => {
    const matchesSearch =
      comment.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPost = filterPost === "all" || comment.posts?.id === filterPost
    const matchesCampaign = filterCampaign === "all" || comment.posts?.campaign_id === filterCampaign
    const matchesKOL = filterKOL === "all" || comment.posts?.kol_channels?.kols?.id === filterKOL

    return matchesSearch && matchesPost && matchesCampaign && matchesKOL
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!selectedFile) {
      alert("กรุณาเลือกไฟล์")
      return
    }

    if (importType === "specific" && !selectedPostId) {
      alert("กรุณาเลือกโพสต์")
      return
    }

    console.log("[v0] Importing comments:", {
      file: selectedFile.name,
      type: importType,
      postId: selectedPostId,
    })

    alert(`กำลัง Import ข้อมูลจากไฟล์: ${selectedFile.name}`)
    setImportDialogOpen(false)
    setSelectedFile(null)
  }

  const handleCommentClick = (comment: any) => {
    setSelectedComment(comment)
    setTagDialogOpen(true)
  }

  const handleAddTag = (tagId: string) => {
    if (!selectedComment) return

    const tag = mockTags.find((t) => t.id === tagId)
    if (!tag) return

    const currentTags = commentTags[selectedComment.id] || []
    if (currentTags.some((t) => t.id === tagId)) return

    setCommentTags({
      ...commentTags,
      [selectedComment.id]: [...currentTags, tag],
    })
  }

  const handleRemoveTag = (tagId: string) => {
    if (!selectedComment) return

    const currentTags = commentTags[selectedComment.id] || []
    setCommentTags({
      ...commentTags,
      [selectedComment.id]: currentTags.filter((t) => t.id !== tagId),
    })
  }

  const handleResetFilters = () => {
    setFilterPost("all")
    setFilterCampaign("all")
    setFilterKOL("all")
    setSearchQuery("")
  }

  const hasActiveFilters = filterPost !== "all" || filterCampaign !== "all" || filterKOL !== "all" || searchQuery !== ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">คอมเมนต์</h1>
          <p className="text-muted-foreground">จัดการและติดแท็กคอมเมนต์ หรือ Import ข้อมูลจากไฟล์</p>
        </div>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Upload className="mr-2 h-4 w-4" />
              Import คอมเมนต์
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Import คอมเมนต์</DialogTitle>
              <DialogDescription>อัพโหลดไฟล์ CSV หรือ Excel ที่มี post_id เป็น key สำหรับ Import ข้อมูลคอมเมนต์</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ประเภทการ Import</Label>
                <Select value={importType} onValueChange={(value: any) => setImportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Import ทั้งหมด (รวมหลายโพสต์)</SelectItem>
                    <SelectItem value="specific">Import สำหรับโพสต์เฉพาะ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importType === "specific" && (
                <div className="space-y-2">
                  <Label>เลือกโพสต์</Label>
                  <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกโพสต์..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPosts.map((post) => (
                        <SelectItem key={post.id} value={post.id}>
                          {post.external_post_id} - {post.kol_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file">เลือกไฟล์</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    ไฟล์ที่เลือก: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">รูปแบบไฟล์ที่รองรับ:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>CSV หรือ Excel (.xlsx, .xls)</li>
                      <li>ต้องมีคอลัมน์ post_id เป็น key</li>
                      <li>คอลัมน์ที่แนะนำ: author, text, timestamp, like_count</li>
                      <li>สำหรับ Import ทั้งหมด: ต้องระบุ post_id ในแต่ละแถว</li>
                      <li>สำหรับ Import เฉพาะโพสต์: post_id จะถูกกำหนดอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">กรองตามโพสต์</Label>
              <Select value={filterPost} onValueChange={setFilterPost}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {mockPosts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.external_post_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">กรองตามแคมเปญ</Label>
              <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {mockCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">กรองตาม KOL</Label>
              <Select value={filterKOL} onValueChange={setFilterKOL}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {mockKOLs.map((kol) => (
                    <SelectItem key={kol.id} value={kol.id}>
                      {kol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">&nbsp;</Label>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleResetFilters} className="w-full bg-transparent">
                  <X className="mr-2 h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาคอมเมนต์..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredComments && filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <Card
                  key={comment.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => handleCommentClick(comment)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{comment.author}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString("th-TH")}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">{comment.text}</p>
                        </div>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link
                            href={`/dashboard/posts/${comment.posts?.id}`}
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            โพสต์: {comment.posts?.external_post_id}
                          </Link>
                          <span>•</span>
                          <span>{comment.posts?.campaign_name}</span>
                          <span>•</span>
                          <span>{comment.posts?.kol_channels?.kols?.name}</span>
                          {comment.like_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{comment.like_count} likes</span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(commentTags[comment.id] || []).map((tag: any) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              style={{ backgroundColor: tag.color + "20", color: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">{hasActiveFilters ? "ไม่พบคอมเมนต์ที่ตรงกับเงื่อนไข" : "ยังไม่มีคอมเมนต์"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>จัดการแท็กคอมเมนต์</DialogTitle>
            <DialogDescription>คลิกเพื่อเพิ่มหรือลบแท็กสำหรับคอมเมนต์นี้</DialogDescription>
          </DialogHeader>

          {selectedComment && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{selectedComment.author}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedComment.timestamp).toLocaleString("th-TH")}
                  </span>
                </div>
                <p className="text-sm">{selectedComment.text}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  โพสต์: {selectedComment.posts?.external_post_id} • {selectedComment.posts?.kol_channels?.kols?.name}
                </div>
              </div>

              <div className="space-y-3">
                <Label>แท็กที่เลือก</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] rounded-lg border p-3">
                  {(commentTags[selectedComment.id] || []).length > 0 ? (
                    (commentTags[selectedComment.id] || []).map((tag: any) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer"
                        style={{ backgroundColor: tag.color + "20", color: tag.color }}
                        onClick={() => handleRemoveTag(tag.id)}
                      >
                        {tag.name}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">ยังไม่มีแท็ก - คลิกเพื่อเพิ่มแท็กด้านล่าง</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>แท็กที่มีให้เลือก</Label>
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Sentiment</p>
                    <div className="flex flex-wrap gap-2">
                      {mockTags
                        .filter((tag) => tag.type === "sentiment")
                        .map((tag) => {
                          const isSelected = (commentTags[selectedComment.id] || []).some((t: any) => t.id === tag.id)
                          return (
                            <Badge
                              key={tag.id}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              style={
                                isSelected
                                  ? { backgroundColor: tag.color, color: "white" }
                                  : { borderColor: tag.color, color: tag.color }
                              }
                              onClick={() => (isSelected ? handleRemoveTag(tag.id) : handleAddTag(tag.id))}
                            >
                              {isSelected ? <X className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                              {tag.name}
                            </Badge>
                          )
                        })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {mockTags
                        .filter((tag) => tag.type === "category")
                        .map((tag) => {
                          const isSelected = (commentTags[selectedComment.id] || []).some((t: any) => t.id === tag.id)
                          return (
                            <Badge
                              key={tag.id}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              style={
                                isSelected
                                  ? { backgroundColor: tag.color, color: "white" }
                                  : { borderColor: tag.color, color: tag.color }
                              }
                              onClick={() => (isSelected ? handleRemoveTag(tag.id) : handleAddTag(tag.id))}
                            >
                              {isSelected ? <X className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                              {tag.name}
                            </Badge>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              ปิด
            </Button>
            <Button onClick={() => setTagDialogOpen(false)}>บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
