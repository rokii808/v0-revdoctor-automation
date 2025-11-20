import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured =
  typeof supabaseUrl === "string" &&
  supabaseUrl.length > 0 &&
  typeof serviceRoleKey === "string" &&
  serviceRoleKey.length > 0

// Minimal type for dummy client to maintain type safety
interface DummySupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: null }>
  }
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: unknown[]; error: null }>
    insert: (values: unknown) => Promise<{ data: null; error: null }>
    update: (values: unknown) => Promise<{ data: null; error: null }>
    delete: () => Promise<{ data: null; error: null }>
    upsert: (values: unknown) => Promise<{ data: null; error: null }>
    single: () => Promise<{ data: null; error: null }>
    eq: (column: string, value: unknown) => DummySupabaseClient['from'] extends (table: string) => infer R ? R : never
  }
}

/**
 * Admin client for server-side operations that require service role access.
 * Use this for API routes that need to bypass RLS.
 */
export function createAdminClient(): SupabaseClient | DummySupabaseClient {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    const dummyFrom = (table: string) => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
      eq: function() { return this },
    })
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: dummyFrom,
    } as DummySupabaseClient
  }

  return createSupabaseClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
