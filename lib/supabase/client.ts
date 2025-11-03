import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"
import { supabaseUrl, supabaseAnonKey } from "./config"

export function createClient() {
  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
}

export function createBrowserClient() {
  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
}
