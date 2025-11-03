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

interface CommentRow {
  external_post_id: string
  external_comment_id: string
  author_name: string
  content: string
  created_at: string
  likes?: number
  sentiment?: string
  tags?: string
}

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export function CommentsImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CommentRow[]>([])
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
      setPreview(rows.slice(0, 5))
    } catch (error) {
      toast.error("ไม่สามารถอ่านไฟล์ได้")
    }
  }

  const parseCSV = (text: string): CommentRow[] => {
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const row: any = {}

      headers.forEach((header, index) => {
        const value = values[index]
        if (header === "likes") {
          row[header] = value ? Number.parseInt(value) : 0
        } else {
          row[header] = value
        }
      })

      return row as CommentRow
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
              row: i + 2,
              error: `ไม่พบโพสต์ที่มี external_post_id: ${row.external_post_id}`,
            })
            continue
          }

          // Insert comment
          const commentData = {
            post_id: post.id,
            external_comment_id: row.external_comment_id,
            author_name: row.author_name,
            content: row.content,
            created_at: row.created_at,
            likes: row.likes || 0,
            sentiment: row.sentiment || null,
          }

          const { data: comment, error: commentError } = await supabase
            .from("comments")
            .upsert(commentData, {
              onConflict: "external_comment_id",
            })
            .select()
            .single()

          if (commentError) throw commentError

          // Process tags if provided
          if (row.tags && comment) {
            const tagNames = row.tags
              .split(";")
              .map((t) => t.trim())
              .filter(Boolean)

            for (const tagName of tagNames) {
              // Get or create tag
              const { data: tag } = await supabase.from("tags").select("id").eq("name", tagName).single()

              let tagId = tag?.id

              if (!tagId) {
                const { data: newTag } = await supabase
                  .from("tags")
                  .insert({ name: tagName, type: "topic" })
                  .select()
                  .single()

                tagId = newTag?.id
              }

              if (tagId) {
                await supabase.from("comment_tags").upsert(
                  {
                    comment_id: comment.id,
                    tag_id: tagId,
                  },
                  {
                    onConflict: "comment_id,tag_id",
                  },
                )
              }
            }
          }

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
        <Label htmlFor="comments-file">เลือกไฟล์</Label>
        <Input id="comments-file" type="file" accept=".csv,.json" onChange={handleFileChange} disabled={isProcessing} />
      </div>

      {preview.length > 0 && (
        <div className="space-y-2">
          <Label>ตัวอย่างข้อมูล (5 แถวแรก)</Label>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post ID</TableHead>
                  <TableHead>Comment ID</TableHead>
                  <TableHead>ผู้เขียน</TableHead>
                  <TableHead>เนื้อหา</TableHead>
                  <TableHead>Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{row.external_post_id}</TableCell>
                    <TableCell className="font-mono text-xs">{row.external_comment_id}</TableCell>
                    <TableCell>{row.author_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{row.content}</TableCell>
                    <TableCell>{row.sentiment}</TableCell>
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
