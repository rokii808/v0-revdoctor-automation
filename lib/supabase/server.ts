import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase environment variables are properly set
export const isSupabaseConfigured =
  typeof supabaseUrl === "string" &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.length > 0

// Minimal type for dummy client to maintain type safety
interface DummySupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: null }>
    getSession: () => Promise<{ data: { session: null }; error: null }>
  }
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: unknown[]; error: null }>
    insert: (values: unknown) => Promise<{ data: null; error: null }>
    update: (values: unknown) => Promise<{ data: null; error: null }>
    delete: () => Promise<{ data: null; error: null }>
    eq: (column: string, value: unknown) => {
      select: (columns?: string) => Promise<{ data: unknown[]; error: null }>
      single: () => Promise<{ data: null; error: null }>
      update: (values: unknown) => Promise<{ data: null; error: null }>
    }
    upsert: (values: unknown) => Promise<{ data: null; error: null }>
    order: (column: string, options?: { ascending?: boolean }) => {
      limit: (count: number) => Promise<{ data: unknown[]; error: null }>
    }
    single: () => Promise<{ data: null; error: null }>
  }
}

/**
 * Create a Supabase client for server-side operations.
 * Uses cookies for authentication state management.
 * Returns a dummy client if configuration is missing.
 */
export async function createClient(): Promise<SupabaseClient | DummySupabaseClient> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")

    // Safe dummy client to prevent runtime errors during development
    const dummyFrom = (table: string) => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      eq: (column: string, value: unknown) => ({
        select: async () => ({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
      }),
      upsert: async () => ({ data: null, error: null }),
      order: (column: string, options?: { ascending?: boolean }) => ({
        limit: async () => ({ data: [], error: null }),
      }),
      single: async () => ({ data: null, error: null }),
    })

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: dummyFrom,
    } as DummySupabaseClient
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
