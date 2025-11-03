import { createClient } from "@/lib/supabase/server"
import { ProjectForm } from "@/components/project-form"

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ account_id?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: accounts } = await supabase.from("accounts").select("id, name").eq("status", "active")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่มโปรเจกต์ใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูลโปรเจกต์</p>
      </div>
      <ProjectForm accounts={accounts || []} defaultAccountId={params.account_id} />
    </div>
  )
}
