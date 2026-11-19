import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { isSupabaseConfigured, env } from '@/lib/config/env'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    let databaseStatus = 'unconfigured'
    let latencyMs = 0

    if (isSupabaseConfigured()) {
      const start = Date.now()
      try {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.from('organizations').select('id').limit(1)
        latencyMs = Date.now() - start
        databaseStatus = error ? 'error' : 'connected'
      } catch {
        databaseStatus = 'unreachable'
      }
    }

    const healthData = {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: {
        status: databaseStatus,
        configured: isSupabaseConfigured(),
        latencyMs: databaseStatus === 'connected' ? latencyMs : null,
      },
      services: {
        whatsapp: 'active',
        sms: 'synthetic_mock',
      },
    }

    return successResponse(healthData, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
