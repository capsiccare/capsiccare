import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const publicAppointmentSchema = z.object({
  patient_name: z.string().min(2, 'Patient full name is required').max(150),
  patient_phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  patient_age: z.coerce.number().min(0).max(125).optional().nullable(),
  patient_gender: z.enum(['male', 'female', 'other']).default('male'),
  doctor_id: z.string().optional().nullable(),
  doctor_slug: z.string().optional().nullable(),
  doctor_name: z.string().optional().nullable(),
  consultation_type: z.enum(['physical', 'telemedicine']).default('physical'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD required'),
  slot: z.string().optional().nullable(),
  symptoms: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const parsed = publicAppointmentSchema.parse(body)
    const admin = createAdminClient()

    // 1. Fetch organization & default branch
    const { data: org, error: orgErr } = await admin.from('organizations').select('id').limit(1).single()
    if (orgErr || !org) throw new ApiError('INTERNAL_ERROR', 'Organization configuration not found', 500)

    const { data: branch, error: branchErr } = await admin.from('branches').select('id, name, address, phone').limit(1).single()
    if (branchErr || !branch) throw new ApiError('INTERNAL_ERROR', 'Branch configuration not found', 500)

    // 2. Resolve Doctor
    let doctor: any = null
    if (parsed.doctor_id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.doctor_id)
      if (isUuid) {
        const { data: docById } = await admin
          .from('doctors')
          .select('id, name, code, specialty, qualifications, physical_fee_paise, telemedicine_fee_paise')
          .eq('id', parsed.doctor_id)
          .maybeSingle()
        doctor = docById
      } else {
        const { data: docBySlug } = await admin
          .from('doctors')
          .select('id, name, code, specialty, qualifications, physical_fee_paise, telemedicine_fee_paise')
          .or(`slug.eq.${parsed.doctor_id},code.eq.${parsed.doctor_id}`)
          .maybeSingle()
        doctor = docBySlug
      }
    }

    if (!doctor && parsed.doctor_slug) {
      const { data: docBySlug } = await admin
        .from('doctors')
        .select('id, name, code, specialty, qualifications, physical_fee_paise, telemedicine_fee_paise')
        .eq('slug', parsed.doctor_slug)
        .maybeSingle()
      doctor = docBySlug
    }

    if (!doctor && parsed.doctor_name) {
      const cleanName = parsed.doctor_name.replace(/^(Dr\.|Dr\s+|Doctor\s+)/i, '').trim()
      const { data: docByName } = await admin
        .from('doctors')
        .select('id, name, code, specialty, qualifications, physical_fee_paise, telemedicine_fee_paise')
        .ilike('name', `%${cleanName}%`)
        .maybeSingle()
      doctor = docByName
    }

    if (!doctor) {
      const { data: fallbackDoc } = await admin
        .from('doctors')
        .select('id, name, code, specialty, qualifications, physical_fee_paise, telemedicine_fee_paise')
        .limit(1)
        .single()
      doctor = fallbackDoc
    }

    if (!doctor) {
      throw new ApiError('NOT_FOUND', 'No active doctor found for appointment', 404)
    }

    // 3. Find or auto-register Patient
    const cleanPhone = parsed.patient_phone.trim()
    const { data: existingPatient } = await admin
      .from('patients')
      .select('id, uhid, full_name, phone')
      .eq('phone', cleanPhone)
      .maybeSingle()

    let patientId: string
    let patientUhid: string

    if (existingPatient) {
      patientId = existingPatient.id
      patientUhid = existingPatient.uhid
    } else {
      const year = new Date().getFullYear()
      const randNum = Math.floor(100000 + Math.random() * 900000)
      patientUhid = `CAP-${year}-${randNum}`

      const { data: newPatient, error: patErr } = await admin
        .from('patients')
        .insert({
          organization_id: org.id,
          uhid: patientUhid,
          full_name: parsed.patient_name.trim(),
          phone: cleanPhone,
          gender: parsed.patient_gender,
          age_years: parsed.patient_age || null,
          city: 'Howrah',
          district: 'Howrah',
          state: 'West Bengal',
          primary_branch_id: branch.id,
          is_active: true,
        })
        .select('id, uhid')
        .single()

      if (patErr || !newPatient) {
        throw new ApiError('DATABASE_ERROR', `Failed to register patient: ${patErr?.message}`, 500)
      }
      patientId = newPatient.id
      patientUhid = newPatient.uhid

      // Initialize portal link pin
      const pin = Math.floor(100000 + Math.random() * 900000).toString()
      const pinHash = crypto.createHash('sha256').update(pin).digest('hex')
      await admin.from('patient_portal_links').insert({
        patient_id: patientId,
        phone: cleanPhone,
        portal_access_pin_hash: pinHash,
        is_active: true,
      })
    }

    // 4. Calculate sequential token number for this doctor on this date
    const { data: latestToken } = await admin
      .from('appointments')
      .select('token_number')
      .eq('doctor_id', doctor.id)
      .eq('scheduled_date', parsed.scheduled_date)
      .order('token_number', { ascending: false })
      .limit(1)

    const nextToken = (latestToken && latestToken[0]?.token_number) ? latestToken[0].token_number + 1 : 1

    // 5. Generate appointment number: APT-YYYYMMDD-XXXX
    const cleanDate = parsed.scheduled_date.replace(/-/g, '')
    const randSuffix = Math.floor(1000 + Math.random() * 9000)
    const appointmentNumber = `APT-${cleanDate}-${randSuffix}`

    const feePaise = parsed.consultation_type === 'physical'
      ? (doctor.physical_fee_paise || 40000)
      : (doctor.telemedicine_fee_paise || 40000)

    // 6. Calculate non-overlapping 15-minute slot based on sequential token number
    const startMinutes = 10 * 60 + ((nextToken - 1) * 15)
    const endMinutes = startMinutes + 15

    const startHour = Math.floor(startMinutes / 60).toString().padStart(2, '0')
    const startMin = (startMinutes % 60).toString().padStart(2, '0')
    const endHour = Math.floor(endMinutes / 60).toString().padStart(2, '0')
    const endMin = (endMinutes % 60).toString().padStart(2, '0')

    const startTime = `${startHour}:${startMin}:00`
    const endTime = `${endHour}:${endMin}:00`

    const { data: newAppointment, error: aptErr } = await admin
      .from('appointments')
      .insert({
        organization_id: org.id,
        branch_id: branch.id,
        patient_id: patientId,
        doctor_id: doctor.id,
        appointment_number: appointmentNumber,
        consultation_type: parsed.consultation_type,
        scheduled_date: parsed.scheduled_date,
        start_time: startTime,
        end_time: endTime,
        fee_paise: feePaise,
        status: 'confirmed',
        booking_source: 'web',
        token_number: nextToken,
        chief_complaint: parsed.symptoms?.trim() || 'Online Web Consultation Booking',
      })
      .select()
      .single()

    if (aptErr || !newAppointment) {
      throw new ApiError('DATABASE_ERROR', `Failed to create appointment: ${aptErr?.message}`, 500)
    }

    // 7. Notification Queue
    await admin.from('communication_messages').insert({
      organization_id: org.id,
      patient_id: patientId,
      channel: 'whatsapp',
      recipient: cleanPhone,
      message_body: `Dear ${parsed.patient_name.trim()}, your consultation with ${doctor.name} on ${parsed.scheduled_date} at ${startTime.slice(0, 5)} (Token #${nextToken}) is confirmed. Appointment Ref: ${appointmentNumber}. Center: ${branch.name}.`,
      status: 'queued',
      related_entity_type: 'appointment',
      related_entity_id: newAppointment.id,
    })

    // 8. Audit log
    await recordAuditEvent({
      userId: patientId,
      organizationId: org.id,
      action: 'PUBLIC_APPOINTMENT_BOOKED',
      entityType: 'appointments',
      entityId: newAppointment.id,
      newValues: {
        appointmentNumber,
        tokenNumber: nextToken,
        uhid: patientUhid,
        doctorName: doctor.name,
      },
    })

    return successResponse(
      {
        appointmentId: newAppointment.id,
        appointmentNumber,
        tokenNumber: nextToken,
        uhid: patientUhid,
        patientName: parsed.patient_name.trim(),
        patientPhone: cleanPhone,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        consultationType: parsed.consultation_type,
        scheduledDate: parsed.scheduled_date,
        startTime: '10:00 AM',
        feeInr: Math.round(feePaise / 100),
        branchName: branch.name,
        branchAddress: branch.address,
        appointment: {
          id: newAppointment.id,
          appointment_number: appointmentNumber,
          token_number: nextToken,
          scheduled_date: parsed.scheduled_date,
          consultation_type: parsed.consultation_type,
          fee_inr: Math.round(feePaise / 100),
        },
        patient: {
          id: patientId,
          uhid: patientUhid,
          name: parsed.patient_name.trim(),
          phone: cleanPhone,
        },
        message: 'Doctor consultation booked and confirmed successfully.',
      },
      undefined,
      201,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
