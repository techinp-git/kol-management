import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProjectsListClient } from "@/components/projects-list-client"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      accounts (
        id,
        name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching projects:", error)
  }

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

      <ProjectsListClient initialProjects={projects || []} />
    </div>
  )
}
