import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { getPatientDashboard } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const dashboard = await getPatientDashboard(context.patient.id)
    return successResponse(dashboard, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
