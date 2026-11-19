import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listCommunicationMessages, dispatchCommunicationMessage } from '@/lib/modules/communication/communication-service'

export const dynamic = 'force-dynamic'

const dispatchSchema = z.object({
  patient_id: z.string().uuid(),
  channel: z.enum(['whatsapp', 'sms', 'email']),
  template_code: z.string().optional(),
  custom_body: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])).optional(),
  related_entity_type: z.string().optional(),
  related_entity_id: z.string().uuid().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId') || undefined
    const channel = searchParams.get('channel') || undefined
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const messages = await listCommunicationMessages({ patientId, channel, status, limit })

    return successResponse({ messages, total: messages.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = dispatchSchema.parse(body)

    const message = await dispatchCommunicationMessage({
      patientId: validated.patient_id,
      channel: validated.channel,
      templateCode: validated.template_code,
      customBody: validated.custom_body,
      variables: validated.variables,
      relatedEntityType: validated.related_entity_type,
      relatedEntityId: validated.related_entity_id || undefined,
      sentById: caller.id,
    })

    return successResponse(message, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
