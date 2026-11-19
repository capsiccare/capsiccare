import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const updateScheduleSchema = z.object({
  branch_id: z.string().uuid().optional(),
  chamber_id: z.string().uuid().optional().nullable(),
  consultation_type: z.enum(['physical', 'telemedicine']).optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  slot_duration_minutes: z.number().int().min(5).max(120).optional(),
  max_patients_per_slot: z.number().int().min(1).max(20).optional(),
  is_active: z.boolean().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const supabase = await createServerSupabaseClient()

    const { data: schedule, error } = await supabase
      .from('doctor_schedules')
      .select(`
        id, doctor_id, branch_id, chamber_id, consultation_type,
        day_of_week, start_time, end_time, slot_duration_minutes,
        max_patients_per_slot, is_active, created_at, updated_at,
        doctors ( id, name, code, specialty ),
        branches ( id, name, code ),
        chambers ( id, name, room_number )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query schedule: ${error.message}`, 500)
    }

    if (!schedule) {
      throw new ApiError('NOT_FOUND', `Schedule session '${id}' not found`, 404)
    }

    return successResponse(schedule, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = updateScheduleSchema.parse(body)

    const admin = createAdminClient()

    // Fetch existing schedule
    const { data: existing, error: fetchErr } = await admin
      .from('doctor_schedules')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new ApiError('NOT_FOUND', `Schedule '${id}' not found`, 404)
    }

    // Validate times if updated
    const startTime = parsed.start_time || existing.start_time
    const endTime = parsed.end_time || existing.end_time
    if (endTime <= startTime) {
      throw new ApiError('BAD_REQUEST', 'Schedule end_time must be later than start_time', 400)
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (parsed.branch_id !== undefined) updatePayload.branch_id = parsed.branch_id
    if (parsed.chamber_id !== undefined) updatePayload.chamber_id = parsed.chamber_id
    if (parsed.consultation_type !== undefined) updatePayload.consultation_type = parsed.consultation_type
    if (parsed.day_of_week !== undefined) updatePayload.day_of_week = parsed.day_of_week
    if (parsed.start_time !== undefined) updatePayload.start_time = parsed.start_time
    if (parsed.end_time !== undefined) updatePayload.end_time = parsed.end_time
    if (parsed.slot_duration_minutes !== undefined) updatePayload.slot_duration_minutes = parsed.slot_duration_minutes
    if (parsed.max_patients_per_slot !== undefined) updatePayload.max_patients_per_slot = parsed.max_patients_per_slot
    if (parsed.is_active !== undefined) updatePayload.is_active = parsed.is_active

    const { data: updated, error: updateErr } = await admin
      .from('doctor_schedules')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        branches ( id, name ),
        chambers ( id, name, room_number )
      `)
      .single()

    if (updateErr || !updated) {
      throw new ApiError('DATABASE_ERROR', `Failed to update schedule: ${updateErr?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_SCHEDULE_UPDATED',
      entityType: 'doctor_schedule',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    })

    return successResponse(updated, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const admin = createAdminClient()

    // Fetch existing
    const { data: existing, error: fetchErr } = await admin
      .from('doctor_schedules')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new ApiError('NOT_FOUND', `Schedule '${id}' not found`, 404)
    }

    const { error: delErr } = await admin
      .from('doctor_schedules')
      .delete()
      .eq('id', id)

    if (delErr) {
      throw new ApiError('DATABASE_ERROR', `Failed to delete schedule: ${delErr.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_SCHEDULE_DELETED',
      entityType: 'doctor_schedule',
      entityId: id,
      oldValues: existing,
    })

    return successResponse({ deleted: true, id }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
