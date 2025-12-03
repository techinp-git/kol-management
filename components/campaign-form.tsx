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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

const CHANNEL_TYPES = ["facebook", "instagram", "tiktok", "youtube", "twitter", "line", "other"]

export function CampaignForm({
  projects,
  kols,
  defaultProjectId,
  initialData,
}: {
  projects: any[]
  kols: any[]
  defaultProjectId?: string
  initialData?: any
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [projectId, setProjectId] = useState(initialData?.project_id || defaultProjectId || "")
  const [name, setName] = useState(initialData?.name || "")
  const [objective, setObjective] = useState(initialData?.objective || "")
  const [startDate, setStartDate] = useState(initialData?.start_date || "")
  const [endDate, setEndDate] = useState(initialData?.end_date || "")
  const [budget, setBudget] = useState(initialData?.budget?.toString() || "")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(initialData?.channels || [])
  const [notes, setNotes] = useState(initialData?.notes || "")

  // Map existing campaign_kols to form format
  const [selectedKols, setSelectedKols] = useState<
    Array<{
      kol_id: string
      kol_channel_id: string
      allocated_budget: string
    }>
  >(
    initialData?.campaign_kols?.map((ck: any) => ({
      kol_id: ck.kol_id,
      kol_channel_id: ck.kol_channel_id,
      allocated_budget: ck.allocated_budget ? ck.allocated_budget.toString() : "",
    })) || [],
  )

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }

  const addKol = () => {
    setSelectedKols([
      ...selectedKols,
      {
        kol_id: "",
        kol_channel_id: "",
        allocated_budget: "",
      },
    ])
  }

  const removeKol = (index: number) => {
    setSelectedKols(selectedKols.filter((_, i) => i !== index))
  }

  const updateKol = (index: number, field: string, value: string) => {
    const updated = [...selectedKols]
    updated[index] = { ...updated[index], [field]: value }

    // Reset channel when KOL changes
    if (field === "kol_id") {
      updated[index].kol_channel_id = ""
    }

    setSelectedKols(updated)
  }

  const getKolChannels = (kolId: string) => {
    const kol = kols.find((k) => k.id === kolId)
    return kol?.kol_channels || []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = initialData?.id ? `/api/campaigns/${initialData.id}` : "/api/campaigns"
      const method = initialData?.id ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          name,
          objective,
          start_date: startDate || null,
          end_date: endDate || null,
          budget: budget ? Number.parseFloat(budget) : null,
          channels: selectedChannels,
          notes,
          status: initialData?.status || "draft",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save campaign")
      }

      const campaignData = await response.json()

      // Handle campaign KOLs separately
      if (selectedKols.length > 0) {
        const kolsToInsert = selectedKols
          .filter((k) => k.kol_id && k.kol_channel_id)
          .map((k) => ({
            campaign_id: campaignData.id,
            kol_id: k.kol_id,
            kol_channel_id: k.kol_channel_id,
            allocated_budget: k.allocated_budget ? Number.parseFloat(k.allocated_budget) : null,
            status: "pending",
          }))

        if (kolsToInsert.length > 0) {
          // For update, delete existing campaign_kols first
          if (initialData?.id) {
            await fetch(`/api/campaigns/${initialData.id}/kols`, {
              method: "DELETE",
            })
          }

          // Insert new campaign KOLs
          const kolsResponse = await fetch(`/api/campaigns/${campaignData.id}/kols`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kols: kolsToInsert }),
          })

          if (!kolsResponse.ok) {
            const kolsData = await kolsResponse.json()
            console.error("[v0] Error inserting campaign KOLs:", kolsData)
            // Don't throw, just log the error
          }
        }
      }

      router.push("/dashboard/campaigns")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error saving campaign:", err)
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
          <div className="space-y-2">
            <Label htmlFor="projectId">โปรเจกต์ *</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger>
                <SelectValue placeholder="เลือกโปรเจกต์" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.accounts?.name} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">ชื่อแคมเปญ *</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">วัตถุประสงค์</Label>
            <Input
              id="objective"
              placeholder="เช่น reach, engagement, traffic, conversion"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>ช่องทางที่ใช้</Label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_TYPES.map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel}`}
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={() => toggleChannel(channel)}
                  />
                  <Label htmlFor={`channel-${channel}`} className="cursor-pointer font-normal">
                    {channel}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>งบประมาณและระยะเวลา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">งบประมาณ</Label>
            <Input id="budget" type="number" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">วันเริ่มต้น</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">วันสิ้นสุด</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>เลือก KOL</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addKol}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่ม KOL
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedKols.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มี KOL คลิกปุ่มด้านบนเพื่อเพิ่ม</p>
          ) : (
            selectedKols.map((kol, index) => {
              const selectedKol = kols.find((k) => k.id === kol.kol_id)
              const channels = getKolChannels(kol.kol_id)

              return (
                <Card key={index}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-start justify-between">
                      <div className="grid flex-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>KOL</Label>
                          <Select value={kol.kol_id} onValueChange={(value) => updateKol(index, "kol_id", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือก KOL" />
                            </SelectTrigger>
                            <SelectContent>
                              {kols.map((k) => (
                                <SelectItem key={k.id} value={k.id}>
                                  {k.name} {k.handle && `(@${k.handle})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>ช่องทาง</Label>
                          <Select
                            value={kol.kol_channel_id}
                            onValueChange={(value) => updateKol(index, "kol_channel_id", value)}
                            disabled={!kol.kol_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกช่องทาง" />
                            </SelectTrigger>
                            <SelectContent>
                              {channels.map((ch: any) => (
                                <SelectItem key={ch.id} value={ch.id}>
                                  {ch.channel_type} - @{ch.handle} ({ch.follower_count?.toLocaleString()} followers)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>งบประมาณที่จัดสรร</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={kol.allocated_budget}
                            onChange={(e) => updateKol(index, "allocated_budget", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKol(index)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {selectedKol && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {selectedKol.category?.map((cat: string) => (
                          <Badge key={cat} variant="secondary">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
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
        <Button type="submit" disabled={isLoading || !projectId}>
          {isLoading ? "กำลังบันทึก..." : initialData ? "บันทึกการแก้ไข" : "บันทึก"}
        </Button>
      </div>
    </form>
  )
}
