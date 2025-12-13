import { NextResponse } from "next/server"

const DEFAULT_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1lSAMPLE_ID/export?format=csv&gid=0"

function extractSheetInfo(sheetUrl: string): { sheetId: string; gid: string; sheetName?: string } | null {
  try {
    const source = new URL(sheetUrl)
    if (!source.hostname.includes("docs.google.com") || !source.pathname.includes("/spreadsheets/")) {
      return null
    }

    if (source.pathname.includes("/spreadsheets/d/")) {
      const parts = source.pathname.split("/")
      const idIndex = parts.indexOf("d")
      const sheetId = idIndex !== -1 ? parts[idIndex + 1] : null
      const gid = source.searchParams.get("gid") || source.hash.replace("#gid=", "") || "0"
      
      if (sheetId) {
        // Try to extract sheet name from URL if available
        const sheetNameMatch = source.searchParams.get("sheet")
        return { sheetId, gid, sheetName: sheetNameMatch || undefined }
      }
    }

    return null
  } catch {
    return null
  }
}

// Convert Google Sheets API JSON response to CSV format
function jsonToCSV(values: any[][]): string {
  if (!values || values.length === 0) return ""
  
  return values.map(row => {
    return row.map(cell => {
      if (cell === null || cell === undefined) return ""
      const cellStr = String(cell)
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(",")
  }).join("\n")
}

// Fetch data using Google Sheets API v4 (supports unlimited rows for public sheets)
async function fetchViaAPI(sheetId: string, gid: string, apiKey?: string): Promise<string | null> {
  try {
    // Try to get sheet metadata first to find sheet name
    let sheetName: string | null = null
    const metadataUrl = apiKey
      ? `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
      : `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`
    
    try {
      const metadataResponse = await fetch(metadataUrl, { 
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })
      
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json()
        // Find sheet by gid (sheetId) or use first sheet
        const targetGid = parseInt(gid, 10)
        const sheet = metadata.sheets?.find((s: any) => 
          s.properties.sheetId === targetGid || 
          (!targetGid && s.properties.index === 0)
        ) || metadata.sheets?.[0]
        
        if (sheet?.properties?.title) {
          sheetName = sheet.properties.title
        }
      }
    } catch (err) {
      console.warn("[v0] Could not fetch sheet metadata:", err)
      // Continue with default range
    }

    // Use sheet name if available, otherwise try Sheet1 or just column range
    // Try multiple range formats
    const rangesToTry = sheetName 
      ? [`${sheetName}!A:ZZ`, `${sheetName}!A1:ZZ100000`]
      : [`Sheet1!A:ZZ`, `Sheet1!A1:ZZ100000`, `A:ZZ`]
    
    for (const range of rangesToTry) {
      try {
        const apiUrl = apiKey
          ? `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
          : `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`
        
        const response = await fetch(apiUrl, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.values && Array.isArray(data.values) && data.values.length > 0) {
            const csv = jsonToCSV(data.values)
            console.log(`[v0] Google Sheets API v4: fetched ${data.values.length} rows using range "${range}"`)
            return csv
          }
        } else if (response.status === 403) {
          // Permission denied - sheet might not be public
          console.warn(`[v0] Google Sheets API v4: Permission denied (403) - sheet may not be public`)
          return null
        } else if (response.status === 404) {
          // Range not found, try next range
          continue
        }
      } catch (rangeError) {
        // Try next range
        continue
      }
    }

    // All ranges failed
    return null
  } catch (error) {
    console.error("[v0] Error fetching via Google Sheets API v4:", error)
    return null
  }
}

function toExportUrl(sheetUrl: string) {
  const info = extractSheetInfo(sheetUrl)
  if (!info) {
    throw new Error("ลิงก์ Google Sheet ไม่ถูกต้อง")
  }
  
  return `https://docs.google.com/spreadsheets/d/${info.sheetId}/export?format=csv&gid=${info.gid}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetParam = searchParams.get("url")
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || undefined // Optional API key
    
    if (!sheetParam && !DEFAULT_GOOGLE_SHEET_URL.includes("SAMPLE")) {
      return NextResponse.json({ error: "กรุณาระบุ URL ของ Google Sheet" }, { status: 400 })
    }

    const sheetInfo = extractSheetInfo(sheetParam ?? DEFAULT_GOOGLE_SHEET_URL)
    if (!sheetInfo) {
      return NextResponse.json({ error: "ลิงก์ Google Sheet ไม่ถูกต้อง" }, { status: 400 })
    }

    // Try Google Sheets API v4 first (supports unlimited rows)
    let csv: string | null = null
    try {
      csv = await fetchViaAPI(sheetInfo.sheetId, sheetInfo.gid, apiKey)
    } catch (apiError) {
      console.warn("[v0] Google Sheets API v4 failed, falling back to CSV export:", apiError)
    }

    // Fallback to CSV export if API fails
    if (!csv) {
      console.log("[v0] Falling back to CSV export method")
      const normalizedUrl = toExportUrl(sheetParam ?? DEFAULT_GOOGLE_SHEET_URL)
      
      const response = await fetch(normalizedUrl, {
        cache: "no-store",
        headers: {
          Accept: "text/csv, text/plain;q=0.9",
        },
      })

      if (!response.ok) {
        const text = await response.text()
        console.error("[v0] Failed to fetch Google Sheet (comments):", response.status, text)
        return NextResponse.json(
          { 
            error: "ไม่สามารถดึงข้อมูลจาก Google Sheet ได้", 
            hint: "กรุณาตรวจสอบว่า Google Sheet เป็น public หรือมี API key ถูกต้อง",
            status: response.status 
          },
          { status: 502 },
        )
      }

      csv = await response.text()
    }

    if (!csv || !csv.trim()) {
      return NextResponse.json({ error: "ไม่พบข้อมูลใน Google Sheet" }, { status: 404 })
    }

    // Log CSV info for debugging
    const lines = csv.split("\n").length
    const rowCount = lines - 1 // Exclude header
    console.log(`[v0] Google Sheet data fetched: ${lines} lines (${rowCount.toLocaleString()} data rows)`)
    
    return NextResponse.json({ csv, rowCount })
  } catch (error) {
    console.error("[v0] Unexpected error fetching Google Sheet (comments):", error)
    return NextResponse.json({ error: (error as Error).message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

