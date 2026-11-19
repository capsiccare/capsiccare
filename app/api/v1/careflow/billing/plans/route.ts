import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listCareflowServicePlans } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const plans = await listCareflowServicePlans()

    return successResponse({ plans, total: plans.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
