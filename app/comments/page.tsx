import { CommentsPageClient } from "@/components/comments-page-client"
import { createClient } from "@/lib/supabase/server"

type CommentQueryResult = {
  id: string
  external_comment_id: string | null
  author: string
  text: string
  timestamp: string
  like_count: number | null
  post_intention: string | null
  post_id: string
  post_link: string | null
  posts?: null | {
    id: string
    external_post_id: string | null
    post_name: string | null
    url: string | null
    campaigns: null | {
      id: string
      name: string | null
      projects: null | {
        accounts: null | {
          id: string
          name: string | null
        }
      }
    }
    kol_channels: null | {
      id: string | null
      channel_type: string | null
      handle: string | null
      kols: null | {
        id: string | null
        name: string | null
      }
    }
  }
  comment_tags: Array<{
        tags: {
      id: string
      name: string
      type: string
      color: string | null
    } | null
  }> | null
}

type TagRecord = {
  id: string
  name: string
  type: string
  color: string | null
}

type PostRecord = {
  id: string
  external_post_id: string | null
  post_name: string | null
  url: string | null
  campaigns: null | {
    id: string
    name: string | null
  }
  kol_channels: null | {
    kols: null | {
      id: string | null
      name: string | null
    }
  }
}

type CommentsPageProps = {
  searchParams?: Promise<{
    page?: string
  }>
}

export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const rawPage = Number(resolvedSearchParams?.page ?? 1)
  const currentPage = Math.max(1, rawPage)
  const itemsPerPage = 50

  console.log("[v0] Comments page - fetching all data for client-side search")

  // First, try to get user info to check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch ALL comments for client-side search and statistics
  const [commentsResponse, tagsResponse, postsResponse] = await Promise.all([
    supabase
      .from("comments")
      .select<CommentQueryResult>(
        `
          id,
          external_comment_id,
          author,
          text,
          timestamp,
          like_count,
          post_intention,
          post_id,
          post_link,
          posts!comments_post_id_fkey (
            id,
            external_post_id,
            post_name,
            url,
            campaigns (
              id,
              name,
              projects (
                accounts (
                  id,
                  name
                )
              )
            ),
            kol_channels (
              id,
              channel_type,
              handle,
              kols (
                id,
                name
              )
            )
          ),
          comment_tags (
            tags (
              id,
              name,
              type,
              color
            )
          )
        `,
      )
      .order("timestamp", { ascending: false }),
    supabase.from("tags").select<TagRecord>("id, name, type, color").order("name", { ascending: true }),
    supabase
      .from("posts")
      .select<PostRecord>(
        `
          id,
          external_post_id,
          post_name,
          url,
          campaigns (
            id,
            name
          ),
          kol_channels (
            kols (
              id,
              name
            )
          )
        `,
      ),
  ])

  const commentsData = commentsResponse.data ?? []
  const tagsData = tagsResponse.data ?? []
  const postsData = postsResponse.data ?? []
  const totalCount = commentsData.length

  if (commentsResponse.error) {
    console.error("[v0] Error loading comments:", commentsResponse.error)
    console.error("[v0] Error code:", commentsResponse.error.code)
    console.error("[v0] Error message:", commentsResponse.error.message)
    console.error("[v0] Error details:", JSON.stringify(commentsResponse.error, null, 2))
    console.error("[v0] User:", user?.id)
  }

  if (tagsResponse.error) {
    console.error("[v0] Error loading tags:", tagsResponse.error)
  }

  if (postsResponse.error) {
    console.error("[v0] Error loading posts:", postsResponse.error)
  }

  // Log only if there are errors or for debugging
  if (commentsResponse.error || commentsData.length === 0) {
    console.log("[v0] Comments loaded:", commentsData.length)
  }

  const comments = commentsData.map((comment) => {
    // Try both 'post' and 'posts' in case relationship name differs
    const post = (comment as any).post || (comment as any).posts
    const campaign = post?.campaigns
    const kolChannel = post?.kol_channels
    const kol = kolChannel?.kols

    return {
      id: comment.id,
      external_comment_id: comment.external_comment_id,
      author: comment.author,
      text: comment.text,
      timestamp: comment.timestamp,
      like_count: comment.like_count ?? 0,
      post_intention: comment.post_intention,
      posts: post
        ? {
            id: post.id,
            external_post_id: post.external_post_id,
            post_name: post.post_name,
            url: post.url,
            campaign_id: campaign?.id ?? null,
            campaign_name: campaign?.name ?? null,
            account_name: campaign?.projects?.accounts?.name ?? null,
            kol_channels: kolChannel
              ? {
                  id: kolChannel.id ?? null,
                  channel_type: kolChannel.channel_type ?? null,
                  handle: kolChannel.handle ?? null,
                  kols: kol
                    ? {
                        id: kol.id ?? null,
                        name: kol.name ?? null,
                      }
                    : null,
                }
              : null,
          }
        : null,
      comment_tags:
        comment.comment_tags
          ?.map((item) => item?.tags)
          .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag)) ?? [],
    }
  })

  const tags = tagsData.map((tag) => ({
    id: tag.id,
    name: tag.name,
    type: tag.type,
    color: tag.color,
  }))

  const posts = postsData.map((post) => {
    const campaign = post.campaigns
    const kol = post.kol_channels?.kols
    return {
      id: post.id,
      external_post_id: post.external_post_id,
      post_name: post.post_name,
      url: post.url,
      campaign_id: campaign?.id ?? null,
      campaign_name: campaign?.name ?? null,
      kol_id: kol?.id ?? null,
      kol_name: kol?.name ?? null,
    }
  })

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <CommentsPageClient 
      comments={comments} 
      tags={tags} 
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      itemsPerPage={itemsPerPage}
      useClientSideSearch={true}
    />
  )
}
