import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const rescheduleSchema = z.object({
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  chamber_id: z.string().uuid().optional().nullable(),
  chief_complaint: z.string().optional().nullable(),
  cancellation_reason: z.string().optional().nullable(),
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

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients ( id, full_name, uhid, phone, gender, date_of_birth, age_years, blood_group ),
        doctors ( id, name, specialty, code, registration_number ),
        branches ( id, name, code, address, city, phone ),
        chambers ( id, name, room_number, floor )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to fetch appointment: ${error.message}`, 500)
    }

    if (!appointment) {
      throw new ApiError('NOT_FOUND', `Appointment with ID '${id}' was not found`, 404)
    }

    // Fetch status history
    const { data: history } = await supabase
      .from('appointment_status_history')
      .select(`
        id, from_status, to_status, reason, created_at,
        profiles ( full_name )
      `)
      .eq('appointment_id', id)
      .order('created_at', { ascending: true })

    const result = {
      ...appointment,
      feeInr: Math.round(appointment.fee_paise / 100),
      patientName: appointment.patients?.full_name,
      patientUhid: appointment.patients?.uhid,
      patientPhone: appointment.patients?.phone,
      patientGender: appointment.patients?.gender,
      patientAge: appointment.patients?.age_years,
      doctorName: appointment.doctors?.name,
      doctorSpecialty: appointment.doctors?.specialty,
      doctorCode: appointment.doctors?.code,
      doctorRegistrationNumber: appointment.doctors?.registration_number,
      branchName: appointment.branches?.name,
      branchAddress: appointment.branches?.address,
      branchCity: appointment.branches?.city,
      branchPhone: appointment.branches?.phone,
      chamberName: appointment.chambers?.name,
      chamberRoom: appointment.chambers?.room_number,
      chamberFloor: appointment.chambers?.floor,
      statusHistory: (history || []).map((h: any) => ({
        id: h.id,
        fromStatus: h.from_status,
        toStatus: h.to_status,
        reason: h.reason,
        changedBy: h.profiles?.full_name || 'Staff User',
        createdAt: h.created_at,
      })),
    }

    return successResponse(result, undefined, 200, requestId)
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
    const parsed = rescheduleSchema.parse(body)

    const admin = createAdminClient()

    const { data: existing, error: fetchErr } = await admin
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new ApiError('NOT_FOUND', `Appointment with ID '${id}' was not found`, 404)
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    let isReschedule = false
    if (parsed.scheduled_date && parsed.scheduled_date !== existing.scheduled_date) {
      updatePayload.scheduled_date = parsed.scheduled_date
      isReschedule = true
    }
    if (parsed.start_time) {
      updatePayload.start_time = parsed.start_time.length === 5 ? `${parsed.start_time}:00` : parsed.start_time
      isReschedule = true
    }
    if (parsed.end_time) {
      updatePayload.end_time = parsed.end_time.length === 5 ? `${parsed.end_time}:00` : parsed.end_time
      isReschedule = true
    }
    if (parsed.chamber_id !== undefined) {
      updatePayload.chamber_id = parsed.chamber_id
    }
    if (parsed.chief_complaint !== undefined) {
      updatePayload.chief_complaint = parsed.chief_complaint
    }
    if (parsed.cancellation_reason !== undefined) {
      updatePayload.cancellation_reason = parsed.cancellation_reason
    }

    const { data: updated, error: updateErr } = await admin
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr || !updated) {
      if (updateErr?.message.includes('overlapping consultation')) {
        throw new ApiError('CONFLICT', updateErr.message, 409)
      }
      if (updateErr?.message.includes('Chamber is already reserved')) {
        throw new ApiError('CONFLICT', updateErr.message, 409)
      }
      throw new ApiError('DATABASE_ERROR', `Failed to update appointment: ${updateErr?.message}`, 500)
    }

    if (isReschedule) {
      await admin.from('appointment_status_history').insert({
        appointment_id: id,
        from_status: existing.status,
        to_status: existing.status,
        changed_by: user.id,
        reason: `Rescheduled to ${updated.scheduled_date} from ${updated.start_time} to ${updated.end_time}`,
      })

      await recordAuditEvent({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'APPOINTMENT_RESCHEDULED',
        entityType: 'appointment',
        entityId: id,
        oldValues: {
          scheduled_date: existing.scheduled_date,
          start_time: existing.start_time,
          end_time: existing.end_time,
        },
        newValues: {
          scheduled_date: updated.scheduled_date,
          start_time: updated.start_time,
          end_time: updated.end_time,
        },
      })
    }

    return successResponse(updated, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
