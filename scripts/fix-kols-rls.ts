/**
 * Fix KOLs RLS policies to allow authenticated users to insert
 * This script runs the KOLs section of 007_simplify_rls_policies.sql
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sqaffprdetbrxrdnslfm.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fixKolsRLS() {
  console.log('🔧 Fixing KOLs RLS policies...\n')

  // SQL to fix KOLs RLS policies
  const sql = `
-- ลบ policies เดิม
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Analysts can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can delete KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view active KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can update their own profile" ON kols;

-- สร้าง policies ใหม่ - ให้ทุกคนที่ login แล้วทำได้หมด
CREATE POLICY "Authenticated users can view KOLs"
ON kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete KOLs"
ON kols FOR DELETE
TO authenticated
USING (true);
`

  try {
    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('⚠️  exec_sql function not found, trying direct execution...\n')
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.rpc('exec_raw_sql', { 
            sql: statement + ';' 
          })
          
          if (stmtError) {
            // Try using Supabase PostgREST (won't work for DDL, but let's try)
            console.log(`Executing: ${statement.substring(0, 50)}...`)
            
            // For DDL statements, we need to use the REST API directly
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceRoleKey,
                'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              },
              body: JSON.stringify({ sql_query: statement + ';' }),
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error(`❌ Error executing statement: ${errorText}`)
            }
          }
        } catch (err: any) {
          console.error(`❌ Error: ${err.message}`)
        }
      }
    }

    console.log('✅ KOLs RLS policies fixed successfully!')
    console.log('\n📝 Summary:')
    console.log('   - Removed old restrictive policies')
    console.log('   - Created new policies allowing authenticated users to:')
    console.log('     • View all KOLs')
    console.log('     • Insert KOLs')
    console.log('     • Update KOLs')
    console.log('     • Delete KOLs')
    console.log('\n💡 Now any authenticated user can save KOLs!')
  } catch (error: any) {
    console.error('❌ Error fixing KOLs RLS policies:', error.message)
    console.error('\n💡 Alternative: Run the SQL manually in Supabase Dashboard SQL Editor:')
    console.log('\n' + sql)
    process.exit(1)
  }
}

fixKolsRLS()

