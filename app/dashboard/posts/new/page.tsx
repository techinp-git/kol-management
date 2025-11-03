import { createClient } from "@/lib/supabase/server"
import { PostForm } from "@/components/post-form"

export default async function NewPostPage() {
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      `
      id,
      name,
      projects (
        accounts (
          name
        )
      )
    `,
    )
    .in("status", ["approved", "live"])

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
      <PostForm campaigns={campaigns || []} kols={kols || []} />
    </div>
  )
}
