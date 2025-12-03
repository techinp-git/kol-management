"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Users,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  User,
  Globe,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type KOL = {
  id: string
  name: string
  handle: string | null
  category: string[] | null
  country: string | null
  status: string
  created_at: string
  kol_tier?: string | null
  kol_channels?: Array<{
    id: string
    channel_type: string
    handle: string
    follower_count: number
    engagement_rate: number | null
    follower_history?: any[]
  }>
}

const getChannelIcon = (channelType: string) => {
  switch (channelType.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "facebook":
      return <Facebook className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    case "tiktok":
      return <Video className="h-4 w-4" />
    case "twitter":
      return <Twitter className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

const formatFollowerCount = (count: number | null | undefined): string => {
  if (!count || count === 0) return "0"

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }

  return count.toLocaleString()
}

const getTotalFollowers = (channels: any[] | null | undefined): number => {
  if (!channels || channels.length === 0) return 0

  return channels.reduce((total, channel) => {
    const latestCount = getLatestFollowerCount(channel)
    return total + latestCount
  }, 0)
}

const getLatestFollowerCount = (channel: any): number => {
  if (channel.follower_history && Array.isArray(channel.follower_history) && channel.follower_history.length > 0) {
    const sortedHistory = [...channel.follower_history].sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
    return sortedHistory[0].follower_count || channel.follower_count || 0
  }
  return channel.follower_count || 0
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-700 border-green-500/20"
    case "inactive":
      return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    case "draft":
      return "bg-blue-500/10 text-blue-700 border-blue-500/20"
    case "ban":
      return "bg-red-500/10 text-red-700 border-red-500/20"
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "ใช้งาน"
    case "inactive":
      return "ไม่ใช้งาน"
    case "draft":
      return "แบบร่าง"
    case "ban":
      return "ระงับ"
    default:
      return status
  }
}

interface KOLsListClientProps {
  initialKOLs: KOL[]
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  useApiPagination?: boolean
  useClientSideSearch?: boolean
}

