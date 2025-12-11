"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRightLeft, Download, RefreshCw, Trash2 } from "lucide-react"
import { PostInfoImport } from "@/components/post-info-import"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ImportSummaryItem = {
  fileName: string
  totalRows: number
  successCount: number
  failedCount: number
  lastImportDate: string | null
}

type ImportDetailItem = {
  id: string
  file_name: string
  kol_name: string | null
  post_name: string | null
  kol_category: string | null
  post_note: string | null
  post_type: string | null
  content_type: string | null
  platform: string | null
  campaign_name: string | null
  kol_tier: string | null
  follower: number | string | null
  kol_budget: number | string | null
  boost_budget: number | string | null
  post_link: string | null
  post_date: string | null
  flag_use: boolean | null
  import_date: string | null
  status: string | null
  error_message: string | null
}

type TransferSummary = {
  fileName: string
  attempts: number
  inserted: number
  duplicates: number
  failed: number
  results?: Array<{
    importId: string
    status: string
    message?: string
    postId?: string
  }>
}

export default function PostInfoImportPage() {
  const formatNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return null
    const numeric = typeof value === "number" ? value : Number.parseFloat(value)
    if (Number.isNaN(numeric)) return null
    return new Intl.NumberFormat().format(numeric)
  }

  const [summary, setSummary] = useState<ImportSummaryItem[]>([])
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [details, setDetails] = useState<ImportDetailItem[]>([])
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [transferringFile, setTransferringFile] = useState<string | null>(null)
  const [transferSummary, setTransferSummary] = useState<TransferSummary | null>(null)

  const formatDateTime = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString()
  }

  const getStatusBadgeVariant = (status?: string | null) => {
    const normalized = status?.toLowerCase()
    switch (normalized) {
      case "processed":
        return { variant: "default" as const, className: "bg-emerald-500 text-white" }
      case "duplicate":
        return { variant: "secondary" as const, className: "bg-amber-100 text-amber-800" }
      case "failed":
      case "error":
        return { variant: "destructive" as const, className: "bg-red-500 text-white" }
      case "queued":
        return { variant: "secondary" as const, className: "" }
      default:
        return { variant: "outline" as const, className: "" }
    }
  }

  const refreshSummary = async () => {
    try {
      setIsLoadingSummary(true)
      const res = await fetch("/api/import-posts", { cache: "no-store" })
      const data = await res.json()

      if (data?.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch import summary:", error)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const handleDeleteBatch = async (fileName: string) => {
    if (!window.confirm(`ยืนยันการลบข้อมูลทั้งหมดของไฟล์ "${fileName}" หรือไม่?`)) {
      return
    }

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/import-posts?fileName=${encodeURIComponent(fileName)}`, {
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
      console.error("[v0] Failed to delete batch:", error)
      alert(error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTransferBatch = async (fileName: string) => {
    try {
      setTransferringFile(fileName)
      setTransferSummary(null)

      const response = await fetch("/api/import-posts/transfer", {
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
        const errorMessage = data?.error ?? data?.message ?? `ไม่สามารถโอนข้อมูลไปยัง posts ได้ (${response.status})`
        throw new Error(errorMessage)
      }

      const summary: TransferSummary = {
        fileName,
        attempts: data?.attempts ?? 0,
        inserted: data?.inserted ?? 0,
        duplicates: data?.duplicates ?? 0,
        failed: data?.failed ?? 0,
        results: Array.isArray(data?.results) ? data.results : [],
      }

      setTransferSummary(summary)

      toast.success(
        `ถ่ายโอนสำเร็จ: เพิ่ม ${summary.inserted} รายการ${summary.duplicates ? `, ซ้ำ ${summary.duplicates}` : ""}`,
      )

      await refreshSummary()
      await refreshDetail(fileName)
    } catch (error) {
      console.error("[v0] Failed to transfer import_post batch:", error)
      toast.error(error instanceof Error ? error.message : "ไม่สามารถโอนข้อมูลไปยัง posts ได้")
    } finally {
      setTransferringFile(null)
    }
  }

  const refreshDetail = async (fileName: string) => {
    try {
      setIsLoadingDetail(true)
      const res = await fetch(`/api/import-posts?fileName=${encodeURIComponent(fileName)}`, { cache: "no-store" })
      const data = await res.json()
      if (data?.rows) {
        setDetails(data.rows)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch import rows:", error)
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">นำเข้า Post Information</h1>
          <p className="text-muted-foreground">
            อัปโหลดไฟล์ CSV หรือ JSON เพื่ออัปเดตหรือสร้างโพสต์ พร้อมตรวจสอบประวัติการนำเข้าได้ตามไฟล์
          </p>
        </div>
        <Button variant="outline" onClick={refreshSummary} disabled={isLoadingSummary} className="md:w-auto">
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoadingSummary && "animate-spin")} />
          รีเฟรชประวัติ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ฟอร์มนำเข้า Post Information</CardTitle>
          <CardDescription>
            ระบบจะค้นหาจาก `post_link`/`post_url` หรือ `external_post_id` หากพบโพสต์จะอัปเดตข้อมูลให้ หากไม่พบจะสร้างรายการใหม่
            โดยต้องกรอก `campaign_id` และ `kol_channel_id`
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostInfoImport onComplete={handleImportComplete} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตัวอย่างรูปแบบไฟล์ CSV</CardTitle>
          <CardDescription>รองรับไฟล์ JSON แบบ array ด้วยเช่นกัน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <pre className="min-w-[720px] whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-mono text-sm">
{`file_name,kol_name,post_name,kol_category,post_note,post_type,content_type,platform,kol_tier,follower,kol_budget,boost_budget,post_link,post_date,campaign_id,kol_channel_id
import_jan.csv,Creator A,My Post A,Beauty,Note A,review,facebook_video,facebook,tier A,250000,1200,1500,https://www.facebook.com/.../12345,2024-01-15T09:00:00Z,campaign-uuid,kol-channel-uuid
import_jan.csv,Creator B,My Post B,Fashion,Note B,tutorial,tiktok_video,tiktok,tier B,85000,0,900,https://www.tiktok.com/.../6789,2024-01-16T11:30:00Z,campaign-uuid,kol-channel-uuid`}
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
            <CardDescription>คลิกชื่อไฟล์เพื่อดูรายละเอียดแต่ละแถว</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {transferSummary && (
            <Alert>
              <AlertDescription className="space-y-2 text-sm">
                <p>
                  ถ่ายโอนจากไฟล์ <span className="font-medium">{transferSummary.fileName}</span> สำเร็จ
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                    <p className="text-base font-semibold">{transferSummary.inserted}</p>
                    <p>เพิ่มใน posts</p>
                  </div>
                  <div className="rounded-md bg-amber-50 px-3 py-2 text-amber-700">
                    <p className="text-base font-semibold">{transferSummary.duplicates}</p>
                    <p>มีอยู่แล้ว</p>
                  </div>
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-slate-700">
                    <p className="text-base font-semibold">{transferSummary.failed}</p>
                    <p>ไม่สำเร็จ</p>
                  </div>
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-slate-700">
                    <p className="text-base font-semibold">{transferSummary.attempts}</p>
                    <p>รวมทั้งหมด</p>
                  </div>
                </div>
                {transferSummary.failed > 0 && transferSummary.results && transferSummary.results.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium">รายละเอียดรายการที่ไม่สำเร็จ</p>
                    <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                      {transferSummary.results
                        .filter((item) => item.status === "failed")
                        .slice(0, 5)
                        .map((item) => (
                          <li key={item.importId}>
                            {item.importId}: {item.message ?? "ไม่ทราบสาเหตุ"}
                          </li>
                        ))}
                    </ul>
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
                    <TableHead>File Name</TableHead>
                    <TableHead className="text-center">ทั้งหมด</TableHead>
                    <TableHead className="text-center text-green-600">สำเร็จ</TableHead>
                    <TableHead className="text-center text-red-600">ล้มเหลว</TableHead>
                    <TableHead>ล่าสุด</TableHead>
                    <TableHead className="text-right">การทำงาน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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
                      <TableCell>{formatDateTime(item.lastImportDate) ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleTransferBatch(item.fileName)
                            }}
                            disabled={isDeleting || transferringFile === item.fileName}
                          >
                            <ArrowRightLeft
                              className={cn("mr-1 h-4 w-4", transferringFile === item.fileName && "animate-spin")}
                            />
                            โอนเข้า Posts
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteBatch(item.fileName)
                            }}
                            disabled={isDeleting || transferringFile === item.fileName}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            ลบชุดนี้
                          </Button>
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
                      สำเร็จ: <span className="font-semibold">{item.successCount}</span>
                    </div>
                    <div className="rounded-md bg-red-50 px-2 py-1 text-red-600">
                      ล้มเหลว: <span className="font-semibold">{item.failedCount}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    อัปเดตล่าสุด: {formatDateTime(item.lastImportDate) ?? "—"}
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleTransferBatch(item.fileName)
                      }}
                      disabled={isDeleting || transferringFile === item.fileName}
                      className="mb-2 h-8 w-full px-2"
                    >
                      <ArrowRightLeft
                        className={cn("mr-1 h-3.5 w-3.5", transferringFile === item.fileName && "animate-spin")}
                      />
                      โอนเข้า Posts
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteBatch(item.fileName)
                      }}
                      disabled={isDeleting || transferringFile === item.fileName}
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
              <CardDescription>ตรวจสอบสถานะการนำเข้าและรายละเอียดเพิ่มเติมในแต่ละแถว</CardDescription>
            </div>
            <Button variant="outline" onClick={() => refreshDetail(selectedFile)} disabled={isLoadingDetail}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoadingDetail && "animate-spin")} />
              รีเฟรชรายละเอียด
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="hidden md:block">
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post Name</TableHead>
                      <TableHead>KOL</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Post Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[220px]">Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                          {isLoadingDetail ? "กำลังโหลด..." : "ยังไม่มีข้อมูลสำหรับไฟล์นี้"}
                        </TableCell>
                      </TableRow>
                    )}
                    {details.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="break-words font-medium">{row.post_name ?? "-"}</div>
                          <div className="break-all text-xs text-muted-foreground">{row.post_link ?? "—"}</div>
                        </TableCell>
                        <TableCell className="max-w-[220px] break-words">
                          <div>{row.kol_name ?? "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.kol_tier ? `Tier: ${row.kol_tier}` : ""}
                            {formatNumber(row.follower) ? ` · ${formatNumber(row.follower)} followers` : ""}
                          </div>
                        </TableCell>
                        <TableCell className="break-words">
                          <div>{row.campaign_name ?? "-"}</div>
                        </TableCell>
                        <TableCell className="break-words">
                          <div>{row.platform ?? "-"}</div>
                          <div className="text-xs text-muted-foreground">{row.content_type ?? ""}</div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(row.post_date) ?? "-"}
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(row.import_date) ? `นำเข้า: ${formatDateTime(row.import_date)}` : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const badge = getStatusBadgeVariant(row.status)
                            return (
                              <Badge variant={badge.variant} className={cn("uppercase", badge.className)}>
                                {row.status ? row.status.toUpperCase() : "N/A"}
                              </Badge>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="max-w-xs break-words text-sm text-muted-foreground">
                          {row.error_message ? row.error_message : row.post_note ?? "—"}
                        </TableCell>
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
                      <div>
                        <div className="text-base font-semibold">{row.post_name ?? "-"}</div>
                        <a
                          href={row.post_link ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-xs text-muted-foreground hover:underline"
                        >
                          {row.post_link ?? "—"}
                        </a>
                      </div>
                      {(() => {
                        const badge = getStatusBadgeVariant(row.status)
                        return (
                          <Badge variant={badge.variant} className={cn("self-start uppercase", badge.className)}>
                            {row.status ? row.status.toUpperCase() : "N/A"}
                          </Badge>
                        )
                      })()}
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">KOL</p>
                          <p className="font-medium">{row.kol_name ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Campaign</p>
                          <p className="font-medium">{row.campaign_name ?? "-"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Tier / Followers</p>
                          <p className="font-medium">
                            {row.kol_tier ?? "-"}
                            {formatNumber(row.follower) ? ` · ${formatNumber(row.follower)}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Platform</p>
                          <p className="font-medium">{row.platform ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">{row.content_type ?? ""}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Post Date</p>
                          <p className="font-medium">{formatDateTime(row.post_date) ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">นำเข้าเมื่อ</p>
                          <p className="font-medium">{formatDateTime(row.import_date) ?? "-"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Error / Note</p>
                        <p className="break-words text-sm text-muted-foreground">
                          {row.error_message ? row.error_message : row.post_note ?? "—"}
                        </p>
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
