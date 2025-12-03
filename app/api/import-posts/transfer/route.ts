import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type TransferRequestBody = {
  fileName?: string
  ids?: string[]
  dryRun?: boolean
}

type ImportPostRow = {
  id: string
  file_name: string
  kol_name: string | null
  kol_category: string | null
  post_name: string | null
  post_note: string | null
  post_type: string | null
  content_type: string | null
  platform: string | null
  kol_tier: string | null
  follower: number | string | null
  kol_budget: number | string | null
  boost_budget: number | string | null
  post_link: string | null
  post_date: string | null
  campaign_name: string | null
  flag_use: boolean | null
  status: string | null
  error_message: string | null
  raw_payload: Record<string, any> | null
}

type TransferResultRow = {
  importId: string
  fileName: string
  status: "inserted" | "duplicate" | "skipped" | "failed"
  message?: string
  postId?: string
}

type ParsedLink = {
  handle: string | null
  profileUrl: string | null
  postId: string | null
  platform: string | null
}

const creatorCache = new Map<string, string | null>()

const profileAccountCache = new Map<string, string | null>()
const accountDefaultProjectCache = new Map<string, string | null>()

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const isUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

const getFirstString = (values: Array<unknown>) => {
  for (const value of values) {
    const trimmed = toTrimmedString(value)
    if (trimmed) {
      return trimmed
    }
  }
  return null
}

const getFirstStringFromObject = (object: Record<string, any> | null | undefined, keys: string[]) => {
  if (!object) {
    return null
  }
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key]
      const trimmed = toTrimmedString(value)
      if (trimmed) {
        return trimmed
      }
    }
  }
  return null
}

const resolveCreatorProfileId = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> => {
  if (creatorCache.has(userId)) {
    return creatorCache.get(userId) ?? null
  }

  const { data, error } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()
  if (error) {
    console.error("[v0] Error resolving creator profile:", error)
    creatorCache.set(userId, null)
    return null
  }

  const resolvedId = data?.id ?? null
  creatorCache.set(userId, resolvedId)
  return resolvedId
}

const normalizeUrl = (input?: string | null) => {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    url.hash = ""
    return url.toString()
  } catch {
    return trimmed
  }
}

