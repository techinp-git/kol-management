import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

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
  const kols = [
    {
      id: "1",
      name: "สมชาย ใจดี",
      handle: "somchai_lifestyle",
      category: ["Lifestyle", "Travel"],
      status: "active" as KOLStatus,
      created_at: "2024-01-15",
      kol_channels: [
        {
          id: "1",
          channel_type: "Instagram",
          handle: "somchai_lifestyle",
          follower_count: 125000,
          engagement_rate: 4.5,
        },
        { id: "2", channel_type: "TikTok", handle: "somchai_tt", follower_count: 89000, engagement_rate: 6.2 },
        { id: "3", channel_type: "YouTube", handle: "SomchaiVlogs", follower_count: 45000, engagement_rate: 3.8 },
      ],
    },
    {
      id: "2",
      name: "มาลี สวยงาม",
      handle: "malee_beauty",
      category: ["Beauty", "Fashion"],
      status: "active" as KOLStatus,
      created_at: "2024-01-20",
      kol_channels: [
        { id: "4", channel_type: "Instagram", handle: "malee_beauty", follower_count: 250000, engagement_rate: 5.8 },
        { id: "5", channel_type: "YouTube", handle: "MaleeBeauty", follower_count: 180000, engagement_rate: 4.2 },
      ],
    },
    {
      id: "3",
      name: "ปิยะ เทคโนโลยี",
      handle: "piya_tech",
      category: ["Technology", "Gaming"],
      status: "inactive" as KOLStatus,
      created_at: "2024-02-01",
      kol_channels: [
        { id: "6", channel_type: "YouTube", handle: "PiyaTech", follower_count: 320000, engagement_rate: 7.1 },
        { id: "7", channel_type: "TikTok", handle: "piya_tech", follower_count: 156000, engagement_rate: 8.3 },
      ],
    },
    {
      id: "4",
      name: "นภา อาหาร",
      handle: "napa_foodie",
      category: ["Food", "Lifestyle"],
      status: "active" as KOLStatus,
      created_at: "2024-02-10",
      kol_channels: [
        { id: "8", channel_type: "Instagram", handle: "napa_foodie", follower_count: 95000, engagement_rate: 6.5 },
        { id: "9", channel_type: "TikTok", handle: "napa_eats", follower_count: 210000, engagement_rate: 9.2 },
      ],
    },
  ]

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
                          <span>@{kol.handle}</span>
                          <span>•</span>
                          <span>{kol.category.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {kol.kol_channels.slice(0, 3).map((channel: any) => (
                          <Badge key={channel.id} variant="secondary">
                            {channel.channel_type}
                          </Badge>
                        ))}
                        {kol.kol_channels.length > 3 && (
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
        </CardContent>
      </Card>
    </div>
  )
}
