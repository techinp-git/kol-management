import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AccountsListClient } from "@/components/accounts-list-client"

export default async function AccountsPage() {
  const supabase = await createClient()

  // Fetch accounts with related data
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select(`
      *,
      projects (
        id,
        total_budget,
        campaigns (
          id,
          campaign_kols (
            kol_id
          )
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching accounts:", error)
  }

  // Calculate statistics for each account
  const accountsWithStats = (accounts || []).map((account: any) => {
    const projects = account.projects || []
    const projectsCount = projects.length
    
    // Count campaigns
    const campaignsCount = projects.reduce((sum: number, project: any) => {
      return sum + (project.campaigns?.length || 0)
    }, 0)
    
    // Count unique KOLs across all campaigns
    const kolIds = new Set<string>()
    projects.forEach((project: any) => {
      project.campaigns?.forEach((campaign: any) => {
        campaign.campaign_kols?.forEach((ck: any) => {
          if (ck.kol_id) {
            kolIds.add(ck.kol_id)
          }
        })
      })
    })
    const kolsCount = kolIds.size
    
    // Calculate total budget from projects
    const totalBudget = projects.reduce((sum: number, project: any) => {
      return sum + (project.total_budget ? parseFloat(project.total_budget) : 0)
    }, 0)

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
      total_budget: totalBudget,
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">บัญชีลูกค้า</h1>
          <p className="text-muted-foreground mt-1">จัดการบัญชีลูกค้าและแบรนด์</p>
        </div>
        <Link href="/dashboard/accounts/new">
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
