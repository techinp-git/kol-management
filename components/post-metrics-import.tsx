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

type MetricsRow = {
  file_name?: string
  post_link?: string
  update_post?: string
  impression_organic?: string | number
  impression_boost_post?: string | number
  reach_organic?: string | number
  reach_boost_post?: string | number
  engage_likes?: string | number
  engange_comments?: string | number
  engage_shares?: string | number
  engage_save?: string | number
  post_click?: string | number
  link_click?: string | number
  retweet?: string | number
  vdo_view?: string | number
}

type ImportResult = {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface PostMetricsImportProps {
  onComplete?: (fileName?: string) => void
}

const REQUIRED_COLUMNS = [
  "post_link",
  "update_post",
  "impression_organic",
  "impression_boost_post",
  "reach_organic",
  "reach_boost_post",
  "engage_likes",
  "engange_comments",
  "engage_shares",
  "engage_save",
  "post_click",
  "link_click",
  "retweet",
  "vdo_view",
]

const OPTIONAL_COLUMNS = [
  "file_name",
  "impression_boost",
  "impressions_boost",
  "impressions_organic",
  "reach_boost",
  "reach_total",
  "engage_comments",
  "engage_comment",
  "engage_saves",
  "engagement_rate",
  "notes",
  "remark",
]

const COLUMN_LABELS: Record<string, string> = {
  file_name: "file_name",
  post_link: "post_link",
  update_post: "update_post",
  impression_organic: "impression_organic",
  impression_boost_post: "impression_boost_post",
  impression_boost: "impression_boost",
  impressions_boost: "impressions_boost",
  impressions_organic: "impressions_organic",
  reach_organic: "reach_organic",
  reach_boost_post: "reach_boost_post",
  reach_boost: "reach_boost",
  reach_total: "reach_total",
  engage_likes: "engage_likes",
  engange_comments: "engange_comments",
  engage_comments: "engage_comments",
  engage_comment: "engage_comment",
  engage_shares: "engage_shares",
  engage_save: "engage_save",
  engage_saves: "engage_saves",
  post_click: "post_click",
  link_click: "link_click",
  retweet: "retweet",
  vdo_view: "vdo_view",
  engagement_rate: "engagement_rate",
  notes: "notes",
  remark: "remark",
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

// Validate date format (YYYY-MM-DD or common date formats)
const validateDateFormat = (dateStr: string): { isValid: boolean; error?: string } => {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, error: "วันที่ว่างเปล่า" }
  }

  const trimmed = dateStr.trim()

  // Check for common date formats
  // YYYY-MM-DD
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
  // DD/MM/YYYY or DD-MM-YYYY
  const dmyPattern = /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/
  // MM/DD/YYYY or MM-DD-YYYY
  const mdyPattern = /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/

  if (isoDatePattern.test(trimmed)) {
    // Validate ISO date
    const parsed = new Date(trimmed + "T00:00:00")
    if (Number.isNaN(parsed.getTime())) {
      return { isValid: false, error: `รูปแบบวันที่ไม่ถูกต้อง: ${trimmed} (กรุณาใช้รูปแบบ YYYY-MM-DD)` }
    }
    return { isValid: true }
  } else if (dmyPattern.test(trimmed) || mdyPattern.test(trimmed)) {
    // Try to parse and validate
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) {
      return { isValid: false, error: `รูปแบบวันที่ไม่ถูกต้อง: ${trimmed} (กรุณาใช้รูปแบบ YYYY-MM-DD)` }
    }
    return { isValid: false, error: `รูปแบบวันที่ไม่ถูกต้อง: ${trimmed} (กรุณาใช้รูปแบบ YYYY-MM-DD แทน DD/MM/YYYY หรือ MM/DD/YYYY)` }
  } else {
    return { isValid: false, error: `รูปแบบวันที่ไม่ถูกต้อง: ${trimmed} (กรุณาใช้รูปแบบ YYYY-MM-DD เช่น 2025-01-15)` }
  }
}

