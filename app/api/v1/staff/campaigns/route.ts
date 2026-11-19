import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listCallingCampaigns, recordCallAttempt } from '@/lib/modules/staff/staff-service'

export const dynamic = 'force-dynamic'

const callAttemptSchema = z.object({
  campaign_id: z.string().uuid().optional().nullable(),
  patient_id: z.string().uuid(),
  call_status: z.enum(['connected', 'no_answer', 'busy', 'wrong_number', 'call_failed']),
  outcome: z.enum([
    'appointment_booked',
    'diagnostic_booked',
    'interested',
    'not_interested',
    'callback_requested',
    'do_not_contact',
    'unreachable',
    'other',
  ]),
  callback_scheduled_at: z.string().optional().nullable(),
  notes: z.string().optional(),
  attributed_appointment_id: z.string().uuid().optional().nullable(),
  attributed_order_id: z.string().uuid().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const campaigns = await listCallingCampaigns()
    return successResponse({ campaigns, total: campaigns.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = callAttemptSchema.parse(body)

    const attempt = await recordCallAttempt({
      campaignId: validated.campaign_id,
      patientId: validated.patient_id,
      callerId: caller.id,
      callStatus: validated.call_status,
      outcome: validated.outcome,
      callbackScheduledAt: validated.callback_scheduled_at,
      notes: validated.notes,
      attributedAppointmentId: validated.attributed_appointment_id,
      attributedOrderId: validated.attributed_order_id,
    })

    return successResponse(attempt, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
