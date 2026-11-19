import { createAdminClient } from '@/lib/supabase/admin'
import {
  DoctorDayAvailability,
  AvailabilitySlot,
  ConsultationType,
} from './types'

interface AvailabilityQueryOptions {
  doctorId: string
  date: string // "YYYY-MM-DD"
  branchId?: string
}

/**
 * Converts a time string "HH:MM:SS" or "HH:MM" into total minutes from midnight.
 */
function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  return hours * 60 + minutes
}

/**
 * Formats minutes from midnight into "HH:MM" 24h format.
 */
function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Calculates real-time appointment slot availability for a doctor on a specific date.
 * Considers recurring weekly schedules, room/chamber assignments, exceptions (leaves/holidays),
 * existing bookings, chamber occupancy, and past-time checks.
 */
export async function getDoctorDayAvailability(
  options: AvailabilityQueryOptions
): Promise<DoctorDayAvailability> {
  const admin = createAdminClient()
  const { doctorId, date, branchId } = options

  // 1. Fetch Doctor details
  const { data: doctor, error: docError } = await admin
    .from('doctors')
    .select('id, name, specialty, physical_fee_paise, telemedicine_fee_paise, is_active')
    .eq('id', doctorId)
    .single()

  if (docError || !doctor) {
    throw new Error(`Doctor not found or inactive with ID: ${doctorId}`)
  }

  // Calculate day of week (0=Sunday ... 6=Saturday) in IST
  const targetDate = new Date(`${date}T12:00:00+05:30`)
  const dayOfWeek = targetDate.getDay()

  // Current IST time components for past-slot checks
  const now = new Date()
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = istFormatter.formatToParts(now)
  const todayStr = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`
  const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
  const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10)
  const currentMinutesFromMidnight = currentHour * 60 + currentMinute
  const isPastDate = date < todayStr
  const isToday = date === todayStr

  // 2. Check Schedule Exceptions (Leaves, Holidays, Cancellations)
  const { data: exceptions } = await admin
    .from('schedule_exceptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('exception_date', date)

  const activeException = exceptions && exceptions.length > 0 ? exceptions[0] : null
  if (
    activeException &&
    ['leave', 'holiday', 'cancelled'].includes(activeException.exception_type) &&
    !activeException.start_time
  ) {
    return {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      dayOfWeek,
      isWorkingDay: false,
      hasException: true,
      exceptionReason: activeException.reason || `Doctor is unavailable (${activeException.exception_type})`,
      slots: [],
    }
  }

  // 3. Fetch recurring doctor schedules for this day of week
  let scheduleQuery = admin
    .from('doctor_schedules')
    .select(`
      id, doctor_id, branch_id, chamber_id, consultation_type,
      day_of_week, start_time, end_time, slot_duration_minutes,
      max_patients_per_slot, is_active,
      chambers ( id, name, room_number )
    `)
    .eq('doctor_id', doctorId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)

  if (branchId && branchId !== 'all') {
    scheduleQuery = scheduleQuery.eq('branch_id', branchId)
  }

  const { data: rawSchedules, error: schedError } = await scheduleQuery
  if (schedError) {
    throw new Error(`Failed to query doctor schedules: ${schedError.message}`)
  }

  const schedules = rawSchedules || []
  if (schedules.length === 0) {
    return {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      dayOfWeek,
      isWorkingDay: false,
      hasException: false,
      slots: [],
    }
  }

  // 4. Fetch existing non-cancelled appointments for this doctor on this date
  const { data: bookedAppointments, error: aptError } = await admin
    .from('appointments')
    .select('id, start_time, end_time, chamber_id, status')
    .eq('doctor_id', doctorId)
    .eq('scheduled_date', date)
    .not('status', 'in', '("cancelled","no_show")')

  if (aptError) {
    throw new Error(`Failed to query booked appointments: ${aptError.message}`)
  }

  // 5. Fetch appointments in the doctor's assigned chambers on this date (Chamber conflict detection)
  const chamberIds = Array.from(
    new Set(schedules.map((s: any) => s.chamber_id).filter(Boolean))
  )

  let chamberAppointments: any[] = []
  if (chamberIds.length > 0) {
    const { data: chamberApts } = await admin
      .from('appointments')
      .select('id, doctor_id, chamber_id, start_time, end_time, status')
      .in('chamber_id', chamberIds)
      .eq('scheduled_date', date)
      .eq('consultation_type', 'physical')
      .not('status', 'in', '("cancelled","no_show")')

    chamberAppointments = chamberApts || []
  }

  // 6. Generate time slots across all sessions
  const slots: AvailabilitySlot[] = []

  for (const session of schedules) {
    const sessionStart = timeToMinutes(session.start_time)
    const sessionEnd = timeToMinutes(session.end_time)
    const slotDuration = session.slot_duration_minutes || 15
    const maxCapacity = session.max_patients_per_slot || 1
    const consultationType = session.consultation_type as ConsultationType
    const feePaise =
      consultationType === 'physical'
        ? doctor.physical_fee_paise
        : doctor.telemedicine_fee_paise
    const feeInr = Math.round(feePaise / 100)

    const chamberId = session.chamber_id
    const chamberName = (Array.isArray(session.chambers) ? (session.chambers[0] as any)?.name : (session.chambers as any)?.name) || null

    let currentSlotStart = sessionStart
    while (currentSlotStart + slotDuration <= sessionEnd) {
      const currentSlotEnd = currentSlotStart + slotDuration
      const slotStartTimeStr = minutesToTime(currentSlotStart)
      const slotEndTimeStr = minutesToTime(currentSlotEnd)

      // Check how many appointments the doctor has in this slot
      const existingForDoc = (bookedAppointments || []).filter((apt: any) => {
        const aptStart = timeToMinutes(apt.start_time)
        const aptEnd = timeToMinutes(apt.end_time)
        return Math.max(currentSlotStart, aptStart) < Math.min(currentSlotEnd, aptEnd)
      })

      // Check if another doctor is occupying the physical chamber
      const chamberConflict = (chamberAppointments || []).some((c: any) => {
        if (c.doctor_id === doctorId) return false
        if (c.chamber_id !== chamberId) return false
        const cStart = timeToMinutes(c.start_time)
        const cEnd = timeToMinutes(c.end_time)
        return Math.max(currentSlotStart, cStart) < Math.min(currentSlotEnd, cEnd)
      })

      let status: AvailabilitySlot['status'] = 'available'
      let reason: string | undefined = undefined

      if (isPastDate) {
        status = 'passed'
        reason = 'Past date'
      } else if (isToday && currentSlotStart <= currentMinutesFromMidnight) {
        status = 'passed'
        reason = 'Slot time has passed'
      } else if (existingForDoc.length >= maxCapacity) {
        status = 'booked'
        reason = 'Doctor slot fully booked'
      } else if (chamberConflict) {
        status = 'booked'
        reason = 'Chamber occupied by another specialist'
      }

      slots.push({
        startTime: slotStartTimeStr,
        endTime: slotEndTimeStr,
        consultationType,
        chamberId,
        chamberName,
        status,
        feePaise,
        feeInr,
        bookedCount: existingForDoc.length,
        maxCapacity,
        reason,
      })

      currentSlotStart = currentSlotEnd
    }
  }

  return {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date,
    dayOfWeek,
    isWorkingDay: slots.length > 0,
    hasException: Boolean(activeException),
    exceptionReason: activeException?.reason,
    slots,
  }
}
