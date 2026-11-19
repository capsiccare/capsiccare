import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getCareflowDashboardMetrics } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const practiceId = searchParams.get('practiceId') || undefined
    const doctorId = searchParams.get('doctorId') || undefined

    const metrics = await getCareflowDashboardMetrics({
      branchId: branchId === 'all' ? undefined : branchId,
      practiceId,
      doctorId,
    })

    return successResponse(metrics, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
