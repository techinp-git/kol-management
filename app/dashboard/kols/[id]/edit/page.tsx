import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { KOLEditForm } from "@/components/kol-edit-form"

export default async function EditKOLPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: kol, error } = await supabase
    .from("kols")
    .select(
      `
      *,
      kol_channels (
        id,
        channel_type,
        handle,
        external_id,
        profile_url,
        follower_count,
        avg_likes,
        avg_comments,
        engagement_rate,
        verified,
        status
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching KOL for edit:", error)
    console.error("[v0] Error code:", error.code)
    console.error("[v0] Error details:", error.details)
    notFound()
  }

  if (!kol) {
    console.error("[v0] KOL not found:", id)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขข้อมูล KOL</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูล {kol.name}</p>
      </div>
      <KOLEditForm kol={kol} />
    </div>
  )
}
