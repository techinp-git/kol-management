import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sqaffprdetbrxrdnslfm.supabase.co"
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWZmcHJkZXRicnhyZG5zbGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDc2MTEsImV4cCI6MjA3NzIyMzYxMX0.HyqQZgiqFbf2HEXDUMhMpaREa59Wtt6ClUx5Smaxxtk"

/**
 * Server-side Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Always create a new client within each function - do not store in global variables.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClientSSR(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}

export async function createServerClient() {
  const cookieStore = await cookies()

  return createServerClientSSR(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
