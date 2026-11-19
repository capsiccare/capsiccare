import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { releaseCareflowTaskClaim } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { id: taskId } = await params

    const result = await releaseCareflowTaskClaim(taskId, caller.id)

    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
