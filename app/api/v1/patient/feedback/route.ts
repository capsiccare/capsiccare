import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { submitPatientFeedback } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const feedback = await submitPatientFeedback(context.patient.id, body)
    return successResponse(feedback, { message: 'Thank you for your feedback!' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
