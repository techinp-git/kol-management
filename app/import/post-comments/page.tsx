"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, RefreshCw, Trash2, Upload } from "lucide-react"
import { CommentsImport } from "@/components/comments-import"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type CommentsImportSummaryItem = {
  fileName: string
  totalRows: number
  successCount: number
  failedCount: number
  lastImportDate: string | null
}

type CommentsImportDetailItem = {
  id: string
  file_name: string
  post_link: string | null
  update_post: string | null
  kol_post_detail: string | null
  post_intention: string | null
  post_message: string | null
  sentiment: string | null
  tags: string[] | null
  flag_use: boolean | null
  import_date: string | null
  status: string | null
  error_message: string | null
}

type CommentsTransferResult = {
  importId: string
  fileName: string
  status: "inserted" | "skipped" | "failed"
  message?: string
  commentId?: string
}

type CommentsTransferSummary = {
  fileName: string | null
  attempts: number
  inserted: number
  failed: number
  results: CommentsTransferResult[]
}

export default function PostCommentsImportPage() {
  const [summary, setSummary] = useState<CommentsImportSummaryItem[]>([])
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [details, setDetails] = useState<CommentsImportDetailItem[]>([])
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [transferringFile, setTransferringFile] = useState<string | null>(null)
  const [transferSummary, setTransferSummary] = useState<CommentsTransferSummary | null>(null)

  const refreshSummary = async () => {
    try {
      setIsLoadingSummary(true)
      const res = await fetch("/api/import-post-comments", { cache: "no-store" })
      const data = await res.json()

      if (data?.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch import_post_comments summary:", error)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const refreshDetail = async (fileName: string) => {
    try {
      setIsLoadingDetail(true)
      const res = await fetch(`/api/import-post-comments?fileName=${encodeURIComponent(fileName)}`, {
        cache: "no-store",
      })
      const data = await res.json()
      if (data?.rows) {
        setDetails(data.rows)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch import_post_comments rows:", error)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  useEffect(() => {
    refreshSummary()
  }, [])

  useEffect(() => {
    if (selectedFile) {
      refreshDetail(selectedFile)
    } else {
      setDetails([])
    }
  }, [selectedFile])

  const handleImportComplete = (fileName?: string) => {
    refreshSummary()
    if (fileName) {
      setSelectedFile(fileName)
      refreshDetail(fileName)
    }
  }

  const latestFileName = useMemo(() => summary[0]?.fileName ?? null, [summary])

  useEffect(() => {
    if (!selectedFile && latestFileName) {
      setSelectedFile(latestFileName)
    }
  }, [latestFileName, selectedFile])

  useEffect(() => {
    if (transferSummary && selectedFile && transferSummary.fileName !== selectedFile) {
      setTransferSummary(null)
    }
  }, [selectedFile, transferSummary])

  const handleDeleteBatch = async (fileName: string) => {
    if (!window.confirm(`ยืนยันการลบข้อมูล Comments ทั้งหมดของไฟล์ "${fileName}" หรือไม่?`)) {
      return
    }

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/import-post-comments?fileName=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        let errorData: any = {}
        try {
          const text = await res.text()
          if (text) {
            errorData = JSON.parse(text)
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse error response:", parseError)
        }
        const errorMessage = errorData?.error ?? errorData?.message ?? `ไม่สามารถลบข้อมูลได้ (${res.status})`
        throw new Error(errorMessage)
      }

      if (selectedFile === fileName) {
        setSelectedFile(null)
        setDetails([])
      }

      await refreshSummary()
    } catch (error) {
      console.error("[v0] Failed to delete comments batch:", error)
      alert(error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTransferBatch = async (fileName: string) => {
    try {
      setTransferringFile(fileName)
      setTransferSummary(null)

      const response = await fetch("/api/import-post-comments/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      })

      let data: any = {}
      try {
        const text = await response.text()
        if (text) {
          data = JSON.parse(text)
        }
      } catch (parseError) {
        console.error("[v0] Failed to parse response:", parseError)
        throw new Error(`ไม่สามารถอ่านข้อมูลจากเซิร์ฟเวอร์ได้: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMessage = data?.error ?? data?.message ?? `ไม่สามารถโอนข้อมูลไปยัง comments ได้ (${response.status})`
        throw new Error(errorMessage)
      }

      const summary: CommentsTransferSummary = {
        fileName: data?.fileName ?? fileName,
        attempts: data?.attempts ?? 0,
        inserted: data?.inserted ?? 0,
        failed: data?.failed ?? 0,
        results: Array.isArray(data?.results) ? data.results : [],
      }

      setTransferSummary(summary)
      toast.success(`เพิ่มคอมเมนต์ใหม่ ${summary.inserted} รายการ`)

      await refreshSummary()
      await refreshDetail(fileName)
    } catch (error) {
      console.error("[v0] Failed to transfer import_post_comments batch:", error)
      toast.error(error instanceof Error ? error.message : "ไม่สามารถโอนข้อมูลไปยัง comments ได้")
    } finally {
      setTransferringFile(null)
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return value
    }
    return parsed.toLocaleString()
  }

  const isTransferDisabled =
    !selectedFile || details.length === 0 || isLoadingDetail || transferringFile === selectedFile

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">นำเข้า Post Comments</h1>
          <p className="text-muted-foreground">
            บันทึกคอมเมนต์ของโพสต์พร้อมรายละเอียด แบ่งปันเจตนา ข้อความ และแท็ก เพื่อประมวลผลต่อได้สะดวก
          </p>
        </div>
        <Button variant="outline" onClick={refreshSummary} disabled={isLoadingSummary}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoadingSummary && "animate-spin")} />
          รีเฟรชประวัติ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ฟอร์มนำเข้า Post Comments</CardTitle>
          <CardDescription>รองรับการดึงจาก Google Sheet หรือไฟล์ CSV/JSON ที่จัดรูปแบบไว้</CardDescription>
        </CardHeader>
        <CardContent>
          <CommentsImport onComplete={handleImportComplete} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตัวอย่างรูปแบบไฟล์</CardTitle>
          <CardDescription>
            ระบบจะสร้าง `file_name` (batch id) ให้อัตโนมัติ คอลัมน์ที่จำเป็น: post_link, update_post, kol_post_detial, post_intention,
            post_message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <pre className="min-w-[720px] whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-mono text-sm">
{`post_link,update_post,kol_post_detial,post_intention,post_message,sentiment,tags
https://www.facebook.com/somepage/posts/12345,2024-01-15,รีวิวสินค้าใหม่,สอบถามสินค้า,อยากทราบรายละเอียดเพิ่มเติม,question,product;detail
https://www.facebook.com/somepage/posts/12345,2024-01-16,รีวิวสินค้าใหม่,ให้ฟีดแบ็ก,สินค้าดีมาก ขอบคุณครับ,positive,feedback;happy`}
            </pre>
          </div>
          <Button variant="outline" className="w-full bg-transparent md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลดไฟล์ตัวอย่าง
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>ประวัติการนำเข้า (ล่าสุด 1000 รายการ)</CardTitle>
            <CardDescription>คลิกชื่อไฟล์เพื่อดูรายละเอียด และสามารถลบชุดข้อมูลทั้งไฟล์ได้</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden md:block">
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead className="text-center">ทั้งหมด</TableHead>
                    <TableHead className="text-center text-green-600">ปกติ</TableHead>
                    <TableHead className="text-center text-red-600">มีข้อผิดพลาด</TableHead>
                    <TableHead>ล่าสุด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        {isLoadingSummary ? "กำลังโหลด..." : "ยังไม่มีประวัติการนำเข้า"}
                      </TableCell>
                    </TableRow>
                  )}
                  {summary.map((item) => (
                    <TableRow
                      key={item.fileName}
                      className={cn(
                        "group cursor-pointer",
                        selectedFile === item.fileName ? "bg-black/5 hover:bg-black/10" : "hover:bg-muted",
                      )}
                      onClick={() => setSelectedFile(item.fileName)}
                    >
                      <TableCell className="max-w-xs break-words font-medium">{item.fileName}</TableCell>
                      <TableCell className="text-center">{item.totalRows}</TableCell>
                      <TableCell className="text-center text-green-600">{item.successCount}</TableCell>
                      <TableCell className="text-center text-red-600">{item.failedCount}</TableCell>
                      <TableCell className="space-y-1">
                        <div>{formatDate(item.lastImportDate) ?? "-"}</div>
                        <div
                          role="button"
                          tabIndex={0}
                          className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteBatch(item.fileName)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              handleDeleteBatch(item.fileName)
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบชุดนี้
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {summary.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {isLoadingSummary ? "กำลังโหลด..." : "ยังไม่มีประวัติการนำเข้า"}
              </div>
            ) : (
              summary.map((item) => (
                <div
                  key={item.fileName}
                  onClick={() => setSelectedFile(item.fileName)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setSelectedFile(item.fileName)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "w-full rounded-lg border bg-card p-4 text-left transition-colors",
                    selectedFile === item.fileName ? "border-black bg-muted" : "hover:bg-muted/70",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="max-w-[70%] break-words text-base font-semibold">{item.fileName}</span>
                    <Badge>{item.totalRows} รายการ</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                      ปกติ: <span className="font-semibold">{item.successCount}</span>
                    </div>
                    <div className="rounded-md bg-red-50 px-2 py-1 text-red-600">
                      ข้อผิดพลาด: <span className="font-semibold">{item.failedCount}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    อัปเดตล่าสุด: {formatDate(item.lastImportDate) ?? "—"}
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteBatch(item.fileName)
                      }}
                      disabled={isDeleting}
                      className="h-8 w-full px-2"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      ลบชุดนี้
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedFile && (
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>รายละเอียดไฟล์: {selectedFile}</CardTitle>
              <CardDescription>ตรวจสอบคอมเมนต์และสถานะที่บันทึกไว้ในแต่ละแถว</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => refreshDetail(selectedFile)} disabled={isLoadingDetail}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isLoadingDetail && "animate-spin")} />
                รีเฟรชรายละเอียด
              </Button>
              <Button
                onClick={() => selectedFile && handleTransferBatch(selectedFile)}
                disabled={isTransferDisabled}
                className="bg-black text-[#FFFF00] hover:bg-black/90"
              >
                {transferringFile === selectedFile ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                โอนเข้า comments
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {transferSummary && transferSummary.fileName === selectedFile && (
              <Alert>
                <AlertDescription className="space-y-2 text-sm">
                  <p>
                    ถ่ายโอนข้อมูลจากไฟล์ <span className="font-medium">{transferSummary.fileName}</span> สำเร็จแล้ว (
                    {transferSummary.attempts} รายการ)
                  </p>
                  <div className="grid gap-2 text-xs sm:grid-cols-3">
                    <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                      <p className="text-base font-semibold">{transferSummary.inserted}</p>
                      <p>เพิ่มใหม่</p>
                    </div>
                    <div className="rounded-md bg-red-50 px-3 py-2 text-red-700">
                      <p className="text-base font-semibold">{transferSummary.failed}</p>
                      <p>ไม่สำเร็จ</p>
                    </div>
                    <div className="rounded-md bg-slate-100 px-3 py-2 text-slate-700">
                      <p className="text-base font-semibold">{transferSummary.attempts}</p>
                      <p>ทั้งหมด</p>
                    </div>
                  </div>
                  {transferSummary.failed > 0 && transferSummary.results.length > 0 && (
                    <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
                      <p className="font-medium">รายละเอียดที่ไม่สำเร็จ</p>
                      <ul className="mt-1 space-y-1">
                        {transferSummary.results
                          .filter((result) => result.status === "failed")
                          .slice(0, 5)
                          .map((result) => (
                            <li key={result.importId}>
                              • {result.fileName}: {result.message || "ไม่ทราบสาเหตุ"}
                            </li>
                          ))}
                      </ul>
                      {transferSummary.failed > 5 && <p>... (ดูเพิ่มเติมในตารางด้านล่าง)</p>}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="hidden md:block">
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post Link</TableHead>
                      <TableHead>Update Date</TableHead>
                      <TableHead>รายละเอียดโพสต์</TableHead>
                      <TableHead>ข้อความ</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                          {isLoadingDetail ? "กำลังโหลด..." : "ยังไม่มีข้อมูลสำหรับไฟล์นี้"}
                        </TableCell>
                      </TableRow>
                    )}
                    {details.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="break-all text-xs text-blue-600">{row.post_link ?? "-"}</TableCell>
                        <TableCell className="text-xs">{row.update_post ?? "-"}</TableCell>
                        <TableCell className="text-xs">{row.kol_post_detail ?? "-"}</TableCell>
                        <TableCell className="text-xs">{row.post_message ?? "-"}</TableCell>
                        <TableCell className="text-xs">{row.sentiment ?? "-"}</TableCell>
                        <TableCell className="text-xs">{row.tags?.join(", ") ?? "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.status === "queued"
                                ? "secondary"
                                : row.status === "invalid"
                                ? "destructive"
                                : row.status === "processed"
                                ? "default"
                                : "outline"
                            }
                          >
                            {row.status ? row.status.toUpperCase() : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.error_message ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {details.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {isLoadingDetail ? "กำลังโหลด..." : "ยังไม่มีข้อมูลสำหรับไฟล์นี้"}
                </div>
              ) : (
                details.map((row) => (
                  <div key={row.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="break-all text-xs text-blue-600">{row.post_link ?? "-"}</div>
                      <Badge
                        variant={
                          row.status === "queued"
                            ? "secondary"
                            : row.status === "invalid"
                            ? "destructive"
                            : row.status === "processed"
                            ? "default"
                            : "outline"
                        }
                        className="self-start"
                      >
                        {row.status ? row.status.toUpperCase() : "N/A"}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Update Date</p>
                        <p className="font-medium">{row.update_post ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">รายละเอียดโพสต์</p>
                        <p className="font-medium">{row.kol_post_detail ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ข้อความ</p>
                        <p className="font-medium">{row.post_message ?? "-"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Sentiment: {row.sentiment ?? "-"}</div>
                        <div>Tags: {row.tags?.join(", ") ?? "-"}</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">หมายเหตุ</p>
                        <p className="break-words text-sm text-muted-foreground">{row.error_message ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
