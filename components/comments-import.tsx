"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { AlertCircle, AlertTriangle, CheckCircle2, CloudDownload, Upload, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type CommentRow = {
  file_name?: string
  post_link?: string
  update_post?: string
  kol_post_detial?: string
  kol_post_detail?: string
  post_intention?: string
  post_message?: string
  sentiment?: string
  tags?: string
}

type ImportResult = {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface CommentsImportProps {
  onComplete?: (fileName?: string) => void
}

const REQUIRED_COLUMNS = ["post_link", "update_post", "kol_post_detial", "post_intention", "post_message"]

const OPTIONAL_COLUMNS = ["file_name", "kol_post_detail", "sentiment", "tags"]

const COLUMN_LABELS: Record<string, string> = {
  file_name: "file_name",
  post_link: "post_link",
  update_post: "update_post",
  kol_post_detial: "kol_post_detial",
  kol_post_detail: "kol_post_detail",
  post_intention: "post_intention",
  post_message: "post_message",
  sentiment: "sentiment",
  tags: "tags",
}

const ALL_ALLOWED_COLUMNS = Array.from(new Set([...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]))

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1lSAMPLE_ID/export?format=csv&gid=0"

const normalizeUrl = (value?: string) => {
  if (!value) return ""
  try {
    const url = new URL(value.trim())
    url.hash = ""
    if (url.pathname && url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+/g, "/").replace(/\/+$/, "") || "/"
    }
    return url.toString()
  } catch {
    return value.trim().replace(/\/+/g, "/").replace(/\/+$/, "")
  }
}

const toDateOnly = (value?: string) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  const year = parsed.getFullYear()
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0")
  const day = `${parsed.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const extractHeadersFromCSV = (text: string) => {
  const normalized = text.replace(/\r/g, "").trim()
  const headerLine = normalized.split("\n")[0] ?? ""
  if (!headerLine) return []
  return headerLine
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean)
}

const validateSheetStructure = (
  headers: string[],
  setErrors: (errors: string[]) => void,
  setWarnings: (warnings: string[]) => void,
  setUnknown: (unknown: string[]) => void,
) => {
  const missingRequired = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))
  const missingOptional = OPTIONAL_COLUMNS.filter((column) => !headers.includes(column))
  const unknownColumns = headers.filter((column) => !ALL_ALLOWED_COLUMNS.includes(column))

  setErrors(missingRequired.map((column) => COLUMN_LABELS[column] ?? column))
  setWarnings(missingOptional.map((column) => COLUMN_LABELS[column] ?? column))
  setUnknown(unknownColumns.map((column) => COLUMN_LABELS[column] ?? column))

  return missingRequired.length === 0
}

const parseCSV = (text: string): CommentRow[] => {
  const lines = text.replace(/\r/g, "").trim().split("\n")
  if (lines.length <= 1) return []

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().toLowerCase())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim())
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ""
    })
    return row as CommentRow
  })
}

const parseJSON = (text: string): CommentRow[] => {
  try {
    const data = JSON.parse(text)
    if (Array.isArray(data)) {
      return data as CommentRow[]
    }
    return []
  } catch {
    throw new Error("Invalid JSON")
  }
}

const parseInput = (text: string, fileType: string): CommentRow[] => {
  const lowerType = fileType.toLowerCase()
  if (lowerType.endsWith(".json") || lowerType.includes("json")) {
    return parseJSON(text)
  }
  return parseCSV(text)
}

const formatTimestampForFileName = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}${month}${day}${hours}${minutes}`
}

