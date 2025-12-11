import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sqaffprdetbrxrdnslfm.supabase.co"
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""

export function createAdminClient() {
  if (!supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === "" || supabaseServiceRoleKey === "your_service_role_key_here") {
    const errorMsg = !supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === ""
      ? "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables"
      : "SUPABASE_SERVICE_ROLE_KEY is still set to placeholder value 'your_service_role_key_here'"
    
    console.error(`[Admin Client] ${errorMsg}`)
    console.error("[Admin Client] Please:")
    console.error("  1. Open .env.local file")
    console.error("  2. Add: SUPABASE_SERVICE_ROLE_KEY=your_actual_key_here")
    console.error("  3. Get the key from: https://supabase.com/dashboard/project/_/settings/api")
    console.error("  4. Restart the dev server")
    
    throw new Error(`${errorMsg}. Check console for instructions.`)
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
