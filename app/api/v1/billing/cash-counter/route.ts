import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')?.trim()
    const supabase = await createServerSupabaseClient()

    // 1. Query staff's current open session
    let sessionQuery = supabase
      .from('cash_counter_sessions')
      .select(`
        *,
        branches ( id, name, code ),
        profiles ( id, full_name, email )
      `)
      .eq('staff_id', user.id)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)

    if (branchId && branchId !== 'all') {
      sessionQuery = sessionQuery.eq('branch_id', branchId)
    }

    const { data: openSession } = await sessionQuery.maybeSingle()

    // 2. Query today's past sessions for this branch
    const today = new Date().toISOString().split('T')[0]
    let pastQuery = supabase
      .from('cash_counter_sessions')
      .select(`
        *,
        branches ( id, name, code ),
        profiles ( id, full_name )
      `)
      .eq('session_date', today)
      .order('opened_at', { ascending: false })

    if (branchId && branchId !== 'all') {
      pastQuery = pastQuery.eq('branch_id', branchId)
    }

    const { data: pastSessions } = await pastQuery

    const formattedOpen = openSession
      ? {
          ...openSession,
          openingBalanceInr: Math.round(openSession.opening_balance_paise / 100),
          cashCollectedInr: Math.round(openSession.cash_collected_paise / 100),
          cashRefundedInr: Math.round(openSession.cash_refunded_paise / 100),
          expectedClosingInr: Math.round(openSession.expected_closing_paise / 100),
        }
      : null

    const formattedPast = (pastSessions || []).map((s: any) => ({
      ...s,
      staffName: s.profiles?.full_name || 'Staff Member',
      branchName: s.branches?.name || 'Clinic',
      openingBalanceInr: Math.round(s.opening_balance_paise / 100),
      cashCollectedInr: Math.round(s.cash_collected_paise / 100),
      cashRefundedInr: Math.round(s.cash_refunded_paise / 100),
      expectedClosingInr: Math.round(s.expected_closing_paise / 100),
      actualClosingInr: s.actual_closing_paise ? Math.round(s.actual_closing_paise / 100) : null,
      varianceInr: s.variance_paise !== null && s.variance_paise !== undefined ? Math.round(s.variance_paise / 100) : null,
    }))

    return successResponse({
      activeSession: formattedOpen,
      todaySessions: formattedPast,
    }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
