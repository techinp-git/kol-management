import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CampaignsListClient } from "@/components/campaigns-list-client"

export default async function CampaignsPage() {
  const supabase = await createClient()

  // Fetch campaigns with related data
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      projects:project_id (
        id,
        name,
        accounts:account_id (
          id,
          name
        )
      ),
      posts (
        id
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching campaigns:", error)
  }

  // Map campaigns with counts
  const mappedCampaigns = (campaigns || []).map((campaign: any) => {
    const postCount = campaign.posts?.length || 0
    
    return {
      id: campaign.id,
      name: campaign.name,
      project_id: campaign.project_id,
      project: campaign.projects ? {
        id: campaign.projects.id,
        name: campaign.projects.name,
        account: campaign.projects.accounts ? {
          id: campaign.projects.accounts.id,
          name: campaign.projects.accounts.name,
        } : null,
      } : null,
      objective: campaign.objective,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      budget: campaign.budget ? parseFloat(campaign.budget) : null,
      status: campaign.status,
      post_count: postCount,
      created_at: campaign.created_at,
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แคมเปญ</h1>
          <p className="text-muted-foreground mt-1">จัดการแคมเปญและ KOL</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มแคมเปญ
          </Button>
        </Link>
      </div>

      <CampaignsListClient initialCampaigns={mappedCampaigns} />
    </div>
  )
}
