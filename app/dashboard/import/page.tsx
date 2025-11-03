"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MessageSquare, Download } from "lucide-react"
import { MetricsImport } from "@/components/metrics-import"
import { CommentsImport } from "@/components/comments-import"

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">นำเข้าข้อมูล</h1>
        <p className="text-muted-foreground">นำเข้าข้อมูล Engagement Metrics และ Comments จากไฟล์ CSV หรือ JSON</p>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Engagement Metrics
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>นำเข้า Engagement Metrics</CardTitle>
              <CardDescription>อัปโหลดไฟล์ CSV หรือ JSON ที่มีข้อมูล Engagement Metrics ของโพสต์</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsImport />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รูปแบบไฟล์ CSV</CardTitle>
              <CardDescription>ตัวอย่างรูปแบบไฟล์ CSV สำหรับนำเข้า Metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <div>external_post_id,recorded_at,likes,comments,shares,views,reach,impressions</div>
                <div>POST123,2024-01-15T10:00:00Z,1500,250,80,50000,45000,60000</div>
                <div>POST456,2024-01-15T10:00:00Z,2300,180,120,75000,68000,85000</div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลดไฟล์ตัวอย่าง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>นำเข้า Comments</CardTitle>
              <CardDescription>อัปโหลดไฟล์ CSV หรือ JSON ที่มีข้อมูล Comments ของโพสต์</CardDescription>
            </CardHeader>
            <CardContent>
              <CommentsImport />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รูปแบบไฟล์ CSV</CardTitle>
              <CardDescription>ตัวอย่างรูปแบบไฟล์ CSV สำหรับนำเข้า Comments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <div>external_post_id,external_comment_id,author_name,content,created_at,likes,sentiment,tags</div>
                <div>POST123,CMT001,John Doe,Great product!,2024-01-15T10:30:00Z,15,positive,product;quality</div>
                <div>POST123,CMT002,Jane Smith,Love it,2024-01-15T11:00:00Z,8,positive,love</div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลดไฟล์ตัวอย่าง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
