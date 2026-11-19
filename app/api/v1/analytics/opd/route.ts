import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getOpdOperationsAnalytics, AnalyticsTimeframe } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const timeframe = (searchParams.get('timeframe') as AnalyticsTimeframe) || 'last_30_days'
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const data = await getOpdOperationsAnalytics({
      branchId: branchId === 'all' ? undefined : branchId,
      timeframe,
      startDate,
      endDate,
    })

    return successResponse(data, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
