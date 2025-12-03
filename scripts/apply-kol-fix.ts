#!/usr/bin/env tsx
/**
 * Apply KOL RLS Fix
 * 
 * This script fixes the RLS policies for kol_channels to allow authenticated users
 * to insert, update, and delete channels when creating KOLs.
 * 
 * Usage:
 *   pnpm tsx scripts/apply-kol-fix.ts
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

console.log('\n🔧 Applying KOL RLS Policy Fix...\n')

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL is required')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.log('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required')
  console.log('   Get it from: https://supabase.com/dashboard/project/_/settings/api')
  console.log('\n📋 Alternative: Manual SQL Execution')
  console.log('   1. Go to: https://supabase.com/dashboard/project/_/sql')
  console.log('   2. Run the file: scripts/fix-kol-channels-rls.sql')
  console.log('   3. Click "Run"\n')
  process.exit(1)
}

console.log(`📍 Supabase URL: ${supabaseUrl}`)
console.log(`🔑 Using Service Role Key\n`)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyFix() {
  try {
    console.log('📝 Reading SQL fix file...')
    const sqlPath = join(process.cwd(), 'scripts', 'fix-kol-channels-rls.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    
    console.log('✅ SQL file loaded\n')
    
    console.log('⚠️  Note: Supabase JS client cannot execute DDL statements')
    console.log('   Please run this SQL manually in Supabase Dashboard:\n')
    console.log('='.repeat(60))
    console.log(sql)
    console.log('='.repeat(60))
    console.log('\n📋 Steps:')
    console.log('   1. Copy the SQL above')
    console.log('   2. Go to: https://supabase.com/dashboard/project/_/sql')
    console.log('   3. Paste and click "Run"')
    console.log('\n💡 Or run: psql $DATABASE_URL < scripts/fix-kol-channels-rls.sql\n')
    
  } catch (error: any) {
    console.error('\n❌ Error:')
    console.error(`   ${error.message}\n`)
    process.exit(1)
  }
}

applyFix()

