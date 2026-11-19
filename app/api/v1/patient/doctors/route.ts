import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { searchDoctorsForPatient } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { searchParams } = new URL(req.url)
    const specialty = searchParams.get('specialty') || undefined
    const branchId = searchParams.get('branchId') || undefined
    const query = searchParams.get('query') || undefined

    const doctors = await searchDoctorsForPatient({ specialty, branchId, query })
    return successResponse(doctors, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
