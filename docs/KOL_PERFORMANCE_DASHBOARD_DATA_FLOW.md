# KOL Performance Dashboard - วิธีการดึงข้อมูลและแสดงผล

## ภาพรวมการทำงาน

Dashboard ดึงข้อมูลจากหลายตารางใน Supabase และคำนวณ metrics ต่างๆ เพื่อแสดงผลในหน้า Dashboard

## ขั้นตอนการดึงข้อมูล

### 1. ดึง Campaigns ตาม Filter

```typescript
// Step 1: ดึง Campaigns จาก Account/Project ที่เลือก
let campaignsQuery = supabase
  .from("campaigns")
  .select(`
    id,
    project_id,
    projects!inner(
      id,
      account_id
    )
  `)
  .eq("projects.account_id", selectedAccount)

if (selectedProject) {
  campaignsQuery = campaignsQuery.eq("project_id", selectedProject)
}

const { data: campaignsData } = await campaignsQuery
```

**ผลลัพธ์**: ได้ campaign IDs ที่เกี่ยวข้องกับ Account/Project

---

### 2. ดึง Campaign KOLs

```typescript
// Step 2: ดึง KOL Channels ที่อยู่ใน Campaigns เหล่านี้
const { data: campaignKolsData } = await supabase
  .from("campaign_kols")
  .select(`
    kol_channel_id,
    campaign_id,
    allocated_budget
  `)
  .in("campaign_id", campaignIds)
```

**ผลลัพธ์**: 
- ได้ `kol_channel_ids` ที่ใช้ดึง posts
- ได้ `allocated_budget` สำหรับคำนวณ cost

---

### 3. ดึง Posts และ Post Metrics

```typescript
// Step 3: ดึง Posts พร้อม Post Metrics
const { data: allPosts } = await supabase
  .from("posts")
  .select(`
    id,
    campaign_id,
    kol_channel_id,
    kol_channels(
      id,
      kol_id,
      follower_count,
      kols(
        id,
        name
      )
    ),
    post_metrics(
      id,
      impressions,
      reach,
      views,
      likes,
      comments,
      shares,
      saves,
      impressions_organic,
      impressions_boost,
      reach_organic,
      reach_boost,
      post_clicks,
      link_clicks,
      retweets,
      ctr,
      engagement_rate,
      captured_at,
      created_at
    )
  `)
  .in("kol_channel_id", kolChannelIds)
```

**ผลลัพธ์**: 
- ได้ posts ทั้งหมดจาก KOL channels ใน campaigns
- ได้ post_metrics ที่เกี่ยวข้องกับแต่ละ post (อาจมีหลาย records ต่อ 1 post)

---

### 4. Filter Posts ตาม Campaign

```typescript
// Step 4: Filter posts ตาม campaign selection
let posts = allPosts || []

if (selectedCampaign) {
  // ถ้าเลือก campaign เฉพาะ: ใช้ posts ที่มี campaign_id = selectedCampaign หรือ null
  posts = posts.filter((p) => p.campaign_id === selectedCampaign || p.campaign_id === null)
} else {
  // ถ้าไม่เลือก: ใช้ posts ที่มี campaign_id ใน campaignIds หรือ null
  posts = posts.filter((p) => p.campaign_id === null || campaignIds.includes(p.campaign_id))
}
```

**เหตุผล**: รองรับ posts ที่ไม่มี campaign_id (null)

---

### 5. คำนวณ Metrics จาก Post Metrics

```typescript
// Step 5: Loop ผ่าน posts และคำนวณ metrics
posts?.forEach((post) => {
  // นับ followers (unique per KOL)
  const kolChannel = post.kol_channel_id
  if (kolChannel) {
    const kolId = kolChannel.kol_id
    const followerCount = kolChannel.follower_count || 0
    // เก็บ max follower count per KOL
    if (!uniqueKols.has(kolId) || uniqueKols.get(kolId)! < followerCount) {
      uniqueKols.set(kolId, followerCount)
    }
  }

  // ดึง metrics จาก post_metrics
  if (post.post_metrics && post.post_metrics.length > 0) {
    // เรียงตาม captured_at (ล่าสุดก่อน)
    const sortedMetrics = [...post.post_metrics].sort(
      (a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()
    )
    const latestMetric = sortedMetrics[0] // ใช้ metrics ล่าสุด

    // คำนวณ impressions (organic + boost หรือ total)
    const impressions =
      (latestMetric.impressions_organic || 0) + (latestMetric.impressions_boost || 0) ||
      latestMetric.impressions || 0

    // คำนวณ reach (organic + boost หรือ total)
    const reach =
      (latestMetric.reach_organic || 0) + (latestMetric.reach_boost || 0) || 
      latestMetric.reach || 0

    // รวม metrics ทั้งหมด
    totalImpressions += impressions
    totalReach += reach
    totalViews += latestMetric.views || 0
    totalLikes += latestMetric.likes || 0
    totalComments += latestMetric.comments || 0
    totalShares += latestMetric.shares || 0
    totalSaves += latestMetric.saves || 0
    postClicks += latestMetric.post_clicks || 0
    linkClicks += latestMetric.link_clicks || 0
    totalRetweets += latestMetric.retweets || 0
  }
})
```

