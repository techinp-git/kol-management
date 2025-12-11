import { createClient } from "@/lib/supabase/server"
import { CampaignForm } from "@/components/campaign-form"

export default async function NewCampaignPage({ searchParams }: { searchParams: Promise<{ project_id?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, accounts(id, name)")
    .in("status", ["planning", "active"])

  const { data: kols } = await supabase
    .from("kols")
    .select(
      `
      id,
      name,
      handle,
      kol_channels (
        id,
        channel_type,
        handle,
        follower_count
      )
    `,
    )
    .eq("status", "active")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่มแคมเปญใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูลแคมเปญและเลือก KOL</p>
      </div>
      <CampaignForm projects={projects || []} kols={kols || []} defaultProjectId={params.project_id} />
    </div>
  )
}
