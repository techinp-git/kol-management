import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Target, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function DashboardPage() {
  const supabase = await createClient()

  let hasError = false
  let kolCount = 0
  let accountCount = 0
  let campaignCount = 0
  let postCount = 0

  try {
    // Fetch counts for dashboard stats
    const results = await Promise.all([
      supabase.from("kols").select("*", { count: "exact", head: true }),
      supabase.from("accounts").select("*", { count: "exact", head: true }),
      supabase.from("campaigns").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
    ])

    kolCount = results[0].count || 0
    accountCount = results[1].count || 0
    campaignCount = results[2].count || 0
    postCount = results[3].count || 0

    // Check if any query returned an error
    hasError = results.some((result) => result.error)
  } catch (error) {
    console.error("[v0] Dashboard data fetch error:", error)
    hasError = true
  }

  const stats = [
    {
      title: "KOL ทั้งหมด",
      value: kolCount,
      icon: Users,
      description: "จำนวน KOL ในระบบ",
    },
    {
      title: "บัญชีลูกค้า",
      value: accountCount,
      icon: Briefcase,
      description: "จำนวนบัญชีลูกค้า",
    },
    {
      title: "แคมเปญ",
      value: campaignCount,
      icon: Target,
      description: "แคมเปญที่กำลังดำเนินการ",
    },
    {
      title: "โพสต์",
      value: postCount,
      icon: FileText,
      description: "โพสต์ทั้งหมด",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ภาพรวม</h1>
        <p className="text-muted-foreground">สรุปข้อมูลระบบจัดการ KOL</p>
      </div>

      {hasError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ต้องการตั้งค่าฐานข้อมูล</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>ระบบตรวจพบว่าฐานข้อมูลยังไม่ได้ถูกตั้งค่า กรุณารันสคริปต์ SQL ในโฟลเดอร์ /scripts เพื่อสร้างตารางฐานข้อมูล</p>
            <p className="text-sm">สคริปต์ที่ต้องรัน: 001_create_profiles_and_roles.sql ถึง 012_seed_default_tags.sql</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ยินดีต้อนรับสู่ระบบจัดการ KOL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            ระบบนี้ช่วยให้คุณสามารถจัดการ KOL, ติดตามแคมเปญ, วิเคราะห์ผลลัพธ์ และจัดการข้อมูลได้อย่างมีประสิทธิภาพ
          </p>
          <p className="text-sm text-muted-foreground">เริ่มต้นใช้งานโดยเลือกเมนูด้านซ้ายมือ</p>
        </CardContent>
      </Card>
    </div>
  )
}
