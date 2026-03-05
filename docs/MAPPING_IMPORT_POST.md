# Mapping Guide: import_post → posts, kols, campaigns

## 📋 Field Mapping Summary

### 1. import_post → posts

| import_post Field | posts Field | Status | Notes |
|-------------------|-------------|--------|-------|
| `post_link` | `url` | ✅ Mapped | Normalized URL |
| `post_name` | `post_name` | ✅ Mapped | Direct mapping |
| `post_date` | `posted_at` | ✅ Mapped | Converted to DATE format (YYYY-MM-DD) |
| `content_type` | `content_type` | ✅ Mapped | Direct mapping |
| `post_note` | `caption` | ✅ Mapped | Used as caption |
| `post_note` | `notes` | ✅ Mapped | Also used as notes |
| `boost_budget` | - | ⚠️ Not in schema | posts table doesn't have this field |
| `kol_budget` | - | ⚠️ Not in schema | posts table doesn't have this field |
| `post_type` | - | ❌ Not Mapped | Not used (could be mapped to content_type if needed) |
| `raw_payload.*` | `external_post_id` | ✅ Mapped | Extracted from URL or payload |
| - | `status` | ✅ Auto-set | Set to "published" |
| - | `created_by` | ✅ Auto-set | From authenticated user |

**Note:** `posts` table does NOT have `remark` field. Code incorrectly tries to set it.

### 2. import_post → kols (via ensureKolAndChannel)

| import_post Field | kols Field | Status | Notes |
|-------------------|------------|--------|-------|
| `kol_name` | `name` | ✅ Mapped | Direct mapping |
| `kol_category` | `category` | ✅ Mapped | Parsed as array (comma/semicolon separated) |
| `kol_tier` | `kol_tier` | ✅ Mapped | Direct mapping |
| `follower` | - | ⚠️ Partial | Used for kol_channels.follower_count |
| `post_note` | `notes` | ✅ Mapped | Used as KOL notes |
| - | `status` | ✅ Auto-set | Set to "active" |
| - | `created_by` | ✅ Auto-set | From authenticated user |

### 3. import_post → kol_channels (via ensureKolAndChannel)

| import_post Field | kol_channels Field | Status | Notes |
|-------------------|-------------------|--------|-------|
| `platform` | `channel_type` | ✅ Mapped | Converted via mapPlatformToChannelType() |
| `post_link` (parsed) | `handle` | ✅ Mapped | Extracted from URL |
| `post_link` (parsed) | `profile_url` | ✅ Mapped | Built from handle + platform |
| `follower` | `follower_count` | ✅ Mapped | Direct mapping |
| - | `status` | ✅ Auto-set | Set to "active" |

### 4. import_post → campaigns (via ensureCampaign)

| import_post Field | campaigns Field | Status | Notes |
|-------------------|----------------|--------|-------|
| `campaign_name` | `name` | ✅ Mapped | Direct mapping |
| `raw_payload.project_id` | `project_id` | ✅ Mapped | Resolved via resolveProjectId() |
| - | `status` | ✅ Auto-set | Set to "draft" |
| - | `created_by` | ✅ Auto-set | From authenticated user |

## 🔄 Mapping Logic Flow

1. **URL Processing**
   - `import_post.post_link` → `posts.url` (normalized)
   - URL parsed to extract handle, post ID, platform

2. **KOL & Channel Resolution**
   - `import_post.kol_name` → Find/Create `kols` record
   - `import_post.platform` + parsed handle → Find/Create `kol_channels` record
   - Result: `kol_channel_id` for `posts.kol_channel_id`

3. **Campaign Resolution**
   - `import_post.campaign_name` → Find/Create `campaigns` record
   - `raw_payload.project_id` or user's default project → Resolve `project_id`
   - Result: `campaign_id` for `posts.campaign_id`

4. **Post Creation**
   - All mapped fields → Create `posts` record
   - `external_post_id` extracted from URL or generated

## ⚠️ Issues Found & Fixed

1. **✅ FIXED: Missing Field: `remark`**
   - ~~Code tried to set `posts.remark` but table doesn't have this field~~ 
   - **Removed from insert payload**

2. **✅ FIXED: Unused Field: `post_type`**
   - ~~`import_post.post_type` was not mapped anywhere~~
   - **Now used as fallback for `content_type` if `content_type` is empty**

3. **✅ FIXED: Budget Fields Not in Schema**
   - `posts` table doesn't have `boost_budget` or `kol_boost_budget` fields
   - **Removed from insert payload (commented out for future use if needed)**
   - Budget data can be stored in `campaigns` or `campaign_kols` tables instead

## 📝 Recommendations

1. Remove `remark` from insert payload (posts table doesn't have this field)
2. Consider mapping `post_type` to `content_type` if `content_type` is empty
3. Verify budget field names match between schema and code
