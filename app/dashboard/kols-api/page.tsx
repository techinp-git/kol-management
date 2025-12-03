import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { KOLsListClient } from "@/components/kols-list-client"

export default async function KOLsAPIPage() {
  // For API pagination, we start with empty data and let the client fetch
  const initialKOLs: any[] = []
  const currentPage = 1
  const totalPages = 1
  const totalCount = 0
  const itemsPerPage = 25

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KOL (API Pagination)</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูล KOL และช่องทางโซเชียลมีเดีย - ใช้ API Pagination</p>
        </div>
        <Link href="/dashboard/kols/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่ม KOL
          </Button>
        </Link>
      </div>

      <KOLsListClient 
        initialKOLs={initialKOLs} 
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        useApiPagination={true}
      />
    </div>
  )
}
