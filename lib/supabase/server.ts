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
interface DummyQueryBuilder {
  select: (columns?: string) => DummyQueryBuilder
  insert: (values: unknown) => DummyQueryBuilder
  update: (values: unknown) => DummyQueryBuilder
  delete: () => DummyQueryBuilder
  eq: (column: string, value: unknown) => DummyQueryBuilder
  upsert: (values: unknown) => DummyQueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => DummyQueryBuilder
  limit: (count: number) => DummyQueryBuilder
  range: (from: number, to: number) => DummyQueryBuilder
  gte: (column: string, value: unknown) => DummyQueryBuilder
  lte: (column: string, value: unknown) => DummyQueryBuilder
  gt: (column: string, value: unknown) => DummyQueryBuilder
  lt: (column: string, value: unknown) => DummyQueryBuilder
  single: () => Promise<{ data: null; error: null }>
  then: (resolve: (value: { data: unknown[]; error: null }) => void) => Promise<{ data: unknown[]; error: null }>
}

interface DummySupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: null }>
    getSession: () => Promise<{ data: { session: null }; error: null }>
  }
  from: (table: string) => DummyQueryBuilder
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
    const createDummyQueryBuilder = (): DummyQueryBuilder => {
      const builder = {
        select: () => builder,
        insert: () => builder,
        update: () => builder,
        delete: () => builder,
        eq: () => builder,
        upsert: () => builder,
        order: () => builder,
        limit: () => builder,
        range: () => builder,
        gte: () => builder,
        lte: () => builder,
        gt: () => builder,
        lt: () => builder,
        single: async () => ({ data: null, error: null }),
        then: (resolve: any) => {
          resolve({ data: [], error: null })
          return Promise.resolve({ data: [], error: null })
        },
      } as DummyQueryBuilder
      return builder
    }

    const dummyFrom = (table: string) => createDummyQueryBuilder()

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
