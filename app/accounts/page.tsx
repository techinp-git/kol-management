import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AccountsListClient } from "@/components/accounts-list-client"

export default async function AccountsPage() {
  const supabase = await createClient()

  // Fetch accounts with projects + campaigns (สำหรับนับโปรเจกต์/แคมเปญ และได้ campaign ids)
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select(`
      *,
      projects (
        id,
        campaigns (
          id
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching accounts:", error)
  }

  const allCampaignIds: string[] = []
  const campaignToAccount: Record<string, string> = {}
  ;(accounts || []).forEach((account: any) => {
    account.projects?.forEach((project: any) => {
      project.campaigns?.forEach((campaign: any) => {
        if (campaign.id) {
          allCampaignIds.push(campaign.id)
          campaignToAccount[campaign.id] = account.id
        }
      })
    })
  })

  // ดึงจาก posts ตาม join: posts → campaigns → projects → account, และ posts → kol_channels → kol_id
  // (เทียบเท่า SELECT ... FROM posts p JOIN kol_channels kc ... JOIN campaigns c ... JOIN projects pm ... JOIN accounts a)
  type AccountStats = { posts_count: number; total_paid_to_kols: number; kol_ids: Set<string> }
  const statsByAccount: Record<string, AccountStats> = {}
  if (allCampaignIds.length > 0) {
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        campaign_id,
        kol_channel_id,
        kol_budget,
        boost_budget,
        campaigns (
          projects (
            account_id
          )
        ),
        kol_channels (
          kol_id
        )
      `)
      .in("campaign_id", allCampaignIds)

    ;(posts || []).forEach((p: any) => {
      const accountId = p.campaigns?.projects?.account_id
      if (!accountId) return
      if (!statsByAccount[accountId]) {
        statsByAccount[accountId] = { posts_count: 0, total_paid_to_kols: 0, kol_ids: new Set() }
      }
      statsByAccount[accountId].posts_count += 1
      const kol = parseFloat(p.kol_budget?.toString() || "0") || 0
      const boost = parseFloat(p.boost_budget?.toString() || "0") || 0
      statsByAccount[accountId].total_paid_to_kols += kol + boost
      const kolId = p.kol_channels?.kol_id
      if (kolId) statsByAccount[accountId].kol_ids.add(kolId)
    })
  }

  // Calculate statistics for each account
  const accountsWithStats = (accounts || []).map((account: any) => {
    const projects = account.projects || []
    const projectsCount = projects.length

    const campaignsCount = projects.reduce((sum: number, project: any) => {
      return sum + (project.campaigns?.length || 0)
    }, 0)

    const stats = statsByAccount[account.id]
    const kolsCount = stats ? stats.kol_ids.size : 0
    const posts_count = stats?.posts_count ?? 0
    const total_paid_to_kols = stats?.total_paid_to_kols ?? 0

    return {
      id: account.id,
      name: account.name,
      company_name: account.company_name,
      primary_contact_email: account.primary_contact_email,
      primary_contact_name: account.primary_contact_name,
      primary_contact_phone: account.primary_contact_phone,
      tax_id: account.tax_id,
      billing_address: account.billing_address,
      currency: account.currency,
      credit_terms: account.credit_terms,
      status: account.status,
      notes: account.notes,
      created_at: account.created_at,
      updated_at: account.updated_at,
      projects_count: projectsCount,
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
          <h1 className="text-3xl font-bold">บัญชีลูกค้า</h1>
          <p className="text-muted-foreground mt-1">จัดการบัญชีลูกค้าและแบรนด์</p>
        </div>
        <Link href="/accounts/new">
          <Button className="bg-black text-[#FFFF00] hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มบัญชี
          </Button>
        </Link>
      </div>

      <AccountsListClient initialAccounts={accountsWithStats} />
    </div>
  )
}
