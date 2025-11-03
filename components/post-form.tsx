"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PostForm({ campaigns, kols }: { campaigns: any[]; kols: any[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [externalPostId, setExternalPostId] = useState("")
  const [campaignId, setCampaignId] = useState("")
  const [kolId, setKolId] = useState("")
  const [kolChannelId, setKolChannelId] = useState("")
  const [url, setUrl] = useState("")
  const [contentType, setContentType] = useState("")
  const [caption, setCaption] = useState("")
  const [postedAt, setPostedAt] = useState("")

  // Metrics
  const [likes, setLikes] = useState("")
  const [comments, setComments] = useState("")
  const [shares, setShares] = useState("")
  const [views, setViews] = useState("")
  const [reach, setReach] = useState("")
  const [saves, setSaves] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In demo mode, just redirect
      router.push("/dashboard/posts")
      router.refresh()
    } catch (err: any) {
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
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สถิติเริ่มต้น (ถ้ามี)</CardTitle>
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
                value={comments}
                onChange={(e) => setComments(e.target.value)}
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
        <Button type="submit" disabled={isLoading || !kolChannelId}>
          {isLoading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </form>
  )
}
