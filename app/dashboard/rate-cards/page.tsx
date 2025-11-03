import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Calendar, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function RateCardsPage() {
  const supabase = await createServerClient()

  const { data: rateCards, error } = await supabase
    .from("rate_cards")
    .select(`
      *,
      kol:kols(name, email),
      rate_items(count)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching rate cards:", error)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      expired: "destructive",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Cards</h1>
          <p className="text-muted-foreground">จัดการอัตราค่าบริการของ KOL</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/rate-cards/new">
            <Plus className="mr-2 h-4 w-4" />
            สร้าง Rate Card
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rateCards?.map((card) => (
          <Link key={card.id} href={`/dashboard/rate-cards/${card.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {card.kol?.name || "ไม่ระบุ KOL"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(card.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{card.rate_items?.[0]?.count || 0} รายการ</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(card.effective_from).toLocaleDateString("th-TH")}
                      {card.effective_to && ` - ${new Date(card.effective_to).toLocaleDateString("th-TH")}`}
                    </span>
                  </div>
                  {card.description && <p className="text-muted-foreground line-clamp-2 mt-2">{card.description}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {(!rateCards || rateCards.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มี Rate Card</h3>
            <p className="text-muted-foreground text-center mb-4">เริ่มต้นสร้าง Rate Card เพื่อกำหนดอัตราค่าบริการของ KOL</p>
            <Button asChild>
              <Link href="/dashboard/rate-cards/new">
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
