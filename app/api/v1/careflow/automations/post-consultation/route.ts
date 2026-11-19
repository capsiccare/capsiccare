import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { triggerPostConsultationFollowUp } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const triggerSchema = z.object({
  appointment_id: z.string().uuid(),
  interval_days: z.number().int().min(1).max(30).optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = triggerSchema.parse(body)

    const result = await triggerPostConsultationFollowUp({
      appointmentId: validated.appointment_id,
      intervalDays: validated.interval_days,
      notes: validated.notes,
    })

    return successResponse(result, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
