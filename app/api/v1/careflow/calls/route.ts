import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordCareflowCallAttempt } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const recordCallSchema = z.object({
  task_id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  practice_id: z.string().uuid().optional().nullable(),
  call_status: z.enum(['connected', 'no_answer', 'busy', 'wrong_number', 'call_failed']),
  outcome: z.enum([
    'connected',
    'no_answer',
    'busy',
    'switched_off',
    'wrong_number',
    'callback_requested',
    'patient_doing_well',
    'patient_has_concern',
    'follow_up_appointment_requested',
    'diagnostic_booking_assistance_requested',
    'appointment_booked',
    'not_interested',
    'do_not_contact',
    'escalated_to_doctor',
  ]),
  notes: z.string().optional(),
  callback_scheduled_at: z.string().optional().nullable(),
  appointment_booked_id: z.string().uuid().optional().nullable(),
  diagnostic_order_id: z.string().uuid().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = recordCallSchema.parse(body)

    const callRecord = await recordCareflowCallAttempt({
      taskId: validated.task_id,
      patientId: validated.patient_id,
      practiceId: validated.practice_id || undefined,
      callerId: caller.id,
      callStatus: validated.call_status,
      outcome: validated.outcome,
      notes: validated.notes,
      callbackScheduledAt: validated.callback_scheduled_at || undefined,
      appointmentBookedId: validated.appointment_booked_id || undefined,
      diagnosticOrderId: validated.diagnostic_order_id || undefined,
    })

    return successResponse(callRecord, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
