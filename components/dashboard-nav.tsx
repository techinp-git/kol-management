"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Briefcase, Target, FileText, MessageSquare, Upload, BarChart3, DollarSign } from "lucide-react"

const navItems = [
  {
    title: "ภาพรวม",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "KOL",
    href: "/dashboard/kols",
    icon: Users,
  },
  {
    title: "บัญชีลูกค้า",
    href: "/dashboard/accounts",
    icon: Briefcase,
  },
  {
    title: "โปรเจกต์",
    href: "/dashboard/projects",
    icon: Target,
  },
  {
    title: "แคมเปญ",
    href: "/dashboard/campaigns",
    icon: Target,
  },
  {
    title: "โพสต์",
    href: "/dashboard/posts",
    icon: FileText,
  },
  {
    title: "คอมเมนต์",
    href: "/dashboard/comments",
    icon: MessageSquare,
  },
  {
    title: "Rate Cards",
    href: "/dashboard/rate-cards",
    icon: DollarSign,
  },
  {
    title: "นำเข้าข้อมูล",
    href: "/dashboard/import",
    icon: Upload,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive ? "bg-black text-[#FFFF00] shadow-md" : "bg-gray-100 text-black hover:bg-gray-200",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
