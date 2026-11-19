import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { listSupportTickets, createSupportTicket } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const tickets = await listSupportTickets(context.patient.id)
    return successResponse(tickets, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const ticket = await createSupportTicket(context.patient.id, body)
    return successResponse(ticket, { message: 'Support ticket submitted successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
