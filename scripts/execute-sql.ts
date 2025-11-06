#!/usr/bin/env tsx
/**
 * Execute SQL scripts in Supabase
 * 
 * This script will attempt to run SQL through Supabase Dashboard API
 * or provide instructions for manual execution
 * 
 * Usage:
 *   pnpm tsx scripts/execute-sql.ts
 */

import { readFileSync, readdirSync } from 'fs'
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

console.log('\n🚀 Executing SQL Scripts in Supabase\n')

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL is required')
  process.exit(1)
}

console.log(`📍 Supabase URL: ${supabaseUrl}`)

if (!supabaseServiceKey) {
  console.log('\n⚠️  Service Role Key not found')
  console.log('   Please add SUPABASE_SERVICE_ROLE_KEY to .env.local')
  console.log('   Get it from: https://supabase.com/dashboard/project/_/settings/api')
  console.log('\n📋 Alternative: Use Supabase Dashboard (Recommended)')
  console.log('   1. Go to: https://supabase.com/dashboard/project/_/sql')
  console.log('   2. Open scripts/all-migrations.sql')
  console.log('   3. Copy and paste into SQL Editor')
  console.log('   4. Click Run\n')
  process.exit(0)
}

console.log(`🔑 Service Role Key: ${supabaseServiceKey.substring(0, 20)}...`)

async function executeSQL(sql: string, filename: string) {
  console.log(`\n📄 Executing: ${filename}`)
  
  try {
    // Supabase doesn't have a direct REST API for arbitrary SQL execution
    // We need to use the Management API or Database API
    // For now, we'll provide the SQL and instructions
    
    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`   Found ${statements.length} statements`)
    
    // Note: Supabase REST API doesn't support arbitrary SQL execution
    // Users need to use Supabase Dashboard or psql
    console.log('   ⚠️  Cannot execute SQL directly via API')
    console.log('   💡 Please run this script in Supabase Dashboard SQL Editor')
    
    return { success: false, message: 'Manual execution required' }
    
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  const scriptsDir = join(process.cwd(), 'scripts')
  
  // Check if we should run all-migrations.sql or individual files
  const useAllMigrations = process.argv.includes('--all')
  
  if (useAllMigrations) {
    const allMigrationsPath = join(scriptsDir, 'all-migrations.sql')
    if (readFileSync(allMigrationsPath, 'utf-8')) {
      console.log('\n📋 Using all-migrations.sql (combined file)')
      const sql = readFileSync(allMigrationsPath, 'utf-8')
      await executeSQL(sql, 'all-migrations.sql')
      return
    }
  }
  
  // Get all SQL files in order
  const files = readdirSync(scriptsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('test') && !f.includes('run') && f !== 'all-migrations.sql')
    .sort()
  
  console.log(`\n📋 Found ${files.length} SQL files to execute`)
  console.log('\n⚠️  Note: Supabase REST API has limitations for SQL execution')
  console.log('   For best results, use Supabase Dashboard SQL Editor\n')
  
  console.log('='.repeat(60))
  console.log('📋 Recommended Method: Supabase Dashboard')
  console.log('='.repeat(60))
  console.log('1. Go to: https://supabase.com/dashboard/project/_/sql')
  console.log('2. Run scripts in this order:\n')
  
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`)
  })
  
  console.log('\n   Or use the combined file:')
  console.log('   - scripts/all-migrations.sql (all scripts in one file)')
  
  console.log('\n' + '='.repeat(60))
  console.log('Alternative: Use psql (Command Line)')
  console.log('='.repeat(60))
  console.log('1. Get connection string from Supabase Dashboard')
  console.log('   Settings > Database > Connection string > URI')
  console.log('2. Run:')
  console.log('   export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"')
  console.log('   ./scripts/run-all-sql.sh')
  console.log('')
  
  // Try to execute if service key is available
  if (supabaseServiceKey) {
    console.log('='.repeat(60))
    console.log('Attempting to execute via API...')
    console.log('='.repeat(60))
    
    // Since Supabase REST API doesn't support arbitrary SQL,
    // we'll provide instructions
    console.log('\n❌ Supabase REST API does not support arbitrary SQL execution')
    console.log('   Please use one of the methods above\n')
  }
}

main().catch(console.error)