export function KOLsListClient({ initialKOLs, currentPage, totalPages, totalCount, itemsPerPage, useApiPagination = false, useClientSideSearch = false }: KOLsListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [pendingPage, setPendingPage] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [kols, setKOLs] = useState<KOL[]>(initialKOLs)
  const [allKols, setAllKols] = useState<KOL[]>(initialKOLs) // Store all KOLs for client-side search
  const [searchQuery, setSearchQuery] = useState("")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiPagination, setApiPagination] = useState({
    page: currentPage,
    totalPages: totalPages,
    totalCount: totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  })
  const [clientPagination, setClientPagination] = useState({
    page: currentPage,
    totalPages: totalPages,
    totalCount: totalCount,
    filteredKols: initialKOLs
  })

  // Prefetch adjacent pages for better performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefetchPage = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          const params = new URLSearchParams(searchParams?.toString() ?? "")
          if (page > 1) {
            params.set("page", page.toString())
          } else {
            params.delete("page")
          }
          const queryString = params.toString()
          const href = queryString ? `${pathname}?${queryString}` : pathname
          router.prefetch(href)
        }
      }

      // Prefetch next and previous pages
      prefetchPage(currentPage + 1)
      prefetchPage(currentPage - 1)
    }
  }, [currentPage, totalPages, pathname, searchParams, router])

  // Fetch KOLs from API with pagination
  const fetchKOLs = async (page: number, search?: string) => {
    if (!useApiPagination) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", itemsPerPage.toString())
      if (search) {
        params.set("search", search)
      }

      const response = await fetch(`/api/kols?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch KOLs")
      }

      const result = await response.json()
      setKOLs(result.data)
      setApiPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        totalCount: result.pagination.totalCount,
        hasNextPage: result.pagination.hasNextPage,
        hasPrevPage: result.pagination.hasPrevPage
      })
    } catch (error) {
      console.error("Error fetching KOLs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize API pagination on mount
  useEffect(() => {
    if (useApiPagination && kols.length === 0) {
      fetchKOLs(1)
    }
  }, [useApiPagination])

  // Client-side search and pagination
  const performClientSearch = (query: string, page: number = 1) => {
    const filtered = allKols.filter((kol) => {
      const searchTerm = query.toLowerCase()
      return (
        kol.name.toLowerCase().includes(searchTerm) ||
        kol.handle?.toLowerCase().includes(searchTerm) ||
        kol.category?.join(", ").toLowerCase().includes(searchTerm) ||
        kol.country?.toLowerCase().includes(searchTerm) ||
        kol.status.toLowerCase().includes(searchTerm) ||
        kol.kol_tier?.toLowerCase().includes(searchTerm)
      )
    })

    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const validPage = Math.min(Math.max(1, page), totalPages || 1)
    const startIndex = (validPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const pageData = filtered.slice(startIndex, endIndex)

    setClientPagination({
      page: validPage,
      totalPages: totalPages || 1,
      totalCount,
      filteredKols: pageData
    })

    return { pageData, totalPages: totalPages || 1, totalCount }
  }

  // Debounced search effect for API pagination
  useEffect(() => {
    if (!useApiPagination) return

    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        fetchKOLs(1, searchQuery)
      } else if (kols.length > 0) {
        fetchKOLs(apiPagination.page)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, useApiPagination])

  // Client-side search effect
  useEffect(() => {
    if (!useClientSideSearch) return

    const timeoutId = setTimeout(() => {
      performClientSearch(searchQuery, 1)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, useClientSideSearch, allKols])

  // Initialize client-side pagination
  useEffect(() => {
    if (useClientSideSearch) {
      performClientSearch("", currentPage)
    }
  }, [useClientSideSearch, initialKOLs, currentPage])

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Don't interfere with form inputs
      }

      let currentPageNum, maxPages
      
      if (useApiPagination) {
        currentPageNum = apiPagination.page
        maxPages = apiPagination.totalPages
      } else if (useClientSideSearch) {
        currentPageNum = clientPagination.page
        maxPages = clientPagination.totalPages
      } else {
        currentPageNum = currentPage
        maxPages = totalPages
      }
      
      if (event.key === 'ArrowLeft' && currentPageNum > 1) {
        event.preventDefault()
        handlePageChange(currentPageNum - 1)
      } else if (event.key === 'ArrowRight' && currentPageNum < maxPages) {
        event.preventDefault()
        handlePageChange(currentPageNum + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, apiPagination.page, apiPagination.totalPages, clientPagination.page, clientPagination.totalPages, useApiPagination, useClientSideSearch])

  const handlePageChange = (page: number) => {
    let maxPages, currentPageNum
    
    if (useApiPagination) {
      maxPages = apiPagination.totalPages
      currentPageNum = apiPagination.page
    } else if (useClientSideSearch) {
      maxPages = clientPagination.totalPages
      currentPageNum = clientPagination.page
    } else {
      maxPages = totalPages
      currentPageNum = currentPage
    }
    
    if (page < 1 || page > maxPages || page === currentPageNum || isPending) {
      return
    }
    
    if (useApiPagination) {
      // API-based pagination
      fetchKOLs(page, searchQuery)
      setApiPagination(prev => ({ ...prev, page }))
    } else if (useClientSideSearch) {
      // Client-side pagination
      performClientSearch(searchQuery, page)
    } else {
      // URL-based pagination (existing behavior)
      setPendingPage(page)
      
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      if (page > 1) {
        params.set("page", page.toString())
      } else {
        params.delete("page")
      }
      const queryString = params.toString()
      const href = queryString ? `${pathname}?${queryString}` : pathname
      
      // Use React's startTransition for smooth navigation
      startTransition(() => {
        router.push(href, { scroll: false })
      })
      
      // Clear pending state after navigation
      setTimeout(() => {
        setPendingPage(null)
      }, 300)
    }
  }

  const handleStatusChange = (kolId: string) => {
    setSelectedKOL(kolId)
    setStatusDialogOpen(true)
  }

  const handleDelete = (kolId: string) => {
    setSelectedKOL(kolId)
    setDeleteDialogOpen(true)
  }

  const saveStatusChange = async () => {
    if (!selectedKOL || !newStatus) return

    try {
      const response = await fetch(`/api/kols/${selectedKOL}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }

      router.refresh()
      setStatusDialogOpen(false)
      setNewStatus("")
      setSelectedKOL(null)
    } catch (err: any) {
      console.error("[v0] Error updating status:", err)
      alert(err.message)
    }
  }

  const confirmDelete = async () => {
    if (!selectedKOL) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kols/${selectedKOL}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete KOL")
      }

      router.refresh()
      setDeleteDialogOpen(false)
      setSelectedKOL(null)
    } catch (err: any) {
      console.error("[v0] Error deleting KOL:", err)
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Get filtered KOLs based on pagination mode
  const filteredKOLs = useApiPagination 
    ? kols 
    : useClientSideSearch 
      ? clientPagination.filteredKols
      : kols.filter((kol) => {
          const query = searchQuery.toLowerCase()
          return (
            kol.name.toLowerCase().includes(query) ||
            kol.handle?.toLowerCase().includes(query) ||
            kol.category?.join(", ").toLowerCase().includes(query) ||
            kol.country?.toLowerCase().includes(query) ||
            kol.status.toLowerCase().includes(query) ||
            kol.kol_tier?.toLowerCase().includes(query)
          )
        })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหา KOL..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-black text-[#FFFF00]" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-black text-[#FFFF00]" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Loading Overlay */}
          {(pendingPage !== null || isPending || isLoading) && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-4 py-2 rounded-full shadow-lg border">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                กำลังโหลดหน้า {pendingPage || (useApiPagination ? apiPagination.page : '...')}
              </div>
            </div>
          )}
          
          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredKOLs.map((kol) => {
                const totalFollowers = getTotalFollowers(kol.kol_channels || [])
                return (
                  <Card key={kol.id} className="overflow-hidden border-2 hover:border-[#FFFF00]/50 transition-colors">
                    <CardContent className="p-0">
                      <Link href={`/dashboard/kols/${kol.id}`} className="block">
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black">
                                <User className="h-7 w-7 text-[#FFFF00]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg mb-1 truncate">{kol.name}</h3>
                                {kol.handle && (
                                  <p className="text-sm text-muted-foreground truncate">@{kol.handle}</p>
                                )}
                                {kol.kol_tier && (
                                  <Badge className="mt-1 bg-amber-100 text-amber-800 border-amber-200">{kol.kol_tier}</Badge>
                                )}
                                {kol.category && kol.category.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {kol.category.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(kol.status)} border shrink-0 ml-2`}>
                              {getStatusText(kol.status)}
                            </Badge>
                          </div>

                          {kol.kol_channels && kol.kol_channels.length > 0 && (
                            <div className="space-y-2 pt-4 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">ช่องทางโซเชียล</span>
                                <span className="text-sm font-bold text-black">
                                  {formatFollowerCount(totalFollowers)} ผู้ติดตาม
                                </span>
                              </div>
                              <div className="space-y-1">
                                {kol.kol_channels.slice(0, 3).map((channel) => {
                                  const latestCount = getLatestFollowerCount(channel)
                                  return (
                                    <div key={channel.id} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        {getChannelIcon(channel.channel_type)}
                                        <span className="capitalize font-medium">{channel.channel_type}</span>
                                        <span className="text-muted-foreground">@{channel.handle}</span>
                                      </div>
                                      <span className="font-semibold">{formatFollowerCount(latestCount)}</span>
                                    </div>
                                  )
                                })}
                                {kol.kol_channels.length > 3 && (
                                  <p className="text-xs text-muted-foreground italic">
                                    +{kol.kol_channels.length - 3} ช่องทางอื่น
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex gap-2 p-4 bg-muted/30 border-t">
                        <Link href={`/dashboard/kols/${kol.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Pencil className="mr-2 h-4 w-4" />
                            แก้ไข
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.preventDefault()
                            handleStatusChange(kol.id)
                          }}
                        >
                          สถานะ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.preventDefault()
                            handleDelete(kol.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {filteredKOLs.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">ไม่พบ KOL</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">KOL</TableHead>
                    <TableHead className="font-bold">Tier</TableHead>
                    <TableHead className="font-bold">สถานะ</TableHead>
                    <TableHead className="font-bold">ช่องทางโซเชียล</TableHead>
                    <TableHead className="font-bold text-right">ผู้ติดตามรวม</TableHead>
                    <TableHead className="font-bold text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKOLs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <p className="text-muted-foreground">ไม่พบ KOL</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKOLs.map((kol) => {
                      const totalFollowers = getTotalFollowers(kol.kol_channels || [])
                      return (
                        <TableRow key={kol.id} className="hover:bg-muted/30">
                          <TableCell>
                            <Link href={`/dashboard/kols/${kol.id}`} className="block hover:underline">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black shrink-0">
                                  <User className="h-5 w-5 text-[#FFFF00]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{kol.name}</p>
                                  {kol.handle && (
                                    <p className="text-sm text-muted-foreground truncate">@{kol.handle}</p>
                                  )}
                                  {kol.category && kol.category.length > 0 && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {kol.category.join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="align-middle">
                            {kol.kol_tier ? (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">{kol.kol_tier}</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(kol.status)} border`}>
                              {getStatusText(kol.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {kol.kol_channels && kol.kol_channels.length > 0 ? (
                              <div className="space-y-1">
                                {kol.kol_channels.slice(0, 2).map((channel) => {
                                  const latestCount = getLatestFollowerCount(channel)
                                  return (
                                    <div key={channel.id} className="flex items-center gap-2 text-sm">
                                      {getChannelIcon(channel.channel_type)}
                                      <span className="capitalize">{channel.channel_type}</span>
                                      <span className="text-muted-foreground">@{channel.handle}</span>
                                      <span className="font-medium">{formatFollowerCount(latestCount)}</span>
                                    </div>
                                  )
                                })}
                                {kol.kol_channels.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{kol.kol_channels.length - 2} ช่องทางอื่น
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">ไม่มีช่องทาง</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="font-bold">{formatFollowerCount(totalFollowers)}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Link href={`/dashboard/kols/${kol.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm" onClick={() => handleStatusChange(kol.id)}>
                                สถานะ
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(kol.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {(() => {
        let showPagination, currentPageNum, totalCountNum, totalPagesNum
        
        if (useApiPagination) {
          showPagination = apiPagination.totalPages > 1
          currentPageNum = apiPagination.page
          totalCountNum = apiPagination.totalCount
          totalPagesNum = apiPagination.totalPages
        } else if (useClientSideSearch) {
          showPagination = clientPagination.totalPages > 1
          currentPageNum = clientPagination.page
          totalCountNum = clientPagination.totalCount
          totalPagesNum = clientPagination.totalPages
        } else {
          showPagination = totalPages > 1
          currentPageNum = currentPage
          totalCountNum = totalCount
          totalPagesNum = totalPages
        }
        
        return showPagination && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const startItem = ((currentPageNum - 1) * itemsPerPage) + 1
                    const endItem = Math.min(currentPageNum * itemsPerPage, totalCountNum)
                    return (
                      <>
                        แสดง {startItem} - {endItem} จาก {totalCountNum.toLocaleString()} รายการ
                        {searchQuery && (
                          <div className="text-xs mt-1 text-blue-600">
                            ผลการค้นหา "{searchQuery}"
                          </div>
                        )}
                        <div className="text-xs mt-1 opacity-70">
                          ใช้ลูกศร ← → เพื่อเปลี่ยนหน้า
                        </div>
                      </>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    let currentPageNum, maxPages
                    
                    if (useApiPagination) {
                      currentPageNum = apiPagination.page
                      maxPages = apiPagination.totalPages
                    } else if (useClientSideSearch) {
                      currentPageNum = clientPagination.page
                      maxPages = clientPagination.totalPages
                    } else {
                      currentPageNum = currentPage
                      maxPages = totalPages
                    }
                    
                    const isLoadingState = pendingPage !== null || isPending || isLoading
                    
                    return (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPageNum - 1)}
                        disabled={currentPageNum <= 1 || isLoadingState}
                        className={`transition-all duration-200 ${isLoadingState ? 'opacity-50' : 'hover:scale-105'}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {isLoadingState ? 'กำลังโหลด...' : 'ก่อนหน้า'}
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, maxPages) }, (_, i) => {
                          let pageNum
                          if (maxPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPageNum <= 3) {
                            pageNum = i + 1
                          } else if (currentPageNum >= maxPages - 2) {
                            pageNum = maxPages - 4 + i
                          } else {
                            pageNum = currentPageNum - 2 + i
                          }
                          
                          const isCurrentPage = pageNum === currentPageNum
                          const isPendingPage = pageNum === pendingPage
                    
                          return (
                            <Button
                              key={pageNum}
                              variant={isCurrentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoadingState}
                              className={`w-10 h-8 transition-all duration-200 ${
                                isPendingPage 
                                  ? 'animate-pulse bg-blue-100 border-blue-300' 
                                  : isLoadingState
                                    ? 'opacity-50' 
                                    : 'hover:scale-105'
                              } ${isCurrentPage ? 'bg-black text-[#FFFF00]' : ''}`}
                            >
                              {isPendingPage ? '...' : pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPageNum + 1)}
                        disabled={currentPageNum >= maxPages || isLoadingState}
                        className={`transition-all duration-200 ${isLoadingState ? 'opacity-50' : 'hover:scale-105'}`}
                      >
                        {isLoadingState ? 'กำลังโหลด...' : 'ถัดไป'}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                    )
                  })()}
                </div>
                </div>
              </CardContent>
            </Card>
          )
        })()}

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนสถานะ KOL</DialogTitle>
            <DialogDescription>เลือกสถานะใหม่</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>สถานะใหม่</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  <SelectItem value="draft">แบบร่าง</SelectItem>
                  <SelectItem value="ban">ระงับ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={saveStatusChange} className="bg-black text-[#FFFF00] hover:bg-black/90">
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ KOL</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ที่จะลบ KOL นี้? การกระทำนี้ไม่สามารถยกเลิกได้</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              ยกเลิก
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "กำลังลบ..." : "ลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

