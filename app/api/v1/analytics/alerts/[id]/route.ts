import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { resolveDecisionAlert } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { id: alertId } = await params

    const resolved = await resolveDecisionAlert(alertId, caller.id)

    return successResponse(resolved, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
