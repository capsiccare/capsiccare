import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/config/env'

export interface CachedIdempotencyResponse {
  status: number
  body: any
}

// In-memory fallback cache for development/offline mode
const localIdempotencyCache = new Map<string, { response: CachedIdempotencyResponse; expiresAt: number }>()

/**
 * Checks if a request with this idempotency key was previously processed.
 */
export async function checkIdempotency(
  key: string,
  requestPath: string
): Promise<CachedIdempotencyResponse | null> {
  if (!key) return null

  // Offline / in-memory path
  if (!isSupabaseConfigured()) {
    const entry = localIdempotencyCache.get(key)
    if (entry && entry.expiresAt > Date.now()) {
      return entry.response
    }
    return null
  }

  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('idempotency_keys')
      .select('response_status, response_body, locked_until')
      .eq('key', key)
      .eq('request_path', requestPath)
      .single()

    if (data && new Date(data.locked_until).getTime() > Date.now()) {
      return {
        status: data.response_status,
        body: data.response_body,
      }
    }
  } catch {
    // If not found or lookup fails, proceed with execution
  }

  return null
}

/**
 * Persists an idempotent response for future replay within a given TTL (default: 24 hours).
 */
export async function storeIdempotency(
  key: string,
  requestPath: string,
  response: CachedIdempotencyResponse,
  ttlHours: number = 24
): Promise<void> {
  if (!key) return

  const lockedUntil = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString()

  // Offline / in-memory path
  if (!isSupabaseConfigured()) {
    localIdempotencyCache.set(key, {
      response,
      expiresAt: Date.now() + ttlHours * 3600 * 1000,
    })
    return
  }

  try {
    const admin = createAdminClient()
    // Fetch default organization for development scoping
    const { data: org } = await admin.from('organizations').select('id').limit(1).single()
    if (!org) return

    await admin.from('idempotency_keys').upsert({
      organization_id: org.id,
      key,
      request_path: requestPath,
      response_status: response.status,
      response_body: response.body,
      locked_until: lockedUntil,
    })
  } catch (error) {
    console.warn('Failed to store idempotency key:', error)
  }
}
