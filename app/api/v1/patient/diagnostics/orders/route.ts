import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { listPatientDiagnosticOrders } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const orders = await listPatientDiagnosticOrders(context.patient.id)
    return successResponse(orders, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