const toTimestamp = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00Z`).toISOString()
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed.toISOString()
}

const toNumber = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  const cleaned = value
    .toString()
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "")
    .trim()
  if (!cleaned) return null
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const resolveProjectId = async ({
  adminClient,
  candidateProjectId,
  payload,
  creatorProfileId,
}: {
  adminClient: ReturnType<typeof createAdminClient>
  candidateProjectId?: string | null
  payload: Record<string, any>
  creatorProfileId: string | null
}) => {
  const directCandidate = getFirstString([candidateProjectId, getFirstStringFromObject(payload, ["project_id", "project_uuid", "projectId", "project"])])

  if (directCandidate && isUUID(directCandidate)) {
    return directCandidate
  }

  const projectName = getFirstString([
    getFirstStringFromObject(payload, ["project_name", "projectName", "project_title", "projectTitle"]),
  ])

  if (projectName) {
    const nameKey = projectName.toLowerCase()
    const existingByName = await adminClient
      .from("projects")
      .select("id")
      .eq("name", projectName)
      .limit(1)

    if (existingByName.error) {
      throw new Error("ไม่สามารถตรวจสอบข้อมูล project ตามชื่อได้")
    }

    const byName = existingByName.data?.[0] ?? null
    if (byName?.id) {
      return byName.id as string
    }

    const existingByIlike = await adminClient
      .from("projects")
      .select("id")
      .ilike("name", projectName)
      .limit(1)

    if (existingByIlike.error) {
      throw new Error("ไม่สามารถตรวจสอบข้อมูล project ตามชื่อได้")
    }

    const byIlike = existingByIlike.data?.[0] ?? null
    if (byIlike?.id) {
      return byIlike.id as string
    }
  }

  if (creatorProfileId) {
    let accountId: string | null | undefined = profileAccountCache.get(creatorProfileId)
    if (accountId === undefined) {
      const { data: profile, error } = await adminClient
        .from("profiles")
        .select("account_id")
        .eq("id", creatorProfileId)
        .limit(1)

      if (error) {
        throw new Error("ไม่สามารถตรวจสอบบัญชีของผู้ใช้งานได้")
      }

      accountId = (profile?.[0]?.account_id as string | null) ?? null
      profileAccountCache.set(creatorProfileId, accountId)
    }

    if (accountId) {
      let defaultProjectId: string | null | undefined = accountDefaultProjectCache.get(accountId)
      if (defaultProjectId === undefined) {
        const { data: projects, error } = await adminClient
          .from("projects")
          .select("id")
          .eq("account_id", accountId)
          .order("created_at", { ascending: true })
          .limit(1)

        if (error) {
          throw new Error("ไม่สามารถค้นหา project หลักของบัญชีได้")
        }

        defaultProjectId = (projects?.[0]?.id as string | null) ?? null
        accountDefaultProjectCache.set(accountId, defaultProjectId)
      }

      if (defaultProjectId) {
        return defaultProjectId
      }
    }
  }

  return null
}

const ensureCampaign = async ({
  adminClient,
  existingCampaignId,
  campaignName,
  candidateProjectId,
  payload,
  creatorProfileId,
}: {
  adminClient: ReturnType<typeof createAdminClient>
  existingCampaignId?: string | null
  campaignName?: string | null
  candidateProjectId?: string | null
  payload: Record<string, any>
  creatorProfileId: string | null
}) => {
  const trimmedExistingId = toTrimmedString(existingCampaignId)
  if (trimmedExistingId && isUUID(trimmedExistingId)) {
    return { campaignId: trimmedExistingId, created: false, name: toTrimmedString(campaignName), projectId: null }
  }

  const normalizedName = toTrimmedString(campaignName)
  if (!normalizedName) {
    return { campaignId: null, created: false, name: null, projectId: null }
  }

  const candidateProject = toTrimmedString(candidateProjectId)

  let existingQuery = adminClient.from("campaigns").select("id, project_id").eq("name", normalizedName)
  if (candidateProject && isUUID(candidateProject)) {
    existingQuery = existingQuery.eq("project_id", candidateProject)
  }
  const { data: existingRows, error: existingError } = await existingQuery.limit(1)
  if (existingError) {
    throw new Error("ไม่สามารถตรวจสอบ Campaign เดิมได้")
  }
  const existing = existingRows?.[0]
  if (existing?.id) {
    return { campaignId: existing.id as string, created: false, name: normalizedName, projectId: (existing.project_id as string | null) ?? null }
  }

  let ilikeQuery = adminClient.from("campaigns").select("id, project_id").ilike("name", normalizedName)
  if (candidateProject && isUUID(candidateProject)) {
    ilikeQuery = ilikeQuery.eq("project_id", candidateProject)
  }
  const { data: ilikeRows, error: ilikeError } = await ilikeQuery.limit(1)
  if (ilikeError) {
    throw new Error("ไม่สามารถตรวจสอบ Campaign เดิมได้")
  }
  const ilikeExisting = ilikeRows?.[0]
  if (ilikeExisting?.id) {
    return {
      campaignId: ilikeExisting.id as string,
      created: false,
      name: normalizedName,
      projectId: (ilikeExisting.project_id as string | null) ?? null,
    }
  }

  let projectId: string | null = null
  if (candidateProject && isUUID(candidateProject)) {
    projectId = candidateProject
  } else {
    projectId = await resolveProjectId({
      adminClient,
      candidateProjectId: candidateProject,
      payload,
      creatorProfileId,
    })
  }

  const insertPayload: Record<string, any> = {
    name: normalizedName,
    status: "draft",
    created_by: creatorProfileId ?? null,
  }

  if (projectId) {
    insertPayload.project_id = projectId
  }

  const { data: insertedCampaign, error: insertCampaignError } = await adminClient
    .from("campaigns")
    .insert(insertPayload)
    .select("id, project_id")
    .single()

  if (insertCampaignError) {
    throw new Error(`ไม่สามารถสร้าง Campaign "${normalizedName}" ได้ (${insertCampaignError.message})`)
  }

  const newCampaignId = insertedCampaign?.id as string | undefined
  if (!newCampaignId) {
    throw new Error(`ไม่สามารถสร้าง Campaign "${normalizedName}" ได้ (ไม่ทราบสาเหตุ)`)
  }

  return { campaignId: newCampaignId, created: true, name: normalizedName, projectId: projectId ?? null }
}

const mapPlatformToChannelType = (platform?: string | null) => {
  if (!platform) return null
  const normalized = platform.trim().toLowerCase()
  if (!normalized) return null

  switch (normalized) {
    case "facebook":
    case "fb":
    case "meta":
      return "facebook"
    case "instagram":
    case "ig":
      return "instagram"
    case "tiktok":
      return "tiktok"
    case "youtube":
    case "yt":
      return "youtube"
    case "twitter":
    case "x":
      return "twitter"
    case "line":
      return "line"
    default:
      return normalized as any
  }
}

const normalizeHandle = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const withoutAt = trimmed.replace(/^@+/, "")
  return withoutAt || null
}

const canonicalHandle = (value?: string | null) => {
  const normalized = normalizeHandle(value)
  return normalized ? normalized.toLowerCase() : null
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const parseCategories = (value?: string | null) => {
  if (!value) return null
  const segments = value
    .split(/[,;/|]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return segments.length > 0 ? segments : null
}

const toNullableNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return null
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  const cleaned = value
    .toString()
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "")
    .trim()
  if (!cleaned) return null
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const derivePlatform = (row: ImportPostRow, normalizedUrl: string | null) => {
  if (row.platform && row.platform.trim()) {
    return row.platform.trim().toLowerCase()
  }

  if (!normalizedUrl) return null

  try {
    const { hostname } = new URL(normalizedUrl)
    if (hostname.includes("facebook")) return "facebook"
    if (hostname.includes("instagram")) return "instagram"
    if (hostname.includes("tiktok")) return "tiktok"
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "twitter"
    if (hostname.includes("youtu")) return "youtube"
    if (hostname.includes("line")) return "line"
    return hostname
  } catch {
    return null
  }
}

const buildProfileUrl = (channelType: string | null, handle: string | null, parsedProfileUrl: string | null) => {
  if (parsedProfileUrl) return parsedProfileUrl
  const cleanHandle = normalizeHandle(handle)
  if (!channelType || !cleanHandle) return null

  switch (channelType) {
    case "facebook":
      return `https://www.facebook.com/${cleanHandle}`
    case "instagram":
      return `https://www.instagram.com/${cleanHandle}/`
    case "tiktok":
      return `https://www.tiktok.com/@${cleanHandle}`
    case "youtube":
      return `https://www.youtube.com/${cleanHandle.startsWith("channel/") ? cleanHandle : `@${cleanHandle}`}`
    case "twitter":
      return `https://twitter.com/${cleanHandle}`
    default:
      return null
  }
}

