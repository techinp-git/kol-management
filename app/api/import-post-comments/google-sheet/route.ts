import { NextResponse } from "next/server"

const DEFAULT_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1lSAMPLE_ID/export?format=csv&gid=0"

function toExportUrl(sheetUrl: string) {
  try {
    const source = new URL(sheetUrl)
    if (!source.hostname.includes("docs.google.com") || !source.pathname.includes("/spreadsheets/")) {
      throw new Error("ลิงก์ต้องเป็น Google Sheet เท่านั้น")
    }

    if (source.pathname.includes("/spreadsheets/d/")) {
      const parts = source.pathname.split("/")
      const idIndex = parts.indexOf("d")
      const sheetId = idIndex !== -1 ? parts[idIndex + 1] : null
      const gid = source.searchParams.get("gid") || source.hash.replace("#gid=", "")
      if (sheetId) {
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ""}`
      }
    }

    return sheetUrl
  } catch {
    throw new Error("ลิงก์ Google Sheet ไม่ถูกต้อง")
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetParam = searchParams.get("url")
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
        { error: "ไม่สามารถดึงข้อมูลจาก Google Sheet ได้", status: response.status },
        { status: 502 },
      )
    }

    const csv = await response.text()
    return NextResponse.json({ csv })
  } catch (error) {
    console.error("[v0] Unexpected error fetching Google Sheet (comments):", error)
    return NextResponse.json({ error: (error as Error).message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

