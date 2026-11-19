import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const patchPrefSchema = z.object({
  patient_id: z.string().uuid(),
  service_sms_enabled: z.boolean().optional(),
  service_whatsapp_enabled: z.boolean().optional(),
  service_email_enabled: z.boolean().optional(),
  promotional_whatsapp_enabled: z.boolean().optional(),
  promotional_sms_enabled: z.boolean().optional(),
  preferred_language: z.enum(['en', 'bn', 'hi']).optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    if (!patientId) throw new Error('patientId query parameter is required')

    const adminClient = createAdminClient()
    const { data: pref, error } = await adminClient
      .from('patient_communication_preferences')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return successResponse(
      pref || {
        patient_id: patientId,
        service_sms_enabled: true,
        service_whatsapp_enabled: true,
        service_email_enabled: true,
        promotional_whatsapp_enabled: false,
        promotional_sms_enabled: false,
        preferred_language: 'en',
      },
      undefined,
      200,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = patchPrefSchema.parse(body)
    const adminClient = createAdminClient()

    const { data: updated, error } = await adminClient
      .from('patient_communication_preferences')
      .upsert(
        {
          patient_id: validated.patient_id,
          service_sms_enabled: validated.service_sms_enabled ?? true,
          service_whatsapp_enabled: validated.service_whatsapp_enabled ?? true,
          service_email_enabled: validated.service_email_enabled ?? true,
          promotional_whatsapp_enabled: validated.promotional_whatsapp_enabled ?? false,
          promotional_sms_enabled: validated.promotional_sms_enabled ?? false,
          preferred_language: validated.preferred_language || 'en',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'patient_id' }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    return successResponse(updated, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
