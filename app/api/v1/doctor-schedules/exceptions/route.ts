import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createExceptionSchema = z.object({
  doctor_id: z.string().uuid('Valid doctor ID is required'),
  branch_id: z.string().uuid().optional().nullable(),
  exception_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  exception_type: z.enum(['leave', 'holiday', 'extended_hours', 'cancelled']),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional().nullable(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional().nullable(),
  reason: z.string().max(255).optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctorId')?.trim()
    const branchId = searchParams.get('branchId')?.trim()
    const fromDate = searchParams.get('fromDate')?.trim()
    const toDate = searchParams.get('toDate')?.trim()

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('schedule_exceptions')
      .select(`
        id, doctor_id, branch_id, exception_date, exception_type,
        start_time, end_time, reason, created_by, created_at,
        doctors ( id, name, code, specialty ),
        branches ( id, name, code )
      `)
      .order('exception_date', { ascending: true })

    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId)
    }

    if (branchId && branchId !== 'all') {
      query = query.or(`branch_id.is.null,branch_id.eq.${branchId}`)
    }

    if (fromDate) {
      query = query.gte('exception_date', fromDate)
    }

    if (toDate) {
      query = query.lte('exception_date', toDate)
    }

    const { data: exceptions, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query exceptions: ${error.message}`, 500)
    }

    const items = (exceptions || []).map((ex: any) => ({
      id: ex.id,
      doctorId: ex.doctor_id,
      doctorName: ex.doctors?.name || 'Doctor',
      doctorCode: ex.doctors?.code || '',
      branchId: ex.branch_id,
      branchName: ex.branches?.name || 'All Branches',
      exceptionDate: ex.exception_date,
      exceptionType: ex.exception_type,
      startTime: ex.start_time,
      endTime: ex.end_time,
      reason: ex.reason,
      createdAt: ex.created_at,
    }))

    return successResponse(items, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createExceptionSchema.parse(body)

    const admin = createAdminClient()

    // Validate times if both are present
    if (parsed.start_time && parsed.end_time && parsed.end_time <= parsed.start_time) {
      throw new ApiError('BAD_REQUEST', 'Exception end_time must be later than start_time', 400)
    }

    const { data: exception, error } = await admin
      .from('schedule_exceptions')
      .insert({
        doctor_id: parsed.doctor_id,
        branch_id: parsed.branch_id || null,
        exception_date: parsed.exception_date,
        exception_type: parsed.exception_type,
        start_time: parsed.start_time || null,
        end_time: parsed.end_time || null,
        reason: parsed.reason || null,
        created_by: user.id,
      })
      .select(`
        *,
        branches ( id, name )
      `)
      .single()

    if (error || !exception) {
      throw new ApiError('DATABASE_ERROR', `Failed to record schedule exception: ${error?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_SCHEDULE_EXCEPTION_CREATED',
      entityType: 'schedule_exception',
      entityId: exception.id,
      newValues: exception,
    })

    return successResponse(exception, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')?.trim()

    if (!id) {
      throw new ApiError('BAD_REQUEST', 'Exception ID is required via ?id=', 400)
    }

    const admin = createAdminClient()

    const { data: existing, error: fetchErr } = await admin
      .from('schedule_exceptions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new ApiError('NOT_FOUND', `Schedule exception '${id}' not found`, 404)
    }

    const { error: delErr } = await admin
      .from('schedule_exceptions')
      .delete()
      .eq('id', id)

    if (delErr) {
      throw new ApiError('DATABASE_ERROR', `Failed to delete schedule exception: ${delErr.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_SCHEDULE_EXCEPTION_DELETED',
      entityType: 'schedule_exception',
      entityId: id,
      oldValues: existing,
    })

    return successResponse({ deleted: true, id }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
