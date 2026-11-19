import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const updatePatientSchema = z.object({
  full_name: z.string().min(2).max(150).optional(),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.string().optional().nullable(),
  age_years: z.number().int().min(0).max(130).optional().nullable(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  address_line1: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
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

    // 1. Fetch patient with branch details
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        id, uhid, full_name, phone, email, gender, date_of_birth,
        age_years, blood_group, address_line1, landmark, city,
        district, state, pincode, emergency_contact_name,
        emergency_contact_phone, is_active, created_at, updated_at,
        primary_branch_id,
        branches!patients_primary_branch_id_fkey ( id, name, code, city, phone )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to fetch patient: ${error.message}`, 500)
    }

    if (!patient) {
      throw new ApiError('NOT_FOUND', `Patient with ID '${id}' was not found`, 404)
    }

    // 2. Fetch contacts and consents
    const { data: contacts } = await supabase
      .from('patient_contacts')
      .select('id, contact_type, value, is_primary, is_verified')
      .eq('patient_id', id)

    const { data: consents } = await supabase
      .from('patient_consents')
      .select('id, consent_type, is_granted, granted_at')
      .eq('patient_id', id)

    // 3. Fetch past appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id, appointment_number, consultation_type, scheduled_date,
        start_time, status, fee_paise,
        doctors ( name, specialty, code )
      `)
      .eq('patient_id', id)
      .order('scheduled_date', { ascending: false })
      .limit(10)

    // 4. Fetch diagnostic orders
    const { data: orders } = await supabase
      .from('diagnostic_orders')
      .select(`
        id, order_number, status, fulfillment_type, total_paise,
        payment_status, created_at
      `)
      .eq('patient_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    const result = {
      ...patient,
      branch: patient.branches,
      contacts: contacts || [],
      consents: consents || [],
      appointments: (appointments || []).map((a: any) => ({
        id: a.id,
        appointmentNumber: a.appointment_number,
        consultationType: a.consultation_type,
        scheduledDate: a.scheduled_date,
        startTime: a.start_time,
        status: a.status,
        feeInr: Math.round(a.fee_paise / 100),
        doctorName: a.doctors?.name || 'Consultant',
        specialty: a.doctors?.specialty || 'General',
      })),
      orders: (orders || []).map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        fulfillmentType: o.fulfillment_type,
        totalInr: Math.round(o.total_paise / 100),
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
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
    const parsed = updatePatientSchema.parse(body)

    const admin = createAdminClient()

    // 1. Fetch current patient
    const { data: existing, error: fetchError } = await admin
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      throw new ApiError('NOT_FOUND', `Patient with ID '${id}' was not found`, 404)
    }

    // 2. Prepare update payload
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (parsed.full_name !== undefined) updatePayload.full_name = parsed.full_name.trim()
    if (parsed.phone !== undefined) updatePayload.phone = parsed.phone.trim()
    if (parsed.email !== undefined) updatePayload.email = parsed.email && parsed.email.trim() ? parsed.email.trim() : null
    if (parsed.gender !== undefined) updatePayload.gender = parsed.gender
    if (parsed.date_of_birth !== undefined) updatePayload.date_of_birth = parsed.date_of_birth
    if (parsed.age_years !== undefined) updatePayload.age_years = parsed.age_years
    if (parsed.blood_group !== undefined) updatePayload.blood_group = parsed.blood_group
    if (parsed.address_line1 !== undefined) updatePayload.address_line1 = parsed.address_line1
    if (parsed.landmark !== undefined) updatePayload.landmark = parsed.landmark
    if (parsed.city !== undefined) updatePayload.city = parsed.city
    if (parsed.district !== undefined) updatePayload.district = parsed.district
    if (parsed.state !== undefined) updatePayload.state = parsed.state
    if (parsed.pincode !== undefined) updatePayload.pincode = parsed.pincode
    if (parsed.emergency_contact_name !== undefined) updatePayload.emergency_contact_name = parsed.emergency_contact_name
    if (parsed.emergency_contact_phone !== undefined) updatePayload.emergency_contact_phone = parsed.emergency_contact_phone
    if (parsed.is_active !== undefined) updatePayload.is_active = parsed.is_active

    // 3. Update patient
    const { data: updatedPatient, error: updateError } = await admin
      .from('patients')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updatedPatient) {
      throw new ApiError('DATABASE_ERROR', `Failed to update patient: ${updateError?.message}`, 500)
    }

    // 4. Record Audit Event
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'PATIENT_UPDATED',
      entityType: 'patient',
      entityId: id,
      oldValues: {
        full_name: existing.full_name,
        phone: existing.phone,
        is_active: existing.is_active,
      },
      newValues: updatePayload,
    })

    return successResponse(updatedPatient, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
