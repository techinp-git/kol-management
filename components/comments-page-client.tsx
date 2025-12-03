"use client"

import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MessageSquare,
  Plus,
  Search,
  Tag,
  Upload,
  X,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CommentsImport } from "@/components/comments-import"

type CommentTag = {
  id: string
  name: string
  type: string
  color?: string | null
}

type CommentPostInfo = {
  id: string
  external_post_id?: string | null
  post_name?: string | null
  url?: string | null
  campaign_id?: string | null
  campaign_name?: string | null
  account_name?: string | null
  kol_channels?: {
    id?: string | null
    channel_type?: string | null
    handle?: string | null
    kols?: {
      id?: string | null
      name?: string | null
    } | null
  } | null
}

type CommentItem = {
  id: string
  external_comment_id?: string | null
  author: string
  text: string
  timestamp: string
  like_count?: number | null
  post_intention?: string | null
  posts?: CommentPostInfo | null
  comment_tags: CommentTag[]
}

type PostOption = {
  id: string
  external_post_id?: string | null
  post_name?: string | null
  url?: string | null
  kol_id?: string | null
  kol_name?: string | null
  campaign_id?: string | null
  campaign_name?: string | null
}

interface CommentsPageClientProps {
  comments: CommentItem[]
  tags: CommentTag[]
  posts: PostOption[]
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  useClientSideSearch?: boolean
}

