import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listPatientFeedback, submitPatientFeedback } from '@/lib/modules/experience/experience-service'

export const dynamic = 'force-dynamic'

const feedbackSchema = z.object({
  branch_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional().nullable(),
  diagnostic_order_id: z.string().uuid().optional().nullable(),
  rating_overall: z.number().int().min(1).max(5),
  rating_doctor: z.number().int().min(1).max(5).optional().nullable(),
  rating_reception: z.number().int().min(1).max(5).optional().nullable(),
  rating_waiting_time: z.number().int().min(1).max(5).optional().nullable(),
  feedback_category: z.string().default('general'),
  comments: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const patientId = searchParams.get('patientId') || undefined
    const negativeOnly = searchParams.get('negativeOnly') === 'true'

    const feedback = await listPatientFeedback({ branchId, patientId, negativeOnly })

    return successResponse({ feedback, total: feedback.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const validated = feedbackSchema.parse(body)

    const result = await submitPatientFeedback({
      branchId: validated.branch_id,
      patientId: validated.patient_id,
      appointmentId: validated.appointment_id,
      diagnosticOrderId: validated.diagnostic_order_id,
      ratingOverall: validated.rating_overall,
      ratingDoctor: validated.rating_doctor,
      ratingReception: validated.rating_reception,
      ratingWaitingTime: validated.rating_waiting_time,
      feedbackCategory: validated.feedback_category,
      comments: validated.comments,
    })

    return successResponse(result, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
