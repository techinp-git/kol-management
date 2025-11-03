"use client"

import type React from "react"

import { use } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Star, Tag, X, FileUp, MessageSquare } from "lucide-react"

// Mock data for demo
const mockPost = {
  id: "1",
  external_post_id: "TK123456",
  caption: "รีวิวสินค้าใหม่ล่าสุด! คุณภาพดีมาก แนะนำเลยค่ะ #review #beauty",
  url: "https://www.tiktok.com/@user/video/123456",
  posted_at: "2024-01-15T10:30:00",
  content_type: "Video",
  campaign_id: "1",
  kol_channel_id: "1",
  kol_channels: {
    id: "1",
    channel_type: "TikTok",
    handle: "beautyqueen_th",
    kol_id: "1",
  },
  post_metrics: {
    views: 1250000,
    likes: 85000,
    comments: 3200,
    shares: 12500,
    saves: 5600,
  },
}

const mockCampaigns = [
  { id: "1", name: "Beauty Product Launch Q1", projects: { accounts: { name: "Beauty Brand" } } },
  { id: "2", name: "Fashion Week Campaign", projects: { accounts: { name: "Fashion Co" } } },
]

const mockKols = [
  {
    id: "1",
    name: "สาวสวย Beauty",
    kol_channels: [
      { id: "1", channel_type: "TikTok", handle: "beautyqueen_th" },
      { id: "2", channel_type: "Instagram", handle: "beautyqueen_ig" },
    ],
  },
  {
    id: "2",
    name: "แฟชั่นนิสต้า BKK",
    kol_channels: [{ id: "3", channel_type: "Instagram", handle: "fashionista_bkk" }],
  },
]

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [status, setStatus] = useState("active")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusReason, setStatusReason] = useState("")

  const [memoDialogOpen, setMemoDialogOpen] = useState(false)
  const [memoText, setMemoText] = useState("")
  const [memoRating, setMemoRating] = useState(0)
  const [memoLogs, setMemoLogs] = useState([
    {
      id: "1",
      text: "โพสต์ได้รับการตอบรับดีมาก Engagement สูงกว่าเป้า",
      rating: 5,
      created_by: "Admin User",
      created_at: "2024-01-20T10:00:00Z",
    },
  ])

  const [historyImportDialogOpen, setHistoryImportDialogOpen] = useState(false)
  const [historyFile, setHistoryFile] = useState<File | null>(null)

  const [commentImportDialogOpen, setCommentImportDialogOpen] = useState(false)
  const [commentFile, setCommentFile] = useState<File | null>(null)
  const [comments, setComments] = useState([
    { id: "1", author: "user123", text: "สินค้าดีมากค่ะ", tags: ["positive", "product"] },
    { id: "2", author: "beauty_lover", text: "ซื้อที่ไหนได้บ้างคะ", tags: ["question"] },
  ])
  const [selectedComment, setSelectedComment] = useState<any>(null)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const [externalPostId, setExternalPostId] = useState(mockPost.external_post_id)
  const [campaignId, setCampaignId] = useState(mockPost.campaign_id)
  const [kolId, setKolId] = useState(mockPost.kol_channels.kol_id)
  const [kolChannelId, setKolChannelId] = useState(mockPost.kol_channel_id)
  const [url, setUrl] = useState(mockPost.url)
  const [contentType, setContentType] = useState(mockPost.content_type)
  const [caption, setCaption] = useState(mockPost.caption)
  const [postedAt, setPostedAt] = useState(mockPost.posted_at)

  // Metrics
  const [likes, setLikes] = useState(mockPost.post_metrics.likes.toString())
  const [commentsCount, setCommentsCount] = useState(mockPost.post_metrics.comments.toString())
  const [shares, setShares] = useState(mockPost.post_metrics.shares.toString())
  const [views, setViews] = useState(mockPost.post_metrics.views.toString())
  const [saves, setSaves] = useState(mockPost.post_metrics.saves.toString())
  const [reach, setReach] = useState("")

  const getKolChannels = (kolId: string) => {
    const kol = mockKols.find((k) => k.id === kolId)
    return kol?.kol_channels || []
  }

  const getSelectedChannelType = () => {
    if (!kolChannelId) return null
    const channels = getKolChannels(kolId)
    const channel = channels.find((ch: any) => ch.id === kolChannelId)
    return channel?.channel_type || null
  }

  const selectedChannelType = getSelectedChannelType()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push(`/dashboard/posts/${id}`)
      router.refresh()
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const channels = getKolChannels(kolId)

  const handleStatusChange = () => {
    console.log("[v0] Changing status to:", status, "Reason:", statusReason)
    setStatusDialogOpen(false)
    setStatusReason("")
  }

  const handleAddMemo = () => {
    const newMemo = {
      id: Date.now().toString(),
      text: memoText,
      rating: memoRating,
      created_by: "Current User",
      created_at: new Date().toISOString(),
    }
    setMemoLogs([newMemo, ...memoLogs])
    setMemoText("")
    setMemoRating(0)
    setMemoDialogOpen(false)
  }

  const handleHistoryImport = () => {
    if (historyFile) {
      console.log("[v0] Importing post history from file:", historyFile.name)
      // Process CSV/Excel file here
      setHistoryImportDialogOpen(false)
      setHistoryFile(null)
    }
  }

  const handleCommentImport = () => {
    if (commentFile) {
      console.log("[v0] Importing comments from file:", commentFile.name)
      // Process CSV/Excel file here
      setCommentImportDialogOpen(false)
      setCommentFile(null)
    }
  }

  const handleAddTag = () => {
    if (newTag && selectedComment) {
      const updatedComments = comments.map((c) =>
        c.id === selectedComment.id ? { ...c, tags: [...(c.tags || []), newTag] } : c,
      )
      setComments(updatedComments)
      setNewTag("")
    }
  }

  const handleRemoveTag = (commentId: string, tagToRemove: string) => {
    const updatedComments = comments.map((c) =>
      c.id === commentId ? { ...c, tags: c.tags.filter((t) => t !== tagToRemove) } : c,
    )
    setComments(updatedComments)
  }

  const openTagDialog = (comment: any) => {
    setSelectedComment(comment)
    setTagDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขโพสต์</h1>
          <p className="text-muted-foreground">แก้ไขข้อมูลและสถิติของโพสต์</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === "active" ? "default" : "secondary"} className="text-sm px-3 py-1">
            {status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setStatusDialogOpen(true)}>
            เปลี่ยนสถานะ
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMemoDialogOpen(true)}>
            <Star className="mr-2 h-4 w-4" />
            เพิ่ม Memo
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลโพสต์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="externalPostId">Post ID *</Label>
                <Input
                  id="externalPostId"
                  required
                  placeholder="รหัสโพสต์จากแพลตฟอร์ม"
                  value={externalPostId}
                  onChange={(e) => setExternalPostId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignId">แคมเปญ</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแคมเปญ (ถ้ามี)" />
                </SelectTrigger>
                <SelectContent>
                  {mockCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.projects?.accounts?.name} - {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kolId">KOL *</Label>
                <Select
                  value={kolId}
                  onValueChange={(value) => {
                    setKolId(value)
                    setKolChannelId("")
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก KOL" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockKols.map((kol) => (
                      <SelectItem key={kol.id} value={kol.id}>
                        {kol.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kolChannelId">ช่องทาง *</Label>
                <Select value={kolChannelId} onValueChange={setKolChannelId} required disabled={!kolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่องทาง" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((ch: any) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.channel_type} - @{ch.handle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contentType">ประเภทคอนเทนต์</Label>
                <Input
                  id="contentType"
                  placeholder="post, reel, story, video"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postedAt">วันที่โพสต์</Label>
                <Input
                  id="postedAt"
                  type="datetime-local"
                  value={postedAt}
                  onChange={(e) => setPostedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea id="caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถิติโพสต์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {(selectedChannelType === "TikTok" ||
                selectedChannelType === "YouTube" ||
                selectedChannelType === "Facebook") && (
                <div className="space-y-2">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    type="number"
                    placeholder="0"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="likes">{selectedChannelType === "Facebook" ? "Reactions" : "Likes"}</Label>
                <Input
                  id="likes"
                  type="number"
                  placeholder="0"
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  type="number"
                  placeholder="0"
                  value={commentsCount}
                  onChange={(e) => setCommentsCount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shares">Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="0"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(selectedChannelType === "TikTok" || selectedChannelType === "Instagram") && (
                <div className="space-y-2">
                  <Label htmlFor="saves">Saves</Label>
                  <Input
                    id="saves"
                    type="number"
                    placeholder="0"
                    value={saves}
                    onChange={(e) => setSaves(e.target.value)}
                  />
                </div>
              )}

              {(selectedChannelType === "Instagram" || selectedChannelType === "Facebook") && (
                <div className="space-y-2">
                  <Label htmlFor="reach">Reach</Label>
                  <Input
                    id="reach"
                    type="number"
                    placeholder="0"
                    value={reach}
                    onChange={(e) => setReach(e.target.value)}
                  />
                </div>
              )}
            </div>

            {selectedChannelType && (
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <p className="font-semibold">สถิติสำหรับ {selectedChannelType}:</p>
                {selectedChannelType === "TikTok" && <p>Views, Likes, Comments, Shares, Saves</p>}
                {selectedChannelType === "Instagram" && <p>Likes, Comments, Saves, Reach</p>}
                {selectedChannelType === "YouTube" && <p>Views, Likes, Comments, Shares</p>}
                {selectedChannelType === "Facebook" && <p>Views, Reactions, Comments, Shares, Reach</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memo Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {memoLogs.length > 0 ? (
              <div className="space-y-3">
                {memoLogs.map((memo) => (
                  <div key={memo.id} className="rounded-lg border-2 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{memo.created_by}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= memo.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(memo.created_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{memo.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">ยังไม่มี Memo Log</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ประวัติการโพสต์</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setHistoryImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import ประวัติ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Import ไฟล์ CSV/Excel ที่มีข้อมูลประวัติการโพสต์ (วันที่, เวลา, สถิติ)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                คอมเมนต์
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setCommentImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import คอมเมนต์
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border-2 p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{comment.author}</p>
                      <p className="text-sm mt-1">{comment.text}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => openTagDialog(comment)}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {comment.tags && comment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {comment.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(comment.id, tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">ยังไม่มีคอมเมนต์</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </form>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะโพสต์</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>สถานะ</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>เหตุผล</Label>
              <Textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="ระบุเหตุผลในการเปลี่ยนสถานะ..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleStatusChange}>บันทึก</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={memoDialogOpen} onOpenChange={setMemoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Memo Log</DialogTitle>
            <DialogDescription>บันทึกข้อมูลการทำงานและให้คะแนน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>ให้คะแนน</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setMemoRating(star)} className="focus:outline-none">
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= memoRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>บันทึก</Label>
              <Textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="เขียนบันทึกการทำงาน..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMemoDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAddMemo} disabled={!memoText || memoRating === 0}>
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyImportDialogOpen} onOpenChange={setHistoryImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import ประวัติการโพสต์</DialogTitle>
            <DialogDescription>
              อัพโหลดไฟล์ CSV/Excel ที่มีข้อมูล: วันที่, เวลา, views, likes, comments, shares, saves
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="historyFile">เลือกไฟล์</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="historyFile"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setHistoryFile(e.target.files?.[0] || null)}
                />
                {historyFile && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {historyFile.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-semibold mb-1">รูปแบบไฟล์:</p>
              <p className="text-muted-foreground">date, time, views, likes, comments, shares, saves</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setHistoryImportDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleHistoryImport} disabled={!historyFile}>
                <FileUp className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={commentImportDialogOpen} onOpenChange={setCommentImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import คอมเมนต์</DialogTitle>
            <DialogDescription>อัพโหลดไฟล์ CSV/Excel ที่มีข้อมูล: author, text, timestamp, like_count</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="commentFile">เลือกไฟล์</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commentFile"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setCommentFile(e.target.files?.[0] || null)}
                />
                {commentFile && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {commentFile.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-semibold mb-1">รูปแบบไฟล์:</p>
              <p className="text-muted-foreground">author, text, timestamp, like_count</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCommentImportDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCommentImport} disabled={!commentFile}>
                <FileUp className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Tag ให้คอมเมนต์</DialogTitle>
            <DialogDescription>
              {selectedComment?.author}: {selectedComment?.text}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Tag ใหม่</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="เช่น positive, question, complaint"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag} disabled={!newTag}>
                  เพิ่ม
                </Button>
              </div>
            </div>
            {selectedComment?.tags && selectedComment.tags.length > 0 && (
              <div>
                <Label className="mb-2 block">Tags ปัจจุบัน</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedComment.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(selectedComment.id, tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-semibold mb-1">Tag ที่แนะนำ:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["positive", "negative", "question", "complaint", "suggestion", "spam"].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setNewTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setTagDialogOpen(false)}>ปิด</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
