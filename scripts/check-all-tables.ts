#!/usr/bin/env tsx
/**
 * Check all tables in Supabase database
 * 
 * Usage:
 *   pnpm tsx scripts/check-all-tables.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
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
  // .env.local not found
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Expected tables from create-tables-only.sql
const expectedTables = [
  'profiles',
  'memo_logs',
  'status_changes',
  'accounts',
  'projects',
  'kols',
  'kol_channels',
  'rate_cards',
  'rate_items',
  'campaigns',
  'campaign_kols',
  'posts',
  'post_metrics',
  'tags',
  'comments',
  'comment_tags',
  'audit_logs',
  'notifications'
]

// Expected types
const expectedTypes = [
  'user_role',
  'channel_type'
]

async function checkAllTables() {
  console.log('\n🔍 Checking Supabase Database Setup...\n')
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`)
  
  const results = {
    tables: { exists: [] as string[], missing: [] as string[], errors: [] as string[] },
    types: { exists: [] as string[], missing: [] as string[] },
    connection: false,
    auth: false
  }
  
  // Test connection
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    results.connection = true
    results.auth = !error
  } catch (error) {
    console.error('❌ Connection failed')
    return
  }
  
  // Check tables
  console.log('📋 Checking Tables...\n')
  for (const table of expectedTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('does not exist')) {
          results.tables.missing.push(table)
          console.log(`   ❌ ${table}: Missing`)
        } else {
          results.tables.errors.push(table)
          console.log(`   ⚠️  ${table}: Error - ${error.message}`)
        }
      } else {
        results.tables.exists.push(table)
        console.log(`   ✅ ${table}: OK`)
      }
    } catch (error: any) {
      results.tables.errors.push(table)
      console.log(`   ❌ ${table}: ${error.message}`)
    }
  }
  
  // Check types (if we can query them)
  console.log('\n📋 Checking Types...\n')
  for (const type of expectedTypes) {
    try {
      // Try to use the type in a query
      const { error } = await supabase
        .from('profiles')
        .select('role')
        .limit(1)
      
      if (type === 'user_role' && !error) {
        results.types.exists.push(type)
        console.log(`   ✅ ${type}: OK`)
      } else if (type === 'channel_type') {
        // Check if channel_type exists by querying kol_channels
        const { error: channelError } = await supabase
          .from('kol_channels')
          .select('channel_type')
          .limit(1)
        
        if (!channelError) {
          results.types.exists.push(type)
          console.log(`   ✅ ${type}: OK`)
        } else {
          results.types.missing.push(type)
          console.log(`   ❌ ${type}: Missing or not accessible`)
        }
      }
    } catch (error) {
      results.types.missing.push(type)
      console.log(`   ❌ ${type}: Error`)
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  
  console.log(`\n✅ Connection: ${results.connection ? 'OK' : 'Failed'}`)
  console.log(`✅ Auth Service: ${results.auth ? 'OK' : 'Failed'}`)
  
  console.log(`\n📋 Tables:`)
  console.log(`   ✅ Exists: ${results.tables.exists.length}/${expectedTables.length}`)
  console.log(`   ❌ Missing: ${results.tables.missing.length}`)
  console.log(`   ⚠️  Errors: ${results.tables.errors.length}`)
  
  console.log(`\n📋 Types:`)
  console.log(`   ✅ Exists: ${results.types.exists.length}/${expectedTypes.length}`)
  console.log(`   ❌ Missing: ${results.types.missing.length}`)
  
  const totalTables = results.tables.exists.length
  const totalExpected = expectedTables.length
  const percentage = Math.round((totalTables / totalExpected) * 100)
  
  console.log(`\n📈 Progress: ${totalTables}/${totalExpected} tables (${percentage}%)`)
  
  if (results.tables.missing.length > 0) {
    console.log('\n⚠️  Missing Tables:')
    results.tables.missing.forEach(table => {
      console.log(`   - ${table}`)
    })
    console.log('\n💡 Run SQL scripts to create missing tables:')
    console.log('   scripts/create-tables-only.sql')
    console.log('   or')
    console.log('   scripts/all-migrations.sql')
  }
  
  if (results.tables.errors.length > 0) {
    console.log('\n⚠️  Tables with Errors:')
    results.tables.errors.forEach(table => {
      console.log(`   - ${table}`)
    })
  }
  
  if (totalTables === totalExpected && results.tables.errors.length === 0) {
    console.log('\n✅ All tables are created successfully!')
    console.log('✅ Supabase setup is complete!')
  } else {
    console.log('\n⚠️  Setup is incomplete. Please run SQL scripts.')
  }
  
  console.log('')
}

checkAllTables().catch(console.error)

