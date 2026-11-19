import { createClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/lib/config/env'

/**
 * Creates an administrative Supabase client using the Service Role Key.
 *
 * CRITICAL SECURITY NOTICE:
 * - This client BYPASSES Row-Level Security (RLS).
 * - MUST NEVER be exposed to the browser or imported into Client Components.
 * - Used exclusively for administrative bootstrap, system webhooks, and audit logging.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured() || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Return dummy client if unconfigured in development
    return createClient(
      'https://offline.supabase.co',
      'offline-service-role-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
