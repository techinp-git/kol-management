"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, FileText, MessageSquare } from "lucide-react"

const importOptions = [
  {
    title: "นำเข้า Post Information",
    description: "รายละเอียดโพสต์, URL, Post ID, งบประมาณ และ remark ต่าง ๆ",
    href: "/dashboard/import/post-info",
    icon: Info,
  },
  {
    title: "นำเข้า Post Metrics",
    description: "สถิติ impressions, reach, engagement, clicks และ views ของโพสต์",
    href: "/dashboard/import/post-metrics",
    icon: FileText,
  },
  {
    title: "นำเข้า Post Comments",
    description: "คอมเมนต์, ผู้เขียน, เวลา, จำนวนไลก์ และแท็กของโพสต์",
    href: "/dashboard/import/post-comments",
    icon: MessageSquare,
  },
]

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ศูนย์นำเข้าข้อมูล</h1>
        <p className="text-muted-foreground">
          เลือกประเภทข้อมูลที่ต้องการนำเข้า ระบบจะแสดงฟอร์มและรูปแบบไฟล์ตัวอย่างสำหรับแต่ละรายการ
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {importOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card key={option.href} className="flex h-full flex-col border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="rounded-md bg-black p-2 text-[#FFFF00]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </div>
            </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild className="w-full">
                  <Link href={option.href}>ไปที่หน้า {option.title}</Link>
              </Button>
            </CardContent>
          </Card>
          )
        })}
              </div>
    </div>
  )
}
