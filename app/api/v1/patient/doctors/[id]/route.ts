import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { getDoctorProfileForPatient } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { id } = await params
    const doctor = await getDoctorProfileForPatient(id)
    if (!doctor) {
      return successResponse({ error: 'Doctor not found' }, undefined, 404, requestId)
    }
    return successResponse(doctor, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
