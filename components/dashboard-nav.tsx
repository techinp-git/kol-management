"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Users,
  Briefcase,
  Target,
  FileText,
  MessageSquare,
  Upload,
  BarChart3,
  DollarSign,
  Info,
  BarChart2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react"

type NavItem = {
  title: string
  href?: string
  icon: any
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "ภาพรวม",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      {
        title: "Total KOL Performance",
        href: "/dashboard/total-kol-performance",
        icon: BarChart2,
      },
      {
        title: "Total Sentiment by KOL",
        href: "/dashboard/total-sentiment-by-kol",
        icon: MessageSquare,
      },
      {
        title: "KOLs/Post Detail",
        href: "/dashboard/kol-post-detail",
        icon: FileText,
      },
      {
        title: "Best Performing KOLs",
        href: "/dashboard/best-performing-kols",
        icon: TrendingUp,
      },
    ],
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
    title: "นำเข้า Post Info",
    href: "/dashboard/import/post-info",
    icon: Info,
  },
  {
    title: "นำเข้า Post Metrics",
    href: "/dashboard/import/post-metrics",
    icon: BarChart2,
  },
  {
    title: "นำเข้า Post Comments",
    href: "/dashboard/import/post-comments",
    icon: Upload,
  },
  {
    title: "Rate Cards",
    href: "/dashboard/rate-cards",
    icon: DollarSign,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const isMenuOpen = (title: string) => openMenus.includes(title)

  const isItemActive = (item: NavItem) => {
    if (item.href) {
      return item.href === "/dashboard"
        ? pathname === item.href
        : pathname === item.href || pathname?.startsWith(`${item.href}/`)
    }
    if (item.children) {
      return item.children.some((child) => isItemActive(child))
    }
    return false
  }

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const hasChildren = item.children && item.children.length > 0
        const isActive = isItemActive(item)
        const isOpen = isMenuOpen(item.title)

        if (hasChildren) {
          return (
            <div key={item.title}>
              <button
                onClick={() => toggleMenu(item.title)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-black text-[#FFFF00] shadow-md"
                    : "bg-gray-100 text-black hover:bg-gray-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {item.title}
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gray-300 pl-2">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon
                    const isChildActive = child.href
                      ? pathname === child.href || pathname?.startsWith(`${child.href}/`)
                      : false

                    return (
                      <Link
                        key={child.href}
                        href={child.href || "#"}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isChildActive
                            ? "bg-black text-[#FFFF00] shadow-md"
                            : "bg-gray-50 text-black hover:bg-gray-200",
                        )}
                      >
                        <ChildIcon className="h-4 w-4" />
                        {child.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href || "#"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-black text-[#FFFF00] shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200",
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
