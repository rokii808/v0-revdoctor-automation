import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured =
  typeof supabaseUrl === "string" &&
  supabaseUrl.length > 0 &&
  typeof serviceRoleKey === "string" &&
  serviceRoleKey.length > 0

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
  }
  from: (table: string) => DummyQueryBuilder
}

/**
 * Admin client for server-side operations that require service role access.
 * Use this for API routes that need to bypass RLS.
 */
export function createAdminClient(): SupabaseClient | DummySupabaseClient {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")

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
