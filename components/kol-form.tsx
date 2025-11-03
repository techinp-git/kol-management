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
import { Plus, X, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const CHANNEL_TYPES = ["facebook", "instagram", "tiktok", "youtube", "twitter", "line", "other"]

const CATEGORIES = ["Fashion", "Beauty", "Food", "Travel", "Tech", "Gaming", "Lifestyle", "Fitness", "Business"]

export function KOLForm({ kol }: { kol?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Basic info
  const [name, setName] = useState(kol?.name || "")
  const [handle, setHandle] = useState(kol?.handle || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(kol?.category || [])
  const [country, setCountry] = useState(kol?.country || "TH")
  const [contactEmail, setContactEmail] = useState(kol?.contact_email || "")
  const [contactPhone, setContactPhone] = useState(kol?.contact_phone || "")
  const [bio, setBio] = useState(kol?.bio || "")
  const [notes, setNotes] = useState(kol?.notes || "")

  // Channels with history
  const [channels, setChannels] = useState<any[]>([])

  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category))
  }

  const addChannel = () => {
    setChannels([
      ...channels,
      {
        channel_type: "instagram",
        handle: "",
        profile_url: "",
        follower_count: 0,
        history: [
          {
            date: new Date().toISOString().split("T")[0],
            follower_count: 0,
          },
        ],
      },
    ])
  }

  const removeChannel = (index: number) => {
    setChannels(channels.filter((_, i) => i !== index))
  }

  const updateChannel = (index: number, field: string, value: any) => {
    const updated = [...channels]
    updated[index] = { ...updated[index], [field]: value }
    setChannels(updated)
  }

  const addHistoryEntry = (channelIndex: number) => {
    const updated = [...channels]
    updated[channelIndex].history = [
      ...(updated[channelIndex].history || []),
      {
        date: new Date().toISOString().split("T")[0],
        follower_count: updated[channelIndex].follower_count || 0,
      },
    ]
    setChannels(updated)
  }

  const removeHistoryEntry = (channelIndex: number, historyIndex: number) => {
    const updated = [...channels]
    updated[channelIndex].history = updated[channelIndex].history.filter((_: any, i: number) => i !== historyIndex)
    setChannels(updated)
  }

  const updateHistoryEntry = (channelIndex: number, historyIndex: number, field: string, value: any) => {
    const updated = [...channels]
    updated[channelIndex].history[historyIndex] = {
      ...updated[channelIndex].history[historyIndex],
      [field]: value,
    }
    setChannels(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/kols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          handle,
          category: selectedCategories,
          country,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          bio,
          notes,
          status: "draft",
          channels,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save KOL")
      }

      const data = await response.json()
      router.push(`/dashboard/kols/${data.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ KOL *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <Input id="handle" placeholder="@username" value={handle} onChange={(e) => setHandle(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>หมวดหมู่</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={addCategory}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((cat) => !selectedCategories.includes(cat)).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">อีเมล</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">เบอร์โทร</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">ประวัติ</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ช่องทางโซเชียลมีเดีย</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addChannel}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มช่องทาง
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีช่องทาง คลิกปุ่มด้านบนเพื่อเพิ่ม</p>
          ) : (
            channels.map((channel, index) => (
              <Card key={index}>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start justify-between">
                    <div className="grid flex-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>ประเภทช่องทาง</Label>
                        <Select
                          value={channel.channel_type}
                          onValueChange={(value) => updateChannel(index, "channel_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CHANNEL_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Handle</Label>
                        <Input
                          value={channel.handle}
                          onChange={(e) => updateChannel(index, "handle", e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL โปรไฟล์</Label>
                        <Input
                          value={channel.profile_url}
                          onChange={(e) => updateChannel(index, "profile_url", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>จำนวนผู้ติดตามปัจจุบัน</Label>
                        <Input
                          type="number"
                          value={channel.follower_count}
                          onChange={(e) => updateChannel(index, "follower_count", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChannel(index)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">ประวัติผู้ติดตาม</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addHistoryEntry(index)}>
                        <Calendar className="mr-2 h-3 w-3" />
                        เพิ่มประวัติ
                      </Button>
                    </div>

                    {channel.history && channel.history.length > 0 ? (
                      <div className="space-y-2">
                        {channel.history.map((entry: any, historyIndex: number) => (
                          <div key={historyIndex} className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateHistoryEntry(index, historyIndex, "date", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={entry.follower_count}
                              onChange={(e) =>
                                updateHistoryEntry(
                                  index,
                                  historyIndex,
                                  "follower_count",
                                  Number.parseInt(e.target.value) || 0,
                                )
                              }
                              placeholder="จำนวนผู้ติดตาม"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHistoryEntry(index, historyIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">ยังไม่มีประวัติ คลิกปุ่มด้านบนเพื่อเพิ่ม</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">จัดการอัตราค่าบริการของ KOL สำหรับแต่ละประเภทโพสต์</p>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/rate-cards/new")}>
            <DollarSign className="mr-2 h-4 w-4" />
            สร้าง Rate Card
          </Button>
          <p className="text-xs text-muted-foreground mt-2">หมายเหตุ: บันทึก KOL ก่อน จากนั้นจึงสามารถสร้าง Rate Card ได้</p>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </form>
  )
}
