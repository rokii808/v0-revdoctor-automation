import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Minimal type for dummy client to maintain type safety
interface DummyQueryBuilder {
  select: (columns?: string, options?: unknown) => DummyQueryBuilder
  insert: (values: unknown, options?: unknown) => DummyQueryBuilder
  update: (values: unknown) => DummyQueryBuilder
  delete: () => DummyQueryBuilder
  eq: (column: string, value: unknown) => DummyQueryBuilder
  not: (column: string, operator: string, value: unknown) => DummyQueryBuilder
  in: (column: string, values: unknown[]) => DummyQueryBuilder
  upsert: (values: unknown, options?: unknown) => DummyQueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => DummyQueryBuilder
  limit: (count: number) => DummyQueryBuilder
  range: (from: number, to: number) => DummyQueryBuilder
  gte: (column: string, value: unknown) => DummyQueryBuilder
  lte: (column: string, value: unknown) => DummyQueryBuilder
  gt: (column: string, value: unknown) => DummyQueryBuilder
  lt: (column: string, value: unknown) => DummyQueryBuilder
  single: () => Promise<{ data: null; error: null }>
  then: <T>(resolve: (value: { data: any; error: null; count: null }) => T) => Promise<T>
}

interface DummySupabaseClient {
  auth: {
    signUp: (credentials: unknown) => Promise<{ data: null; error: { message: string } }>
    signInWithPassword: (credentials: unknown) => Promise<{ data: null; error: { message: string } }>
    signOut: () => Promise<{ error: null }>
    getUser: () => Promise<{ data: { user: null }; error: null }>
    getSession: () => Promise<{ data: { session: null }; error: null }>
  }
  from: (table: string) => DummyQueryBuilder
  channel: (name: string) => {
    on: (event: any, filter: unknown, callback: () => void) => any
    subscribe: () => void
  }
  removeChannel: (channel: any) => void
}

export function createClient(): SupabaseClient | DummySupabaseClient {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")

    const createDummyQueryBuilder = (): DummyQueryBuilder => {
      const builder = {
        select: (_columns?: string, _options?: unknown) => builder,
        insert: (_values: unknown, _options?: unknown) => builder,
        update: () => builder,
        delete: () => builder,
        eq: () => builder,
        not: () => builder,
        in: () => builder,
        upsert: (_values: unknown, _options?: unknown) => builder,
        order: () => builder,
        limit: () => builder,
        range: () => builder,
        gte: () => builder,
        lte: () => builder,
        gt: () => builder,
        lt: () => builder,
        single: async () => ({ data: null, error: null }),
        then: (resolve: any) => {
          const result = { data: null, error: null, count: null }
          resolve(result)
          return Promise.resolve(result)
        },
      } as DummyQueryBuilder
      return builder
    }

    return {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: (table: string) => createDummyQueryBuilder(),
      channel: (_name: string) => ({
        on: (_event: any, _filter: unknown, _callback: () => void) => ({
          subscribe: () => {},
        }),
        subscribe: () => {},
      }),
      removeChannel: (_channel: any) => {},
    } as DummySupabaseClient
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Legacy export for backward compatibility
export const supabase = createClient()
