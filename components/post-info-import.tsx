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

type PostInfoRow = {
  post_link?: string
  post_url?: string
  external_post_id?: string
  post_name?: string
  content_type?: string
  caption?: string
  posted_at?: string | number
  post_date?: string | number
  kol_budget?: string | number
  boost_budget?: string | number
  remark?: string
  status?: string
  campaign_id?: string
  campaign_name?: string
  project_id?: string
  project_name?: string
  kol_channel_id?: string
  file_name?: string
  kol_name?: string
  kol_category?: string
  post_note?: string
  post_type?: string
  platform?: string
  kol_tier?: string
  follower?: string | number
  kol_budget?: string | number
}

type ImportResult = {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface PostInfoImportProps {
  onComplete?: (fileName?: string) => void
}

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

const parseNumber = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return Number.NaN
  if (typeof value === "number") return value
  const cleaned = value.toString().replace(/[,฿]/g, "").trim()
  if (!cleaned) return Number.NaN
  const parsed = Number.parseFloat(cleaned)
  return Number.isNaN(parsed) ? Number.NaN : parsed
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

const formatTimestampForFileName = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}${month}${day}${hours}${minutes}`
}

const normalizeColumnName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")

const normalizeRowKeys = (row: Record<string, any>): PostInfoRow => {
  const normalized: Record<string, any> = {}

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeColumnName(key)
    if (!normalizedKey) {
      return
    }
    normalized[normalizedKey] = value
  })

  return normalized as PostInfoRow
}

const normalizeRowsPostDate = (rows: PostInfoRow[]) => {
  const normalizedRows = rows.map((row) => ({ ...row }))
  const errors: string[] = []

  normalizedRows.forEach((row, index) => {
    const source = row.post_date ?? row.posted_at
    const { date, error } = parsePostDate(source)

    if (error) {
      errors.push(`แถว ${index + 2}: ${error}`)
      return
    }

    if (date) {
      row.post_date = date
    }
  })

  return { rows: normalizedRows, errors }
}

const parsePostDate = (value?: string | number) => {
  if (value === undefined || value === null) {
    return { date: null as string | null, error: undefined }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelDate = convertExcelSerialToDate(value)
    if (excelDate) {
      return { date: excelDate, error: undefined }
    }
  }

  const raw = value.toString().trim()

  if (!raw) {
    return { date: null, error: undefined }
  }

  if (/^\d+(\.\d+)?$/.test(raw)) {
    const numericValue = Number.parseFloat(raw)
    if (Number.isFinite(numericValue)) {
      const excelDate = convertExcelSerialToDate(numericValue)
      if (excelDate) {
        return { date: excelDate, error: undefined }
      }
    }
  }

  const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  const isoDateTimeMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})T/)

  let year: number | null = null
  let month: number | null = null
  let day: number | null = null

  if (isoMatch) {
    year = Number.parseInt(isoMatch[1], 10)
    month = Number.parseInt(isoMatch[2], 10)
    day = Number.parseInt(isoMatch[3], 10)
  } else if (dmyMatch) {
    day = Number.parseInt(dmyMatch[1], 10)
    month = Number.parseInt(dmyMatch[2], 10)
    year = Number.parseInt(dmyMatch[3], 10)
  } else if (isoDateTimeMatch) {
    year = Number.parseInt(isoDateTimeMatch[1], 10)
    month = Number.parseInt(isoDateTimeMatch[2], 10)
    day = Number.parseInt(isoDateTimeMatch[3], 10)
  } else {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) {
      year = parsed.getUTCFullYear()
      month = parsed.getUTCMonth() + 1
      day = parsed.getUTCDate()
    } else {
      return { date: null, error: "post_date ต้องเป็นรูปแบบ YYYY-MM-DD หรือ DD/MM/YYYY" }
    }
  }

  if (year === null || month === null || day === null) {
    return { date: null, error: "post_date ไม่ถูกต้อง" }
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { date: null, error: "post_date ไม่ถูกต้อง" }
  }

  const date = new Date(Date.UTC(year, month - 1, day))

  if (Number.isNaN(date.getTime())) {
    return { date: null, error: "post_date ไม่ถูกต้อง" }
  }

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { date: null, error: "post_date ไม่ถูกต้อง" }
  }

  const paddedMonth = month.toString().padStart(2, "0")
  const paddedDay = day.toString().padStart(2, "0")

  return { date: `${year}-${paddedMonth}-${paddedDay}`, error: undefined }
}

const convertExcelSerialToDate = (serial: number) => {
  if (!Number.isFinite(serial)) {
    return null
  }

  if (serial <= 0 || serial >= 60000) {
    return null
  }

  const millisPerDay = 24 * 60 * 60 * 1000
  const excelEpoch = Date.UTC(1899, 11, 30)
  const millis = Math.round(serial * millisPerDay)
  const date = new Date(excelEpoch + millis)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  const paddedMonth = month.toString().padStart(2, "0")
  const paddedDay = day.toString().padStart(2, "0")

  return `${year}-${paddedMonth}-${paddedDay}`
}

const REQUIRED_COLUMNS = [
  "kol_name",
  "post_name",
  "kol_category",
  "post_note",
  "post_type",
  "content_type",
  "platform",
  "kol_tier",
  "follower",
  "kol_budget",
  "boost_budget",
  "post_link",
  "post_date",
]

const OPTIONAL_COLUMNS = [
  "post_url",
  "external_post_id",
  "caption",
  "remark",
  "status",
  "kol_budget",
  "posted_at",
  "campaign_id",
  "campaign_name",
  "project_id",
  "project_name",
  "kol_channel_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "notes",
]

const COLUMN_LABELS: Record<string, string> = {
  file_name: "file_name",
  kol_name: "kol_name",
  post_name: "post_name",
  kol_category: "kol_category",
  post_note: "post_note",
  post_type: "post_type",
  content_type: "content_type",
  platform: "platform",
  kol_tier: "kol_tier",
  follower: "follower",
  kol_budget: "kol_budget",
  boost_budget: "boost_budget",
  post_link: "post_link",
  post_url: "post_url",
  post_date: "post_date",
  posted_at: "posted_at",
  campaign_id: "campaign_id",
  campaign_name: "campaign_name",
  project_id: "project_id",
  project_name: "project_name",
  kol_channel_id: "kol_channel_id",
  external_post_id: "external_post_id",
  caption: "caption",
  remark: "remark",
  status: "status",
  kol_budget: "kol_budget",
  notes: "notes",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_content: "utm_content",
  utm_term: "utm_term",
}

const ALL_ALLOWED_COLUMNS = Array.from(new Set([...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS, "file_name"]))

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1_1D64wh00-FQUjGqB00zN-9LiHoPcbjgTjhUcVSfcMw/export?format=csv&gid=1829620904"

// Check if a value looks like it should be an integer but has comma
const detectCommaInInteger = (value: string, columnName: string): boolean => {
  if (!value || !value.trim()) return false
  
  const trimmed = value.trim()
  
  // Check if value contains only digits, spaces, and commas (looks like a number with comma separator)
  // Pattern: digits with optional comma separators (e.g., "1,000", "1,234,567")
  const numberWithCommaPattern = /^\d{1,3}(,\d{3})+$/
  
  // If it matches number with comma pattern, it's likely a number that should not have comma
  if (numberWithCommaPattern.test(trimmed)) {
    return true
  }
  
  // Also check if it has comma but looks like it should be an integer
  if (trimmed.includes(",") && /^\d+[,\.]\d*$/.test(trimmed.replace(/\./g, ""))) {
    return true
  }
  
  return false
}

// Detect if CSV has comma issues (unequal column counts)
const detectCSVIssues = (
  text: string,
  headers: string[],
  rows?: PostInfoRow[],
): { hasError: boolean; errors: string[] } => {
  const errors: string[] = []
  const lines = text.replace(/\r/g, "").trim().split("\n")
  const expectedColumnCount = headers.length

  // Check data rows - simple split by comma (for basic CSV without quoted values)
  lines.slice(1).forEach((line, index) => {
    if (!line.trim()) return // Skip empty lines

    // Simple comma split (works for most cases)
    const columnCount = line.split(",").length

    // Check if column count significantly differs
    if (Math.abs(columnCount - expectedColumnCount) > 1) {
      errors.push(
        `แถวที่ ${index + 2}: จำนวนคอลัมน์ไม่ตรงกัน (คาดหวัง ${expectedColumnCount} คอลัมน์ แต่พบ ${columnCount} คอลัมน์) - อาจมี comma (,) หลุดออกมาในข้อมูล หรือมี comma เกินในเซลล์ (ควรใส่ข้อมูลที่มี comma ใน double quotes "ข้อความ,ที่มีcomma")`,
      )
    }
  })

  // Check for comma in integer columns if rows are provided
  if (rows) {
    rows.forEach((row, index) => {
      // Check all numeric-looking fields that might be integers
      Object.entries(row).forEach(([columnName, value]) => {
        if (typeof value === "string" && value.trim()) {
          // Check columns that might be integers
          const isLikelyIntegerColumn =
            columnName.toLowerCase().includes("id") ||
            columnName.toLowerCase().includes("count") ||
            columnName.toLowerCase().includes("follower") ||
            columnName.toLowerCase().includes("number") ||
            columnName.toLowerCase().includes("num") ||
            columnName.toLowerCase().includes("quantity") ||
            columnName.toLowerCase().includes("qty")
          
          if (detectCommaInInteger(value, columnName)) {
            if (isLikelyIntegerColumn || /^\d{1,3}(,\d{3})+$/.test(value.trim())) {
              errors.push(
                `แถวที่ ${index + 2}, คอลัมน์ "${columnName}": พบ comma (,) ในค่าที่ควรเป็นตัวเลขจำนวนเต็ม (${value.trim()}) - กรุณาลบ comma ออก (เช่น 1,000 ควรเป็น 1000)`,
              )
            }
          }
        }
      })
    })
  }

  // Only show first 10 errors to avoid overwhelming the user
  return { hasError: errors.length > 0, errors: errors.slice(0, 10) }
}

export function PostInfoImport({ onComplete }: PostInfoImportProps) {
  const supabase = createBrowserClient()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PostInfoRow[]>([])
  const [rowsBuffer, setRowsBuffer] = useState<PostInfoRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isFetchingSheet, setIsFetchingSheet] = useState(false)
  const [sheetUrlInput, setSheetUrlInput] = useState("")
  const [sheetValidationErrors, setSheetValidationErrors] = useState<string[]>([])
  const [sheetValidationWarnings, setSheetValidationWarnings] = useState<string[]>([])
  const [sheetUnknownColumns, setSheetUnknownColumns] = useState<string[]>([])
  const [sheetRowErrors, setSheetRowErrors] = useState<string[]>([])
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    setResult(null)
    setRowsBuffer([])
    setSheetValidationErrors([])
    setSheetValidationWarnings([])
    setSheetUnknownColumns([])
    setSheetRowErrors([])
    setSheetHeaders([])

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

      const { rows: normalizedRows, errors: postDateErrors } = normalizeRowsPostDate(rows)

      if (postDateErrors.length > 0) {
        setSheetRowErrors(postDateErrors)
        const limitedErrors = postDateErrors.slice(0, 3).join("; ")
        const suffix = postDateErrors.length > 3 ? " ..." : ""
        throw new Error(`พบ post_date ไม่ถูกต้อง: ${limitedErrors}${suffix}`)
      }

      // Check for comma issues in CSV files
      if (isCSV) {
        const { hasError: hasCommaError, errors: commaErrors } = detectCSVIssues(text, headers, normalizedRows)
        if (hasCommaError) {
          setSheetRowErrors([...postDateErrors, ...commaErrors])
          const limitedErrors = commaErrors.slice(0, 3).join("; ")
          const suffix = commaErrors.length > 3 ? " ..." : ""
          throw new Error(`พบปัญหา comma (,) ในข้อมูล: ${limitedErrors}${suffix}`)
        }
      }

      setSheetRowErrors([])
      setPreview(normalizedRows.slice(0, 5))
      setFile(selected)
      setRowsBuffer([])
    } catch (error: any) {
      console.error("[v0] Error reading file:", error)
      toast.error(error?.message ?? "ไม่สามารถอ่านไฟล์ได้")
      setFile(null)
      setPreview([])
    }
  }

  const logImportRow = async (
    params: {
      file_name: string
      kol_name: string | null
      post_name: string | null
      kol_category: string | null
      post_note: string | null
      post_type: string | null
      content_type: string | null
      platform: string | null
      kol_tier: string | null
      follower: number | null
      kol_budget: number | null
      boost_budget: number | null
      post_link: string | null
      post_date: string | null
      campaign_name: string | null
      flag_use: boolean
      import_date: string
      status: string
      error_message: string | null
      raw_payload: PostInfoRow
      created_by: string
    },
  ) => {
    const { error } = await supabase.from("import_post").insert({
      ...params,
      raw_payload: params.raw_payload,
    })

    if (error) {
      console.error("[v0] Error logging import_post row:", error)
      return false
    }
    return true
  }

  const parseCSV = (text: string): PostInfoRow[] => {
    const lines = text.replace(/\r/g, "").trim().split("\n")
    if (lines.length <= 1) return []

    const headers = lines[0]
      .split(",")
      .map((header) => normalizeColumnName(header))
      .filter(Boolean)

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim())
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] ?? ""
      })
      return normalizeRowKeys(row)
    })
  }

  const parseJSON = (text: string): PostInfoRow[] => {
    try {
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        return data.map((item) => normalizeRowKeys(item as Record<string, any>))
      }
      return []
    } catch {
      throw new Error("Invalid JSON")
    }
  }

  const parseInput = (text: string, fileType: string): PostInfoRow[] => {
    const lowerType = fileType.toLowerCase()
    if (lowerType.endsWith(".json") || lowerType.includes("json")) {
      return parseJSON(text)
    }
    return parseCSV(text)
  }

const extractHeadersFromCSV = (text: string) => {
  const normalized = text.replace(/\r/g, "").trim()
  const headerLine = normalized.split("\n")[0] ?? ""
  if (!headerLine) return []
  return headerLine
    .split(",")
    .map((header) => normalizeColumnName(header))
    .filter(Boolean)
}

const normalizeGoogleSheetUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes("docs.google.com")) {
      return null
    }

    if (parsed.pathname.includes("/spreadsheets/d/")) {
      const parts = parsed.pathname.split("/")
      const idIndex = parts.indexOf("d")
      const sheetId = idIndex !== -1 ? parts[idIndex + 1] : null
      const gid = parsed.searchParams.get("gid") || parsed.hash.replace("#gid=", "")
      if (sheetId) {
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ""}`
      }
    }

    return url
  } catch {
    return null
  }
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

  const handleImport = async () => {
    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !userData?.user?.id) {
      toast.error("ไม่สามารถดึงข้อมูลผู้ใช้งานได้ กรุณาเข้าสู่ระบบใหม่")
      return
    }

    const toNullableNumber = (value?: string | number) => {
      const numericValue = parseNumber(value)
      return Number.isNaN(numericValue) ? null : numericValue
    }

    const hasBufferedRows = rowsBuffer.length > 0

    if (!file && !hasBufferedRows) {
      toast.error("กรุณาเลือกไฟล์หรือดึงข้อมูลจาก Google Sheet ก่อน")
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const generatedFileName = `${userData.user.id}${formatTimestampForFileName(new Date())}`
      let rows: PostInfoRow[] = []

      if (file) {
        const text = await file.text()
        rows = parseInput(text, file.type || file.name)
      } else {
        rows = rowsBuffer
      }

      if (!rows?.length) {
        toast.error("ไม่พบข้อมูลในไฟล์")
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
        const rawPostLinkInput = row.post_link ?? row.post_url
        const trimmedPostLink = rawPostLinkInput !== undefined && rawPostLinkInput !== null ? rawPostLinkInput.toString().trim() : ""
        const normalizedPostLink = trimmedPostLink ? normalizeUrl(trimmedPostLink) : ""
        const finalPostLink = normalizedPostLink || (trimmedPostLink || null)

        if (!finalPostLink) {
          rowErrors.push("post_link หรือ post_url ว่างหรือไม่ถูกต้อง")
        }

        const rawPostDateInput = row.post_date ?? row.posted_at
        let finalPostDate: string | null = null
        const { date: normalizedPostDate, error: postDateError } = parsePostDate(rawPostDateInput)

        if (postDateError) {
          rowErrors.push(postDateError)
        } else if (normalizedPostDate) {
          finalPostDate = normalizedPostDate
        }

        const status = rowErrors.length > 0 ? "invalid" : "queued"
        const errorMessage = rowErrors.length > 0 ? rowErrors.join("; ") : null

        const inserted = await logImportRow({
          file_name: generatedFileName,
          kol_name: row.kol_name?.trim() || null,
          post_name: row.post_name?.trim() || null,
          kol_category: row.kol_category?.trim() || null,
          post_note: row.post_note?.trim() || null,
          post_type: row.post_type?.trim() || null,
          content_type: row.content_type?.trim() || null,
          platform: row.platform?.trim() || null,
          kol_tier: row.kol_tier?.trim() || null,
          follower: toNullableNumber(row.follower),
          kol_budget: toNullableNumber(row.kol_budget),
          boost_budget: toNullableNumber(row.boost_budget),
          post_link: finalPostLink,
          post_date: finalPostDate,
          campaign_name: row.campaign_name?.trim() || null,
          flag_use: false,
          import_date: new Date().toISOString(),
          status,
          error_message: errorMessage,
          raw_payload: row,
          created_by: userData.user.id,
        })

        if (inserted) {
          results.success++
          if (rowErrors.length > 0) {
            results.errors.push({
              row: index + 2,
              error: errorMessage ?? "ข้อมูลไม่ถูกต้อง",
            })
          }
        } else {
          results.failed++
          results.errors.push({
            row: index + 2,
            error: "บันทึกลง import_post ไม่สำเร็จ",
          })
        }
      }

      setResult(results)

      if (results.success > 0) {
        toast.success(`บันทึกเข้าตาราง import_post แล้ว ${results.success} รายการ`)
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
      console.error("[v0] Error processing post info import:", error)
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
    setSheetRowErrors([])
    setSheetHeaders([])

    try {
      const inputUrl = sheetUrlInput.trim()
      const normalizedUrl = inputUrl ? normalizeGoogleSheetUrl(inputUrl) : GOOGLE_SHEET_URL

      if (!normalizedUrl) {
        throw new Error("ลิงก์ Google Sheet ไม่ถูกต้อง")
      }

      const response = await fetch(`/api/import-posts/google-sheet?url=${encodeURIComponent(normalizedUrl)}`, {
        cache: "no-store",
      })
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

      const { rows: normalizedRows, errors: postDateErrors } = normalizeRowsPostDate(rows)

      if (postDateErrors.length > 0) {
        setSheetRowErrors(postDateErrors)
        const limitedErrors = postDateErrors.slice(0, 5).join("; ")
        const suffix = postDateErrors.length > 5 ? " ..." : ""
        throw new Error(`พบ post_date ไม่ถูกต้อง: ${limitedErrors}${suffix}`)
      }

      // Check for comma issues
      const { hasError: hasCommaError, errors: commaErrors } = detectCSVIssues(text, headers, normalizedRows)
      if (hasCommaError) {
        setSheetRowErrors([...postDateErrors, ...commaErrors])
        const limitedErrors = commaErrors.slice(0, 5).join("; ")
        const suffix = commaErrors.length > 5 ? " ..." : ""
        throw new Error(`พบปัญหา comma (,) ในข้อมูล: ${limitedErrors}${suffix}`)
      }

      setSheetRowErrors([])
      setFile(null)
      setPreview(normalizedRows.slice(0, 5))
      setRowsBuffer(normalizedRows)
      toast.success(`ตรวจสอบและดึงข้อมูลจาก Google Sheet สำเร็จ (${normalizedRows.length} แถว)`)
    } catch (error: any) {
      console.error("[v0] Error fetching Google Sheet:", error)
      toast.error(error?.message ?? "ไม่สามารถดึงข้อมูลจาก Google Sheet ได้")
    } finally {
      setIsFetchingSheet(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sheet-url">ลิงก์ Google Sheet</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="sheet-url"
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
        <Label htmlFor="post-info-file">เลือกไฟล์ (รองรับ .csv, .json)</Label>
        <Input
          id="post-info-file"
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

      {sheetRowErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2 text-sm">
            <p>พบปัญหา post_date ในข้อมูลที่ตรวจสอบ:</p>
            <ul className="list-inside list-disc">
              {sheetRowErrors.map((message, index) => (
                <li key={`post-date-error-${index}`}>{message}</li>
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
                  <TableHead>Post Link</TableHead>
                  <TableHead>External Post ID</TableHead>
                  <TableHead>Post Name</TableHead>
                  <TableHead>KOL Name</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Posted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-xs truncate font-mono text-xs">
                      {row.post_link || row.post_url || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.external_post_id || "-"}</TableCell>
                    <TableCell>{row.post_name || "-"}</TableCell>
                    <TableCell>{row.kol_name || "-"}</TableCell>
                    <TableCell>{row.content_type || "-"}</TableCell>
                    <TableCell>{row.post_date || row.posted_at || "-"}</TableCell>
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
        disabled={(!file && rowsBuffer.length === 0) || isProcessing || sheetValidationErrors.length > 0}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isProcessing ? "กำลังนำเข้า..." : "เริ่มนำเข้าข้อมูล"}
      </Button>
    </div>
  )
}

