import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProjectsListClient } from "@/components/projects-list-client"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      accounts (
        id,
        name
      ),
      campaigns (
        id
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching projects:", error)
  }

  const allCampaignIds: string[] = []
  const campaignToProject: Record<string, string> = {}
  ;(projects || []).forEach((project: any) => {
    (project.campaigns || []).forEach((campaign: any) => {
      if (campaign.id) {
        allCampaignIds.push(campaign.id)
        campaignToProject[campaign.id] = project.id
      }
    })
  })

  type ProjectStats = { posts_count: number; total_paid_to_kols: number; kol_ids: Set<string> }
  const statsByProject: Record<string, ProjectStats> = {}
  if (allCampaignIds.length > 0) {
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        campaign_id,
        kol_channel_id,
        kol_budget,
        boost_budget,
        campaigns (
          project_id
        ),
        kol_channels (
          kol_id
        )
      `)
      .in("campaign_id", allCampaignIds)

    ;(posts || []).forEach((p: any) => {
      const projectId = p.campaigns?.project_id
      if (!projectId) return
      if (!statsByProject[projectId]) {
        statsByProject[projectId] = { posts_count: 0, total_paid_to_kols: 0, kol_ids: new Set() }
      }
      statsByProject[projectId].posts_count += 1
      const kol = parseFloat(p.kol_budget?.toString() || "0") || 0
      const boost = parseFloat(p.boost_budget?.toString() || "0") || 0
      statsByProject[projectId].total_paid_to_kols += kol + boost
      const kolId = p.kol_channels?.kol_id
      if (kolId) statsByProject[projectId].kol_ids.add(kolId)
    })
  }

  const projectsWithStats = (projects || []).map((project: any) => {
    const campaignsCount = (project.campaigns || []).length
    const stats = statsByProject[project.id]
    const kolsCount = stats ? stats.kol_ids.size : 0
    const posts_count = stats?.posts_count ?? 0
    const total_paid_to_kols = stats?.total_paid_to_kols ?? 0
    return {
      ...project,
      campaigns_count: campaignsCount,
      kols_count: kolsCount,
      posts_count,
      total_budget: total_paid_to_kols,
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">โปรเจกต์</h1>
          <p className="text-muted-foreground mt-1">จัดการโปรเจกต์และแคมเปญ</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มโปรเจกต์
          </Button>
        </Link>
      </div>

      <ProjectsListClient initialProjects={projectsWithStats} />
    </div>
  )
}
