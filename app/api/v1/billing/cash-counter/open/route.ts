import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const openSessionSchema = z.object({
  branch_id: z.string().uuid('Valid branch ID required'),
  opening_balance_paise: z.number().int().min(0, 'Opening balance must be non-negative'),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = openSessionSchema.parse(body)
    const admin = createAdminClient()

    // Check if staff already has an open session
    const { data: existing } = await admin
      .from('cash_counter_sessions')
      .select('id')
      .eq('staff_id', user.id)
      .eq('status', 'open')
      .maybeSingle()

    if (existing) {
      throw new ApiError('CONFLICT', 'You already have an open cash counter session. Please close it first.', 409)
    }

    const { data: session, error } = await admin
      .from('cash_counter_sessions')
      .insert({
        organization_id: user.organizationId,
        branch_id: parsed.branch_id,
        staff_id: user.id,
        session_date: new Date().toISOString().split('T')[0],
        opening_balance_paise: parsed.opening_balance_paise,
        cash_collected_paise: 0,
        cash_refunded_paise: 0,
        status: 'open',
      })
      .select()
      .single()

    if (error || !session) {
      throw new ApiError('DATABASE_ERROR', `Failed to open cash counter session: ${error?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CASH_COUNTER_SESSION_OPENED',
      entityType: 'cash_counter_session',
      entityId: session.id,
      newValues: session,
    })

    return successResponse(session, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
