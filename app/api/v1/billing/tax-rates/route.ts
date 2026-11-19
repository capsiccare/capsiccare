import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const supabase = await createServerSupabaseClient()

    const { data: rates, error } = await supabase
      .from('tax_classifications')
      .select('*')
      .eq('is_active', true)
      .order('rate_percent', { ascending: true })

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query tax rates: ${error.message}`, 500)
    }

    return successResponse(rates || [], undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
