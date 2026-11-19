import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createScheduleSchema = z.object({
  doctor_id: z.string().uuid('Valid doctor ID is required'),
  branch_id: z.string().uuid('Valid branch ID is required'),
  chamber_id: z.string().uuid().optional().nullable(),
  consultation_type: z.enum(['physical', 'telemedicine']).default('physical'),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid start time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid end time format'),
  slot_duration_minutes: z.number().int().min(5).max(120).default(15),
  max_patients_per_slot: z.number().int().min(1).max(20).default(1),
  is_active: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctorId')
    const branchId = searchParams.get('branchId')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('doctor_schedules')
      .select(`
        id, doctor_id, branch_id, chamber_id, consultation_type,
        day_of_week, start_time, end_time, slot_duration_minutes,
        max_patients_per_slot, is_active, created_at, updated_at,
        doctors ( id, name, code, specialty ),
        branches ( id, name, code ),
        chambers ( id, name, room_number )
      `)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (dayOfWeek !== null && dayOfWeek !== undefined && dayOfWeek !== '') {
      query = query.eq('day_of_week', parseInt(dayOfWeek, 10))
    }

    const { data: schedules, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query schedules: ${error.message}`, 500)
    }

    const items = (schedules || []).map((s: any) => ({
      id: s.id,
      doctorId: s.doctor_id,
      doctorName: s.doctors?.name || 'Doctor',
      doctorCode: s.doctors?.code || '',
      doctorSpecialty: s.doctors?.specialty || '',
      branchId: s.branch_id,
      branchName: s.branches?.name || 'Clinic',
      chamberId: s.chamber_id,
      chamberName: s.chambers?.name || null,
      chamberRoom: s.chambers?.room_number || null,
      consultationType: s.consultation_type,
      dayOfWeek: s.day_of_week,
      startTime: s.start_time,
      endTime: s.end_time,
      slotDurationMinutes: s.slot_duration_minutes,
      maxPatientsPerSlot: s.max_patients_per_slot,
      isActive: s.is_active,
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
    const parsed = createScheduleSchema.parse(body)

    const admin = createAdminClient()

    // Validate end_time > start_time
    if (parsed.end_time <= parsed.start_time) {
      throw new ApiError('BAD_REQUEST', 'Schedule end_time must be later than start_time', 400)
    }

    // Insert new schedule session
    const { data: schedule, error } = await admin
      .from('doctor_schedules')
      .insert({
        doctor_id: parsed.doctor_id,
        branch_id: parsed.branch_id,
        chamber_id: parsed.chamber_id || null,
        consultation_type: parsed.consultation_type,
        day_of_week: parsed.day_of_week,
        start_time: parsed.start_time,
        end_time: parsed.end_time,
        slot_duration_minutes: parsed.slot_duration_minutes,
        max_patients_per_slot: parsed.max_patients_per_slot,
        is_active: parsed.is_active,
      })
      .select()
      .single()

    if (error || !schedule) {
      throw new ApiError('DATABASE_ERROR', `Failed to create doctor schedule: ${error?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_SCHEDULE_CREATED',
      entityType: 'doctor_schedule',
      entityId: schedule.id,
      newValues: schedule,
    })

    return successResponse(schedule, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
