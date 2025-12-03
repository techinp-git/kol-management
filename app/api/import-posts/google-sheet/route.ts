import { NextResponse } from "next/server"

const DEFAULT_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1_1D64wh00-FQUjGqB00zN-9LiHoPcbjgTjhUcVSfcMw/export?format=csv&gid=1829620904"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetUrl = searchParams.get("url") ?? DEFAULT_GOOGLE_SHEET_URL

    const normalizedUrl = (() => {
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
    })()

    const response = await fetch(normalizedUrl, {
      cache: "no-store",
      headers: {
        "Accept": "text/csv, text/plain;q=0.9",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[v0] Failed to fetch Google Sheet:", response.status, text)
      return NextResponse.json(
        { error: "ไม่สามารถดึงข้อมูลจาก Google Sheet ได้", status: response.status },
        { status: 502 },
      )
    }

    const csv = await response.text()
    return NextResponse.json({ csv })
  } catch (error: any) {
    console.error("[v0] Unexpected error fetching Google Sheet:", error)
    return NextResponse.json({ error: error?.message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