export function CommentsPageClient({ comments, tags, posts, currentPage, totalPages, totalCount, itemsPerPage, useClientSideSearch = false }: CommentsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pendingPage, setPendingPage] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [filterPost, setFilterPost] = useState<string>("all")
  const [filterCampaign, setFilterCampaign] = useState<string>("all")
  const [filterKOL, setFilterKOL] = useState<string>("all")
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null)
  const [commentTags, setCommentTags] = useState<Record<string, CommentTag[]>>({})
  const prevCommentIdsRef = useRef<string>('')
  const currentPageRef = useRef<number>(1) // Track current page for pagination
  
  // Client-side search state
  const [allComments] = useState<CommentItem[]>(comments)
  const [displayedComments, setDisplayedComments] = useState<CommentItem[]>(comments)
  const [clientPagination, setClientPagination] = useState({
    currentPage: currentPage, // Start at the current page from URL
    totalPages: totalPages,
    totalCount: totalCount,
    pageSize: itemsPerPage,
    filteredComments: comments
  })

  useEffect(() => {
    // Create a stable string representation of comment IDs
    const commentIdsString = comments.map(c => c.id).sort().join(',')
    
    // Only update if comment IDs have actually changed
    if (commentIdsString !== prevCommentIdsRef.current) {
      prevCommentIdsRef.current = commentIdsString
      
      const initial: Record<string, CommentTag[]> = {}
      comments.forEach((comment) => {
        initial[comment.id] = comment.comment_tags ?? []
      })
      setCommentTags(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments.length])

  // Client-side search and pagination function
  const performClientSearch = useCallback((query: string, postFilter: string, campaignFilter: string, kolFilter: string, page: number = 1) => {
    let filtered = allComments

    // Apply search filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter((comment) => {
        return (
          comment.text?.toLowerCase().includes(searchTerm) ||
          comment.author?.toLowerCase().includes(searchTerm) ||
          comment.post_intention?.toLowerCase().includes(searchTerm) ||
          comment.posts?.post_name?.toLowerCase().includes(searchTerm) ||
          comment.posts?.campaign_name?.toLowerCase().includes(searchTerm) ||
          comment.posts?.kol_channels?.kols?.name?.toLowerCase().includes(searchTerm)
        )
      })
    }

    // Apply filters
    if (postFilter !== "all") {
      filtered = filtered.filter(comment => comment.posts?.id === postFilter)
    }
    if (campaignFilter !== "all") {
      filtered = filtered.filter(comment => comment.posts?.campaign_id === campaignFilter)
    }
    if (kolFilter !== "all") {
      filtered = filtered.filter(comment => comment.posts?.kol_channels?.kols?.id === kolFilter)
    }

    // Calculate pagination
    const totalCount = filtered.length
    const pageSize = clientPagination.pageSize
    const totalPages = Math.ceil(totalCount / pageSize) || 1
    const validPage = Math.min(Math.max(page, 1), totalPages)
    const startIndex = (validPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageData = filtered.slice(startIndex, endIndex)

    // Update current page ref
    currentPageRef.current = validPage

    // Update client pagination state
    setClientPagination({
      currentPage: validPage,
      totalPages,
      totalCount,
      pageSize,
      filteredComments: pageData
    })

    // Update displayed comments
    if (useClientSideSearch) {
      setDisplayedComments(pageData)
    }

    return { pageData, totalPages, totalCount, allFiltered: filtered }
  }, [allComments, itemsPerPage, useClientSideSearch])

  // Initialize client-side search
  useEffect(() => {
    if (useClientSideSearch) {
      // Initialize with current page from URL, not always page 1
      performClientSearch("", "all", "all", "all", currentPage)
    } else {
      setDisplayedComments(comments)
    }
  }, [useClientSideSearch, performClientSearch, currentPage]) // Include currentPage to respect URL

  // Debounced search effect (resets to page 1)
  useEffect(() => {
    if (!useClientSideSearch) return

    const timeoutId = setTimeout(() => {
      // Reset to page 1 when search/filter changes
      performClientSearch(searchQuery, filterPost, filterCampaign, filterKOL, 1)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filterPost, filterCampaign, filterKOL, useClientSideSearch, performClientSearch])

  // Separate effect for handling page changes without debounce
  const handlePageChangeInternal = useCallback((page: number) => {
    if (!useClientSideSearch) return
    performClientSearch(searchQuery, filterPost, filterCampaign, filterKOL, page)
  }, [useClientSideSearch, searchQuery, filterPost, filterCampaign, filterKOL, performClientSearch])

  const postOptions = useMemo(() => {
    const unique = new Map<string, PostOption>()
    posts.forEach((post) => {
      if (!unique.has(post.id)) {
        unique.set(post.id, post)
      }
    })
    return Array.from(unique.values())
  }, [posts])

  const campaignOptions = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>()
    posts.forEach((post) => {
      if (post.campaign_id && post.campaign_name && !unique.has(post.campaign_id)) {
        unique.set(post.campaign_id, {
          id: post.campaign_id,
          name: post.campaign_name,
        })
      }
    })
    return Array.from(unique.values())
  }, [posts])

  const kolOptions = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>()
    posts.forEach((post) => {
      if (post.kol_id && post.kol_name && !unique.has(post.kol_id)) {
        unique.set(post.kol_id, {
          id: post.kol_id,
          name: post.kol_name,
        })
      }
    })
    return Array.from(unique.values())
  }, [posts])

  const filteredComments = useMemo(() => {
    if (useClientSideSearch) {
      return displayedComments // Already filtered by performClientSearch
    }

    return comments.filter((comment) => {
      const matchesSearch =
        comment.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.post_intention?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPost = filterPost === "all" || comment.posts?.id === filterPost
      const matchesCampaign =
        filterCampaign === "all" || comment.posts?.campaign_id === filterCampaign
      const matchesKOL =
        filterKOL === "all" || comment.posts?.kol_channels?.kols?.id === filterKOL

      return matchesSearch && matchesPost && matchesCampaign && matchesKOL
    })
  }, [comments, displayedComments, searchQuery, filterPost, filterCampaign, filterKOL, useClientSideSearch])

  // Get all filtered comments for statistics (from all pages)
  const allFilteredComments = useMemo(() => {
    if (useClientSideSearch) {
      // Calculate filtered comments without changing state
      let filtered = allComments

      // Apply search filter
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase()
        filtered = filtered.filter((comment) => {
          return (
            comment.text?.toLowerCase().includes(searchTerm) ||
            comment.author?.toLowerCase().includes(searchTerm) ||
            comment.post_intention?.toLowerCase().includes(searchTerm) ||
            comment.posts?.post_name?.toLowerCase().includes(searchTerm) ||
            comment.posts?.campaign_name?.toLowerCase().includes(searchTerm) ||
            comment.posts?.kol_channels?.kols?.name?.toLowerCase().includes(searchTerm)
          )
        })
      }

      // Apply filters
      if (filterPost !== "all") {
        filtered = filtered.filter(comment => comment.posts?.id === filterPost)
      }
      if (filterCampaign !== "all") {
        filtered = filtered.filter(comment => comment.posts?.campaign_id === filterCampaign)
      }
      if (filterKOL !== "all") {
        filtered = filtered.filter(comment => comment.posts?.kol_channels?.kols?.id === filterKOL)
      }

      return filtered
    }
    return filteredComments
  }, [allComments, searchQuery, filterPost, filterCampaign, filterKOL, useClientSideSearch, filteredComments])

  // Group count by post_intention (from all filtered data)
  const postIntentionStats = useMemo(() => {
    const stats: Record<string, number> = {}
    allFilteredComments.forEach((comment) => {
      const intention = comment.post_intention || "ไม่ระบุ"
      stats[intention] = (stats[intention] || 0) + 1
    })
    return Object.entries(stats)
      .map(([intention, count]) => ({ intention, count }))
      .sort((a, b) => b.count - a.count)
  }, [allFilteredComments])

  const handleCommentClick = (comment: CommentItem) => {
    setSelectedComment(comment)
    setTagDialogOpen(true)
  }

  const handleAddTag = (tagId: string) => {
    if (!selectedComment) return
    const tag = tags.find((t) => t.id === tagId)
    if (!tag) return

    const currentTags = commentTags[selectedComment.id] || []
    if (currentTags.some((t) => t.id === tagId)) return

    setCommentTags((prev) => ({
      ...prev,
      [selectedComment.id]: [...currentTags, tag],
    }))
  }

  const handleRemoveTag = (tagId: string) => {
    if (!selectedComment) return

    const currentTags = commentTags[selectedComment.id] || []
    setCommentTags((prev) => ({
      ...prev,
      [selectedComment.id]: currentTags.filter((t) => t.id !== tagId),
    }))
  }

  const handleResetFilters = () => {
    setFilterPost("all")
    setFilterCampaign("all")
    setFilterKOL("all")
    setSearchQuery("")
  }

  const hasActiveFilters =
    filterPost !== "all" ||
    filterCampaign !== "all" ||
    filterKOL !== "all" ||
    searchQuery !== ""

  const availableSentimentTags = useMemo(
    () => tags.filter((tag) => tag.type === "sentiment"),
    [tags],
  )
  const availableOtherTags = useMemo(
    () => tags.filter((tag) => tag.type !== "sentiment"),
    [tags],
  )

  const handlePageChange = (page: number) => {
    const maxPages = useClientSideSearch ? clientPagination.totalPages : totalPages
    const currentPageNum = useClientSideSearch ? clientPagination.currentPage : currentPage
    
    if (page < 1 || page > maxPages || page === currentPageNum) {
      return
    }

    if (useClientSideSearch) {
      // Client-side pagination (no debounce for page changes)
      handlePageChangeInternal(page)
      // Also update URL to keep it in sync
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      if (page > 1) {
        params.set("page", page.toString())
      } else {
        params.delete("page")
      }
      const queryString = params.toString()
      const href = queryString ? `${pathname}?${queryString}` : pathname
      router.replace(href, { scroll: false })
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

  const handleImportComplete = () => {
    setImportDialogOpen(false)
    router.refresh()
  }

  const totalComments = useClientSideSearch ? allComments.length : comments.length
  const filteredCount = useClientSideSearch ? clientPagination.totalCount : filteredComments.length
  const displayedCount = filteredComments.length
  
  // Calculate total likes from all filtered comments (not just current page)
  const totalLikes = useMemo(() => {
    return allFilteredComments.reduce((sum, comment) => sum + (comment.like_count || 0), 0)
  }, [allFilteredComments])
  
  // Calculate average likes per comment
  const avgLikes = useMemo(() => {
    return allFilteredComments.length > 0 ? totalLikes / allFilteredComments.length : 0
  }, [totalLikes, allFilteredComments.length])

  return (
    <div className="w-full max-w-full space-y-4 px-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">คอมเมนต์</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {totalComments.toLocaleString()} รายการ
              </span>
              {(searchQuery || hasActiveFilters) && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Search className="h-4 w-4" />
                  {filteredCount.toLocaleString()} ผลลัพธ์
                </span>
              )}
              {useClientSideSearch && totalLikes > 0 && (
                <span className="flex items-center gap-1 text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                  {totalLikes.toLocaleString()} ไลค์
                </span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            จัดการและติดแท็กคอมเมนต์ หรือ Import ข้อมูลจากไฟล์
          </p>
        </div>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-[#FFFF00] hover:bg-black/90 flex-shrink-0">
              <Upload className="mr-2 h-4 w-4" />
              Import คอมเมนต์
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Import คอมเมนต์</DialogTitle>
              <DialogDescription>
                อัพโหลดไฟล์ที่มีคอลัมน์ <span className="font-semibold">post_link</span> เพื่อเชื่อมกับโพสต์
              </DialogDescription>
            </DialogHeader>
            <CommentsImport onComplete={handleImportComplete} />
          </DialogContent>
        </Dialog>
      </div>


      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">ค้นหาและกรองข้อมูล</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {displayedCount} / {filteredCount.toLocaleString()} รายการ
          </div>
        </div>
          
          <div className="flex flex-col gap-3 px-4 sm:px-6 pb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาคอมเมนต์, ผู้เขียน, เจตนา, โพสต์, แคมเปญ, KOL..."
                  className="pl-9 w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters} 
                  className="flex-shrink-0 h-10 px-3 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  <X className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">ล้างตัวกรอง</span>
                  <span className="sm:hidden">ล้าง</span>
                </Button>
              )}
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  กรองตามโพสต์
                </Label>
                <Select value={filterPost} onValueChange={setFilterPost}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด ({postOptions.length} โพสต์)</SelectItem>
                    {postOptions.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.external_post_id || post.post_name || post.url || post.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  กรองตามแคมเปญ
                </Label>
                <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด ({campaignOptions.length} แคมเปญ)</SelectItem>
                    {campaignOptions.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  กรองตาม KOL
                </Label>
                <Select value={filterKOL} onValueChange={setFilterKOL}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด ({kolOptions.length} KOL)</SelectItem>
                    {kolOptions.map((kol) => (
                      <SelectItem key={kol.id} value={kol.id}>
                        {kol.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                แสดง {displayedCount} รายการ จาก {filteredCount.toLocaleString()} ผลลัพธ์
                {useClientSideSearch && (
                  <span className="ml-2 text-xs text-gray-500">
                    (หน้า {clientPagination.currentPage}/{clientPagination.totalPages})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(searchQuery || hasActiveFilters) && (
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    🔍 ค้นหาแล้ว
                  </div>
                )}
                {useClientSideSearch && (
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                    ⚡ Real-time
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Post Intention Statistics */}
          {postIntentionStats.length > 0 && (
            <div className="mb-4 bg-white border rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium">สถิติตามเจตนา</h3>
                </div>
                <span className="text-sm text-gray-500">{allFilteredComments.length.toLocaleString()} รายการ</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {postIntentionStats.slice(0, 6).map(({ intention, count }, index) => {
                  const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo']
                  const color = colors[index % colors.length]
                  const percentage = ((count / allFilteredComments.length) * 100).toFixed(1)
                  
                  return (
                    <div key={intention} className={`inline-flex items-center gap-2 px-3 py-2 bg-${color}-50 border border-${color}-200 rounded-lg`}>
                      <div className={`h-2 w-2 rounded-full bg-${color}-500`}></div>
                      <span className="text-sm font-medium text-gray-900">{intention}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  )
                })}
                {postIntentionStats.length > 6 && (
                  <div className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">+{postIntentionStats.length - 6} อื่นๆ</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredComments.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 sm:w-32">ผู้เขียน</TableHead>
                    <TableHead className="max-w-xs w-64">ข้อความ</TableHead>
                    <TableHead className="w-20 sm:w-24 hidden sm:table-cell">วันที่</TableHead>
                    <TableHead className="w-16 text-center hidden md:table-cell">ไลก์</TableHead>
                    <TableHead className="w-20 hidden lg:table-cell">เจตนา</TableHead>
                    <TableHead className="w-24 hidden lg:table-cell">โพสต์</TableHead>
                    <TableHead className="w-20 hidden xl:table-cell">KOL</TableHead>
                    <TableHead className="w-24 hidden xl:table-cell">แคมเปญ</TableHead>
                    <TableHead className="w-16 hidden xl:table-cell">แท็ก</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.map((comment) => (
                    <TableRow 
                      key={comment.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleCommentClick(comment)}
                    >
                      <TableCell className="font-medium">
                        <div className="truncate text-sm" title={comment.author}>
                          {comment.author}
                        </div>
                        {/* Mobile: Show additional info */}
                        <div className="sm:hidden text-xs text-muted-foreground mt-1 space-y-1">
                          <div>{new Date(comment.timestamp).toLocaleDateString("th-TH")}</div>
                          {comment.like_count && comment.like_count > 0 && (
                            <div>❤️ {comment.like_count}</div>
                          )}
                          {comment.post_intention && (
                            <div className="text-blue-600">{comment.post_intention}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs w-64">
                        <div className="text-sm whitespace-normal break-words" title={comment.text}>
                          {comment.text}
                        </div>
                        {/* Mobile: Show KOL and Campaign info */}
                        <div className="xl:hidden text-xs text-muted-foreground mt-2 space-y-1">
                          {comment.posts?.kol_channels?.kols?.name && (
                            <div>👤 {comment.posts.kol_channels.kols.name}</div>
                          )}
                          {comment.posts?.campaign_name && (
                            <div>📢 {comment.posts.campaign_name}</div>
                          )}
                          {comment.posts?.id && (
                            <Link
                              href={`/dashboard/posts/${comment.posts.id}`}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate">
                                📝 {comment.posts.external_post_id || comment.posts.post_name || "โพสต์"}
                              </span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        <div className="whitespace-nowrap">
                          {new Date(comment.timestamp).toLocaleDateString("th-TH", {
                            year: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs opacity-75">
                          {new Date(comment.timestamp).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {comment.like_count && comment.like_count > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {comment.like_count}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {comment.post_intention ? (
                          <Badge variant="outline" className="text-xs truncate max-w-20" title={comment.post_intention}>
                            {comment.post_intention}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {comment.posts?.id ? (
                          <Link
                            href={`/dashboard/posts/${comment.posts.id}`}
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="truncate max-w-20" title={comment.posts.external_post_id || comment.posts.post_name || "โพสต์"}>
                              {comment.posts.external_post_id || comment.posts.post_name || "โพสต์"}
                            </span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="truncate text-sm max-w-20" title={comment.posts?.kol_channels?.kols?.name || ""}>
                          {comment.posts?.kol_channels?.kols?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="truncate text-sm max-w-24" title={comment.posts?.campaign_name || ""}>
                          {comment.posts?.campaign_name || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(commentTags[comment.id] || []).slice(0, 1).map((tag) => {
                            const color = tag.color || "#111827"
                            return (
                              <Badge
                                key={tag.id}
                                variant="secondary"
                                className="text-xs px-1 py-0 max-w-16 truncate"
                                style={{ backgroundColor: `${color}20`, color }}
                                title={tag.name}
                              >
                                {tag.name}
                              </Badge>
                            )
                          })}
                          {(commentTags[comment.id] || []).length > 1 && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              +{(commentTags[comment.id] || []).length - 1}
                            </Badge>
                          )}
                          {(commentTags[comment.id] || []).length === 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm">ยังไม่มีคอมเมนต์</p>
            </div>
          )}

          {/* Pagination */}
          {(() => {
            const shouldShowPagination = useClientSideSearch 
              ? clientPagination.totalPages > 1 
              : totalPages > 1
            return shouldShowPagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t px-4 sm:px-6">
              <div className="text-sm text-gray-600">
                {(() => {
                  const currentPageNum = useClientSideSearch ? clientPagination.currentPage : currentPage
                  const totalPagesNum = useClientSideSearch ? clientPagination.totalPages : totalPages
                  const totalCountNum = useClientSideSearch ? clientPagination.totalCount : totalCount
                  const startItem = ((currentPageNum - 1) * itemsPerPage) + 1
                  const endItem = Math.min(currentPageNum * itemsPerPage, totalCountNum)
                  
                  return (
                    <span>
                      แสดง <span className="font-medium">{startItem}-{endItem}</span> จาก{' '}
                      <span className="font-medium">{totalCountNum.toLocaleString()}</span> รายการ
                      <span className="text-gray-500 ml-2">(หน้า {currentPageNum}/{totalPagesNum})</span>
                    </span>
                  )
                })()}
              </div>
              
              <div className="flex items-center gap-2">
                {(() => {
                  const currentPageNum = useClientSideSearch ? clientPagination.currentPage : currentPage
                  const totalPagesNum = useClientSideSearch ? clientPagination.totalPages : totalPages
                  
                  return (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPageNum - 1)}
                        disabled={currentPageNum <= 1 || pendingPage !== null}
                        className="h-9 px-2 sm:px-3 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                      >
                        <ChevronLeft className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">ก่อนหน้า</span>
                      </Button>
                      
                      <div className="flex items-center gap-1 flex-wrap">
                        {Array.from({ length: Math.min(5, totalPagesNum) }, (_, i) => {
                          let pageNum
                          if (totalPagesNum <= 5) {
                            pageNum = i + 1
                          } else if (currentPageNum <= 3) {
                            pageNum = i + 1
                          } else if (currentPageNum >= totalPagesNum - 2) {
                            pageNum = totalPagesNum - 4 + i
                          } else {
                            pageNum = currentPageNum - 2 + i
                          }
                          
                          const isCurrentPage = pageNum === currentPageNum
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={isCurrentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={pendingPage !== null}
                              className={`w-8 sm:w-10 h-9 text-xs sm:text-sm ${
                                isCurrentPage 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-md' 
                                  : 'border-gray-300 hover:border-blue-500 hover:text-blue-600'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPageNum + 1)}
                        disabled={currentPageNum >= totalPagesNum || pendingPage !== null}
                        className="h-9 px-2 sm:px-3 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                      >
                        <span className="hidden sm:inline">ถัดไป</span>
                        <ChevronRight className="h-4 w-4 sm:ml-1" />
                      </Button>
                    </>
                  )
                })()}
              </div>
            </div>
            )
          })()}
        </CardContent>
      </Card>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>จัดการแท็กคอมเมนต์</DialogTitle>
            <DialogDescription>คลิกเพื่อเพิ่มหรือลบแท็กสำหรับคอมเมนต์นี้</DialogDescription>
          </DialogHeader>

          {selectedComment && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{selectedComment.author}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedComment.timestamp).toLocaleString("th-TH")}
                  </span>
                </div>
                <p className="text-sm">{selectedComment.text}</p>
                {selectedComment.post_intention && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      เจตนา: {selectedComment.post_intention}
                    </Badge>
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  โพสต์:{" "}
                  {selectedComment.posts?.external_post_id ||
                    selectedComment.posts?.post_name ||
                    selectedComment.posts?.url ||
                    "-"}
                  {selectedComment.posts?.kol_channels?.kols?.name && (
                    <> • {selectedComment.posts.kol_channels.kols.name}</>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>แท็กที่เลือก</Label>
                <div className="flex min-h-[40px] flex-wrap gap-2 rounded-lg border p-3">
                  {(commentTags[selectedComment.id] || []).length > 0 ? (
                    (commentTags[selectedComment.id] || []).map((tag) => {
                      const color = tag.color || "#111827"
                      return (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="cursor-pointer"
                          style={{ backgroundColor: `${color}20`, color }}
                          onClick={() => handleRemoveTag(tag.id)}
                        >
                          {tag.name}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      ยังไม่มีแท็ก - คลิกเพื่อเพิ่มแท็กด้านล่าง
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>แท็กที่มีให้เลือก</Label>
                <div className="grid gap-3">
                  <div>
                    <p className="mb-2 text-sm font-medium">Sentiment</p>
                    <div className="flex flex-wrap gap-2">
                      {availableSentimentTags.map((tag) => {
                        const isSelected = (commentTags[selectedComment.id] || []).some(
                          (t) => t.id === tag.id,
                        )
                        const color = tag.color || "#111827"
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            style={
                              isSelected
                                ? { backgroundColor: color, color: "white" }
                                : { borderColor: color, color }
                            }
                            onClick={() =>
                              isSelected ? handleRemoveTag(tag.id) : handleAddTag(tag.id)
                            }
                          >
                            {isSelected ? <X className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                            {tag.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">หัวข้อ / ประเภทอื่น ๆ</p>
                    <div className="flex flex-wrap gap-2">
                      {availableOtherTags.map((tag) => {
                        const isSelected = (commentTags[selectedComment.id] || []).some(
                          (t) => t.id === tag.id,
                        )
                        const color = tag.color || "#111827"
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            style={
                              isSelected
                                ? { backgroundColor: color, color: "white" }
                                : { borderColor: color, color }
                            }
                            onClick={() =>
                              isSelected ? handleRemoveTag(tag.id) : handleAddTag(tag.id)
                            }
                          >
                            {isSelected ? <X className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                            {tag.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              ปิด
            </Button>
            <Button onClick={() => setTagDialogOpen(false)}>บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

