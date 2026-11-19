import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import {
  getRetentionAnalytics,
  getCohortAnalysis,
  getPatientLtvEstimates,
} from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const practiceId = searchParams.get('practiceId') || undefined
    const doctorId = searchParams.get('doctorId') || undefined
    const branchId = searchParams.get('branchId') || undefined

    const [retention, cohorts, ltv] = await Promise.all([
      getRetentionAnalytics({ practiceId, doctorId, branchId }),
      getCohortAnalysis(),
      getPatientLtvEstimates(),
    ])

    return successResponse(
      {
        retention,
        cohorts,
        ltv,
      },
      undefined,
      200,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
