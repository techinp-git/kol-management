import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Calendar, User, DollarSign } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function RateCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rateCard, error } = await supabase
    .from("rate_cards")
    .select(`
      *,
      kol:kols(id, name, contact_email),
      rate_items(*)
    `)
    .eq("id", id)
    .single()

  if (error || !rateCard) {
    notFound()
  }

  // Calculate status based on effective dates
  const getStatus = (effectiveFrom: string, effectiveTo: string | null) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const from = new Date(effectiveFrom)
    from.setHours(0, 0, 0, 0)
    
    if (effectiveTo) {
      const to = new Date(effectiveTo)
      to.setHours(0, 0, 0, 0)
      if (to < today) {
        return "expired"
      }
      if (from > today) {
        return "draft"
      }
      return "active"
    }
    
    // No end date means active
    if (from > today) {
      return "draft"
    }
    return "active"
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      expired: "destructive",
    }
    const labels: Record<string, string> = {
      draft: "แบบร่าง",
      active: "ใช้งาน",
      expired: "หมดอายุ",
    }
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const status = getStatus(rateCard.effective_from, rateCard.effective_to)
  const cardName = rateCard.kol?.name 
    ? `${rateCard.kol.name} - เวอร์ชัน ${rateCard.version}`
    : `Rate Card เวอร์ชัน ${rateCard.version}`

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{cardName}</h1>
            {getStatusBadge(status)}
          </div>
          {rateCard.notes && <p className="text-muted-foreground">{rateCard.notes}</p>}
        </div>
        <Button asChild>
          <Link href={`/dashboard/rate-cards/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            แก้ไข
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูล KOL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{rateCard.kol?.name || "ไม่ระบุ KOL"}</p>
                {rateCard.kol?.contact_email && (
                  <p className="text-sm text-muted-foreground">{rateCard.kol.contact_email}</p>
                )}
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
              <Link href={`/dashboard/kols/${rateCard.kol?.id}`}>ดูโปรไฟล์ KOL</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ระยะเวลาใช้งาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">เริ่มใช้งาน</p>
                <p className="font-medium">
                  {new Date(rateCard.effective_from).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            {rateCard.effective_to && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">สิ้นสุด</p>
                  <p className="font-medium">
                    {new Date(rateCard.effective_to).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการอัตราค่าบริการ</CardTitle>
          <CardDescription>ราคาสำหรับแต่ละประเภทโพสต์</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rateCard.rate_items?.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium capitalize">
                          {item.channel_type} - {item.content_type}
                        </p>
                      </div>
                      {item.addons && Object.keys(item.addons).length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Add-ons: {Object.keys(item.addons).join(", ")}
                        </p>
                      )}
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(parseFloat(item.base_rate), rateCard.currency || "THB")}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!rateCard.rate_items || rateCard.rate_items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">ยังไม่มีรายการอัตราค่าบริการ</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
