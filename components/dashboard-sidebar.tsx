"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed))
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <aside
      className={cn(
        "relative border-r bg-muted/40 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold transition-opacity duration-300">เมนู</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "ml-auto h-8 w-8",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "ขยายเมนู" : "หุบเมนู"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <DashboardNav isCollapsed={isCollapsed} />
      </div>
    </aside>
  )
}

