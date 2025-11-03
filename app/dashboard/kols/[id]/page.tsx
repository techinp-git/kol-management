import { notFound } from "next/navigation"
import { KOLDetailClient } from "@/components/kol-detail-client"
import { createClient } from "@/lib/supabase/server"

type KOLStatus = "active" | "inactive" | "draft" | "ban"

export default async function KOLDetailPage({ params }: { params: { id: string } }) {
  const { id } = params

  const supabase = await createClient()

  const { data: kol, error } = await supabase
    .from("kols")
    .select(`
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
    `)
    .eq("id", id)
    .single()

  if (error || !kol) {
    console.error("[v0] Error fetching KOL:", error)
    notFound()
  }

  return <KOLDetailClient kol={kol} />
}
