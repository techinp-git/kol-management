"use client"

import { useState, useMemo, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Download, Calendar, X } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

type Post = {
  id: string
  post_name: string
  kol_name: string
  kol_category: string[]
  platform: string
  follower: number
  posted_at: string
  remark: string
  campaign_id?: string | null
  campaign_name?: string | null
  impressions_organic: number
  impressions_boost: number
  total_impressions: number
  reach_organic: number
  reach_boost: number
  total_reach: number
  likes: number
  comments: number
  shares_and_saves: number
  post_clicks: number
  link_clicks: number
  retweets: number
  total_engage: number
  vdo_view: number
  kol_budget: number
  boost_budget: number
  total_budget: number
  cpr: number
  cpe: number
  cpv: number
  er_percent: number
  total_comment: number
  url: string
  caption: string
  content_type: string
}

const formatNumber = (num: number | null | undefined): string => {
  if (!num && num !== 0) return "-"
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

const formatCurrency = (num: number | null | undefined): string => {
  if (!num && num !== 0) return "-"
  return `฿${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatPercent = (num: number | null | undefined): string => {
  if (!num && num !== 0) return "-"
  return `${num.toFixed(2)}%`
}

type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

type PostsListClientProps = {
  initialPosts?: Post[]
  pagination?: PaginationMeta
  useClientSideSearch?: boolean
}

export function PostsListClient({ initialPosts = [], pagination, useClientSideSearch = false }: PostsListClientProps) {
  // ใช้ default = [] กันทุก case
  const allPosts = initialPosts ?? []
  const [posts, setPosts] = useState<Post[]>(allPosts)

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [clientPagination, setClientPagination] = useState({
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 1,
    totalCount: pagination?.totalCount || allPosts.length,
    pageSize: pagination?.pageSize || 10,
    filteredPosts: allPosts
  })

  const paginationInfo: PaginationMeta = useClientSideSearch 
    ? {
        currentPage: clientPagination.currentPage,
        totalPages: clientPagination.totalPages,
        totalCount: clientPagination.totalCount,
        pageSize: clientPagination.pageSize,
      }
    : pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: allPosts.length,
        pageSize: allPosts.length || 0,
      }

  const { currentPage, totalPages, totalCount } = paginationInfo
  const [pendingPage, setPendingPage] = useState<number | null>(null)
  const targetPage = pendingPage ?? currentPage
  const displayPage = Math.min(Math.max(targetPage, 1), totalPages || 1)

  useEffect(() => {
    setPendingPage(null)
  }, [currentPage])

  // Client-side search and pagination function
  const performClientSearch = (query: string, dateFromFilter: string, dateToFilter: string, page: number = 1) => {
    let filtered = allPosts

    // Apply search filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter((post) => {
        const categories = post.kol_category?.join(", ") ?? ""
        return (
          post.kol_name?.toLowerCase().includes(searchTerm) ||
          post.post_name?.toLowerCase().includes(searchTerm) ||
          post.caption?.toLowerCase().includes(searchTerm) ||
          post.platform?.toLowerCase().includes(searchTerm) ||
          post.content_type?.toLowerCase().includes(searchTerm) ||
          post.campaign_name?.toLowerCase().includes(searchTerm) ||
          post.remark?.toLowerCase().includes(searchTerm) ||
          categories.toLowerCase().includes(searchTerm)
        )
      })
    }

    // Apply date filter
    if (dateFromFilter || dateToFilter) {
      filtered = filtered.filter((post) => {
        if (!post.posted_at) return false

        const postDate = new Date(post.posted_at)
        const fromDate = dateFromFilter ? new Date(dateFromFilter) : null
        const toDate = dateToFilter ? new Date(dateToFilter) : null

        if (fromDate) fromDate.setHours(0, 0, 0, 0)
        if (toDate) toDate.setHours(23, 59, 59, 999)
        postDate.setHours(0, 0, 0, 0)

        const isAfterFrom = !fromDate || postDate >= fromDate
        const isBeforeTo = !toDate || postDate <= toDate

        return isAfterFrom && isBeforeTo
      })
    }

    // Calculate pagination
    const totalCount = filtered.length
    const pageSize = clientPagination.pageSize
    const totalPages = Math.ceil(totalCount / pageSize) || 1
    const validPage = Math.min(Math.max(page, 1), totalPages)
    const startIndex = (validPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageData = filtered.slice(startIndex, endIndex)

    // Update client pagination state
    setClientPagination({
      currentPage: validPage,
      totalPages,
      totalCount,
      pageSize,
      filteredPosts: pageData
    })

    // Update posts for display
    if (useClientSideSearch) {
      setPosts(pageData)
    }

    return { pageData, totalPages, totalCount }
  }

  // Initialize client-side search
  useEffect(() => {
    if (useClientSideSearch) {
      performClientSearch("", "", "", 1)
    } else {
      setPosts(allPosts)
    }
  }, [useClientSideSearch, allPosts])

  // Debounced search effect
  useEffect(() => {
    if (!useClientSideSearch) return

    const timeoutId = setTimeout(() => {
      performClientSearch(searchQuery, dateFrom, dateTo, 1)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, dateFrom, dateTo, useClientSideSearch])

  const searchQueryLower = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery]
  )

  // Filter ตาม search + ช่วงวัน (for non-client-side search mode)
  const filteredPosts = useMemo(() => {
    if (useClientSideSearch) {
      return posts // posts already filtered by performClientSearch
    }

    if (!posts || posts.length === 0) return []

    let result = posts

    if (searchQueryLower) {
      result = result.filter((post) => {
        const categories = post.kol_category?.join(", ") ?? ""
        return (
          post.kol_name?.toLowerCase().includes(searchQueryLower) ||
          post.caption?.toLowerCase().includes(searchQueryLower) ||
          post.platform?.toLowerCase().includes(searchQueryLower) ||
          post.content_type?.toLowerCase().includes(searchQueryLower) ||
          categories.toLowerCase().includes(searchQueryLower)
        )
      })
    }

    if (dateFrom || dateTo) {
      result = result.filter((post) => {
        if (!post.posted_at) return false

        const postDate = new Date(post.posted_at)
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo) : null

        if (fromDate) fromDate.setHours(0, 0, 0, 0)
        if (toDate) toDate.setHours(23, 59, 59, 999)
        postDate.setHours(0, 0, 0, 0)

        const isAfterFrom = !fromDate || postDate >= fromDate
        const isBeforeTo = !toDate || postDate <= toDate

        return isAfterFrom && isBeforeTo
      })
    }

    return result
  }, [posts, searchQueryLower, dateFrom, dateTo, useClientSideSearch])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
  }

  const handleExport = () => {
    // TODO: Implement export to Excel/CSV
    console.log("[v0] Exporting posts to Excel/CSV")
  }

  const safeFilteredPosts = filteredPosts ?? []
  const safeInitialPosts = posts ?? []

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return
    }

    if (useClientSideSearch) {
      // Client-side pagination
      performClientSearch(searchQuery, dateFrom, dateTo, page)
    } else {
      // URL-based pagination (existing behavior)
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      if (page > 1) {
        params.set("page", page.toString())
      } else {
        params.delete("page")
      }

      const queryString = params.toString()
      const href = queryString ? `${pathname}?${queryString}` : pathname

      setPendingPage(page)
      router.push(href, { scroll: false })
      router.refresh()
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4 border-b space-y-3">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาโพสต์..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleExport}
                size="sm"
                className="h-9 flex-shrink-0"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Label
                htmlFor="date-from"
                className="text-xs sm:text-sm whitespace-nowrap hidden sm:inline"
              >
                จากวันที่:
              </Label>
              <Input
                id="date-from"
                type="date"
                className="flex-1 h-9 text-sm"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Label
                htmlFor="date-to"
                className="text-xs sm:text-sm whitespace-nowrap hidden sm:inline"
              >
                ถึงวันที่:
              </Label>
              <Input
                id="date-to"
                type="date"
                className="flex-1 h-9 text-sm"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                min={dateFrom || undefined}
              />
            </div>
            {(searchQuery || dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 flex-shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">ล้าง</span>
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs sm:text-sm text-muted-foreground">
            {safeFilteredPosts.length > 0 ? (
              <>
                {useClientSideSearch ? (
                  <>
                    แสดง {safeFilteredPosts.length} รายการ (จากทั้งหมด {allPosts.length} รายการ)
                    {(searchQuery || dateFrom || dateTo) && (
                      <span className="text-blue-600 ml-2">
                        ผลการค้นหา: {clientPagination.totalCount} รายการ
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    แสดง {safeFilteredPosts.length} รายการ (จากทั้งหมด {totalCount} รายการ)
                  </>
                )}
              </>
            ) : (
              <>ไม่มีข้อมูล</>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 sm:mx-0 mb-4">
            <TabsTrigger value="summary" className="text-xs sm:text-sm">
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm">
              รายละเอียดทั้งหมด
            </TabsTrigger>
          </TabsList>

          {/* SUMMARY TAB */}
          <TabsContent value="summary" className="mt-0 px-4 sm:px-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold whitespace-nowrap">KOL Name</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Post Name</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Content / Caption</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Platform</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Date</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Impressions</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Reach</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Likes</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Comments</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Engage</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">ER%</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Budget</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeFilteredPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-muted-foreground">
                                {safeInitialPosts.length === 0 
                                  ? "ยังไม่มีโพสต์" 
                                  : safeFilteredPosts.length === 0 
                                  ? "ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหา"
                                  : "ไม่พบโพสต์"}
                              </p>
                              {(searchQuery || dateFrom || dateTo) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleClearFilters}
                                  className="mt-2"
                                >
                                  ล้างการค้นหา
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        safeFilteredPosts.map((post) => (
                          <TableRow key={post.id} className="hover:bg-gray-50 transition-colors border-b">
                            <TableCell className="font-medium whitespace-nowrap">
                              <Link href={`/dashboard/posts/${post.id}`} className="text-black hover:underline">
                                {post.kol_name || "Unknown"}
                              </Link>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap max-w-[150px] truncate">
                              <Link href={`/dashboard/posts/${post.id}`} className="text-black hover:underline">
                                {post.post_name || "-"}
                              </Link>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="space-y-1">
                                {post.content_type && (
                                  <Badge variant="outline" className="text-xs mb-1">
                                    {post.content_type}
                                  </Badge>
                                )}
                                <p className="text-sm line-clamp-2">{post.caption || "-"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="secondary">{post.platform || "unknown"}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {post.posted_at
                                ? new Date(post.posted_at).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.total_impressions)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.total_reach)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.likes)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.comments)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.total_engage)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatPercent(post.er_percent)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(post.total_budget)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {post.url ? (
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-black hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="hidden sm:inline">เปิด</span>
                                </a>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="mt-0 px-4 sm:px-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold whitespace-nowrap">KOL Name</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Post Name</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Content / Caption</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Platform</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Date</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Impressions (Org)</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Impressions (Boost)</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Total Impressions</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Reach (Org)</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Reach (Boost)</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Total Reach</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Likes</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Comments</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Shares & Saves</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Post Clicks</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Link Clicks</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Retweets</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Total Engage</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Views</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">CPR</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">CPE</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">CPV</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">ER%</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Total Comment</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeFilteredPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={25} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-muted-foreground">
                                {safeInitialPosts.length === 0 
                                  ? "ยังไม่มีโพสต์" 
                                  : safeFilteredPosts.length === 0 
                                  ? "ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหา"
                                  : "ไม่พบโพสต์"}
                              </p>
                              {(searchQuery || dateFrom || dateTo) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleClearFilters}
                                  className="mt-2"
                                >
                                  ล้างการค้นหา
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        safeFilteredPosts.map((post) => (
                          <TableRow key={post.id} className="hover:bg-gray-50 transition-colors border-b">
                            <TableCell className="font-medium whitespace-nowrap">
                              <Link href={`/dashboard/posts/${post.id}`} className="text-black hover:underline">
                                {post.kol_name || "Unknown"}
                              </Link>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap max-w-[150px] truncate">
                              <Link href={`/dashboard/posts/${post.id}`} className="text-black hover:underline">
                                {post.post_name || "-"}
                              </Link>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="space-y-1">
                                {post.content_type && (
                                  <Badge variant="outline" className="text-xs mb-1">
                                    {post.content_type}
                                  </Badge>
                                )}
                                <p className="text-sm line-clamp-2">{post.caption || "-"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="secondary">{post.platform || "unknown"}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {post.posted_at
                                ? new Date(post.posted_at).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.impressions_organic)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.impressions_boost)}</TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">{formatNumber(post.total_impressions)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.reach_organic)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.reach_boost)}</TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">{formatNumber(post.total_reach)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.likes)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.comments)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.shares_and_saves)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.post_clicks)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.link_clicks)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.retweets)}</TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">{formatNumber(post.total_engage)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.vdo_view)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap text-sm">{formatCurrency(post.cpr)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap text-sm">{formatCurrency(post.cpe)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap text-sm">{formatCurrency(post.cpv)}</TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">{formatPercent(post.er_percent)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatNumber(post.total_comment)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {post.url ? (
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-black hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="hidden sm:inline">เปิด</span>
                                </a>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </CardContent>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t">
          <div className="text-xs sm:text-sm text-muted-foreground">
            หน้า {displayPage} จาก {totalPages} (ทั้งหมด {totalCount} รายการ)
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(displayPage - 1)}
              disabled={displayPage === 1}
              className="h-8 px-2 sm:px-3"
            >
              <span className="hidden sm:inline mr-1">ก่อนหน้า</span>
              <span>‹</span>
            </Button>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (displayPage <= 3) {
                  pageNum = i + 1
                } else if (displayPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = displayPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={displayPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 min-w-[32px] sm:min-w-[40px] px-2 text-xs sm:text-sm"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(displayPage + 1)}
              disabled={displayPage === totalPages}
              className="h-8 px-2 sm:px-3"
            >
              <span>›</span>
              <span className="hidden sm:inline ml-1">ถัดไป</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