export function CommentsImport({ onComplete }: CommentsImportProps) {
  const supabase = createBrowserClient()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CommentRow[]>([])
  const [rowsBuffer, setRowsBuffer] = useState<CommentRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isFetchingSheet, setIsFetchingSheet] = useState(false)
  const [sheetUrlInput, setSheetUrlInput] = useState("")
  const [sheetValidationErrors, setSheetValidationErrors] = useState<string[]>([])
  const [sheetValidationWarnings, setSheetValidationWarnings] = useState<string[]>([])
  const [sheetUnknownColumns, setSheetUnknownColumns] = useState<string[]>([])
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    setResult(null)
    setSheetValidationErrors([])
    setSheetValidationWarnings([])
    setSheetUnknownColumns([])
    setSheetHeaders([])
    setRowsBuffer([])

    try {
      const text = await selected.text()
      const isCSV = selected.type === "text/csv" || selected.name.toLowerCase().endsWith(".csv")
      if (isCSV) {
        const headers = extractHeadersFromCSV(text)
        if (!headers.length) {
          throw new Error("ไฟล์ CSV ไม่มีส่วนหัวของคอลัมน์")
        }
        setSheetHeaders(headers)
        const isValidStructure = validateSheetStructure(
          headers,
          setSheetValidationErrors,
          setSheetValidationWarnings,
          setSheetUnknownColumns,
        )
        if (!isValidStructure) {
          throw new Error("โครงสร้างคอลัมน์ของไฟล์ไม่ถูกต้อง")
        }
      }

      const rows = parseInput(text, selected.type || selected.name)

      if (!rows.length) {
        throw new Error("ไม่พบข้อมูลในไฟล์หรือรูปแบบไม่ถูกต้อง")
      }

      setPreview(rows.slice(0, 5))
      setRowsBuffer(rows)
      setFile(selected)
    } catch (error: any) {
      console.error("[v0] Error reading post comments file:", error)
      toast.error(error?.message ?? "ไม่สามารถอ่านไฟล์ได้")
      setFile(null)
      setPreview([])
      setRowsBuffer([])
    }
  }

  const logImportRow = async (
    params: {
      file_name: string
      post_link: string | null
      update_post: string | null
      kol_post_detail: string | null
      post_intention: string | null
      post_message: string | null
      sentiment: string | null
      tags: string[] | null
      flag_use: boolean
      import_date: string
      status: string
      error_message: string | null
      raw_payload: CommentRow
      created_by: string
    },
  ) => {
    const { error } = await supabase.from("import_post_comments").insert({
      ...params,
      raw_payload: params.raw_payload,
    })

    if (error) {
      console.error("[v0] Error logging import_post_comments row:", error)
      return false
    }
    return true
  }

  const handleImport = async () => {
    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !userData?.user?.id) {
      toast.error("ไม่สามารถดึงข้อมูลผู้ใช้งานได้ กรุณาเข้าสู่ระบบใหม่")
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const generatedFileName = `${userData.user.id}${formatTimestampForFileName(new Date())}`
      let rows: CommentRow[] = []

      if (file) {
      const text = await file.text()
        rows = parseInput(text, file.type || file.name)
      } else {
        rows = rowsBuffer
      }

      if (!rows.length) {
        toast.error("ไม่พบข้อมูลสำหรับนำเข้า")
        return
      }

      const results: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      }

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index]
        setProgress(((index + 1) / rows.length) * 100)

        const rowErrors: string[] = []

        const rawPostLinkInput = row.post_link
        const trimmedPostLink = rawPostLinkInput !== undefined && rawPostLinkInput !== null ? rawPostLinkInput.toString().trim() : ""
        const normalizedPostLink = trimmedPostLink ? normalizeUrl(trimmedPostLink) : ""
        const finalPostLink = normalizedPostLink || (trimmedPostLink || null)

        if (!finalPostLink) {
          rowErrors.push("post_link ว่างหรือไม่ถูกต้อง")
        }

        const rawUpdateInput = row.update_post
        const trimmedUpdate = rawUpdateInput !== undefined && rawUpdateInput !== null ? rawUpdateInput.toString().trim() : ""
        let finalUpdateDate: string | null = null
        if (trimmedUpdate) {
          const dateOnly = toDateOnly(trimmedUpdate)
          if (dateOnly) {
            finalUpdateDate = dateOnly
          } else {
            rowErrors.push("update_post ไม่ถูกต้อง (ต้องเป็นวันที่ เช่น 2025-01-15)")
          }
        }

        const commentDetail = row.kol_post_detial?.toString().trim() || row.kol_post_detail?.toString().trim() || null
        const postIntention = row.post_intention?.toString().trim() || null
        const postMessage = row.post_message?.toString().trim() || null

        if (!postMessage) {
          rowErrors.push("post_message ว่างไม่สามารถบันทึกได้")
        }

        const tagsArray = row.tags
          ? row.tags
              .split(";")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : null

        const inserted = await logImportRow({
          file_name: generatedFileName,
          post_link: finalPostLink,
          update_post: finalUpdateDate,
          kol_post_detail: commentDetail,
          post_intention: postIntention,
          post_message: postMessage,
          sentiment: row.sentiment?.toString().trim() || null,
          tags: tagsArray,
          flag_use: false,
          import_date: new Date().toISOString(),
          status: rowErrors.length > 0 ? "invalid" : "queued",
          error_message: rowErrors.length > 0 ? rowErrors.join("; ") : null,
          raw_payload: row,
          created_by: userData.user.id,
        })

        if (inserted) {
          results.success++
          if (rowErrors.length > 0) {
            results.errors.push({
              row: index + 2,
              error: rowErrors.join("; "),
            })
          }
        } else {
          results.failed++
          results.errors.push({
            row: index + 2,
            error: "บันทึกลง import_post_comments ไม่สำเร็จ",
          })
        }
      }

      setResult(results)

      if (results.success > 0) {
        toast.success(`บันทึกเข้าตาราง import_post_comments แล้ว ${results.success} รายการ`)
        setFile(null)
        setPreview([])
        setRowsBuffer([])
        onComplete?.(generatedFileName)
      }

      if (results.failed > 0) {
        toast.error(`มี ${results.failed} รายการที่บันทึกไม่สำเร็จ`)
      } else if (results.errors.length > 0) {
        toast.warning("บันทึกข้อมูลสำเร็จบางส่วน โปรดตรวจสอบรายละเอียด")
      }
    } catch (error) {
      console.error("[v0] Error processing post comments import:", error)
      toast.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูล")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFetchGoogleSheet = async () => {
    setIsFetchingSheet(true)
    setResult(null)
    setPreview([])
    setFile(null)
    setSheetValidationErrors([])
    setSheetValidationWarnings([])
    setSheetUnknownColumns([])
    setSheetHeaders([])
    setRowsBuffer([])

    try {
      const inputUrl = sheetUrlInput.trim()
      const response = await fetch(
        `/api/import-post-comments/google-sheet?url=${encodeURIComponent(inputUrl || GOOGLE_SHEET_URL)}`,
        {
          cache: "no-store",
        },
      )

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลจาก Google Sheet ได้")
      }

      const { csv, error } = await response.json()
      if (error) {
        throw new Error(error)
      }

      const text = typeof csv === "string" ? csv : ""
      if (!text.trim()) {
        throw new Error("ไม่พบข้อมูลใน Google Sheet")
      }

      const headers = extractHeadersFromCSV(text)
      if (!headers.length) {
        throw new Error("ไม่พบส่วนหัวของคอลัมน์ (Header) ใน Google Sheet")
      }

      setSheetHeaders(headers)
      const isValidStructure = validateSheetStructure(
        headers,
        setSheetValidationErrors,
        setSheetValidationWarnings,
        setSheetUnknownColumns,
      )
      if (!isValidStructure) {
        throw new Error("โครงสร้างคอลัมน์ของ Google Sheet ไม่ถูกต้อง")
      }

      const rows = parseInput(text, "text/csv")
      if (!rows.length) {
        throw new Error("ข้อมูลที่ดึงมาว่างหรือไม่ตรงรูปแบบ")
      }

      setPreview(rows.slice(0, 5))
      setRowsBuffer(rows)
      toast.success(`ตรวจสอบและดึงข้อมูลจาก Google Sheet สำเร็จ (${rows.length} แถว)`)
    } catch (error: any) {
      console.error("[v0] Error fetching Google Sheet for comments:", error)
      toast.error(error?.message ?? "ไม่สามารถดึงข้อมูลจาก Google Sheet ได้")
    } finally {
      setIsFetchingSheet(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="comments-sheet-url">ลิงก์ Google Sheet</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="comments-sheet-url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrlInput}
            onChange={(event) => setSheetUrlInput(event.target.value)}
            disabled={isProcessing || isFetchingSheet}
            className="sm:max-w-lg"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleFetchGoogleSheet}
            disabled={isProcessing || isFetchingSheet}
            className="w-full sm:w-auto"
          >
            <CloudDownload className={cn("mr-2 h-4 w-4", isFetchingSheet && "animate-bounce")} />
            {isFetchingSheet ? "กำลังตรวจสอบจาก Google Sheet..." : "ตรวจสอบและดึงข้อมูลจาก Google Sheet"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          รองรับลิงก์ที่ลงท้ายด้วย <code>/edit?gid=</code> หรือ <code>/export?format=csv</code> ระบบจะตรวจสอบคอลัมน์และเตรียมไฟล์ให้อัตโนมัติ
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments-file">เลือกไฟล์ (รองรับ .csv, .json)</Label>
        <Input
          id="comments-file"
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="sm:max-w-md"
        />
        <p className="text-xs text-muted-foreground">หากอัปโหลดไฟล์ CSV ระบบจะตรวจสอบรูปแบบคอลัมน์ให้ก่อนเริ่มนำเข้า</p>
      </div>

      {sheetHeaders.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <p>ตรวจพบคอลัมน์ทั้งหมด {sheetHeaders.length} คอลัมน์:</p>
              <p className="break-words text-xs text-muted-foreground">{sheetHeaders.join(", ")}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {sheetValidationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2 text-sm">
            <p>โครงสร้างไม่ถูกต้อง จำเป็นต้องมีคอลัมน์ดังต่อไปนี้:</p>
            <ul className="list-inside list-disc">
              {sheetValidationErrors.map((column) => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {sheetValidationWarnings.length > 0 && sheetValidationErrors.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2 text-sm">
            <p>คำแนะนำ: เพิ่มคอลัมน์เพิ่มเติมเพื่อให้ข้อมูลครบถ้วน (ไม่บังคับ)</p>
            <ul className="list-inside list-disc">
              {sheetValidationWarnings.map((column) => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {sheetUnknownColumns.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2 text-sm">
            <p>พบคอลัมน์ที่ระบบไม่รู้จัก (จะถูกข้ามระหว่างนำเข้า):</p>
            <ul className="list-inside list-disc">
              {sheetUnknownColumns.map((column) => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {preview.length > 0 && (
        <div className="space-y-2">
          <Label>ตัวอย่างข้อมูล (5 แถวแรก)</Label>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch / File Name</TableHead>
                  <TableHead>Post Link</TableHead>
                  <TableHead>Update Date</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead>ข้อความ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{row.file_name || "(ระบบจะสร้าง)"}</TableCell>
                    <TableCell className="max-w-xs break-words text-xs text-blue-600">{row.post_link || "-"}</TableCell>
                    <TableCell className="text-xs">{row.update_post || "-"}</TableCell>
                    <TableCell className="text-xs">
                      {row.kol_post_detial || row.kol_post_detail || "-"}
                      <br />
                      <span className="text-muted-foreground">เจตนา: {row.post_intention || "-"}</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.post_message || "-"}
                      {row.sentiment ? (
                        <span className="block text-muted-foreground">Sentiment: {row.sentiment}</span>
                      ) : null}
                      {row.tags ? (
                        <span className="block text-muted-foreground">Tags: {row.tags}</span>
                      ) : null}
                    </TableCell>
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
                <span>บันทึกลง import_post_comments: {result.success} รายการ</span>
              </div>
              {result.failed > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>ล้มเหลว: {result.failed} รายการ</span>
                  </div>
                  <div className="mt-4 max-h-40 space-y-1 overflow-auto">
                      {result.errors.map((error, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          แถว {error.row}: {error.error}
                        </p>
                      ))}
                  </div>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleImport}
        disabled={(file === null && rowsBuffer.length === 0) || isProcessing || sheetValidationErrors.length > 0}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isProcessing ? "กำลังนำเข้า..." : "เริ่มนำเข้าข้อมูล"}
      </Button>
    </div>
  )
}

