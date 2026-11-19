import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { getPatientPrescriptionDetail } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const { id } = await params

    const detail = await getPatientPrescriptionDetail(context.patient.id, id)
    if (!detail) {
      return successResponse({ error: 'Prescription not found or not finalized' }, undefined, 404, requestId)
    }
    return successResponse(detail, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
