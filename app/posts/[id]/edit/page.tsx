import { PostEditForm } from "@/components/post-edit-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

async function getPost(id: string) {
  try {
    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        kol_channels (
          id,
          channel_type,
          handle,
          kols (
            id,
            name
          )
        ),
        campaigns (
          id,
          name,
          projects (
            accounts (
              name
            )
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching post:", error)
      return null
    }

    return post
  } catch (error) {
    console.error("[v0] Error fetching post:", error)
    return null
  }
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      name,
      status,
      projects (
        accounts (
          name
        )
      )
    `)
    .in("status", ["draft", "review", "approved", "live"])
    .order("created_at", { ascending: false })

  // Fetch KOLs
  const { data: kols } = await supabase
    .from("kols")
    .select(`
      id,
      name,
      kol_channels (
        id,
        channel_type,
        handle
      )
    `)
    .eq("status", "active")

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขโพสต์</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูลโพสต์</p>
      </div>

      <PostEditForm post={post} campaigns={campaigns || []} kols={kols || []} />
    </div>
  )
}
