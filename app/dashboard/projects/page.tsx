import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FolderKanban } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      *,
      accounts (
        id,
        name
      ),
      campaigns:campaigns(count)
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">โปรเจกต์</h1>
          <p className="text-muted-foreground">จัดการโปรเจกต์และแคมเปญ</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มโปรเจกต์
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ค้นหาโปรเจกต์..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="transition-colors hover:bg-accent">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{project.accounts?.name}</span>
                            {project.start_date && (
                              <>
                                <span>•</span>
                                <span>{new Date(project.start_date).toLocaleDateString("th-TH")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">แคมเปญ</p>
                          <p className="text-2xl font-bold">{project.campaigns?.[0]?.count || 0}</p>
                        </div>
                        {project.total_budget && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">งบประมาณ</p>
                            <p className="font-semibold">{project.total_budget.toLocaleString()}</p>
                          </div>
                        )}
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">ยังไม่มีโปรเจกต์</p>
                <Link href="/dashboard/projects/new">
                  <Button className="mt-4 bg-transparent" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มโปรเจกต์แรก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
