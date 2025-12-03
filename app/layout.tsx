import type React from "react"
import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"], // Light, Regular, Medium, Semi Bold, Bold
  variable: "--font-prompt",
})

export const metadata: Metadata = {
  title: "YDM - KOL Management System",
  description: "ระบบจัดการ KOL และแคมเปญ",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