// Check if a value looks like it should be an integer but has comma
const detectCommaInInteger = (value: string, columnName: string): boolean => {
  if (!value || !value.trim()) return false
  
  const trimmed = value.trim()
  
  // Must actually contain a comma to be considered an error
  if (!trimmed.includes(",")) {
    return false
  }
  
  // Check if value contains comma-separated numbers (e.g., "1,000", "1,234,567")
  // Pattern: digits with comma separators (must have at least one comma)
  // Format: 1-3 digits, followed by one or more groups of ",123" (comma + exactly 3 digits)
  const numberWithCommaPattern = /^\d{1,3}(,\d{3})+$/
  
  // If it matches number with comma pattern (has comma), return true
  if (numberWithCommaPattern.test(trimmed)) {
    return true
  }
  
  // Also check if it has comma but looks like a number with comma separator
  // This catches cases like "1,234" or "123,456" but not "7" or "978" or "0"
  // Pattern: starts with digits, has comma, followed by digits
  if (/^\d+,\d+$/.test(trimmed.replace(/\s/g, ""))) {
    return true
  }
  
  return false
}

// Detect if CSV has comma issues (unequal column counts and comma in numbers)
const detectCSVIssues = (
  text: string,
  headers: string[],
  rows?: MetricsRow[],
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

  // Check for comma in numeric columns if rows are provided
  if (rows) {
    // Define numeric columns that should not have comma
    const numericColumns = [
      "impression_organic",
      "impression_boost_post",
      "impression_boost",
      "impressions_boost",
      "impressions_organic",
      "reach_organic",
      "reach_boost_post",
      "reach_boost",
      "reach_total",
      "engage_likes",
      "engange_comments",
      "engage_comments",
      "engage_comment",
      "engage_shares",
      "engage_save",
      "engage_saves",
      "post_click",
      "link_click",
      "retweet",
      "vdo_view",
      "engagement_rate",
    ]

    rows.forEach((row, index) => {
      numericColumns.forEach((columnName) => {
        const value = (row as any)[columnName]
        if (value !== undefined && value !== null && value !== "") {
          const valueStr = value.toString().trim()
          // Only check if value string actually contains a comma
          // Skip pure numeric strings without comma
          if (valueStr && valueStr.includes(",")) {
            if (detectCommaInInteger(valueStr, columnName)) {
              errors.push(
                `แถวที่ ${index + 2}, คอลัมน์ "${columnName}": พบ comma (,) ในค่าที่ควรเป็นตัวเลขจำนวนเต็ม (${valueStr}) - กรุณาลบ comma ออก (เช่น 1,000 ควรเป็น 1000)`,
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

const formatTimestampForFileName = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}${month}${day}${hours}${minutes}`
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

const parseCSV = (text: string): MetricsRow[] => {
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
    return row as MetricsRow
  })
}

const parseJSON = (text: string): MetricsRow[] => {
  try {
    const data = JSON.parse(text)
    if (Array.isArray(data)) {
      return data as MetricsRow[]
    }
    return []
  } catch {
    throw new Error("Invalid JSON")
  }
}

const parseInput = (text: string, fileType: string): MetricsRow[] => {
  const lowerType = fileType.toLowerCase()
  if (lowerType.endsWith(".json") || lowerType.includes("json")) {
    return parseJSON(text)
  }
  return parseCSV(text)
}

export function PostMetricsImport({ onComplete }: PostMetricsImportProps) {
  const supabase = createBrowserClient()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<MetricsRow[]>([])
  const [rowsBuffer, setRowsBuffer] = useState<MetricsRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isFetchingSheet, setIsFetchingSheet] = useState(false)
  const [sheetUrlInput, setSheetUrlInput] = useState("")
  const [sheetValidationErrors, setSheetValidationErrors] = useState<string[]>([])
  const [sheetValidationWarnings, setSheetValidationWarnings] = useState<string[]>([])
  const [sheetUnknownColumns, setSheetUnknownColumns] = useState<string[]>([])
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([])
  const [sheetDataErrors, setSheetDataErrors] = useState<string[]>([]) // Errors from data validation (date format, comma issues)

  const toNullableNumber = (value?: string | number) => {
    const numericValue = parseNumber(value)
    return Number.isNaN(numericValue) ? null : numericValue
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    setResult(null)
    setSheetValidationErrors([])
    setSheetValidationWarnings([])
    setSheetUnknownColumns([])
    setSheetHeaders([])
    setSheetDataErrors([])
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

      // Check for CSV parsing issues (comma problems) - check after parsing to get rows
      if (isCSV) {
        const csvIssues = detectCSVIssues(text, headers, rows)
        if (csvIssues.hasError) {
          setSheetDataErrors(csvIssues.errors)
          throw new Error("พบปัญหาการอ่านข้อมูล: " + csvIssues.errors.slice(0, 3).join("; ") + (csvIssues.errors.length > 3 ? "..." : ""))
        }

        // Validate date formats in update_post column
        const dateValidationErrors: string[] = []
        rows.forEach((row, index) => {
          if (row.update_post) {
            const dateValidation = validateDateFormat(row.update_post.toString())
            if (!dateValidation.isValid && dateValidation.error) {
              dateValidationErrors.push(`แถวที่ ${index + 2}: ${dateValidation.error}`)
            }
          }
        })

        if (dateValidationErrors.length > 0) {
          setSheetDataErrors((prev) => [...prev, ...dateValidationErrors.slice(0, 10)]) // Show first 10 errors
          throw new Error(
            `พบปัญหา format วันที่ในคอลัมน์ update_post (พบ ${dateValidationErrors.length} รายการ): ` +
              dateValidationErrors.slice(0, 3).join("; ") +
              (dateValidationErrors.length > 3 ? "..." : ""),
          )
        }
      }

      // Clear data errors if all validations pass
      setSheetDataErrors([])

      setPreview(rows.slice(0, 5))
      setFile(selected)
      setRowsBuffer(rows)
    } catch (error: any) {
      console.error("[v0] Error reading post metrics file:", error)
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
      impression_organic: number | null
      impression_boost_post: number | null
      reach_organic: number | null
      reach_boost_post: number | null
      engage_likes: number | null
      engange_comments: number | null
      engage_shares: number | null
      engage_save: number | null
      post_click: number | null
      link_click: number | null
      retweet: number | null
      vdo_view: number | null
      flag_use: boolean
      import_date: string
      status: string
      error_message: string | null
      raw_payload: MetricsRow
      created_by: string
    },
  ) => {
    const { error } = await supabase.from("import_post_metrics").insert({
      ...params,
      raw_payload: params.raw_payload,
    })

    if (error) {
      console.error("[v0] Error logging import_post_metrics row:", error)
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
      let rows: MetricsRow[] = []

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

        const inserted = await logImportRow({
          file_name: generatedFileName,
          post_link: finalPostLink,
          update_post: finalUpdateDate,
          impression_organic: toNullableNumber(row.impression_organic),
          impression_boost_post: toNullableNumber(row.impression_boost_post ?? (row as any).impression_boost),
          reach_organic: toNullableNumber(row.reach_organic),
          reach_boost_post: toNullableNumber(row.reach_boost_post ?? (row as any).reach_boost),
          engage_likes: toNullableNumber(row.engage_likes),
          engange_comments: toNullableNumber(row.engange_comments ?? (row as any).engage_comments ?? (row as any).engage_comment),
          engage_shares: toNullableNumber(row.engage_shares),
          engage_save: toNullableNumber(row.engage_save ?? (row as any).engage_saves),
          post_click: toNullableNumber(row.post_click),
          link_click: toNullableNumber(row.link_click),
          retweet: toNullableNumber(row.retweet),
          vdo_view: toNullableNumber(row.vdo_view),
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
            error: "บันทึกลง import_post_metrics ไม่สำเร็จ",
          })
        }
      }

      setResult(results)

      if (results.success > 0) {
        toast.success(`บันทึกเข้าตาราง import_post_metrics แล้ว ${results.success} รายการ`)
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
      console.error("[v0] Error processing post metrics import:", error)
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
      setSheetDataErrors([])
      setRowsBuffer([])

    try {
      const inputUrl = sheetUrlInput.trim()
      const response = await fetch(
        `/api/import-post-metrics/google-sheet?url=${encodeURIComponent(inputUrl || GOOGLE_SHEET_URL)}`,
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

      // Check for CSV parsing issues (comma problems) - check after parsing to get rows
      const csvIssues = detectCSVIssues(text, headers, rows)
      if (csvIssues.hasError) {
        setSheetDataErrors(csvIssues.errors)
        throw new Error("พบปัญหาการอ่านข้อมูล: " + csvIssues.errors.slice(0, 3).join("; ") + (csvIssues.errors.length > 3 ? "..." : ""))
      }

      // Validate date formats in update_post column
      const dateValidationErrors: string[] = []
      rows.forEach((row, index) => {
        if (row.update_post) {
          const dateValidation = validateDateFormat(row.update_post.toString())
          if (!dateValidation.isValid && dateValidation.error) {
            dateValidationErrors.push(`แถวที่ ${index + 2}: ${dateValidation.error}`)
          }
        }
      })

      if (dateValidationErrors.length > 0) {
        setSheetDataErrors((prev) => [...prev, ...dateValidationErrors.slice(0, 10)]) // Show first 10 errors
        throw new Error(
          `พบปัญหา format วันที่ในคอลัมน์ update_post (พบ ${dateValidationErrors.length} รายการ): ` +
            dateValidationErrors.slice(0, 3).join("; ") +
            (dateValidationErrors.length > 3 ? "..." : ""),
        )
      }

      // Clear data errors if all validations pass
      setSheetDataErrors([])

      setPreview(rows.slice(0, 5))
      setRowsBuffer(rows)
      setFile(null)
      toast.success(`ตรวจสอบและดึงข้อมูลจาก Google Sheet สำเร็จ (${rows.length} แถว)`)
    } catch (error: any) {
      console.error("[v0] Error fetching Google Sheet for metrics:", error)
      toast.error(error?.message ?? "ไม่สามารถดึงข้อมูลจาก Google Sheet ได้")
    } finally {
      setIsFetchingSheet(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="metrics-sheet-url">ลิงก์ Google Sheet</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="metrics-sheet-url"
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
        <Label htmlFor="metrics-file">เลือกไฟล์ (รองรับ .csv, .json)</Label>
        <Input
          id="metrics-file"
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

      {sheetDataErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2 text-sm">
            <p className="font-semibold">พบปัญหาข้อมูลใน Google Sheet กรุณาแก้ไขก่อนนำเข้า:</p>
            <ul className="list-inside list-disc max-h-40 space-y-1 overflow-auto">
              {sheetDataErrors.map((error, index) => (
                <li key={index} className="text-xs">
                  {error}
                </li>
              ))}
            </ul>
            {sheetDataErrors.length >= 10 && (
              <p className="text-xs text-muted-foreground">... (แสดงเฉพาะ 10 รายการแรก)</p>
            )}
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
                  <TableHead>Impression (Org / Boost)</TableHead>
                  <TableHead>Reach (Org / Boost)</TableHead>
                  <TableHead>Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, index) => {
                  const impressionOrg = toNullableNumber(row.impression_organic) ?? 0
                  const impressionBoost = toNullableNumber(row.impression_boost_post) ?? 0
                  const reachOrg = toNullableNumber(row.reach_organic) ?? 0
                  const reachBoost = toNullableNumber(row.reach_boost_post) ?? 0
                  const likes = toNullableNumber(row.engage_likes) ?? 0
                  const comments =
                    toNullableNumber(row.engange_comments ?? (row as any).engage_comments ?? (row as any).engage_comment) ?? 0
                  const shares = toNullableNumber(row.engage_shares) ?? 0
                  const saves = toNullableNumber(row.engage_save ?? (row as any).engage_saves) ?? 0
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{row.file_name || "-"}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-xs text-blue-600" title={row.post_link || "-"}>
                        {row.post_link || "-"}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{row.update_post || "-"}</TableCell>
                      <TableCell className="text-xs">
                        {impressionOrg.toLocaleString()} / {impressionBoost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {reachOrg.toLocaleString()} / {reachBoost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        👍 {likes.toLocaleString()} · 💬 {comments.toLocaleString()} · 🔁 {shares.toLocaleString()} · 💾{" "}
                        {saves.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
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
                <span>บันทึกลง import_post_metrics: {result.success} รายการ</span>
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
        disabled={
          (file === null && rowsBuffer.length === 0) ||
          isProcessing ||
          sheetValidationErrors.length > 0 ||
          sheetDataErrors.length > 0
        }
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isProcessing ? "กำลังนำเข้า..." : "เริ่มนำเข้าข้อมูล"}
      </Button>
    </div>
  )
}

