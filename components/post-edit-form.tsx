"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { extractPostId, detectPlatformFromUrl, extractPageInfo } from "@/lib/utils/extractPostId"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function PostEditForm({ post, campaigns, kols }: { post: any; campaigns: any[]; kols: any[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [externalPostId, setExternalPostId] = useState(post.external_post_id || "")
  const [pageName, setPageName] = useState("")
  const [pageId, setPageId] = useState("")
  const [postName, setPostName] = useState(post.post_name || "")
  const [campaignId, setCampaignId] = useState(post.campaign_id || "")
  const [kolId, setKolId] = useState(post.kol_channels?.kols?.id || "")
  const [kolChannelId, setKolChannelId] = useState(post.kol_channel_id || "")
  const [url, setUrl] = useState(post.url || "")
  const [contentType, setContentType] = useState(post.content_type || "")
  const [caption, setCaption] = useState(post.caption || "")
  const [postedAt, setPostedAt] = useState(post.posted_at ? new Date(post.posted_at).toISOString().slice(0, 16) : "")
  const [boostBudget, setBoostBudget] = useState(post.boost_budget ? post.boost_budget.toString() : "")
  const [remark, setRemark] = useState(post.remark || post.notes || "")

  const getKolChannels = (kolId: string) => {
    const kol = kols.find((k) => k.id === kolId)
    return kol?.kol_channels || []
  }

  const getSelectedChannelType = () => {
    if (!kolChannelId) return null
    const channels = getKolChannels(kolId)
    const channel = channels.find((ch: any) => ch.id === kolChannelId)
    return channel?.channel_type || null
  }

  const selectedChannelType = getSelectedChannelType()

  // Auto-extract post ID and page info from URL when URL changes
  useEffect(() => {
    if (url) {
      const detectedPlatform = detectPlatformFromUrl(url)
      const platform = detectedPlatform || selectedChannelType
      if (platform) {
        const postId = extractPostId(url, platform)
        if (postId) {
          setExternalPostId(postId)
        } else {
          setExternalPostId("")
        }

        const pageInfo = extractPageInfo(url, platform)
        if (pageInfo.pageId) {
          setPageId(pageInfo.pageId)
        } else {
          setPageId("")
        }
        if (pageInfo.pageName) {
          setPageName(pageInfo.pageName)
        } else {
          setPageName("")
        }
      } else {
        setExternalPostId("")
        setPageId("")
        setPageName("")
      }
    } else {
      setExternalPostId("")
      setPageId("")
      setPageName("")
    }
  }, [url, selectedChannelType])

  // Auto-detect platform from URL and suggest matching channel
  useEffect(() => {
    if (url && !kolChannelId && kolId) {
      const detectedPlatform = detectPlatformFromUrl(url)
      if (detectedPlatform) {
        const channels = getKolChannels(kolId)
        const matchingChannel = channels.find(
          (ch: any) => ch.channel_type?.toLowerCase() === detectedPlatform.toLowerCase()
        )
        if (matchingChannel) {
          setKolChannelId(matchingChannel.id)
        }
      }
    }
  }, [url, kolId, kolChannelId])

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
  }

  const handleExtractPostId = () => {
    if (url) {
      const detectedPlatform = detectPlatformFromUrl(url)
      const platform = detectedPlatform || selectedChannelType
      if (platform) {
        const postId = extractPostId(url, platform)
        if (postId) {
          setExternalPostId(postId)
        } else {
          setError("ไม่สามารถดึง Post ID จาก URL นี้ได้ กรุณาตรวจสอบ URL หรือเลือก Channel")
        }

        const pageInfo = extractPageInfo(url, platform)
        if (pageInfo.pageId) {
          setPageId(pageInfo.pageId)
        }
        if (pageInfo.pageName) {
          setPageName(pageInfo.pageName)
        }
      } else {
        setError("ไม่สามารถ detect platform จาก URL ได้ กรุณาเลือก Channel ก่อน")
      }
    } else {
      setError("กรุณาใส่ URL ก่อน")
    }
  }

  const getPostIdStatus = () => {
    if (!url) return null
    const detectedPlatform = detectPlatformFromUrl(url)
    const platform = detectedPlatform || selectedChannelType
    if (platform) {
      const postId = extractPostId(url, platform)
      if (postId) {
        return { success: true, postId, platform: detectedPlatform || selectedChannelType }
      }
    }
    return { success: false, postId: null, platform: null }
  }

  const postIdStatus = getPostIdStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!campaignId) {
      setError("กรุณาเลือกแคมเปญ")
      setIsLoading(false)
      return
    }

    if (!kolChannelId) {
      setError("กรุณาเลือกช่องทางของ KOL")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_name: postName || null,
          url,
          content_type: contentType || null,
          caption: caption || null,
          posted_at: postedAt || null,
          boost_budget: boostBudget ? parseFloat(boostBudget) : 0,
          remark: remark || null,
          campaign_id: campaignId || null,
          kol_channel_id: kolChannelId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update post")
      }

      router.push(`/dashboard/posts/${post.id}`)
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error updating post:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const channels = getKolChannels(kolId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลโพสต์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Field - First */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              required
              placeholder="https://..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            {url && (
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const detectedPlatform = detectPlatformFromUrl(url)
                  const platform = detectedPlatform || selectedChannelType
                  if (platform) {
                    const postId = extractPostId(url, platform)
                    if (postId) {
                      return `Post ID: ${postId}${detectedPlatform ? ` (Platform: ${detectedPlatform})` : ""}`
                    }
                  }
                  return "ไม่สามารถดึง Post ID จาก URL นี้ได้"
                })()}
              </p>
            )}
          </div>

          {/* Post ID - Auto-filled from URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="externalPostId">Post ID *</Label>
              {url && (
                <div className="flex items-center gap-2">
                  {postIdStatus?.success ? (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      ได้ Post ID แล้ว
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      ยังไม่ได้ Post ID
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExtractPostId}
                    disabled={!url}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    ดึง Post ID
                  </Button>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                id="externalPostId"
                required
                placeholder="รหัสโพสต์จากแพลตฟอร์ม (จะถูกดึงอัตโนมัติจาก URL)"
                value={externalPostId}
                onChange={(e) => setExternalPostId(e.target.value)}
                className={postIdStatus?.success ? "border-green-500 focus-visible:border-green-500" : ""}
                readOnly
              />
              {postIdStatus?.success && externalPostId && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {/* Page Name/ID - After Post ID */}
          {(pageId || pageName) && (
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name / Page ID</Label>
              <Input
                id="pageName"
                placeholder="ชื่อเพจหรือรหัสเพจ (ดึงอัตโนมัติจาก URL)"
                value={pageName || pageId || ""}
                readOnly
                className="bg-muted"
              />
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {pageId && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Page ID:</span>
                    <span>{pageId}</span>
                  </span>
                )}
                {pageName && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Page Name:</span>
                    <span>{pageName}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Post Name */}
          <div className="space-y-2">
            <Label htmlFor="postName">Post Name</Label>
            <Input
              id="postName"
              placeholder="ชื่อโพสต์"
              value={postName}
              onChange={(e) => setPostName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaignId">แคมเปญ *</Label>
            <Select value={campaignId} onValueChange={setCampaignId} required>
              <SelectTrigger>
                <SelectValue placeholder="เลือกแคมเปญ" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
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
                  {kols.map((kol) => (
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
            <Label htmlFor="boostBudget">Budget Boost (฿)</Label>
            <Input
              id="boostBudget"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={boostBudget}
              onChange={(e) => setBoostBudget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" rows={3} placeholder="หมายเหตุ/บันทึกเพิ่มเติม" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isLoading || !kolChannelId || !campaignId}>
          {isLoading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </form>
  )
}

