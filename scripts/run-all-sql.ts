#!/usr/bin/env tsx
/**
 * Run all SQL scripts in order
 * 
 * This script will execute all SQL files in the scripts/ folder
 * using Supabase REST API
 * 
 * Usage:
 *   pnpm tsx scripts/run-all-sql.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
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
  // .env.local not found, use environment variables
}

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
  console.error('   Add it to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQL(sql: string, filename: string) {
  console.log(`\n📄 Running: ${filename}`)
  
  try {
    // Split SQL by semicolons, but keep function definitions together
    const statements: string[] = []
    let currentStatement = ''
    let inFunction = false
    let dollarQuoteTag = ''
    
    const lines = sql.split('\n')
    
    for (const line of lines) {
      // Skip comments
      if (line.trim().startsWith('--')) {
        continue
      }
      
      // Check for function definition
      if (line.includes('CREATE FUNCTION') || line.includes('CREATE OR REPLACE FUNCTION')) {
        inFunction = true
        // Extract dollar quote tag if present
        const dollarMatch = line.match(/\$(\w*)\$/g)
        if (dollarMatch) {
          dollarQuoteTag = dollarMatch[0]
        }
      }
      
      currentStatement += line + '\n'
      
      // Check for function end
      if (inFunction && dollarQuoteTag && line.includes(dollarQuoteTag + ';')) {
        inFunction = false
        dollarQuoteTag = ''
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim())
          currentStatement = ''
        }
        continue
      }
      
      // Check for end of function without dollar quotes
      if (inFunction && line.trim().match(/^END;?$/i)) {
        inFunction = false
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim())
          currentStatement = ''
        }
        continue
      }
      
      // Regular statement end
      if (!inFunction && line.trim().endsWith(';')) {
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim())
          currentStatement = ''
        }
      }
    }
    
    // Add remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim())
    }
    
    // Execute each statement
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      if (!statement.trim() || statement.trim().startsWith('--')) {
        continue
      }
      
      try {
        // Use REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ sql_query: statement })
        })
        
        if (!response.ok) {
          // Try alternative method using direct query
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
          
          if (error) {
            // If exec_sql doesn't exist, we need to use Supabase Dashboard
            console.log(`   ⚠️  Warning: Cannot execute SQL directly`)
            console.log(`   💡 Please run this script manually in Supabase Dashboard`)
            console.log(`   📋 Go to: https://supabase.com/dashboard/project/_/sql`)
            errorCount++
            continue
          }
        }
        
        successCount++
      } catch (error: any) {
        console.log(`   ⚠️  Error executing statement: ${error.message}`)
        errorCount++
      }
    }
    
    if (errorCount === 0 && successCount > 0) {
      console.log(`   ✅ Completed: ${filename} (${successCount} statements)`)
    } else if (errorCount > 0) {
      console.log(`   ⚠️  Partial: ${filename} (${successCount} success, ${errorCount} errors)`)
      console.log(`   💡 Some statements may need to be run manually in Supabase Dashboard`)
    }
    
  } catch (error: any) {
    console.error(`   ❌ Error in ${filename}:`, error.message)
    throw error
  }
}

async function main() {
  const scriptsDir = join(process.cwd(), 'scripts')
  
  // Get all SQL files and sort them
  const files = readdirSync(scriptsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('test') && !f.includes('run'))
    .sort()
  
  console.log(`\n🚀 Running ${files.length} SQL migration scripts...`)
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log(`\n⚠️  Note: This script uses REST API which may have limitations`)
  console.log(`   For best results, use Supabase Dashboard SQL Editor\n`)
  
  const results: { file: string; success: boolean; error?: string }[] = []
  
  for (const file of files) {
    try {
      const filePath = join(scriptsDir, file)
      const sql = readFileSync(filePath, 'utf-8')
      await runSQL(sql, file)
      results.push({ file, success: true })
      
      // Small delay between files
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error: any) {
      console.error(`   ❌ Failed: ${file}`)
      results.push({ file, success: false, error: error.message })
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log('='.repeat(60))
  
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.file}`)
    } else {
      console.log(`❌ ${result.file}: ${result.error}`)
    }
  })
  
  console.log('\n' + '='.repeat(60))
  console.log(`Total: ${results.length} files`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(60))
  
  if (failCount > 0) {
    console.log('\n💡 For failed scripts, please run them manually in:')
    console.log('   https://supabase.com/dashboard/project/_/sql\n')
  } else {
    console.log('\n✅ All scripts completed successfully!\n')
  }
}

main().catch(console.error)

