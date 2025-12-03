import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { KOLEditForm } from "@/components/kol-edit-form"

export default async function EditKOLPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Try to fetch with follower_history first, fallback to without it if column doesn't exist
  let { data: kol, error } = await supabase
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
        status,
        follower_history
      )
    `,
    )
    .eq("id", id)
    .single()

  // If error is due to missing column, try again without follower_history
  if (error && (error.code === "42703" || error.message?.includes("column") || error.message?.includes("follower_history"))) {
    console.warn("[v0] follower_history column not found, fetching without it:", error.message)
    const result = await supabase
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
    
    kol = result.data
    error = result.error
    
    // Set follower_history to empty array for all channels if column doesn't exist
    if (kol && kol.kol_channels) {
      kol.kol_channels = kol.kol_channels.map((channel: any) => ({
        ...channel,
        follower_history: [],
      }))
    }
  }

  if (error) {
    console.error("[v0] Error fetching KOL for edit:", error)
    console.error("[v0] Error code:", error.code)
    console.error("[v0] Error details:", error.details)
    console.error("[v0] Error hint:", error.hint)
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
