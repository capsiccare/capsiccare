import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { startConsultation, getDoctorContext } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const { appointmentId, doctorId: requestedDoctorId } = body

    if (!appointmentId) {
      throw new Error('appointmentId is required')
    }

    const doctor = await getDoctorContext(user.id, requestedDoctorId)
    if (!doctor) {
      throw new Error('No authorized doctor profile found')
    }

    const result = await startConsultation(appointmentId, doctor.id)
    return successResponse(result, { message: 'Consultation initialized' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
