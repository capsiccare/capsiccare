import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { cancelPatientAppointment } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const reason = body.reason || 'Cancelled by patient via portal'

    const cancelled = await cancelPatientAppointment(context.patient.id, id, reason)
    return successResponse(cancelled, { message: 'Appointment cancelled successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
