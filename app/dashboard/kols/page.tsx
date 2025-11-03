import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"

type KOLStatus = "active" | "inactive" | "draft" | "ban"

const getStatusBadgeVariant = (status: KOLStatus) => {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    case "draft":
      return "outline"
    case "ban":
      return "destructive"
    default:
      return "secondary"
  }
}

const getStatusLabel = (status: KOLStatus) => {
  switch (status) {
    case "active":
      return "ใช้งาน"
    case "inactive":
      return "ไม่ใช้งาน"
    case "draft":
      return "แบบร่าง"
    case "ban":
      return "ระงับ"
    default:
      return status
  }
}

export default async function KOLsPage() {
  const supabase = await createClient()

  const { data: kols, error } = await supabase
    .from("kols")
    .select(`
      *,
      kol_channels (
        id,
        channel_type,
        handle,
        follower_count,
        engagement_rate
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching KOLs:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KOL</h1>
          <p className="text-muted-foreground">จัดการข้อมูล KOL และช่องทางโซเชียลมีเดีย</p>
        </div>
        <Link href="/dashboard/kols/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่ม KOL
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ค้นหา KOL..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!kols || kols.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">ยังไม่มี KOL ในระบบ</p>
              <Link href="/dashboard/kols/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่ม KOL แรก
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {kols.map((kol) => (
                <Link key={kol.id} href={`/dashboard/kols/${kol.id}`} className="block">
                  <Card className="cursor-pointer transition-colors hover:bg-accent">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                          {kol.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{kol.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {kol.handle && (
                              <>
                                <span>@{kol.handle}</span>
                                <span>•</span>
                              </>
                            )}
                            {kol.category && Array.isArray(kol.category) && <span>{kol.category.join(", ")}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {kol.kol_channels?.slice(0, 3).map((channel: any) => (
                            <Badge key={channel.id} variant="secondary">
                              {channel.channel_type}
                            </Badge>
                          ))}
                          {kol.kol_channels && kol.kol_channels.length > 3 && (
                            <Badge variant="secondary">+{kol.kol_channels.length - 3}</Badge>
                          )}
                        </div>
                        <Badge variant={getStatusBadgeVariant(kol.status)}>{getStatusLabel(kol.status)}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
