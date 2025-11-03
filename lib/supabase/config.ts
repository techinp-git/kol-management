/**
 * Supabase configuration
 * Uses environment variables with fallback to integration-provided values
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sqaffprdetbrxrdnslfm.supabase.co"

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWZmcHJkZXRicnhyZG5zbGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDc2MTEsImV4cCI6MjA3NzIyMzYxMX0.HyqQZgiqFbf2HEXDUMhMpaREa59Wtt6ClUx5Smaxxtk"