const parsePostLink = (url: string | null, platform?: string | null): ParsedLink => {
  if (!url) return { handle: null, profileUrl: null, postId: null, platform: platform ?? null }

  let derivedPlatform = platform?.toLowerCase() ?? null
  try {
    const parsedUrl = new URL(url)
    if (!derivedPlatform) {
      derivedPlatform = derivePlatform({ platform: null } as any, url)
    }
    const segments = parsedUrl.pathname.split("/").filter(Boolean)

    switch (derivedPlatform) {
      case "facebook": {
        const handle = segments[0] || null
        const postIndex = segments.findIndex((segment) => segment === "posts" || segment === "videos")
        const postId = postIndex >= 0 ? segments[postIndex + 1] ?? null : parsedUrl.searchParams.get("v")
        return {
          handle,
          profileUrl: handle ? `https://www.facebook.com/${handle}` : null,
          postId,
          platform: "facebook",
        }
      }
      case "instagram": {
        const shortcodeIndex = segments.findIndex((segment) => segment === "p" || segment === "reel" || segment === "tv")
        const postId = shortcodeIndex >= 0 ? segments[shortcodeIndex + 1] ?? null : null
        return {
          handle: null,
          profileUrl: null,
          postId,
          platform: "instagram",
        }
      }
      case "tiktok": {
        const match = parsedUrl.pathname.match(/@([^/]+)\/video\/(\d+)/)
        const handle = match ? match[1] : null
        const postId = match ? match[2] : null
        return {
          handle: handle ? `@${handle}` : null,
          profileUrl: handle ? `https://www.tiktok.com/@${handle}` : null,
          postId,
          platform: "tiktok",
        }
      }
      case "twitter":
      case "x": {
        const handle = segments[0] ? `@${segments[0]}` : null
        const postId = segments[2] || parsedUrl.searchParams.get("s")
        return {
          handle,
          profileUrl: handle ? `https://twitter.com/${segments[0]}` : null,
          postId,
          platform: "twitter",
        }
      }
      case "youtube": {
        const videoId =
          parsedUrl.searchParams.get("v") ||
          (parsedUrl.hostname === "youtu.be" ? segments[0] : null) ||
          (segments[0] === "shorts" ? segments[1] : null)
        return {
          handle: null,
          profileUrl: null,
          postId: videoId,
          platform: "youtube",
        }
      }
      default:
        return {
          handle: null,
          profileUrl: null,
          postId: null,
          platform: derivedPlatform,
        }
    }
  } catch {
    return { handle: null, profileUrl: null, postId: null, platform: platform ?? null }
  }
}

