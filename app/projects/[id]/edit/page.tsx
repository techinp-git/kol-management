import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProjectEditForm } from "@/components/project-edit-form"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      accounts (
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error || !project) {
    console.error("[v0] Error fetching project:", error)
    notFound()
  }

  // Fetch all accounts for the dropdown
  const { data: accounts } = await supabase.from("accounts").select("id, name").eq("status", "active")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขโปรเจกต์</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูล {project.name}</p>
      </div>
      <ProjectEditForm project={project} accounts={accounts || []} />
    </div>
  )
}

