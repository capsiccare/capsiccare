import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const updateDoctorSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  specialty: z.string().min(2).max(150).optional(),
  designation: z.string().min(2).max(150).optional(),
  qualifications: z.string().min(2).optional(),
  registration_number: z.string().min(2).max(100).optional(),
  experience_years: z.number().int().min(0).optional(),
  physical_fee_paise: z.number().int().min(0).optional(),
  telemedicine_fee_paise: z.number().int().min(0).optional(),
  follow_up_fee_paise: z.number().int().min(0).optional(),
  branch_ids: z.array(z.string().uuid()).optional(),
  languages: z.array(z.string()).optional(),
  areas_of_expertise: z.array(z.string()).optional(),
  about: z.string().optional().nullable(),
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

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        id, code, name, slug, specialty, designation, qualifications,
        registration_number, experience_years, physical_fee_paise,
        telemedicine_fee_paise, follow_up_fee_paise, languages,
        areas_of_expertise, about, is_active, created_at, updated_at,
        doctor_branches (
          branch_id, is_primary,
          branches ( id, name, code, city, phone )
        ),
        doctor_schedules (
          id, branch_id, chamber_id, consultation_type, day_of_week,
          start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active,
          branches ( id, name ),
          chambers ( id, name, room_number )
        ),
        schedule_exceptions (
          id, branch_id, exception_date, exception_type, start_time, end_time, reason, created_at,
          branches ( id, name )
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to fetch doctor: ${error.message}`, 500)
    }

    if (!doctor) {
      throw new ApiError('NOT_FOUND', `Doctor with ID '${id}' was not found`, 404)
    }

    const result = {
      ...doctor,
      physicalFeeInr: Math.round(doctor.physical_fee_paise / 100),
      telemedicineFeeInr: Math.round(doctor.telemedicine_fee_paise / 100),
      followUpFeeInr: Math.round(doctor.follow_up_fee_paise / 100),
      branches: (doctor.doctor_branches || []).map((db: any) => ({
        id: db.branches?.id || db.branch_id,
        name: db.branches?.name || 'Unknown',
        code: db.branches?.code || '',
        city: db.branches?.city || '',
        phone: db.branches?.phone || '',
        isPrimary: db.is_primary,
      })),
      schedules: (doctor.doctor_schedules || []).map((s: any) => ({
        id: s.id,
        branchId: s.branch_id,
        branchName: s.branches?.name || 'Clinic',
        chamberId: s.chamber_id || null,
        chamberName: s.chambers?.name || null,
        chamberRoom: s.chambers?.room_number || null,
        consultationType: s.consultation_type,
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time,
        slotDurationMinutes: s.slot_duration_minutes,
        maxPatientsPerSlot: s.max_patients_per_slot,
        isActive: s.is_active,
      })),
      exceptions: (doctor.schedule_exceptions || []).map((ex: any) => ({
        id: ex.id,
        branchId: ex.branch_id,
        branchName: ex.branches?.name || 'All Branches',
        exceptionDate: ex.exception_date,
        exceptionType: ex.exception_type,
        startTime: ex.start_time,
        endTime: ex.end_time,
        reason: ex.reason,
        createdAt: ex.created_at,
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
    const parsed = updateDoctorSchema.parse(body)

    const admin = createAdminClient()

    // 1. Fetch current doctor
    const { data: existing, error: fetchError } = await admin
      .from('doctors')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      throw new ApiError('NOT_FOUND', `Doctor with ID '${id}' was not found`, 404)
    }

    // 2. Prepare update data
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (parsed.name !== undefined) updatePayload.name = parsed.name
    if (parsed.specialty !== undefined) updatePayload.specialty = parsed.specialty
    if (parsed.designation !== undefined) updatePayload.designation = parsed.designation
    if (parsed.qualifications !== undefined) updatePayload.qualifications = parsed.qualifications
    if (parsed.registration_number !== undefined) updatePayload.registration_number = parsed.registration_number
    if (parsed.experience_years !== undefined) updatePayload.experience_years = parsed.experience_years
    if (parsed.physical_fee_paise !== undefined) updatePayload.physical_fee_paise = parsed.physical_fee_paise
    if (parsed.telemedicine_fee_paise !== undefined) updatePayload.telemedicine_fee_paise = parsed.telemedicine_fee_paise
    if (parsed.follow_up_fee_paise !== undefined) updatePayload.follow_up_fee_paise = parsed.follow_up_fee_paise
    if (parsed.languages !== undefined) updatePayload.languages = parsed.languages
    if (parsed.areas_of_expertise !== undefined) updatePayload.areas_of_expertise = parsed.areas_of_expertise
    if (parsed.about !== undefined) updatePayload.about = parsed.about
    if (parsed.is_active !== undefined) updatePayload.is_active = parsed.is_active

    // 3. Update doctor record
    const { data: updatedDoctor, error: updateError } = await admin
      .from('doctors')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updatedDoctor) {
      throw new ApiError('DATABASE_ERROR', `Failed to update doctor: ${updateError?.message}`, 500)
    }

    // 4. Update branch links if provided
    if (parsed.branch_ids !== undefined) {
      await admin.from('doctor_branches').delete().eq('doctor_id', id)
      if (parsed.branch_ids.length > 0) {
        const branchLinks = parsed.branch_ids.map((bId, idx) => ({
          doctor_id: id,
          branch_id: bId,
          is_primary: idx === 0,
        }))
        await admin.from('doctor_branches').insert(branchLinks)
      }
    }

    // 5. Audit Log
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_UPDATED',
      entityType: 'doctor',
      entityId: id,
      oldValues: {
        physical_fee_paise: existing.physical_fee_paise,
        is_active: existing.is_active,
        specialty: existing.specialty,
      },
      newValues: updatePayload,
    })

    return successResponse(updatedDoctor, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
