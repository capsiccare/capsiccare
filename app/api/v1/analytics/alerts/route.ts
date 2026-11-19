import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getDecisionAlerts } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined

    const alerts = await getDecisionAlerts(branchId)

    return successResponse({ alerts, total: alerts.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
