import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')?.trim()
    const doctorId = searchParams.get('doctorId')?.trim()
    const requestedDate = searchParams.get('date')?.trim()

    // Default to today in IST
    const now = new Date()
    const istFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const todayIst = requestedDate || istFormatter.format(now)

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('appointments')
      .select(`
        id, appointment_number, organization_id, branch_id, doctor_id,
        patient_id, chamber_id, consultation_type, scheduled_date,
        start_time, end_time, fee_paise, status, booking_source,
        token_number, chief_complaint, check_in_time,
        consultation_start_time, consultation_end_time,
        created_at, updated_at,
        patients ( id, full_name, uhid, phone, gender, age_years ),
        doctors ( id, name, specialty, code ),
        branches ( id, name, code, phone ),
        chambers ( id, name, room_number )
      `)
      .eq('scheduled_date', todayIst)

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId)
    }

    const { data: rawQueue, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query reception queue: ${error.message}`, 500)
    }

    const queueItems = (rawQueue || []).map((a: any) => {
      // Calculate waiting minutes
      let waitingMinutes: number | null = null
      if (a.check_in_time) {
        const checkInMs = new Date(a.check_in_time).getTime()
        const endWaitMs = a.consultation_start_time
          ? new Date(a.consultation_start_time).getTime()
          : (a.consultation_end_time ? new Date(a.consultation_end_time).getTime() : Date.now())
        waitingMinutes = Math.max(0, Math.floor((endWaitMs - checkInMs) / (1000 * 60)))
      }

      return {
        id: a.id,
        appointmentNumber: a.appointment_number,
        tokenNumber: a.token_number,
        patientId: a.patient_id,
        patientName: a.patients?.full_name || 'Walk-in Patient',
        patientUhid: a.patients?.uhid || '-',
        patientPhone: a.patients?.phone || '-',
        patientGender: a.patients?.gender || '-',
        patientAge: a.patients?.age_years,
        doctorId: a.doctor_id,
        doctorName: a.doctors?.name || 'Doctor',
        doctorSpecialty: a.doctors?.specialty || '',
        doctorCode: a.doctors?.code || '',
        branchId: a.branch_id,
        branchName: a.branches?.name || 'Clinic',
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
        chiefComplaint: a.chief_complaint,
        checkInTime: a.check_in_time,
        consultationStartTime: a.consultation_start_time,
        consultationEndTime: a.consultation_end_time,
        waitingMinutes,
      }
    })

    // Sort Queue by operational priority:
    // 1. in_consultation
    // 2. waiting
    // 3. checked_in
    // 4. confirmed / scheduled (by start_time)
    // 5. completed / cancelled / no_show
    const STATUS_PRIORITY: Record<string, number> = {
      in_consultation: 1,
      waiting: 2,
      checked_in: 3,
      confirmed: 4,
      scheduled: 5,
      completed: 6,
      no_show: 7,
      cancelled: 8,
    }

    queueItems.sort((a, b) => {
      const pA = STATUS_PRIORITY[a.status] || 99
      const pB = STATUS_PRIORITY[b.status] || 99
      if (pA !== pB) return pA - pB
      // If same priority, order by token number or start time
      if (a.tokenNumber && b.tokenNumber) return a.tokenNumber - b.tokenNumber
      return a.startTime.localeCompare(b.startTime)
    })

    const summary = {
      total: queueItems.length,
      inConsultation: queueItems.filter((q) => q.status === 'in_consultation').length,
      waiting: queueItems.filter((q) => q.status === 'waiting' || q.status === 'checked_in').length,
      confirmed: queueItems.filter((q) => q.status === 'confirmed' || q.status === 'scheduled').length,
      completed: queueItems.filter((q) => q.status === 'completed').length,
      cancelled: queueItems.filter((q) => q.status === 'cancelled' || q.status === 'no_show').length,
      date: todayIst,
    }

    return successResponse({
      summary,
      items: queueItems,
    }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
