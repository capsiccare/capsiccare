export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'waiting'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type ConsultationType = 'physical' | 'telemedicine'

export type BookingSource = 'web' | 'mobile' | 'call_center' | 'reception' | 'partner'

export interface Chamber {
  id: string
  organizationId: string
  branchId: string
  name: string
  roomNumber: string
  floor?: string
  isActive: boolean
  metadata?: Record<string, any>
}

export interface DoctorScheduleSession {
  id: string
  doctorId: string
  branchId: string
  chamberId?: string | null
  chamberName?: string | null
  consultationType: ConsultationType
  dayOfWeek: number // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: string // "HH:MM:SS"
  endTime: string // "HH:MM:SS"
  slotDurationMinutes: number
  maxPatientsPerSlot: number
  isActive: boolean
}

export interface ScheduleException {
  id: string
  doctorId: string
  branchId?: string | null
  exceptionDate: string // "YYYY-MM-DD"
  exceptionType: 'leave' | 'holiday' | 'extended_hours' | 'cancelled'
  startTime?: string | null
  endTime?: string | null
  reason?: string | null
}

export interface AvailabilitySlot {
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
  consultationType: ConsultationType
  chamberId?: string | null
  chamberName?: string | null
  status: 'available' | 'booked' | 'passed' | 'exception'
  feePaise: number
  feeInr: number
  bookedCount: number
  maxCapacity: number
  reason?: string
}

export interface DoctorDayAvailability {
  doctorId: string
  doctorName: string
  specialty: string
  date: string // "YYYY-MM-DD"
  dayOfWeek: number
  isWorkingDay: boolean
  hasException: boolean
  exceptionReason?: string
  slots: AvailabilitySlot[]
}

export interface AppointmentRecord {
  id: string
  appointmentNumber: string
  organizationId: string
  branchId: string
  branchName?: string
  doctorId: string
  doctorName?: string
  doctorSpecialty?: string
  doctorCode?: string
  patientId: string
  patientName?: string
  patientUhid?: string
  patientPhone?: string
  patientGender?: string
  patientAge?: number
  chamberId?: string | null
  chamberName?: string | null
  chamberRoom?: string | null
  consultationType: ConsultationType
  scheduledDate: string
  startTime: string
  endTime: string
  feePaise: number
  feeInr: number
  status: AppointmentStatus
  bookingSource: BookingSource
  tokenNumber: number | null
  chiefComplaint?: string | null
  cancellationReason?: string | null
  checkInTime?: string | null
  consultationStartTime?: string | null
  consultationEndTime?: string | null
  createdAt: string
  updatedAt: string
}
