/**
 * Extract post ID from social media URLs
 * Supports: TikTok, Instagram, YouTube, Facebook, Twitter/X
 */

export function extractPostId(url: string, platform?: string): string | null {
  if (!url) return null

  try {
    // If platform is provided, use it
    if (platform) {
      return extractPostIdByPlatform(url, platform)
    }

    // Otherwise, try to detect platform from URL
    const detectedPlatform = detectPlatformFromUrl(url)
    if (detectedPlatform) {
      return extractPostIdByPlatform(url, detectedPlatform)
    }

    return null
  } catch (error) {
    console.error("[v0] Error extracting post ID:", error)
    return null
  }
}

function extractPostIdByPlatform(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url)
    const urlPath = urlObj.pathname
    const urlSearch = urlObj.search

    switch (platform.toLowerCase()) {
      case "tiktok":
        // https://www.tiktok.com/@username/video/1234567890
        // https://vm.tiktok.com/ABC123/
        const tiktokVideoMatch = url.match(/\/video\/(\d+)/)
        if (tiktokVideoMatch) {
          return tiktokVideoMatch[1]
        }
        // Try to extract from short URL (would need to follow redirect)
        const tiktokShortMatch = url.match(/vm\.tiktok\.com\/([A-Za-z0-9]+)/)
        if (tiktokShortMatch) {
          return tiktokShortMatch[1]
        }
        return null

      case "instagram":
        // https://www.instagram.com/p/ABC123xyz/
        // https://www.instagram.com/reel/ABC123xyz/
        const instagramMatch = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/)
        if (instagramMatch) {
          return instagramMatch[2]
        }
        return null

      case "youtube":
        // https://www.youtube.com/watch?v=xyz789
        // https://youtu.be/xyz789
        // https://www.youtube.com/shorts/xyz789
        const youtubeWatchMatch = url.match(/[?&]v=([A-Za-z0-9_-]+)/)
        if (youtubeWatchMatch) {
          return youtubeWatchMatch[1]
        }
        const youtubeShortMatch = url.match(/\/(shorts|watch)\/([A-Za-z0-9_-]+)/)
        if (youtubeShortMatch) {
          return youtubeShortMatch[2]
        }
        const youtuBeMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/)
        if (youtuBeMatch) {
          return youtuBeMatch[1]
        }
        return null

      case "facebook":
        // https://www.facebook.com/username/posts/1234567890
        // https://www.facebook.com/username/posts/pfbid02siDChKqHkodWw9xbp5CBk5fcHZFZV1rjTz4qZLERKVpzFYNoPhszPbwLmUg3NgYHl
        // https://www.facebook.com/username/videos/1234567890
        // https://www.facebook.com/username/videos/pfbid...
        // Support both numeric and string post IDs (pfbid...)
        // Post ID can contain letters, numbers, underscores, and hyphens
        const facebookMatch = url.match(/\/(posts|videos)\/([A-Za-z0-9_-]+)/)
        if (facebookMatch) {
          return facebookMatch[2]
        }
        // Try to extract from permalink - support both numeric and string story_fbid
        // https://www.facebook.com/permalink.php?story_fbid=1234567890
        // https://www.facebook.com/permalink.php?story_fbid=pfbid02k1KVLthcJwbYdXezRTy53sjw24fKW9LQ83jzuqzGT7EAz17ydGapHFrvbvAQ5NNzl
        try {
          const urlObj = new URL(url)
          const storyFbid = urlObj.searchParams.get("story_fbid")
          if (storyFbid) {
            return storyFbid
          }
        } catch (e) {
          // If URL parsing fails, fallback to regex
        }
        // Fallback to regex for old format
        const facebookPermalinkMatch = url.match(/permalink\.php\?story_fbid=([^&]+)/)
        if (facebookPermalinkMatch) {
          return facebookPermalinkMatch[1]
        }
        return null

      case "twitter":
      case "x":
        // https://twitter.com/username/status/1234567890
        // https://x.com/username/status/1234567890
        const twitterMatch = url.match(/\/status\/(\d+)/)
        if (twitterMatch) {
          return twitterMatch[1]
        }
        return null

      default:
        return null
    }
  } catch (error) {
    console.error(`[v0] Error extracting post ID for ${platform}:`, error)
    return null
  }
}

export function detectPlatformFromUrl(url: string): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    if (hostname.includes("tiktok.com") || hostname.includes("vm.tiktok.com")) {
      return "tiktok"
    }
    if (hostname.includes("instagram.com")) {
      return "instagram"
    }
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "youtube"
    }
    if (hostname.includes("facebook.com") || hostname.includes("fb.com")) {
      return "facebook"
    }
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return "twitter"
    }

    return null
  } catch (error) {
    console.error("[v0] Error detecting platform:", error)
    return null
  }
}

/**
 * Extract page ID or page name from social media URLs
 * Supports Facebook, TikTok, and Twitter/X
 */
export function extractPageInfo(url: string, platform?: string): { pageId: string | null; pageName: string | null } {
  if (!url) return { pageId: null, pageName: null }

  try {
    const detectedPlatform = platform || detectPlatformFromUrl(url)
    
    // Facebook
    if (detectedPlatform?.toLowerCase() === "facebook") {
      try {
        const urlObj = new URL(url)
        // For Facebook permalink URLs: https://www.facebook.com/permalink.php?story_fbid=...&id=61550850848620
        const pageId = urlObj.searchParams.get("id")
        if (pageId) {
          return { pageId, pageName: null } // Page name would require Facebook Graph API
        }
      } catch (e) {
        // If URL parsing fails, try regex
      }
      
      // For Facebook page URLs: https://www.facebook.com/username/posts/...
      const facebookPageMatch = url.match(/facebook\.com\/([^\/]+)/)
      if (facebookPageMatch && !facebookPageMatch[1].includes("permalink.php")) {
        return { pageId: null, pageName: facebookPageMatch[1] }
      }
    }

    // TikTok
    if (detectedPlatform?.toLowerCase() === "tiktok") {
      // For TikTok URLs: https://www.tiktok.com/@username/video/1234567890
      const tiktokUsernameMatch = url.match(/tiktok\.com\/@([^\/]+)/)
      if (tiktokUsernameMatch) {
        return { pageId: null, pageName: tiktokUsernameMatch[1] }
      }
      // For short URLs (vm.tiktok.com), we can't extract username without following redirect
    }

    // Twitter/X
    if (detectedPlatform?.toLowerCase() === "twitter" || detectedPlatform?.toLowerCase() === "x") {
      // For Twitter/X URLs: https://twitter.com/username/status/1234567890
      // https://x.com/username/status/1234567890
      const twitterUsernameMatch = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/)
      if (twitterUsernameMatch) {
        return { pageId: null, pageName: twitterUsernameMatch[1] }
      }
      // Also try without /status/ for profile URLs
      const twitterProfileMatch = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/)
      if (twitterProfileMatch && !["i", "intent", "search", "hashtag", "explore"].includes(twitterProfileMatch[1].toLowerCase())) {
        return { pageId: null, pageName: twitterProfileMatch[1] }
      }
    }

    return { pageId: null, pageName: null }
  } catch (error) {
    console.error("[v0] Error extracting page info:", error)
    return { pageId: null, pageName: null }
  }
}