const extractExternalPostIdFromSources = (row: ImportPostRow, normalizedUrl: string | null, parsedId?: string | null) => {
  if (parsedId && parsedId.trim()) {
    return parsedId.trim()
  }

  const payload = row.raw_payload ?? {}
  const fromPayload =
    payload.external_post_id ??
    payload.external_id ??
    payload.post_external_id ??
    payload.post_id ??
    payload.id

  if (fromPayload && typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim()
  }

  if (normalizedUrl) {
    try {
      const url = new URL(normalizedUrl)
      const searchId =
        url.searchParams.get("story_fbid") ??
        url.searchParams.get("fbid") ??
        url.searchParams.get("id") ??
        url.searchParams.get("post") ??
        url.searchParams.get("v")
      if (searchId) {
        return searchId
      }
      const segments = url.pathname.split("/").filter(Boolean)
      if (segments.length > 0) {
        return segments[segments.length - 1]
      }
    } catch {
      // ignore parsing errors
    }
  }

  if (row.post_name && row.post_name.trim()) {
    return `${row.post_name.trim()}-${row.id.slice(0, 8)}`
  }

  return `imported-${row.id}`
}

const extractExternalPostId = (row: ImportPostRow, normalizedUrl: string | null, parsedId?: string | null) => {
  return extractExternalPostIdFromSources(row, normalizedUrl, parsedId)
}

const findKolChannelByHandle = async (
  client: ReturnType<typeof createAdminClient>,
  channelType: string | null,
  handle: string | null,
) => {
  if (!channelType || !handle) return null
  const canonical = canonicalHandle(handle)
  if (!canonical) return null

  const { data, error } = await client
    .from("kol_channels")
    .select("id, kol_id, channel_type, handle")
    .eq("channel_type", channelType)
    .limit(50)

  if (error) {
    console.error("[v0] Error searching kol_channels:", error)
    return null
  }

  if (!data) return null
  return data.find((channel) => canonicalHandle(channel.handle) === canonical) ?? null
}

const findKolByName = async (
  client: ReturnType<typeof createAdminClient>,
  kolName: string | null,
) => {
  if (!kolName || !kolName.trim()) return null
  const { data, error } = await client
    .from("kols")
    .select("id, name")
    .ilike("name", kolName.trim())
    .limit(1)

  if (error) {
    console.error("[v0] Error searching kols:", error)
    return null
  }

  return data?.[0] ?? null
}

const createKol = async (
  client: ReturnType<typeof createAdminClient>,
  params: {
    kolName: string
    kolTier: string | null
    kolCategory: string | null
    follower: number | string | null
    notes: string | null
    createdBy: string | null
  },
) => {
  const categories = parseCategories(params.kolCategory)

  const { data, error } = await client
    .from("kols")
    .insert({
      name: params.kolName,
      kol_tier: params.kolTier ? params.kolTier.trim() : null,
      category: categories,
      notes: params.notes,
      status: "active",
      created_by: params.createdBy ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error creating KOL:", error)
    throw new Error(error.message)
  }

  return data.id as string
}

const createKolChannel = async (
  client: ReturnType<typeof createAdminClient>,
  params: {
    kolId: string
    channelType: string
    handle: string | null
    profileUrl: string | null
    follower: number | string | null
  },
) => {
  const followerCount = toNullableNumber(params.follower) ?? 0

  const { data, error } = await client
    .from("kol_channels")
    .insert({
      kol_id: params.kolId,
      channel_type: params.channelType,
      handle: params.handle,
      profile_url: params.profileUrl,
      follower_count: followerCount,
      status: "active",
    })
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error creating kol_channel:", error)
    throw new Error(error.message)
  }

  return data.id as string
}

