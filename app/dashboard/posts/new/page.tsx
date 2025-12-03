import { createClient } from "@/lib/supabase/server"
import { PostForm } from "@/components/post-form"

export default async function NewPostPage() {
  const supabase = await createClient()

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select(
      `
      id,
      name,
      status,
      projects (
        accounts (
          name
        )
      )
    `,
    )
    .in("status", ["draft", "review", "approved", "live"])
    .order("created_at", { ascending: false })

  if (campaignsError) {
    console.error("[v0] Error fetching campaigns:", campaignsError)
  }

  const { data: kols } = await supabase
    .from("kols")
    .select(
      `
      id,
      name,
      kol_channels (
        id,
        channel_type,
        handle
      )
    `,
    )
    .eq("status", "active")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่มโพสต์ใหม่</h1>
        <p className="text-muted-foreground">บันทึกโพสต์และสถิติ</p>
      </div>
      {campaignsError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            เกิดข้อผิดพลาดในการดึงข้อมูลแคมเปญ: {campaignsError.message}
          </p>
        </div>
      )}
      {!campaignsError && (!campaigns || campaigns.length === 0) && (
        <div className="rounded-lg border border-amber-600 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            ไม่พบแคมเปญที่สามารถเลือกได้ กรุณาสร้างแคมเปญก่อนเพิ่มโพสต์
          </p>
        </div>
      )}
      <PostForm campaigns={campaigns || []} kols={kols || []} />
    </div>
  )
}
