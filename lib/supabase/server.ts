import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env, isSupabaseConfigured } from '@/lib/config/env'

/**
 * Creates a server-side Supabase client for Server Components, Server Actions,
 * and Route Handlers with secure cookie persistence.
 */
export async function createServerSupabaseClient() {
  let cookieStore: any
  try {
    cookieStore = await cookies()
  } catch {
    // Graceful fallback when invoked outside a Next.js request store (e.g. Unit and integration tests)
    cookieStore = {
      getAll: () => [],
      set: () => {},
    }
  }

  if (!isSupabaseConfigured()) {
    return createServerClient(
      'https://offline.supabase.co',
      'offline-anon-key',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
  }

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server component cookie modification no-op
          }
        },
      },
    }
  )
}
