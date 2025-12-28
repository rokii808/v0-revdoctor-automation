import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Minimal type for dummy client to maintain type safety
interface DummySupabaseClient {
  auth: {
    signUp: (credentials: unknown) => Promise<{ data: null; error: { message: string } }>
    signInWithPassword: (credentials: unknown) => Promise<{ data: null; error: { message: string } }>
    signOut: () => Promise<{ error: null }>
    getUser: () => Promise<{ data: { user: null }; error: null }>
    getSession: () => Promise<{ data: { session: null }; error: null }>
  }
  from: () => {
    select: () => Promise<{ data: unknown[]; error: null }>
    insert: () => Promise<{ data: null; error: null }>
    update: () => Promise<{ data: null; error: null }>
    delete: () => Promise<{ data: null; error: null }>
  }
}

export function createClient(): SupabaseClient | DummySupabaseClient {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    } as DummySupabaseClient
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Legacy export for backward compatibility
export const supabase = createClient()
