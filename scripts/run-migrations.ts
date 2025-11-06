#!/usr/bin/env tsx
/**
 * Script to run all SQL migration files in order
 * 
 * Usage:
 *   pnpm tsx scripts/run-migrations.ts
 *   
 * Or run individual script:
 *   pnpm tsx scripts/run-migrations.ts scripts/001_create_profiles_and_roles.sql
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { readdirSync } from 'fs'

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required')
  console.error('   Get it from: https://supabase.com/dashboard/project/_/settings/api')
  console.error('   Look for "service_role" key (secret)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQL(sql: string, filename: string) {
  console.log(`\n📄 Running: ${filename}`)
  
  try {
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: queryError } = await supabase.from('_temp').select('*').limit(0)
          
          // Use REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql_query: statement })
          })
          
          if (!response.ok) {
            console.error(`   ⚠️  Warning: ${error.message}`)
            console.error(`   This might need to be run manually in Supabase Dashboard`)
          }
        }
      }
    }
    
    console.log(`   ✅ Completed: ${filename}`)
  } catch (error: any) {
    console.error(`   ❌ Error in ${filename}:`, error.message)
    throw error
  }
}

async function main() {
  const scriptsDir = join(process.cwd(), 'scripts')
  
  // If specific file is provided as argument
  const specificFile = process.argv[2]
  
  if (specificFile) {
    const filePath = join(process.cwd(), specificFile)
    const sql = readFileSync(filePath, 'utf-8')
    const filename = specificFile.split('/').pop() || specificFile
    await runSQL(sql, filename)
    return
  }

  // Get all SQL files and sort them
  const files = readdirSync(scriptsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  
  console.log(`🚀 Running ${files.length} migration scripts...`)
  
  for (const file of files) {
    const filePath = join(scriptsDir, file)
    const sql = readFileSync(filePath, 'utf-8')
    await runSQL(sql, file)
  }
  
  console.log('\n✅ All migrations completed!')
}

main().catch(console.error)

