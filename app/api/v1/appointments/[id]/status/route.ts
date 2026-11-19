import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'
import { AppointmentStatus } from '@/lib/modules/appointments/types'

export const dynamic = 'force-dynamic'

const statusTransitionSchema = z.object({
  status: z.enum([
    'scheduled',
    'confirmed',
    'checked_in',
    'waiting',
    'in_consultation',
    'completed',
    'cancelled',
    'no_show',
  ]),
  reason: z.string().max(500).optional().nullable(),
})

// Permitted state transitions map
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'checked_in', 'waiting', 'cancelled', 'no_show'],
  confirmed: ['checked_in', 'waiting', 'in_consultation', 'cancelled', 'no_show'],
  checked_in: ['waiting', 'in_consultation', 'cancelled', 'no_show'],
  waiting: ['in_consultation', 'cancelled', 'no_show'],
  in_consultation: ['completed', 'waiting'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  no_show: [], // Terminal state
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = statusTransitionSchema.parse(body)

    const admin = createAdminClient()

    // 1. Fetch current appointment
    const { data: appointment, error: fetchErr } = await admin
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !appointment) {
      throw new ApiError('NOT_FOUND', `Appointment with ID '${id}' was not found`, 404)
    }

    const currentStatus = appointment.status as AppointmentStatus
    const targetStatus = parsed.status as AppointmentStatus

    // 2. Validate state transition
    if (currentStatus === targetStatus) {
      return successResponse(appointment, undefined, 200, requestId)
    }

    const allowedNext = VALID_TRANSITIONS[currentStatus] || []
    const isSuperAdmin = user.roles.some((r) => r.role === 'super_admin')

    if (!allowedNext.includes(targetStatus) && !isSuperAdmin) {
      throw new ApiError(
        'INVALID_STATE_TRANSITION',
        `Cannot transition appointment from status '${currentStatus}' to '${targetStatus}'. Permitted transitions: [${allowedNext.join(', ')}]`,
        400
      )
    }

    if (targetStatus === 'cancelled' && (!parsed.reason || !parsed.reason.trim())) {
      throw new ApiError('BAD_REQUEST', 'Cancellation reason is required when marking an appointment cancelled', 400)
    }

    // 3. Prepare payload and lifecycle timestamps
    const nowIso = new Date().toISOString()
    const updatePayload: Record<string, any> = {
      status: targetStatus,
      updated_at: nowIso,
    }

    if (targetStatus === 'checked_in' || targetStatus === 'waiting') {
      if (!appointment.check_in_time) {
        updatePayload.check_in_time = nowIso
      }
    } else if (targetStatus === 'in_consultation') {
      if (!appointment.consultation_start_time) {
        updatePayload.consultation_start_time = nowIso
      }
    } else if (targetStatus === 'completed') {
      if (!appointment.consultation_end_time) {
        updatePayload.consultation_end_time = nowIso
      }
    } else if (targetStatus === 'cancelled') {
      updatePayload.cancellation_reason = parsed.reason?.trim()
    }

    // 4. Update appointment
    const { data: updated, error: updateErr } = await admin
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        patients ( id, full_name, uhid, phone ),
        doctors ( id, name, specialty, code ),
        branches ( id, name, address, phone ),
        chambers ( id, name, room_number )
      `)
      .single()

    if (updateErr || !updated) {
      throw new ApiError('DATABASE_ERROR', `Failed to transition appointment status: ${updateErr?.message}`, 500)
    }

    // 5. Append to appointment_status_history
    await admin.from('appointment_status_history').insert({
      appointment_id: id,
      from_status: currentStatus,
      to_status: targetStatus,
      changed_by: user.id,
      reason: parsed.reason?.trim() || `Status updated to ${targetStatus}`,
    })

    // 6. Record Audit Log
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'APPOINTMENT_STATUS_CHANGED',
      entityType: 'appointment',
      entityId: id,
      oldValues: { status: currentStatus },
      newValues: { status: targetStatus, reason: parsed.reason },
    })

    const result = {
      ...updated,
      feeInr: Math.round(updated.fee_paise / 100),
      patientName: updated.patients?.full_name,
      patientUhid: updated.patients?.uhid,
      patientPhone: updated.patients?.phone,
      doctorName: updated.doctors?.name,
      doctorSpecialty: updated.doctors?.specialty,
      chamberName: updated.chambers?.name,
      chamberRoom: updated.chambers?.room_number,
    }

    return successResponse(result, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