**สำคัญ**: 
- ใช้ **latest metric** (เรียงตาม `captured_at` DESC)
- ถ้ามี `impressions_organic` + `impressions_boost` ใช้ค่านั้น
- ถ้าไม่มี ใช้ `impressions` (total)

---

### 6. ดึง Comments สำหรับ Sentiment Analysis

```typescript
// Step 6: ดึง Comments สำหรับวิเคราะห์ Sentiment
const postIds = posts?.map((p) => p.id) || []
const { data: commentsData } = await supabase
  .from("comments")
  .select("id, text")
  .in("post_id", postIds)
```

**ผลลัพธ์**: ได้ comments ทั้งหมดจาก posts ที่เกี่ยวข้อง

---

### 7. คำนวณ Sentiment

```typescript
// Step 7: วิเคราะห์ Sentiment จาก Comments
const positiveKeywords = ["good", "great", "love", "amazing", ...]
const negativeKeywords = ["bad", "worst", "hate", "terrible", ...]

comments.forEach((comment) => {
  const content = comment.text?.toLowerCase() || ""
  const hasPositive = positiveKeywords.some((keyword) => content.includes(keyword))
  const hasNegative = negativeKeywords.some((keyword) => content.includes(keyword))

  if (hasPositive && !hasNegative) {
    positive++
  } else if (hasNegative && !hasPositive) {
    negative++
  } else {
    neutral++
  }
})
```

---

### 8. คำนวณ Cost Efficiency

```typescript
// Step 8: คำนวณ Cost Efficiency Metrics
const totalCost = campaignKolsData.reduce(
  (sum, ck) => sum + (parseFloat(ck.allocated_budget?.toString() || "0") || 0),
  0
)

const cpr = totalReach > 0 ? totalCost / totalReach : 0  // Cost per Reach
const cpe = totalEngagement > 0 ? totalCost / totalEngagement : 0  // Cost per Engagement
const cpv = totalViews > 0 ? totalCost / totalViews : 0  // Cost per View
const er = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0  // Engagement Rate
```

---

## โครงสร้างข้อมูลที่แสดงผล

### Primary KPIs
- **Total Post Count**: จำนวน posts ทั้งหมด
- **Total Follower**: รวม followers ของ KOLs ทั้งหมด (unique per KOL)
- **Total Impression**: รวม impressions จาก post_metrics
- **Total Reach**: รวม reach จาก post_metrics

### Secondary KPIs
- **Total View**: รวม views
- **Total Engagement**: likes + comments + shares + saves + retweets
- **Likes**: รวม likes
- **Comments**: รวม comments
- **Shares**: รวม shares
- **Saves**: รวม saves
- **Click Post**: รวม post_clicks
- **Link Click**: รวม link_clicks
- **Retweets**: รวม retweets

### Sentiment
- **Comment Sentiment**: Brand Mention %, KOL Mention %, Other %
- **Brand Sentiment**: Positive %, Neutral %, Negative %

### Cost Efficiency
- **CPR**: Cost per Reach
- **CPE**: Cost per Engagement
- **CPV**: Cost per View
- **%ER**: Engagement Rate

---

## ข้อมูลที่ดึงจาก Tables

### จาก `posts` table:
- `id`
- `campaign_id`
- `kol_channel_id`
- `kol_channels` (nested)
  - `follower_count`
  - `kols` (nested)
    - `name`

### จาก `post_metrics` table:
- `impressions` (total)
- `impressions_organic`
- `impressions_boost`
- `reach` (total)
- `reach_organic`
- `reach_boost`
- `views`
- `likes`
- `comments`
- `shares`
- `saves`
- `post_clicks`
- `link_clicks`
- `retweets`
- `ctr`
- `engagement_rate`
- `captured_at` (ใช้เลือก latest metric)

### จาก `campaign_kols` table:
- `allocated_budget` (สำหรับคำนวณ cost)

### จาก `comments` table:
- `text` (สำหรับ sentiment analysis)

---

## Flow Diagram

```
User Selects Account
    ↓
Fetch Campaigns (filter by Account/Project)
    ↓
Fetch Campaign KOLs (get kol_channel_ids)
    ↓
Fetch Posts (with post_metrics nested)
    ↓
Filter Posts (by campaign_id or null)
    ↓
Calculate Metrics (from latest post_metrics)
    ↓
Fetch Comments (for sentiment)
    ↓
Calculate Sentiment (keyword-based)
    ↓
Calculate Cost Efficiency (from allocated_budget)
    ↓
Display Dashboard
```

---

## สิ่งสำคัญ

1. **ใช้ Latest Metric**: เรียง `post_metrics` ตาม `captured_at` DESC และใช้ตัวแรก
2. **รองรับ Posts ไม่มี Campaign**: Filter posts ที่ `campaign_id` เป็น null ด้วย
3. **Unique KOL Followers**: ใช้ Map เพื่อเก็บ max follower count per KOL
4. **Organic + Boost**: ถ้ามี organic/boost ใช้ค่านั้น ถ้าไม่มีใช้ total
5. **Error Handling**: มี try-catch และแสดง error message ใน UI

