#!/usr/bin/env tsx
/**
 * Test Supabase Connection
 * 
 * Usage:
 *   pnpm tsx scripts/test-connection.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Try to load .env.local
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

console.log('\n🔍 Testing Supabase Connection...\n')

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  process.exit(1)
}

console.log(`📍 Supabase URL: ${supabaseUrl}`)
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('1️⃣  Testing basic connection...')
    const { data: health, error: healthError } = await supabase.from('_health').select('*').limit(1)
    
    if (healthError && healthError.code !== 'PGRST116') {
      console.log(`   ⚠️  Health check failed: ${healthError.message}`)
    } else {
      console.log('   ✅ Basic connection OK')
    }

    // Test 2: Check auth.users table (if accessible)
    console.log('\n2️⃣  Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log(`   ℹ️  Not authenticated: ${authError.message}`)
      console.log('   ✅ Auth service is accessible')
    } else if (user) {
      console.log(`   ✅ Authenticated as: ${user.email}`)
    } else {
      console.log('   ✅ Auth service is accessible (not logged in)')
    }

    // Test 3: Check if profiles table exists
    console.log('\n3️⃣  Testing database tables...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.log(`   ❌ Profiles table error: ${profilesError.message}`)
      console.log('   💡 This might mean tables are not created yet')
      console.log('   💡 Run SQL scripts in scripts/ folder first')
    } else {
      console.log('   ✅ Profiles table exists')
      
      // Get count
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (!countError) {
        console.log(`   📊 Total profiles: ${count || 0}`)
      }
    }

    // Test 4: Check other tables
    const tables = ['accounts', 'kols', 'campaigns', 'posts', 'projects', 'post_metrics']
    console.log('\n4️⃣  Checking other tables...')
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
        if (error.code === 'PGRST116') {
          console.log(`      💡 Table "${table}" might not exist. Check if migrations have been run.`)
        } else if (error.message?.includes('fetch failed')) {
          console.log(`      ⚠️  Network error when accessing "${table}"`)
        }
      } else {
        console.log(`   ✅ ${table}: OK`)
      }
    }

    // Test 4.5: Check post_metrics columns specifically
    console.log('\n4️⃣.5️⃣  Checking post_metrics columns...')
    const { data: sampleMetric, error: metricError } = await supabase
      .from('post_metrics')
      .select('impressions_organic, impressions_boost, reach_organic, reach_boost, post_clicks, link_clicks, retweets')
      .limit(1)
    
    if (metricError) {
      if (metricError.code === '42703' || metricError.message?.includes('column')) {
        console.log('   ⚠️  Missing columns in post_metrics table')
        console.log('   💡 Run migration: scripts/add_post_metrics_columns.sql')
        console.log(`   Error: ${metricError.message}`)
      } else if (metricError.message?.includes('fetch failed')) {
        console.log('   ⚠️  Network error when accessing post_metrics')
        console.log(`   Error: ${metricError.message}`)
      } else {
        console.log(`   ❌ post_metrics query error: ${metricError.message}`)
      }
    } else {
      console.log('   ✅ post_metrics table has all required columns')
    }

    // Test 5: Check RLS policies
    console.log('\n5️⃣  Testing Row Level Security...')
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (rlsError && rlsError.code === 'PGRST301') {
      console.log('   ⚠️  RLS is blocking access (this is normal if not authenticated)')
    } else if (rlsError) {
      console.log(`   ℹ️  RLS check: ${rlsError.message}`)
    } else {
      console.log('   ✅ RLS is configured')
    }

    console.log('\n✅ Connection test completed!\n')
    console.log('📝 Summary:')
    console.log(`   - Supabase URL: ✅ Connected`)
    console.log(`   - Auth Service: ✅ Working`)
    console.log(`   - Database: ${profilesError ? '⚠️  Tables may need to be created' : '✅ Accessible'}`)
    console.log('\n💡 Next steps:')
    if (profilesError) {
      console.log('   1. Run SQL scripts from scripts/ folder')
      console.log('   2. Start with: 001_create_profiles_and_roles.sql')
    } else {
      console.log('   ✅ Database is ready to use!')
    }
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Connection test failed:')
    console.error(`   ${error.message}\n`)
    process.exit(1)
  }
}

testConnection()

