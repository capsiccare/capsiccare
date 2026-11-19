import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth, requireAnyRole } from '@/lib/modules/auth/auth-service'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerAutomationEvent } from '@/lib/modules/automation/automation-service'

export const dynamic = 'force-dynamic'

const triggerSchema = z.object({
  event_name: z.string().min(2),
  entity_type: z.string().min(2),
  entity_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  branch_id: z.string().uuid().optional().nullable(),
  payload: z.record(z.any()).optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const adminClient = createAdminClient()

    const { data: rules } = await adminClient
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: logs } = await adminClient
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    return successResponse({ rules: rules || [], logs: logs || [] }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const body = await req.json()
    const validated = triggerSchema.parse(body)

    const result = await triggerAutomationEvent({
      eventName: validated.event_name,
      entityType: validated.entity_type,
      entityId: validated.entity_id,
      patientId: validated.patient_id,
      branchId: validated.branch_id,
      payload: validated.payload,
    })

    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
