"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface MetricRow {
  external_post_id: string
  recorded_at: string
  likes?: number
  comments?: number
  shares?: number
  views?: number
  reach?: number
  impressions?: number
  engagement_rate?: number
}

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export function MetricsImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<MetricRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const supabase = createBrowserClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)

    try {
      const text = await selectedFile.text()
      const rows = parseCSV(text)
      setPreview(rows.slice(0, 5)) // Show first 5 rows
    } catch (error) {
      toast.error("ไม่สามารถอ่านไฟล์ได้")
    }
  }

  const parseCSV = (text: string): MetricRow[] => {
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const row: any = {}

      headers.forEach((header, index) => {
        const value = values[index]
        if (["likes", "comments", "shares", "views", "reach", "impressions"].includes(header)) {
          row[header] = value ? Number.parseInt(value) : null
        } else if (header === "engagement_rate") {
          row[header] = value ? Number.parseFloat(value) : null
        } else {
          row[header] = value
        }
      })

      return row as MetricRow
    })
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      const results: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        setProgress(((i + 1) / rows.length) * 100)

        try {
          // Find post by external_post_id
          const { data: post } = await supabase
            .from("posts")
            .select("id")
            .eq("external_post_id", row.external_post_id)
            .single()

          if (!post) {
            results.failed++
            results.errors.push({
              row: i + 2, // +2 because of header and 0-index
              error: `ไม่พบโพสต์ที่มี external_post_id: ${row.external_post_id}`,
            })
            continue
          }

          // Insert or update metric
          const metricData = {
            post_id: post.id,
            recorded_at: row.recorded_at,
            likes: row.likes || 0,
            comments: row.comments || 0,
            shares: row.shares || 0,
            views: row.views || 0,
            reach: row.reach || 0,
            impressions: row.impressions || 0,
            engagement_rate: row.engagement_rate || 0,
          }

          const { error } = await supabase.from("post_metrics").upsert(metricData, {
            onConflict: "post_id,recorded_at",
          })

          if (error) throw error

          results.success++
        } catch (error: any) {
          results.failed++
          results.errors.push({
            row: i + 2,
            error: error.message,
          })
        }
      }

      setResult(results)
      toast.success(`นำเข้าสำเร็จ ${results.success} รายการ`)
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูล")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="metrics-file">เลือกไฟล์</Label>
        <Input id="metrics-file" type="file" accept=".csv,.json" onChange={handleFileChange} disabled={isProcessing} />
      </div>

      {preview.length > 0 && (
        <div className="space-y-2">
          <Label>ตัวอย่างข้อมูล (5 แถวแรก)</Label>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post ID</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{row.external_post_id}</TableCell>
                    <TableCell>{new Date(row.recorded_at).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell>{row.likes?.toLocaleString()}</TableCell>
                    <TableCell>{row.comments?.toLocaleString()}</TableCell>
                    <TableCell>{row.shares?.toLocaleString()}</TableCell>
                    <TableCell>{row.views?.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <Label>กำลังนำเข้าข้อมูล...</Label>
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      )}

      {result && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>นำเข้าสำเร็จ: {result.success} รายการ</span>
              </div>
              {result.failed > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>ล้มเหลว: {result.failed} รายการ</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="font-medium">รายละเอียดข้อผิดพลาด:</p>
                    <div className="max-h-40 overflow-auto space-y-1">
                      {result.errors.map((error, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          แถว {error.row}: {error.error}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={handleImport} disabled={!file || isProcessing} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {isProcessing ? "กำลังนำเข้า..." : "เริ่มนำเข้าข้อมูล"}
      </Button>
    </div>
  )
}
