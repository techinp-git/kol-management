#!/usr/bin/env tsx
/**
 * Check Post Metrics Error
 * 
 * This script specifically tests the post_metrics query that's failing
 * Usage: pnpm tsx scripts/check-post-metrics-error.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local
try {
  const envPath = join(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
} catch (error) {
  console.log('⚠️  .env.local not found, using environment variables')
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPostMetricsQuery() {
  console.log('\n🔍 Testing Post Metrics Query (Same as posts/page.tsx)...\n')

  try {
    // Step 1: Get some post IDs
    console.log('1️⃣  Fetching post IDs...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(10)

    if (postsError) {
      console.error(`   ❌ Error fetching posts: ${postsError.message}`)
      process.exit(1)
    }

    const postIds = (posts || []).map(p => p.id).filter(Boolean)
    console.log(`   ✅ Found ${postIds.length} posts`)

    if (postIds.length === 0) {
      console.log('   ⚠️  No posts found. Creating a test scenario...')
      console.log('   💡 Add some posts first to test metrics query')
      return
    }

    console.log(`   📋 Post IDs: ${postIds.slice(0, 5).join(', ')}${postIds.length > 5 ? '...' : ''}\n`)

    // Step 2: Test the exact query from posts/page.tsx
    console.log('2️⃣  Testing post_metrics query (same as posts/page.tsx)...')
    const { data: metricsRows, error: metricsError } = await supabase
      .from('post_metrics')
      .select('*')
      .in('post_id', postIds)
      .order('post_id', { ascending: true })
      .order('captured_at', { ascending: false })

    if (metricsError) {
      const errorMessage = metricsError?.message || String(metricsError) || 'Unknown error'
      const isNetworkError = errorMessage.includes('fetch failed') ||
                             errorMessage.includes('NetworkError') ||
                             errorMessage.includes('Failed to fetch')

      if (isNetworkError) {
        console.error('   ❌ NETWORK ERROR detected!')
        console.error(`   Message: ${errorMessage}`)
        console.error(`   Code: ${metricsError?.code || 'NETWORK_ERROR'}`)
        console.error('\n   💡 Possible causes:')
        console.error('      - Network connectivity issue')
        console.error('      - Supabase service temporarily unavailable')
        console.error('      - Firewall/proxy blocking connection')
        console.error('      - Request timeout (too many post IDs)')
      } else {
        console.error('   ❌ QUERY ERROR:')
        console.error(`   Message: ${errorMessage}`)
        console.error(`   Code: ${metricsError?.code || 'QUERY_ERROR'}`)
        console.error(`   Details: ${metricsError?.details || 'No details'}`)
        console.error(`   Hint: ${metricsError?.hint || 'No hint'}`)
      }
      process.exit(1)
    }

    console.log(`   ✅ Query successful! Found ${metricsRows?.length || 0} metric records\n`)

    // Step 3: Check if columns exist
    console.log('3️⃣  Checking required columns in results...')
    if (metricsRows && metricsRows.length > 0) {
      const firstMetric = metricsRows[0]
      const requiredColumns = [
        'impressions_organic',
        'impressions_boost',
        'reach_organic',
        'reach_boost',
        'post_clicks',
        'link_clicks',
        'retweets'
      ]

      const missingColumns: string[] = []
      requiredColumns.forEach(col => {
        if (!(col in firstMetric)) {
          missingColumns.push(col)
        }
      })

      if (missingColumns.length > 0) {
        console.error(`   ❌ Missing columns: ${missingColumns.join(', ')}`)
        console.error('   💡 Run migration: scripts/add_post_metrics_columns.sql')
        process.exit(1)
      } else {
        console.log('   ✅ All required columns exist')
      }
    } else {
      console.log('   ℹ️  No metrics found (this is OK if posts have no metrics yet)')
    }

    console.log('\n✅ All tests passed! Post metrics query is working correctly.\n')

  } catch (error: any) {
    console.error('\n❌ Unexpected error:')
    console.error(`   ${error.message}`)
    console.error(`   Stack: ${error.stack}`)
    process.exit(1)
  }
}

testPostMetricsQuery()
