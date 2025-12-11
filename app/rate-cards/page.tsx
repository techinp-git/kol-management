import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Calendar, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function RateCardsPage() {
  const supabase = await createClient()

  const { data: rateCards, error } = await supabase
    .from("rate_cards")
    .select(`
      *,
      kol:kols(id, name, contact_email),
      rate_items(id)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching rate cards:", error)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Cards</h1>
          <p className="text-muted-foreground">จัดการอัตราค่าบริการของ KOL</p>
        </div>
        <Button asChild>
          <Link href="/rate-cards/new">
            <Plus className="mr-2 h-4 w-4" />
            สร้าง Rate Card
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rateCards?.map((card: any) => {
          const status = getStatus(card.effective_from, card.effective_to)
          const cardName = card.kol?.name 
            ? `${card.kol.name} - เวอร์ชัน ${card.version}`
            : `Rate Card เวอร์ชัน ${card.version}`
          const rateItemsCount = card.rate_items?.length || 0
          
          return (
          <Link key={card.id} href={`/rate-cards/${card.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                      <CardTitle className="text-lg">{cardName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {card.kol?.name || "ไม่ระบุ KOL"}
                    </CardDescription>
                  </div>
                    {getStatusBadge(status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                      <span>{rateItemsCount} รายการ</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(card.effective_from).toLocaleDateString("th-TH")}
                      {card.effective_to && ` - ${new Date(card.effective_to).toLocaleDateString("th-TH")}`}
                    </span>
                  </div>
                    {card.notes && <p className="text-muted-foreground line-clamp-2 mt-2">{card.notes}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
          )
        })}
      </div>

      {(!rateCards || rateCards.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มี Rate Card</h3>
            <p className="text-muted-foreground text-center mb-4">เริ่มต้นสร้าง Rate Card เพื่อกำหนดอัตราค่าบริการของ KOL</p>
            <Button asChild>
              <Link href="/rate-cards/new">
                <Plus className="mr-2 h-4 w-4" />
                สร้าง Rate Card แรก
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
