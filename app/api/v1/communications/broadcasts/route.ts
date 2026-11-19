import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAnyRole } from '@/lib/modules/auth/auth-service'
import { broadcastCommunication } from '@/lib/modules/communication/communication-service'

export const dynamic = 'force-dynamic'

const broadcastSchema = z.object({
  channel: z.enum(['whatsapp', 'sms', 'email']),
  template_code: z.string().optional(),
  custom_body: z.string().optional(),
  patient_ids: z.array(z.string().uuid()).min(1, 'At least one patient required'),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAnyRole(['super_admin', 'org_admin', 'branch_admin', 'careflow_manager'])
    const body = await req.json()
    const validated = broadcastSchema.parse(body)

    const result = await broadcastCommunication({
      channel: validated.channel,
      templateCode: validated.template_code,
      customBody: validated.custom_body,
      patientIds: validated.patient_ids,
      sentById: caller.id,
    })

    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
