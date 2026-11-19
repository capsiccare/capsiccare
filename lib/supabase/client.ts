import { createBrowserClient } from '@supabase/ssr'
import { env, isSupabaseConfigured } from '@/lib/config/env'

/**
 * Creates or retrieves the browser-side Supabase client.
 * Uses anon public key with PKCE session handling.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a dummy client in offline development mode
    return createBrowserClient(
      'https://offline.supabase.co',
      'offline-anon-key'
    )
  }

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
