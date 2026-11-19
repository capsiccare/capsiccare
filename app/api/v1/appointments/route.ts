import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { parsePaginationParams } from '@/lib/api/pagination'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const bookAppointmentSchema = z.object({
  patient_id: z.string().uuid('Valid patient ID is required'),
  doctor_id: z.string().uuid('Valid doctor ID is required'),
  branch_id: z.string().uuid('Valid branch ID is required'),
  chamber_id: z.string().uuid().optional().nullable(),
  consultation_type: z.enum(['physical', 'telemedicine']).default('physical'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid scheduled_date (YYYY-MM-DD) is required'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid start time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid end time format'),
  fee_paise: z.number().int().min(0).optional(),
  booking_source: z.enum(['web', 'mobile', 'call_center', 'reception', 'partner']).default('reception'),
  chief_complaint: z.string().max(500).optional().nullable(),
  status: z.enum(['scheduled', 'confirmed']).default('confirmed'),
})

/**
 * Generates an appointment reference: APT-YYYYMMDD-XXXX
 */
function generateAppointmentNumber(dateStr: string): string {
  const cleanDate = dateStr.replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `APT-${cleanDate}-${randomSuffix}`
}

/**
 * Calculates next token number for a doctor on a specific date
 */
async function getNextTokenNumber(admin: ReturnType<typeof createAdminClient>, doctorId: string, scheduledDate: string): Promise<number> {
  const { data: latestToken } = await admin
    .from('appointments')
    .select('token_number')
    .eq('doctor_id', doctorId)
    .eq('scheduled_date', scheduledDate)
    .order('token_number', { ascending: false })
    .limit(1)

  if (latestToken && latestToken.length > 0 && latestToken[0].token_number) {
    return latestToken[0].token_number + 1
  }
  return 1
}

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const { page, limit, offset } = parsePaginationParams(searchParams)
    const date = searchParams.get('date')?.trim()
    const startDate = searchParams.get('startDate')?.trim()
    const endDate = searchParams.get('endDate')?.trim()
    const branchId = searchParams.get('branchId')?.trim()
    const doctorId = searchParams.get('doctorId')?.trim()
    const chamberId = searchParams.get('chamberId')?.trim()
    const status = searchParams.get('status')?.trim()
    const search = searchParams.get('q')?.trim()

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('appointments')
      .select(`
        id, appointment_number, organization_id, branch_id, doctor_id,
        patient_id, chamber_id, consultation_type, scheduled_date,
        start_time, end_time, fee_paise, status, booking_source,
        token_number, chief_complaint, cancellation_reason,
        check_in_time, consultation_start_time, consultation_end_time,
        created_at, updated_at,
        patients ( id, full_name, uhid, phone, gender, age_years ),
        doctors ( id, name, specialty, code ),
        branches ( id, name, code ),
        chambers ( id, name, room_number )
      `, { count: 'exact' })

    if (date) {
      query = query.eq('scheduled_date', date)
    } else if (startDate && endDate) {
      query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate)
    }

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId)
    }

    if (chamberId && chamberId !== 'all') {
      query = query.eq('chamber_id', chamberId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    query = query
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: rawAppointments, count, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query appointments: ${error.message}`, 500)
    }

    let items = (rawAppointments || []).map((a: any) => ({
      id: a.id,
      appointmentNumber: a.appointment_number,
      organizationId: a.organization_id,
      branchId: a.branch_id,
      branchName: a.branches?.name || 'Clinic',
      branchCode: a.branches?.code || '',
      doctorId: a.doctor_id,
      doctorName: a.doctors?.name || 'Consultant',
      doctorSpecialty: a.doctors?.specialty || '',
      doctorCode: a.doctors?.code || '',
      patientId: a.patient_id,
      patientName: a.patients?.full_name || 'Walk-in Patient',
      patientUhid: a.patients?.uhid || '-',
      patientPhone: a.patients?.phone || '-',
      patientGender: a.patients?.gender || '-',
      patientAge: a.patients?.age_years,
      chamberId: a.chamber_id,
      chamberName: a.chambers?.name || null,
      chamberRoom: a.chambers?.room_number || null,
      consultationType: a.consultation_type,
      scheduledDate: a.scheduled_date,
      startTime: a.start_time,
      endTime: a.end_time,
      feePaise: a.fee_paise,
      feeInr: Math.round(a.fee_paise / 100),
      status: a.status,
      bookingSource: a.booking_source,
      tokenNumber: a.token_number,
      chiefComplaint: a.chief_complaint,
      cancellationReason: a.cancellation_reason,
      checkInTime: a.check_in_time,
      consultationStartTime: a.consultation_start_time,
      consultationEndTime: a.consultation_end_time,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }))

    // In-memory search filter if 'q' provided
    if (search) {
      const qLower = search.toLowerCase()
      items = items.filter((item: any) =>
        item.patientName.toLowerCase().includes(qLower) ||
        item.patientUhid.toLowerCase().includes(qLower) ||
        item.patientPhone.includes(qLower) ||
        item.appointmentNumber.toLowerCase().includes(qLower) ||
        item.doctorName.toLowerCase().includes(qLower)
      )
    }

    const total = count || items.length
    const totalPages = Math.ceil(total / limit) || 1

    return successResponse(items, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = bookAppointmentSchema.parse(body)

    const admin = createAdminClient()

    // 1. Fetch Doctor fee if not explicitly provided
    let feePaise = parsed.fee_paise
    if (feePaise === undefined || feePaise === null) {
      const { data: doc } = await admin
        .from('doctors')
        .select('physical_fee_paise, telemedicine_fee_paise')
        .eq('id', parsed.doctor_id)
        .single()

      feePaise = parsed.consultation_type === 'physical'
        ? (doc?.physical_fee_paise || 0)
        : (doc?.telemedicine_fee_paise || 0)
    }

    // 2. Generate unique appointment number & sequential token
    const appointmentNumber = generateAppointmentNumber(parsed.scheduled_date)
    const tokenNumber = await getNextTokenNumber(admin, parsed.doctor_id, parsed.scheduled_date)

    // Normalize start and end times to HH:MM:00
    const normStart = parsed.start_time.length === 5 ? `${parsed.start_time}:00` : parsed.start_time
    const normEnd = parsed.end_time.length === 5 ? `${parsed.end_time}:00` : parsed.end_time

    // 3. Insert Appointment Record (database overlap trigger guards doctor and chamber concurrency)
    const { data: appointment, error: insertError } = await admin
      .from('appointments')
      .insert({
        appointment_number: appointmentNumber,
        organization_id: user.organizationId,
        branch_id: parsed.branch_id,
        doctor_id: parsed.doctor_id,
        patient_id: parsed.patient_id,
        chamber_id: parsed.chamber_id || null,
        consultation_type: parsed.consultation_type,
        scheduled_date: parsed.scheduled_date,
        start_time: normStart,
        end_time: normEnd,
        fee_paise: feePaise,
        status: parsed.status,
        booking_source: parsed.booking_source,
        token_number: tokenNumber,
        chief_complaint: parsed.chief_complaint?.trim() || null,
        created_by: user.id,
      })
      .select(`
        *,
        patients ( id, full_name, uhid, phone ),
        doctors ( id, name, specialty, code ),
        branches ( id, name, address, phone ),
        chambers ( id, name, room_number )
      `)
      .single()

    if (insertError || !appointment) {
      if (insertError?.message.includes('overlapping consultation')) {
        throw new ApiError('CONFLICT', insertError.message, 409)
      }
      if (insertError?.message.includes('Chamber is already reserved')) {
        throw new ApiError('CONFLICT', insertError.message, 409)
      }
      throw new ApiError('DATABASE_ERROR', `Booking failed: ${insertError?.message}`, 500)
    }

    // 4. Record Initial Status in appointment_status_history
    await admin.from('appointment_status_history').insert({
      appointment_id: appointment.id,
      from_status: null,
      to_status: appointment.status,
      changed_by: user.id,
      reason: 'Initial booking recorded by reception',
    })

    // 5. Record Audit Log
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'APPOINTMENT_BOOKED',
      entityType: 'appointment',
      entityId: appointment.id,
      newValues: {
        appointment_number: appointment.appointment_number,
        token_number: appointment.token_number,
        doctor_id: appointment.doctor_id,
        patient_id: appointment.patient_id,
        scheduled_date: appointment.scheduled_date,
        start_time: appointment.start_time,
        fee_paise: appointment.fee_paise,
      },
    })

    const responseData = {
      ...appointment,
      feeInr: Math.round(appointment.fee_paise / 100),
      patientName: appointment.patients?.full_name,
      patientUhid: appointment.patients?.uhid,
      patientPhone: appointment.patients?.phone,
      doctorName: appointment.doctors?.name,
      doctorSpecialty: appointment.doctors?.specialty,
      branchName: appointment.branches?.name,
      branchAddress: appointment.branches?.address,
      chamberName: appointment.chambers?.name,
      chamberRoom: appointment.chambers?.room_number,
    }

    return successResponse(responseData, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
