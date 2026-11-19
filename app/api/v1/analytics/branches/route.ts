import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getMultiBranchAnalytics, AnalyticsTimeframe } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const timeframe = (searchParams.get('timeframe') as AnalyticsTimeframe) || 'current_month'

    const data = await getMultiBranchAnalytics({ timeframe })

    return successResponse(data, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
