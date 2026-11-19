import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { listPatientAppointments, bookPatientAppointment } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined

    const appointments = await listPatientAppointments(context.patient.id, status)
    return successResponse(appointments, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()

    const appointment = await bookPatientAppointment(context.patient.id, body)
    return successResponse(appointment, { message: 'Appointment booked successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
