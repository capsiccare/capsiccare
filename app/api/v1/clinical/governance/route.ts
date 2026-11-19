import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getClinicalGovernanceOverview } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const overview = await getClinicalGovernanceOverview()
    return successResponse(overview, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
