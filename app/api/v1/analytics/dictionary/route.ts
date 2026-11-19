import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getMetricDictionary } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const dictionary = getMetricDictionary()

    return successResponse({ dictionary, total: dictionary.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
