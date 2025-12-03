import { createClient } from "@/lib/supabase/server"
import KOLSentimentDashboard from "@/components/kol-sentiment-dashboard"

export default async function TotalSentimentByKOLPage() {
  const supabase = await createClient()

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name")
    .order("name", { ascending: true })

  if (accountsError) {
    console.error("Error fetching accounts for filters:", accountsError)
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, account_id")
    .order("name", { ascending: true })

  if (projectsError) {
    console.error("Error fetching projects for filters:", projectsError)
  }

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("id, name, project_id")
    .order("name", { ascending: true })

  if (campaignsError) {
    console.error("Error fetching campaigns for filters:", campaignsError)
  }

  return (
    <KOLSentimentDashboard
      initialAccounts={accounts || []}
      initialProjects={projects || []}
      initialCampaigns={campaigns || []}
    />
  )
}

