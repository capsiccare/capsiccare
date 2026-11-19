import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const closeSessionSchema = z.object({
  session_id: z.string().uuid('Valid session ID required'),
  actual_closing_paise: z.number().int().min(0, 'Actual cash count must be non-negative'),
  closing_notes: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = closeSessionSchema.parse(body)
    const admin = createAdminClient()

    // Fetch existing open session
    const { data: session, error: fetchErr } = await admin
      .from('cash_counter_sessions')
      .select('*')
      .eq('id', parsed.session_id)
      .maybeSingle()

    if (fetchErr || !session) {
      throw new ApiError('NOT_FOUND', `Session '${parsed.session_id}' not found`, 404)
    }

    if (session.status !== 'open') {
      throw new ApiError('BAD_REQUEST', 'This cash counter session is already closed', 400)
    }

    // Expected closing is opening + collected - refunded
    const expectedPaise = session.opening_balance_paise + session.cash_collected_paise - session.cash_refunded_paise
    const variancePaise = parsed.actual_closing_paise - expectedPaise

    const { data: closedSession, error: closeErr } = await admin
      .from('cash_counter_sessions')
      .update({
        actual_closing_paise: parsed.actual_closing_paise,
        variance_paise: variancePaise,
        status: 'closed',
        closing_notes: parsed.closing_notes || null,
        closed_at: new Date().toISOString(),
        closed_by: user.id,
      })
      .eq('id', parsed.session_id)
      .select()
      .single()

    if (closeErr || !closedSession) {
      throw new ApiError('DATABASE_ERROR', `Failed to close cash session: ${closeErr?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CASH_COUNTER_SESSION_CLOSED',
      entityType: 'cash_counter_session',
      entityId: closedSession.id,
      newValues: {
        expected_closing_paise: expectedPaise,
        actual_closing_paise: parsed.actual_closing_paise,
        variance_paise: variancePaise,
      },
    })

    return successResponse({
      ...closedSession,
      expectedClosingInr: Math.round(expectedPaise / 100),
      actualClosingInr: Math.round(parsed.actual_closing_paise / 100),
      varianceInr: Math.round(variancePaise / 100),
    }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