const ensureKolAndChannel = async (
  adminClient: ReturnType<typeof createAdminClient>,
  params: {
    explicitChannelId?: string | null
    platform: string | null
    parsedLink: ParsedLink
    row: ImportPostRow
    creatorId: string | null
  },
) => {
  const payload = params.row.raw_payload ?? {}
  const warnings: string[] = []

  if (params.explicitChannelId) {
    const { data, error } = await adminClient
      .from("kol_channels")
      .select("id, kol_id, channel_type")
      .eq("id", params.explicitChannelId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }
    if (!data) {
      throw new Error(`ไม่พบ kol_channel ที่ระบุ (${params.explicitChannelId})`)
    }

    return {
      kolId: data.kol_id,
      channelId: data.id,
      channelType: data.channel_type,
      createdKol: false,
      createdChannel: false,
      warnings,
    }
  }

  const channelType = mapPlatformToChannelType(params.platform || params.parsedLink.platform)
  if (!channelType) {
    throw new Error("ไม่สามารถระบุประเภทช่องทาง (platform) ได้")
  }

  const handleCandidate =
    params.parsedLink.handle ??
    payload.channel_handle ??
    payload.handle ??
    (params.row.kol_name ? `@${slugify(params.row.kol_name)}` : null)

  const normalizedHandle = normalizeHandle(handleCandidate)
  const canonical = canonicalHandle(handleCandidate)

  let kolId: string | null = null
  let channelId: string | null = null
  let createdKol = false
  let createdChannel = false

  if (canonical) {
    const existingChannel = await findKolChannelByHandle(adminClient, channelType, normalizedHandle)
    if (existingChannel) {
      kolId = existingChannel.kol_id
      channelId = existingChannel.id
    }
  }

  if (!kolId) {
    const kolNameCandidate =
      (params.row.kol_name && params.row.kol_name.trim()) ||
      (payload.kol_name && payload.kol_name.toString().trim()) ||
      (normalizedHandle ? normalizedHandle : null)

    if (!kolNameCandidate) {
      throw new Error("ไม่สามารถระบุชื่อ KOL หรือ handle เพื่อสร้างข้อมูลได้")
    }

    const existingKol = await findKolByName(adminClient, kolNameCandidate)

    if (existingKol?.id) {
      kolId = existingKol.id
    } else {
      if (!params.creatorId) {
        warnings.push("ไม่พบ profile สำหรับผู้ใช้งาน ระบุ created_by เป็นค่าว่าง")
      }
      kolId = await createKol(adminClient, {
        kolName: kolNameCandidate,
        kolTier:
          params.row.kol_tier ??
          (payload.kol_tier ? payload.kol_tier.toString() : null) ??
          (payload.tier ? payload.tier.toString() : null),
        kolCategory: params.row.kol_category ?? (payload.kol_category ? payload.kol_category.toString() : null),
        follower: params.row.follower ?? payload.follower,
        notes: params.row.post_note ?? null,
        createdBy: params.creatorId ?? null,
      })
      createdKol = true
    }
  }

  if (!kolId) {
    throw new Error("สร้างข้อมูล KOL ไม่สำเร็จ")
  }

  if (!channelId) {
    // ตรวจสอบอีกครั้งว่ามี channel อยู่แล้วหรือไม่ (กรณีที่ KOL มีอยู่แล้วแต่ channel ยังไม่มี)
    if (kolId && normalizedHandle) {
      const existingChannelByKol = await adminClient
        .from("kol_channels")
        .select("id")
        .eq("kol_id", kolId)
        .eq("channel_type", channelType)
        .eq("handle", normalizedHandle)
        .maybeSingle()

      if (existingChannelByKol.data?.id) {
        channelId = existingChannelByKol.data.id
      }
    }

    // หากยังไม่มี channel ให้สร้างใหม่
    if (!channelId) {
      let handleForCreation = normalizedHandle
      if (!handleForCreation && params.row.kol_name) {
        handleForCreation = slugify(params.row.kol_name)
        warnings.push("ไม่พบ handle ในลิงก์ ใช้ชื่อ KOL เป็น handle แทน")
      }

      if (!handleForCreation) {
        throw new Error("ไม่สามารถระบุ handle เพื่อสร้างช่องทางได้")
      }

      const profileUrl =
        params.parsedLink.profileUrl ??
        buildProfileUrl(channelType, handleCandidate, params.parsedLink.profileUrl) ??
        buildProfileUrl(channelType, handleForCreation, null)

      channelId = await createKolChannel(adminClient, {
        kolId,
        channelType,
        handle: handleForCreation,
        profileUrl,
        follower: params.row.follower ?? payload.follower,
      })
      createdChannel = true
    }
  }

  return {
    kolId,
    channelId,
    channelType,
    createdKol,
    createdChannel,
    warnings,
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const [{ data: authData }, body] = await Promise.all([
      supabase.auth.getUser(),
      request.json().catch(() => ({} as TransferRequestBody)),
    ])

    const userId = authData?.user?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileName, ids, dryRun } = body as TransferRequestBody

    if (!fileName && (!ids || ids.length === 0)) {
      return NextResponse.json({ error: "Must provide fileName or ids" }, { status: 400 })
    }

    let adminClient: ReturnType<typeof createAdminClient>
    try {
      adminClient = createAdminClient()
    } catch (error) {
      console.error("[v0] Missing SUPABASE_SERVICE_ROLE_KEY for transfer:", error)
      return NextResponse.json(
        { error: "Server missing SUPABASE_SERVICE_ROLE_KEY for admin operations" },
        { status: 500 },
      )
    }

    let creatorProfileId = await resolveCreatorProfileId(supabase, userId)
    let creatorProfileCreated = false

    if (!creatorProfileId && authData?.user) {
      try {
        const fullName =
          (authData.user.user_metadata?.full_name as string | undefined) ||
          authData.user.email ||
          "System User"
        const role =
          (authData.user.user_metadata?.role as string | undefined)?.toLowerCase() ?? "brand_user"

        const { data: insertedProfile, error: insertProfileError } = await adminClient
          .from("profiles")
          .upsert(
            {
              id: userId,
              email: authData.user.email ?? "",
              full_name: fullName,
              role: role as any,
            },
            { onConflict: "id" },
          )
          .select("id")
          .maybeSingle()

        if (insertProfileError) {
          console.error("[v0] Failed to auto-create profile:", insertProfileError)
        } else {
          creatorProfileId = insertedProfile?.id ?? null
          creatorProfileCreated = Boolean(insertedProfile?.id)
        }
      } catch (adminError) {
        console.warn("[v0] Admin client unavailable for profile creation:", adminError)
      }
    }

    if (!creatorProfileId) {
      creatorProfileId = await resolveCreatorProfileId(supabase, userId)
    }

    if (!creatorProfileId) {
      return NextResponse.json({ error: "Profile not found and could not be auto-created" }, { status: 500 })
    }

    let query = supabase
      .from("import_post")
      .select(
        "id, file_name, kol_name, kol_category, post_name, post_note, post_type, content_type, platform, kol_tier, follower, kol_budget, boost_budget, post_link, post_date, campaign_name, flag_use, status, error_message, raw_payload",
      )
      .eq("flag_use", false)

    if (fileName) {
      query = query.eq("file_name", fileName)
    }

    if (ids && ids.length > 0) {
      query = query.in("id", ids)
    }

    const { data: rowsData, error } = await query

    if (error) {
      console.error("[v0] Error fetching import_post rows for transfer:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!rowsData || rowsData.length === 0) {
      return NextResponse.json({ message: "No pending rows found for transfer", attempts: 0, inserted: 0 })
    }

    const results: TransferResultRow[] = []
    let insertedCount = 0
    let duplicateCount = 0
    let failedCount = 0

    for (const row of rowsData as ImportPostRow[]) {
      const payload = row.raw_payload ?? {}
      const rawUrl = row.post_link ?? payload.post_link ?? payload.post_url ?? payload.url
      const normalizedUrl = normalizeUrl(rawUrl)
      
      console.log("[v0] URL processing:", {
        rawUrl,
        normalizedUrl,
        rowPostLink: row.post_link,
        payloadPostLink: payload.post_link,
        payloadPostUrl: payload.post_url,
        payloadUrl: payload.url
      })

      const rowMessages: string[] = []
      let status: TransferResultRow["status"] = "failed"
      let postId: string | undefined

      if (!normalizedUrl) {
        rowMessages.push("post_link ไม่ถูกต้องหรือว่าง")
      }

      const parsedLink = parsePostLink(normalizedUrl || null, row.platform ?? payload.platform ?? null)

      const explicitKolChannelId = [
        payload.kol_channel_id,
        payload.channel_id,
        payload.kol_channel,
        payload.kol_channel_uuid,
      ].find((value) => typeof value === "string" && value.trim().length > 0) ?? null

      let kolChannelInfo: Awaited<ReturnType<typeof ensureKolAndChannel>> | null = null

      if (rowMessages.length === 0) {
        try {
          kolChannelInfo = await ensureKolAndChannel(adminClient, {
            explicitChannelId: typeof explicitKolChannelId === "string" ? explicitKolChannelId : null,
            platform: row.platform ?? payload.platform ?? null,
            parsedLink: parsedLink,
            row: row,
            creatorId: creatorProfileId,
          })
          if (kolChannelInfo?.warnings.length) {
            rowMessages.push(...kolChannelInfo.warnings)
          }
        } catch (e: any) {
          rowMessages.push(e.message)
        }
      }

      if (!kolChannelInfo?.channelId) {
        rowMessages.push("ไม่สามารถสร้างหรือหา kol_channel ได้")
      }

      if (rowMessages.length > 0) {
        failedCount += 1
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("import_post")
            .update({
              status: "failed",
              error_message: rowMessages.join("; "),
            })
            .eq("id", row.id)

          if (updateError) {
            console.error("[v0] Failed to update import_post failure state:", updateError)
          }
        }

        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "failed",
          message: rowMessages.join("; "),
        })
        continue
      }

      if (dryRun) {
        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "skipped",
          message: "Dry-run mode, no changes applied",
        })
        continue
      }

      const postedAt =
        toTimestamp(payload.posted_at ?? payload.post_date ?? row.post_date) ??
        (row.post_date ? `${row.post_date}T00:00:00Z` : null)

      const boostBudget =
        toNumber(payload.boost_budget ?? row.boost_budget) ?? toNumber(payload.kol_budget ?? row.kol_budget)

      const kolBoostBudget =
        toNumber(payload.kol_budget ?? row.kol_budget)

      const externalPostId = extractExternalPostId(row, normalizedUrl, parsedLink.postId)

      const existingByUrlQuery = normalizedUrl
        ? adminClient.from("posts").select("id").eq("url", normalizedUrl).maybeSingle()
        : Promise.resolve({ data: null, error: null })

      const { data: existingByUrl, error: existingByUrlError } = await existingByUrlQuery

      console.log("[v0] Checking duplicate URL:", {
        normalizedUrl,
        existingByUrl,
        existingByUrlError,
        hasExisting: !!existingByUrl?.id
      })

      if (existingByUrl?.id) {
        status = "duplicate"
        duplicateCount += 1
        postId = existingByUrl.id
        const duplicateMessage = `พบโพสต์ซ้ำ (url=${normalizedUrl})`

        const { error: updateError } = await supabase
          .from("import_post")
          .update({
            flag_use: true,
            status: "duplicate",
            error_message: duplicateMessage,
          })
          .eq("id", row.id)

        if (updateError) {
          console.error("[v0] Failed to update duplicate import_post row:", updateError)
        }

        results.push({
          importId: row.id,
          fileName: row.file_name,
          status,
          message: duplicateMessage,
          postId,
        })
        continue
      }

      const candidateCampaignId = getFirstString([
        payload.campaign_id,
        payload.campaign_uuid,
        payload.campaignId,
      ])

      const candidateCampaignName = getFirstString([
        row.campaign_name,
        payload.campaign_name,
        payload.campaignName,
        payload.campaign,
        payload.campaign_title,
        payload.campaignTitle,
      ])

      const candidateProjectId = getFirstString([
        payload.project_id,
        payload.project_uuid,
        payload.projectId,
      ])

      let campaignInfo: { campaignId: string | null; created: boolean; name: string | null; projectId: string | null } = {
        campaignId: candidateCampaignId ?? null,
        created: false,
        name: candidateCampaignName ?? null,
        projectId: null,
      }

      try {
        campaignInfo = await ensureCampaign({
          adminClient,
          existingCampaignId: candidateCampaignId,
          campaignName: candidateCampaignName,
          candidateProjectId,
          payload,
          creatorProfileId,
        })
      } catch (campaignError: any) {
        rowMessages.push(campaignError?.message ?? "ไม่สามารถสร้าง Campaign ได้")
      }

      if (rowMessages.length > 0) {
        failedCount += 1
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("import_post")
            .update({
              status: "failed",
              error_message: rowMessages.join("; "),
            })
            .eq("id", row.id)

          if (updateError) {
            console.error("[v0] Failed to update import_post failure state:", updateError)
          }
        }

        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "failed",
          message: rowMessages.join("; "),
        })
        continue
      }

      const insertPayload: Record<string, any> = {
        external_post_id: externalPostId,
        post_name: row.post_name ?? payload.post_name ?? null,
        kol_channel_id: kolChannelInfo?.channelId,
        url: normalizedUrl,
        content_type: row.content_type ?? payload.content_type ?? null,
        caption: payload.caption ?? row.post_note ?? null,
        posted_at: postedAt,
        boost_budget: boostBudget ?? 0,
        kol_boost_budget: kolBoostBudget ?? null,
        notes: row.post_note ?? payload.notes ?? null,
        remark: payload.remark ?? row.post_note ?? null,
        status: "published",
        created_by: creatorProfileId ?? null,
      }

      if (campaignInfo.campaignId && isUUID(campaignInfo.campaignId)) {
        insertPayload.campaign_id = campaignInfo.campaignId
      }

      const { data: inserted, error: insertError } = await adminClient
        .from("posts")
        .insert(insertPayload)
        .select("id")
        .single()

      if (insertError) {
        failedCount += 1
        console.error("[v0] Failed to insert post from import:", insertError)

        const { error: updateError } = await supabase
          .from("import_post")
          .update({
            status: "failed",
            error_message: insertError.message,
          })
          .eq("id", row.id)

        if (updateError) {
          console.error("[v0] Failed to update import_post after insert failure:", updateError)
        }

        results.push({
          importId: row.id,
          fileName: row.file_name,
          status: "failed",
          message: insertError.message,
        })
        continue
      }

      status = "inserted"
      insertedCount += 1
      postId = inserted?.id

      const successParts: string[] = []
      if (creatorProfileCreated) successParts.push("สร้างโปรไฟล์ผู้ใช้งาน")
      if (kolChannelInfo?.createdKol) successParts.push("สร้าง KOL ใหม่")
      if (kolChannelInfo?.createdChannel) successParts.push("สร้าง Channel ใหม่")
      if (campaignInfo.created) {
        successParts.push(campaignInfo.name ? `สร้าง Campaign ใหม่ (${campaignInfo.name})` : "สร้าง Campaign ใหม่")
      }
      if (successParts.length === 0) successParts.push("สร้างโพสต์ใหม่สำเร็จ")

      const { error: updateSuccessError } = await supabase
        .from("import_post")
        .update({
          flag_use: true,
          status: "processed",
          error_message: successParts.join(", "),
        })
        .eq("id", row.id)

      if (updateSuccessError) {
        console.error("[v0] Failed to update import_post success state:", updateSuccessError)
      }

      results.push({
        importId: row.id,
        fileName: row.file_name,
        status,
        message: successParts.join(", "),
        postId,
      })
    }

    return NextResponse.json({
      attempts: rowsData.length,
      inserted: insertedCount,
      duplicates: duplicateCount,
      failed: failedCount,
      results,
    })
  } catch (error: any) {
    console.error("[v0] Unexpected error in POST /api/import-posts/transfer:", error)
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 })
  }
}

