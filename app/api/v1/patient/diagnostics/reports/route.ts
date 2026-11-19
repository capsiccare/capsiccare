import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { listPatientReports } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const reports = await listPatientReports(context.patient.id)
    return successResponse(reports, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
