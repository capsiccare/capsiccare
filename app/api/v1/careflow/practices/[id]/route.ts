import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getPracticeDetails } from '@/lib/modules/careflow/careflow-service'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const updatePracticeSchema = z.object({
  name: z.string().optional(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  chambers: z.any().optional(),
  service_agreement_status: z.enum(['pending', 'active', 'suspended', 'cancelled']).optional(),
  service_plan_id: z.string().uuid().optional().nullable(),
  default_follow_up_days: z.number().int().min(1).max(30).optional(),
  is_active: z.boolean().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id: practiceId } = await params

    const details = await getPracticeDetails(practiceId)

    return successResponse(details, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id: practiceId } = await params
    const body = await req.json()
    const validated = updatePracticeSchema.parse(body)

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('careflow_practices')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', practiceId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update practice: ${error.message}`)

    return successResponse(data, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
