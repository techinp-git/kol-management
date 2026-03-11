"use client"

import { useEffect, useMemo, useState, useRef } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([])
  const [selectedKolIds, setSelectedKolIds] = useState<string[]>([])
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [selectedIntentionFilters, setSelectedIntentionFilters] = useState<string[]>([])
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)
  const [kolDropdownOpen, setKolDropdownOpen] = useState(false)
  const [postDropdownOpen, setPostDropdownOpen] = useState(false)
  const campaignDropdownRef = useRef<HTMLDivElement | null>(null)
  const kolDropdownRef = useRef<HTMLDivElement | null>(null)
  const postDropdownRef = useRef<HTMLDivElement | null>(null)
  const filterInitializedRef = useRef(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null)
  const [commentTags, setCommentTags] = useState<Record<string, CommentTag[]>>({})
  const prevCommentIdsRef = useRef<string>('')
  
  // Client-side search state
  const [allComments] = useState<CommentItem[]>(comments)
  const [clientPage, setClientPage] = useState(currentPage)

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

  // Campaign options — จาก comments (INNER JOIN: เฉพาะ campaign ที่มี comment)
  const campaignOptions = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>()
    allComments.forEach((c) => {
      const cid = c.posts?.campaign_id
      const cname = c.posts?.campaign_name
      if (cid && cname && !unique.has(cid)) {
        unique.set(cid, { id: cid, name: cname })
      }
    })
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allComments])

  // KOL options — จาก comments กรองตาม campaign ที่เลือก
  const kolOptions = useMemo(() => {
    const allCamp = selectedCampaignIds.length === campaignOptions.length
    const scope = allCamp
      ? allComments
      : allComments.filter((c) => c.posts?.campaign_id && selectedCampaignIds.includes(c.posts.campaign_id))
    const unique = new Map<string, { id: string; name: string }>()
    scope.forEach((c) => {
      const kid = c.posts?.kol_channels?.kols?.id
      const kname = c.posts?.kol_channels?.kols?.name
      if (kid && kname && !unique.has(kid)) {
        unique.set(kid, { id: kid, name: kname })
      }
    })
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allComments, selectedCampaignIds, campaignOptions.length])

  // Post options — จาก comments กรองตาม campaign + KOL ที่เลือก
  const postOptions = useMemo(() => {
    const allCamp = selectedCampaignIds.length === campaignOptions.length
    const allKol = selectedKolIds.length === kolOptions.length
    let scope: CommentItem[] = allComments
    if (!allCamp) scope = scope.filter((c) => c.posts?.campaign_id && selectedCampaignIds.includes(c.posts.campaign_id))
    if (!allKol) scope = scope.filter((c) => c.posts?.kol_channels?.kols?.id && selectedKolIds.includes(c.posts.kol_channels.kols.id))
    const unique = new Map<string, PostOption>()
    scope.forEach((c) => {
      const p = c.posts
      if (p && !unique.has(p.id)) {
        unique.set(p.id, {
          id: p.id,
          external_post_id: p.external_post_id,
          post_name: p.post_name,
          url: p.url,
          campaign_id: p.campaign_id,
          campaign_name: p.campaign_name,
          kol_id: p.kol_channels?.kols?.id ?? null,
          kol_name: p.kol_channels?.kols?.name ?? null,
        })
      }
    })
    return Array.from(unique.values()).sort((a, b) =>
      (a.post_name || a.external_post_id || a.id).localeCompare(b.post_name || b.external_post_id || b.id)
    )
  }, [allComments, selectedCampaignIds, selectedKolIds, campaignOptions.length, kolOptions.length])

  const isAllCampaigns = selectedCampaignIds.length === campaignOptions.length
  const isAllKols = selectedKolIds.length === kolOptions.length
  const isAllPosts = selectedPostIds.length === postOptions.length

  // เลือกทั้งหมดเมื่อโหลดครั้งแรก
  useEffect(() => {
    if (filterInitializedRef.current || campaignOptions.length === 0) return
    filterInitializedRef.current = true
    setSelectedCampaignIds(campaignOptions.map((c) => c.id))
  }, [campaignOptions])

  // เมื่อ campaign เปลี่ยน → reset KOL เป็นทั้งหมด
  useEffect(() => {
    setSelectedKolIds(kolOptions.map((k) => k.id))
  }, [kolOptions])

  // เมื่อ KOL เปลี่ยน → reset Post เป็นทั้งหมด
  useEffect(() => {
    setSelectedPostIds(postOptions.map((p) => p.id))
  }, [postOptions])

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target as Node)) setCampaignDropdownOpen(false)
      if (kolDropdownRef.current && !kolDropdownRef.current.contains(e.target as Node)) setKolDropdownOpen(false)
      if (postDropdownRef.current && !postDropdownRef.current.contains(e.target as Node)) setPostDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset to page 1 when filters or search change
  const prevFiltersRef = useRef('')
  useEffect(() => {
    const key = `${searchQuery}|${selectedCampaignIds.join(',')}|${selectedKolIds.join(',')}|${selectedPostIds.join(',')}|${selectedIntentionFilters.join(',')}`
    if (prevFiltersRef.current && prevFiltersRef.current !== key) {
      setClientPage(1)
    }
    prevFiltersRef.current = key
  }, [searchQuery, selectedCampaignIds, selectedKolIds, selectedPostIds, selectedIntentionFilters])

  // Base filtered (campaign, KOL, post, search only — no intention) for intention buttons list
  const baseFilteredComments = useMemo(() => {
    const source = useClientSideSearch ? allComments : comments
    let filtered = source
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.text?.toLowerCase().includes(q) || c.author?.toLowerCase().includes(q) || c.post_intention?.toLowerCase().includes(q) ||
        c.posts?.post_name?.toLowerCase().includes(q) || c.posts?.campaign_name?.toLowerCase().includes(q) ||
        c.posts?.kol_channels?.kols?.name?.toLowerCase().includes(q)
      )
    }
    if (!isAllCampaigns) filtered = filtered.filter(c => c.posts?.campaign_id && selectedCampaignIds.includes(c.posts.campaign_id))
    if (!isAllKols) filtered = filtered.filter(c => c.posts?.kol_channels?.kols?.id && selectedKolIds.includes(c.posts.kol_channels.kols.id))
    if (!isAllPosts) filtered = filtered.filter(c => c.posts?.id && selectedPostIds.includes(c.posts.id))
    return filtered
  }, [allComments, comments, searchQuery, isAllCampaigns, isAllKols, isAllPosts, selectedCampaignIds, selectedKolIds, selectedPostIds, useClientSideSearch])

  // All filtered comments (with intention filter) — used for table and pagination
  const allFilteredComments = useMemo(() => {
    if (selectedIntentionFilters.length === 0) return baseFilteredComments
    return baseFilteredComments.filter(c => selectedIntentionFilters.includes(c.post_intention || "ไม่ระบุ"))
  }, [baseFilteredComments, selectedIntentionFilters])

  // Paginated comments for display
  const csrTotalPages = Math.ceil(allFilteredComments.length / itemsPerPage) || 1
  const csrCurrentPage = Math.min(Math.max(clientPage, 1), csrTotalPages)

  const filteredComments = useMemo(() => {
    if (!useClientSideSearch) return allFilteredComments
    const start = (csrCurrentPage - 1) * itemsPerPage
    return allFilteredComments.slice(start, start + itemsPerPage)
  }, [useClientSideSearch, allFilteredComments, csrCurrentPage, itemsPerPage])

  // รายการปุ่มเจตนา — คำนวณจาก base (ไม่กรองเจตนา) เพื่อให้ปุ่มไม่หายเมื่อเลือก
  const postIntentionStats = useMemo(() => {
    const stats: Record<string, number> = {}
    baseFilteredComments.forEach((comment) => {
      const intention = comment.post_intention || "ไม่ระบุ"
      stats[intention] = (stats[intention] || 0) + 1
    })
    return Object.entries(stats)
      .map(([intention, count]) => ({ intention, count }))
      .sort((a, b) => b.count - a.count)
  }, [baseFilteredComments])

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
    setSelectedCampaignIds(campaignOptions.map((c) => c.id))
    setSelectedKolIds(kolOptions.map((k) => k.id))
    setSelectedPostIds(postOptions.map((p) => p.id))
    setSelectedIntentionFilters([])
    setSearchQuery("")
  }

  const hasActiveFilters =
    !isAllCampaigns ||
    !isAllKols ||
    !isAllPosts ||
    selectedIntentionFilters.length > 0 ||
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
    const maxPages = useClientSideSearch ? csrTotalPages : totalPages
    const currentPageNum = useClientSideSearch ? csrCurrentPage : currentPage
    
    if (page < 1 || page > maxPages || page === currentPageNum) {
      return
    }

    if (useClientSideSearch) {
      setClientPage(page)
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
  const filteredCount = allFilteredComments.length
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
              {/* Campaign */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  กรองตามแคมเปญ
                </Label>
                <div className="relative" ref={campaignDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCampaignDropdownOpen((prev) => !prev)}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <span className="truncate text-left">
                      {isAllCampaigns
                        ? `ทั้งหมด (${campaignOptions.length} แคมเปญ)`
                        : `${selectedCampaignIds.length}/${campaignOptions.length} แคมเปญ`}
                    </span>
                    <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {campaignDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                      <div className="p-2 border-b">
                        <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setSelectedCampaignIds(isAllCampaigns ? [] : campaignOptions.map((c) => c.id))}>
                          {isAllCampaigns ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      {campaignOptions.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm">
                          <Checkbox checked={selectedCampaignIds.includes(c.id)}
                            onCheckedChange={(checked) => setSelectedCampaignIds((prev) => checked ? [...prev, c.id] : prev.filter((id) => id !== c.id))} />
                          <span className="truncate">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* KOL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  กรองตาม KOL
                </Label>
                <div className="relative" ref={kolDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setKolDropdownOpen((prev) => !prev)}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <span className="truncate text-left">
                      {isAllKols
                        ? `ทั้งหมด (${kolOptions.length} KOL)`
                        : `${selectedKolIds.length}/${kolOptions.length} KOL`}
                    </span>
                    <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {kolDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                      <div className="p-2 border-b">
                        <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setSelectedKolIds(isAllKols ? [] : kolOptions.map((k) => k.id))}>
                          {isAllKols ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      {kolOptions.map((k) => (
                        <label key={k.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm">
                          <Checkbox checked={selectedKolIds.includes(k.id)}
                            onCheckedChange={(checked) => setSelectedKolIds((prev) => checked ? [...prev, k.id] : prev.filter((id) => id !== k.id))} />
                          <span className="truncate">{k.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Post */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  กรองตามโพสต์
                </Label>
                <div className="relative" ref={postDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setPostDropdownOpen((prev) => !prev)}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <span className="truncate text-left">
                      {isAllPosts
                        ? `ทั้งหมด (${postOptions.length} โพสต์)`
                        : `${selectedPostIds.length}/${postOptions.length} โพสต์`}
                    </span>
                    <svg className="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {postDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-auto">
                      <div className="p-2 border-b">
                        <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setSelectedPostIds(isAllPosts ? [] : postOptions.map((p) => p.id))}>
                          {isAllPosts ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      {postOptions.map((post) => (
                        <label key={post.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm">
                          <Checkbox checked={selectedPostIds.includes(post.id)}
                            onCheckedChange={(checked) => setSelectedPostIds((prev) => checked ? [...prev, post.id] : prev.filter((id) => id !== post.id))} />
                          <span className="truncate">{post.post_name || post.external_post_id || post.url || post.id}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                แสดง {displayedCount} รายการ จาก {filteredCount.toLocaleString()} ผลลัพธ์
                {useClientSideSearch && (
                  <span className="ml-2 text-xs text-gray-500">
                    (หน้า {csrCurrentPage}/{csrTotalPages})
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
                  const intentionStyles = [
                    { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", ring: "ring-blue-500" },
                    { bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500", ring: "ring-green-500" },
                    { bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500", ring: "ring-purple-500" },
                    { bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", ring: "ring-orange-500" },
                    { bg: "bg-pink-50", border: "border-pink-200", dot: "bg-pink-500", ring: "ring-pink-500" },
                    { bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-500", ring: "ring-indigo-500" },
                  ]
                  const style = intentionStyles[index % intentionStyles.length]
                  const totalBase = baseFilteredComments.length
                  const percentage = totalBase > 0 ? ((count / totalBase) * 100).toFixed(1) : "0"
                  const isSelected = selectedIntentionFilters.includes(intention)

                  return (
                    <button
                      key={intention}
                      type="button"
                      onClick={() => {
                        setSelectedIntentionFilters((prev) =>
                          prev.includes(intention)
                            ? prev.filter((x) => x !== intention)
                            : [...prev, intention]
                        )
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:opacity-90 ${style.bg} ${style.border} ${isSelected ? `ring-2 ring-offset-1 ${style.ring}` : "opacity-80"}`}
                    >
                      <div className={`h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
                      <span className="text-sm font-medium text-gray-900">{intention}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </button>
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
                              href={`/posts/${comment.posts.id}`}
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
                            href={`/posts/${comment.posts.id}`}
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
              ? csrTotalPages > 1 
              : totalPages > 1
            return shouldShowPagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t px-4 sm:px-6">
              <div className="text-sm text-gray-600">
                {(() => {
                  const currentPageNum = useClientSideSearch ? csrCurrentPage : currentPage
                  const totalPagesNum = useClientSideSearch ? csrTotalPages : totalPages
                  const totalCountNum = useClientSideSearch ? allFilteredComments.length : totalCount
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
                  const currentPageNum = useClientSideSearch ? csrCurrentPage : currentPage
                  const totalPagesNum = useClientSideSearch ? csrTotalPages : totalPages
                  
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

