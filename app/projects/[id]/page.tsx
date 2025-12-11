import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderKanban } from "lucide-react"
import Link from "next/link"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      *,
      accounts (
        id,
        name,
        currency
      ),
      campaigns (
        id,
        name,
        status,
        start_date,
        end_date,
        budget
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
            <FolderKanban className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              <Link href={`/accounts/${project.accounts?.id}`} className="hover:underline">
                {project.accounts?.name}
              </Link>
            </p>
          </div>
        </div>
        <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดโปรเจกต์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {project.total_budget && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">งบประมาณรวม</p>
                <p className="text-2xl font-bold">
                  {project.total_budget.toLocaleString()} {project.accounts?.currency}
                </p>
              </div>
            )}
            {project.start_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันเริ่มต้น</p>
                <p className="text-lg font-semibold">{new Date(project.start_date).toLocaleDateString("th-TH")}</p>
              </div>
            )}
            {project.end_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันสิ้นสุด</p>
                <p className="text-lg font-semibold">{new Date(project.end_date).toLocaleDateString("th-TH")}</p>
              </div>
            )}
          </div>

          {project.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">คำอธิบาย</p>
              <p className="mt-1 text-sm">{project.description}</p>
            </div>
          )}

          {project.scope && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ขอบเขตงาน</p>
              <p className="mt-1 text-sm">{project.scope}</p>
            </div>
          )}

          {project.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">หมายเหตุ</p>
              <p className="mt-1 text-sm text-muted-foreground">{project.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>แคมเปญ</CardTitle>
          <Link href={`/campaigns/new?project_id=${project.id}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มแคมเปญ
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {project.campaigns && project.campaigns.length > 0 ? (
            <div className="space-y-3">
              {project.campaigns.map((campaign: any) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className="transition-colors hover:bg-accent">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.start_date && new Date(campaign.start_date).toLocaleDateString("th-TH")}
                          {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString("th-TH")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {campaign.budget && (
                          <p className="text-sm font-semibold">
                            {campaign.budget.toLocaleString()} {project.accounts?.currency}
                          </p>
                        )}
                        <Badge variant="secondary">{campaign.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">ยังไม่มีแคมเปญ</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
