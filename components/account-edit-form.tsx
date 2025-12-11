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
import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type SocialChannel = {
  id?: string
  channel_type: string
  handle: string
  profile_url: string
  follower_count: number
  verified: boolean
  status?: string
}

export function AccountEditForm({ account }: { account: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(account.name || "")
  const [companyName, setCompanyName] = useState(account.company_name || "")
  const [taxId, setTaxId] = useState(account.tax_id || "")
  const [billingAddress, setBillingAddress] = useState(account.billing_address || "")
  const [primaryContactName, setPrimaryContactName] = useState(account.primary_contact_name || "")
  const [primaryContactEmail, setPrimaryContactEmail] = useState(account.primary_contact_email || "")
  const [primaryContactPhone, setPrimaryContactPhone] = useState(account.primary_contact_phone || "")
  const [currency, setCurrency] = useState(account.currency || "THB")
  const [creditTerms, setCreditTerms] = useState(account.credit_terms?.toString() || "30")
  const [status, setStatus] = useState(account.status || "active")
  const [notes, setNotes] = useState(account.notes || "")

  // Social channels - map from account_channels to social_channels format
  const mappedChannels = (account.account_channels || []).map((ch: any) => ({
    id: ch.id,
    channel_type: ch.channel_type,
    handle: ch.handle,
    profile_url: ch.profile_url || "",
    follower_count: ch.follower_count || 0,
    verified: ch.verified || false,
    status: ch.status || "active",
  }))
  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>(mappedChannels)
  const [newChannel, setNewChannel] = useState({
    channel_type: "Instagram",
    handle: "",
    profile_url: "",
    follower_count: 0,
    verified: false,
  })

  const addSocialChannel = () => {
    if (newChannel.handle) {
      setSocialChannels([
        ...socialChannels,
        {
          ...newChannel,
          _tempId: `temp-${Date.now()}-${Math.random()}`,
        },
      ])
      setNewChannel({
        channel_type: "Instagram",
        handle: "",
        profile_url: "",
        follower_count: 0,
        verified: false,
      })
    }
  }

  const removeSocialChannel = (index: number) => {
    setSocialChannels(socialChannels.filter((_, i) => i !== index))
  }

  const updateChannel = (index: number, field: string, value: any) => {
    const updated = [...socialChannels]
    updated[index] = { ...updated[index], [field]: value }
    setSocialChannels(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        name,
        company_name: companyName,
        tax_id: taxId,
        billing_address: billingAddress,
        primary_contact_name: primaryContactName,
        primary_contact_email: primaryContactEmail,
        primary_contact_phone: primaryContactPhone,
        currency,
        credit_terms: Number.parseInt(creditTerms) || 30,
        status,
        notes,
        social_channels: socialChannels.map((ch) => ({
          id: ch.id, // Include id for existing channels
          channel_type: ch.channel_type,
          handle: ch.handle,
          profile_url: ch.profile_url,
          follower_count: ch.follower_count,
          verified: ch.verified,
          status: ch.status || "active",
        })),
      }

      console.log("[v0] Updating account with social channels:", payload)

      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update account")
      }

      router.push("/accounts")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error updating account:", err)
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
              <Label htmlFor="name">ชื่อบัญชี *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">ชื่อบริษัท</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxId">เลขผู้เสียภาษี</Label>
              <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">สกุลเงิน</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">THB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">ที่อยู่ใบกำกับภาษี</Label>
            <Textarea
              id="billingAddress"
              rows={3}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ผู้ติดต่อหลัก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryContactName">ชื่อผู้ติดต่อ</Label>
            <Input
              id="primaryContactName"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryContactEmail">อีเมล</Label>
              <Input
                id="primaryContactEmail"
                type="email"
                value={primaryContactEmail}
                onChange={(e) => setPrimaryContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactPhone">เบอร์โทร</Label>
              <Input
                id="primaryContactPhone"
                value={primaryContactPhone}
                onChange={(e) => setPrimaryContactPhone(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สถานะ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">ใช้งาน</SelectItem>
                <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                <SelectItem value="suspended">ระงับ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เงื่อนไขการชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creditTerms">เครดิตเทอม (วัน)</Label>
            <Input
              id="creditTerms"
              type="number"
              value={creditTerms}
              onChange={(e) => setCreditTerms(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ช่องทางโซเชียลมีเดีย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialChannels.length > 0 && (
            <div className="space-y-2">
              {socialChannels.map((channel, index) => (
                <div key={channel.id || `temp-${index}`} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Badge>{channel.channel_type}</Badge>
                    <span className="font-medium">@{channel.handle}</span>
                    <span className="text-sm text-muted-foreground">
                      {channel.follower_count.toLocaleString()} ผู้ติดตาม
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialChannel(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>ประเภทช่องทาง</Label>
                <Select
                  value={newChannel.channel_type}
                  onValueChange={(value) => setNewChannel({ ...newChannel, channel_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="LINE">LINE</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Handle/Username</Label>
                <Input
                  placeholder="@username"
                  value={newChannel.handle}
                  onChange={(e) => setNewChannel({ ...newChannel, handle: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Profile URL</Label>
                <Input
                  placeholder="https://..."
                  value={newChannel.profile_url}
                  onChange={(e) => setNewChannel({ ...newChannel, profile_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>จำนวนผู้ติดตาม</Label>
                <Input
                  type="number"
                  value={newChannel.follower_count}
                  onChange={(e) =>
                    setNewChannel({ ...newChannel, follower_count: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialChannel}
              className="w-full bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มช่องทาง
            </Button>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </form>
  )
}

