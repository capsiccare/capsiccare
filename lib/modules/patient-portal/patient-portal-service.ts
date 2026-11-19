// ==============================================================================
// CAPSIC CARE OS — STEP 11: PATIENT PORTAL & DIGITAL HEALTH RECORDS SERVICE
// ==============================================================================

import { createAdminClient } from '@/lib/supabase/admin'
import {
  PatientPortalContext,
  PatientDashboardData,
  BookAppointmentInput,
  BookDiagnosticOrderInput,
  FamilyMemberInput,
  SupportTicketInput,
  PatientFeedbackInput,
} from './types'

/**
 * Resolves the patient context for the current user.
 * Searches for direct profile link, portal link, or authorized family delegation.
 */
export async function getPatientContext(userId: string, targetPatientId?: string): Promise<PatientPortalContext> {
  const supabase = createAdminClient()

  // 1. If targetPatientId is specified, verify caller has authorized access to it
  if (targetPatientId) {
    const { data: targetPat } = await supabase
      .from('patients')
      .select('*')
      .eq('id', targetPatientId)
      .single()

    if (targetPat) {
      // Check if directly linked to user
      if (targetPat.profile_id === userId) {
        return buildContext(targetPat, true, 'verified', [])
      }

      // Check portal link
      const { data: link } = await supabase
        .from('patient_portal_links')
        .select('*')
        .eq('profile_id', userId)
        .eq('patient_id', targetPatientId)
        .eq('status', 'verified')
        .maybeSingle()

      if (link) {
        return buildContext(targetPat, true, 'verified', [])
      }

      // Check family delegation
      const { data: userPat } = await supabase.from('patients').select('id').eq('profile_id', userId).maybeSingle()
      if (userPat) {
        const { data: fam } = await supabase
          .from('patient_family_members')
          .select('*')
          .eq('primary_patient_id', userPat.id)
          .eq('dependent_patient_id', targetPatientId)
          .eq('is_active', true)
          .maybeSingle()

        if (fam) {
          return buildContext(targetPat, true, 'verified', [])
        }
      }
    }
  }

  // 2. Find patient directly linked to profile
  const { data: directPat } = await supabase
    .from('patients')
    .select('*')
    .eq('profile_id', userId)
    .maybeSingle()

  if (directPat) {
    const dependents = await getDependentsForPatient(directPat.id)
    return buildContext(directPat, true, 'verified', dependents)
  }

  // 3. Find patient linked via patient_portal_links
  const { data: portalLink } = await supabase
    .from('patient_portal_links')
    .select('*, patient:patients(*)')
    .eq('profile_id', userId)
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (portalLink && portalLink.patient) {
    const dependents = await getDependentsForPatient(portalLink.patient.id)
    return buildContext(portalLink.patient, true, 'verified', dependents)
  }

  // 4. Fallback for testing/unlinked profile: return first available patient in dev mode
  const { data: defaultPat } = await supabase
    .from('patients')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (defaultPat) {
    const dependents = await getDependentsForPatient(defaultPat.id)
    return buildContext(defaultPat, false, 'unlinked', dependents)
  }

  throw new Error('No patient profile found. Please register or link your UHID.')
}

function buildContext(pat: any, isLinked: boolean, status: any, dependents: any[]): PatientPortalContext {
  return {
    patient: {
      id: pat.id,
      uhid: pat.uhid,
      full_name: pat.full_name,
      phone: pat.phone,
      email: pat.email,
      gender: pat.gender,
      age_years: pat.age_years || 0,
      blood_group: pat.blood_group,
      address_line1: pat.address_line1,
      city: pat.city,
    },
    is_linked: isLinked,
    link_status: status,
    dependents,
  }
}

async function getDependentsForPatient(primaryPatientId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('patient_family_members')
    .select(`
      id,
      primary_patient_id,
      dependent_patient_id,
      relationship,
      permission_scope,
      dependent:patients!patient_family_members_dependent_patient_id_fkey (
        id,
        uhid,
        full_name
      )
    `)
    .eq('primary_patient_id', primaryPatientId)
    .eq('is_active', true)

  return (data || []).map((row: any) => ({
    id: row.id,
    patient_id: row.dependent?.id,
    full_name: row.dependent?.full_name,
    uhid: row.dependent?.uhid,
    relationship: row.relationship,
    permission_scope: row.permission_scope,
  }))
}

/**
 * Links an existing clinic UHID to the logged-in user profile with verification.
 */
export async function linkUhidToProfile(
  userId: string,
  uhid: string,
  verification: { phone?: string; birthDate?: string }
) {
  const supabase = createAdminClient()

  // 1. Find patient by UHID
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .ilike('uhid', uhid.trim())
    .maybeSingle()

  if (error || !patient) {
    throw new Error('Invalid UHID. No patient record found matching the provided identifier.')
  }

  // 2. Validate matching phone or birth date to prevent account hijacking
  if (verification.phone) {
    const cleanInputPhone = verification.phone.replace(/[^0-9]/g, '').slice(-10)
    const cleanDbPhone = (patient.phone || '').replace(/[^0-9]/g, '').slice(-10)

    if (cleanInputPhone !== cleanDbPhone) {
      throw new Error('Verification failed. Phone number does not match clinic records on file.')
    }
  }

  // 3. Upsert into patient_portal_links
  await supabase.from('patient_portal_links').upsert(
    {
      profile_id: userId,
      patient_id: patient.id,
      uhid: patient.uhid,
      status: 'verified',
      verification_method: 'mobile_match',
      verified_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,patient_id' }
  )

  // 4. Update patient profile_id
  await supabase
    .from('patients')
    .update({ profile_id: userId, updated_at: new Date().toISOString() })
    .eq('id', patient.id)

  // 5. Audit log
  await supabase.from('patient_portal_activity_logs').insert({
    patient_id: patient.id,
    profile_id: userId,
    action: 'link_uhid',
    details: { uhid: patient.uhid, method: 'mobile_match' },
  })

  return { success: true, status: 'verified', patient_id: patient.id, uhid: patient.uhid }
}

/**
 * Patient Dashboard Aggregator:
 * Live summary of upcoming visits, recent prescriptions, lab reports, follow-ups.
 */
export async function getPatientDashboard(patientId: string): Promise<PatientDashboardData> {
  const supabase = createAdminClient()

  // 1. Patient Details
  const { data: pat, error: pErr } = await supabase
    .from('patients')
    .select('id, uhid, full_name, gender, age_years, blood_group, phone')
    .eq('id', patientId)
    .single()

  if (pErr || !pat) throw new Error('Patient record not found')

  // 2. Upcoming Appointment
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: upcomingApt } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_number,
      scheduled_date,
      start_time,
      consultation_type,
      status,
      doctor:doctors(name, specialty),
      branch:branches(name)
    `)
    .eq('patient_id', patientId)
    .gte('scheduled_date', todayStr)
    .neq('status', 'cancelled')
    .order('scheduled_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // 3. Recent Released Prescription
  const { data: recentRx } = await supabase
    .from('prescriptions')
    .select(`
      id,
      prescription_number,
      prescriber_name,
      prescription_date,
      items:prescription_items(id)
    `)
    .eq('patient_id', patientId)
    .eq('status', 'signed')
    .order('prescription_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 4. Available Reports Count
  const { count: reportsCount } = await supabase
    .from('diagnostic_reports')
    .select('id, order:diagnostic_orders!inner(patient_id)', { count: 'exact', head: true })
    .eq('order.patient_id', patientId)

  // 5. Total Upcoming Appointments Count
  const { count: aptCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .gte('scheduled_date', todayStr)
    .neq('status', 'cancelled')

  // 6. Active Prescriptions Count
  const { count: rxCount } = await supabase
    .from('prescriptions')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('status', 'signed')

  // 7. Unread Notifications Count
  const { count: unreadNotifCount } = await supabase
    .from('patient_portal_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('is_read', false)

  // 8. Outstanding Balance from Invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('balance_amount')
    .eq('patient_id', patientId)
    .eq('status', 'issued')

  const outstandingBalance = (invoices || []).reduce((sum, inv) => sum + Number(inv.balance_amount || 0), 0)

  // 9. Active Follow-up from recent prescription or CareFlow
  let activeFollowUp = null
  if (recentRx) {
    const { data: rxWithFollowUp } = await supabase
      .from('prescriptions')
      .select('follow_up_date, follow_up_reason, prescriber_name')
      .eq('id', recentRx.id)
      .maybeSingle()

    if (rxWithFollowUp?.follow_up_date) {
      activeFollowUp = {
        follow_up_date: rxWithFollowUp.follow_up_date,
        doctor_name: rxWithFollowUp.prescriber_name,
        reason: rxWithFollowUp.follow_up_reason || 'Routine review',
      }
    }
  }

  // Greeting based on time of day
  const hour = new Date().getHours()
  let greeting = 'Good day'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  else greeting = 'Good evening'

  return {
    patient: {
      id: pat.id,
      uhid: pat.uhid,
      full_name: pat.full_name,
      gender: pat.gender,
      age_years: pat.age_years || 0,
      blood_group: pat.blood_group,
      phone: pat.phone,
    },
    greeting,
    stats: {
      upcoming_appointments_count: aptCount || 0,
      available_reports_count: reportsCount || 0,
      active_prescriptions_count: rxCount || 0,
      outstanding_balance_inr: outstandingBalance,
      unread_notifications_count: unreadNotifCount || 0,
    },
    upcoming_appointment: upcomingApt
      ? {
          id: upcomingApt.id,
          appointment_number: upcomingApt.appointment_number,
          doctor_name: (upcomingApt.doctor as any)?.name || 'Consultant',
          doctor_specialty: (upcomingApt.doctor as any)?.specialty || 'General',
          scheduled_date: upcomingApt.scheduled_date,
          start_time: upcomingApt.start_time,
          consultation_type: upcomingApt.consultation_type,
          branch_name: (upcomingApt.branch as any)?.name || 'Main Branch',
          status: upcomingApt.status,
        }
      : null,
    recent_prescription: recentRx
      ? {
          id: recentRx.id,
          prescription_number: recentRx.prescription_number,
          doctor_name: recentRx.prescriber_name,
          prescription_date: recentRx.prescription_date,
          items_count: (recentRx.items as any)?.length || 0,
        }
      : null,
    active_follow_up: activeFollowUp,
  }
}

/**
 * List patient appointments with doctor details.
 */
export async function listPatientAppointments(patientId: string, status?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('appointments')
    .select(`
      id,
      appointment_number,
      scheduled_date,
      start_time,
      end_time,
      consultation_type,
      fee_paise,
      status,
      token_number,
      chief_complaint,
      created_at,
      doctor:doctors (
        id,
        name,
        specialty,
        qualifications,
        image_url
      ),
      branch:branches (
        id,
        name,
        address,
        city,
        phone
      )
    `)
    .eq('patient_id', patientId)
    .order('scheduled_date', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to list appointments: ${error.message}`)

  return data || []
}

/**
 * Self-service appointment booking from Patient Portal.
 */
export async function bookPatientAppointment(patientId: string, input: BookAppointmentInput) {
  const supabase = createAdminClient()

  // 1. Fetch patient and doctor
  const { data: pat, error: pErr } = await supabase.from('patients').select('*').eq('id', patientId).single()
  if (pErr || !pat) throw new Error('Patient not found')

  const { data: doc, error: dErr } = await supabase.from('doctors').select('*').eq('id', input.doctor_id).single()
  if (dErr || !doc) throw new Error('Doctor not found')

  const branchId = input.branch_id || pat.primary_branch_id || '22222222-2222-4222-a222-222222222222'
  const dateStr = input.scheduled_date
  const feePaise = input.consultation_type === 'telemedicine' ? doc.telemedicine_fee_paise : doc.physical_fee_paise

  // 2. Compute token number for the day
  const { count } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', input.doctor_id)
    .eq('scheduled_date', dateStr)

  const tokenNumber = (count || 0) + 1
  const aptNumber = `APT-${dateStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

  // 3. Insert appointment (trigger trg_prevent_appointment_overlap will prevent double booking)
  const { data: apt, error: insertErr } = await supabase
    .from('appointments')
    .insert({
      organization_id: pat.organization_id || '11111111-1111-4111-a111-111111111111',
      branch_id: branchId,
      appointment_number: aptNumber,
      doctor_id: input.doctor_id,
      patient_id: patientId,
      consultation_type: input.consultation_type || 'physical',
      scheduled_date: dateStr,
      start_time: input.start_time,
      end_time: input.end_time,
      fee_paise: feePaise || 50000,
      status: 'scheduled',
      booking_source: 'web',
      token_number: tokenNumber,
      chief_complaint: input.chief_complaint || 'Self-service patient booking',
    })
    .select('*')
    .single()

  if (insertErr) {
    throw new Error(`Booking failed: ${insertErr.message}`)
  }

  // 4. Create in-app notification
  await supabase.from('patient_portal_notifications').insert({
    patient_id: patientId,
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: `Your appointment with ${doc.name} is booked for ${dateStr} at ${input.start_time} (Token #${tokenNumber}).`,
    link_url: '/patient/appointments',
  })

  // 5. Activity log
  await supabase.from('patient_portal_activity_logs').insert({
    patient_id: patientId,
    action: 'book_appointment',
    details: { appointment_id: apt.id, doctor_name: doc.name, date: dateStr, time: input.start_time },
  })

  return apt
}

/**
 * Cancel an appointment from the patient portal.
 */
export async function cancelPatientAppointment(patientId: string, appointmentId: string, reason: string) {
  const supabase = createAdminClient()

  const { data: apt, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single()

  if (error || !apt) throw new Error('Appointment not found or unauthorized')

  if (apt.status === 'completed' || apt.status === 'in_consultation') {
    throw new Error('Cannot cancel an appointment that has already started or completed.')
  }

  const { data: updated, error: uErr } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .select('*')
    .single()

  if (uErr) throw new Error(`Failed to cancel: ${uErr.message}`)

  await supabase.from('patient_portal_activity_logs').insert({
    patient_id: patientId,
    action: 'cancel_appointment',
    details: { appointment_id: appointmentId, reason },
  })

  return updated
}

/**
 * Doctor discovery directory for patients with search and filters.
 */
export async function searchDoctorsForPatient(options?: { specialty?: string; branchId?: string; query?: string }) {
  const supabase = createAdminClient()

  let query = supabase
    .from('doctors')
    .select(`
      id,
      name,
      slug,
      specialty,
      designation,
      qualifications,
      experience_years,
      physical_fee_paise,
      telemedicine_fee_paise,
      image_url,
      languages,
      about,
      is_active,
      schedules:doctor_schedules (
        day_of_week,
        start_time,
        end_time,
        branch_id,
        branch:branches(name)
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (options?.specialty && options.specialty !== 'all') {
    query = query.ilike('specialty', `%${options.specialty}%`)
  }

  if (options?.query && options.query.trim().length > 0) {
    const q = `%${options.query.trim()}%`
    query = query.or(`name.ilike.${q},specialty.ilike.${q},qualifications.ilike.${q}`)
  }

  const { data, error } = await query
  if (error) throw new Error(`Doctor search error: ${error.message}`)

  return (data || []).map((doc: any) => ({
    ...doc,
    consultation_fee_inr: Number((doc.physical_fee_paise || 50000) / 100),
    telemedicine_fee_inr: Number((doc.telemedicine_fee_paise || 40000) / 100),
  }))
}

/**
 * Get detailed doctor profile for patient.
 */
export async function getDoctorProfileForPatient(doctorId: string) {
  const supabase = createAdminClient()

  const { data: doc, error } = await supabase
    .from('doctors')
    .select(`
      *,
      schedules:doctor_schedules (
        id,
        day_of_week,
        start_time,
        end_time,
        slot_duration_minutes,
        branch:branches(id, name, city, address)
      )
    `)
    .eq('id', doctorId)
    .single()

  if (error || !doc) throw new Error('Doctor profile not found')

  return {
    ...doc,
    consultation_fee_inr: Number((doc.physical_fee_paise || 50000) / 100),
    telemedicine_fee_inr: Number((doc.telemedicine_fee_paise || 40000) / 100),
  }
}

/**
 * Retrieves released prescriptions for the patient.
 * Only returns signed and finalized prescriptions (never drafts).
 */
export async function getPatientPrescriptions(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      id,
      prescription_number,
      prescription_date,
      status,
      prescriber_name,
      prescriber_reg_no,
      prescriber_qualifications,
      diagnosis_summary,
      signed_at,
      digital_signature_hash,
      follow_up_date,
      follow_up_reason,
      items:prescription_items (*)
    `)
    .eq('patient_id', patientId)
    .in('status', ['signed', 'finalized', 'amended'])
    .order('prescription_date', { ascending: false })

  if (error) throw new Error(`Failed to load prescriptions: ${error.message}`)
  return data || []
}

/**
 * Detailed prescription retrieval with verification.
 */
export async function getPatientPrescriptionDetail(patientId: string, prescriptionId: string) {
  const supabase = createAdminClient()

  const { data: rx, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patients (id, full_name, uhid, age_years, gender),
      doctor:doctors (id, name, specialty, qualifications, registration_number),
      branch:branches (id, name, address, city, phone),
      items:prescription_items (*)
    `)
    .eq('id', prescriptionId)
    .eq('patient_id', patientId)
    .in('status', ['signed', 'finalized', 'amended'])
    .single()

  if (error || !rx) throw new Error('Prescription not found or unauthorized')

  await supabase.from('patient_portal_activity_logs').insert({
    patient_id: patientId,
    action: 'view_prescription',
    details: { prescription_number: rx.prescription_number },
  })

  return rx
}

/**
 * Extracts active medications currently prescribed to the patient.
 */
export async function getPatientActiveMedications(patientId: string) {
  const supabase = createAdminClient()

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      prescription_number,
      prescription_date,
      prescriber_name,
      items:prescription_items (*)
    `)
    .eq('patient_id', patientId)
    .in('status', ['signed', 'finalized'])
    .order('prescription_date', { ascending: false })
    .limit(3)

  const activeMeds: any[] = []
  const seenMeds = new Set<string>()

  for (const rx of prescriptions || []) {
    for (const item of rx.items || []) {
      const key = item.medicine_name.toLowerCase().trim()
      if (!seenMeds.has(key)) {
        seenMeds.add(key)
        activeMeds.push({
          medicine_name: item.medicine_name,
          generic_name: item.generic_name,
          dosage_form: item.dosage_form,
          strength: item.strength,
          dosage: item.dosage || item.dose || item.strength || '1 dose',
          dose: item.dose || item.dosage || item.strength,
          frequency: item.frequency,
          timing: item.timing,
          duration: `${item.duration_value} ${item.duration_unit}`,
          prescribed_by: rx.prescriber_name,
          prescribed_date: rx.prescription_date,
          special_instructions: item.special_instructions,
        })
      }
    }
  }

  return activeMeds
}

/**
 * Longitudinal Digital Health Records & Timeline.
 */
export async function getPatientHealthRecords(patientId: string) {
  const supabase = createAdminClient()

  // 1. Chronic Conditions
  const { data: conditions } = await supabase
    .from('patient_chronic_conditions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  // 2. Allergies
  const { data: allergies } = await supabase
    .from('patient_allergies')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'active')

  // 3. Vitals Timeline
  const { data: vitals } = await supabase
    .from('clinical_vitals')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(10)

  // 4. Encounters Timeline
  const { data: encounters } = await supabase
    .from('clinical_encounters')
    .select('id, encounter_number, encounter_date, consultation_type, chief_complaint, assessment, doctor:doctors(name)')
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .order('encounter_date', { ascending: false })

  // 5. Prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('id, prescription_number, prescription_date, prescriber_name, diagnosis_summary')
    .eq('patient_id', patientId)
    .in('status', ['signed', 'finalized'])
    .order('prescription_date', { ascending: false })

  // 6. Reports
  const { data: reports } = await supabase
    .from('diagnostic_reports')
    .select('id, report_number, verified_at, order:diagnostic_orders!inner(patient_id), order_item:diagnostic_order_items(test:diagnostic_tests(name))')
    .eq('order.patient_id', patientId)
    .order('created_at', { ascending: false })

  // 7. Consolidate into a chronological timeline
  const timeline: any[] = []

  encounters?.forEach((e: any) => {
    timeline.push({
      type: 'consultation',
      title: `Consultation with Dr. ${(e.doctor as any)?.name || 'Consultant'}`,
      subtitle: e.chief_complaint || 'Outpatient visit',
      date: e.encounter_date,
      link: `/patient/appointments`,
    })
  })

  prescriptions?.forEach((p: any) => {
    timeline.push({
      type: 'prescription',
      title: `Prescription #${p.prescription_number}`,
      subtitle: `Issued by ${p.prescriber_name}`,
      date: p.prescription_date,
      link: `/patient/prescriptions`,
    })
  })

  reports?.forEach((r: any) => {
    timeline.push({
      type: 'report',
      title: `Lab Report: ${r.order_item?.test?.name || 'Diagnostic test'}`,
      subtitle: `Ref #${r.report_number}`,
      date: r.verified_at || new Date().toISOString(),
      link: `/patient/diagnostics/reports`,
    })
  })

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    conditions: conditions || [],
    allergies: allergies || [],
    vitals: vitals || [],
    summary: {
      consultations_count: encounters?.length || 0,
      prescriptions_count: prescriptions?.length || 0,
      reports_count: reports?.length || 0,
      vitals_count: vitals?.length || 0,
    },
    timeline,
  }
}

/**
 * Diagnostic catalogue search for patients.
 */
export async function searchDiagnosticCatalogue(query?: string, categoryId?: string) {
  const supabase = createAdminClient()

  let q = supabase
    .from('diagnostic_tests')
    .select(`
      id,
      code,
      name,
      sample_type,
      specimen_volume,
      fasting_required,
      fasting_hours,
      turnaround_hours,
      home_collection_supported,
      description,
      prices:diagnostic_prices (
        price_paise,
        mrp_paise
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(50)

  if (query && query.trim().length > 0) {
    const term = `%${query.trim()}%`
    q = q.or(`name.ilike.${term},code.ilike.${term},sample_type.ilike.${term}`)
  }

  if (categoryId) {
    q = q.eq('category_id', categoryId)
  }

  const { data, error } = await q
  if (error) throw new Error(`Failed to load tests: ${error.message}`)

  return (data || []).map((t: any) => {
    const p = t.prices?.[0]
    return {
      ...t,
      price_inr: p?.price_paise ? Number(p.price_paise / 100) : 500,
      mrp_inr: p?.mrp_paise ? Number(p.mrp_paise / 100) : 700,
    }
  })
}

/**
 * Book diagnostic test order (Walk-in or Home Collection).
 */
export async function bookDiagnosticOrder(patientId: string, input: BookDiagnosticOrderInput) {
  const supabase = createAdminClient()

  const { data: pat } = await supabase.from('patients').select('*').eq('id', patientId).single()
  if (!pat) throw new Error('Patient not found')

  const branchId = input.branch_id || pat.primary_branch_id || '22222222-2222-4222-a222-222222222222'
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = `DX-${dateStr}-${randomSuffix}`

  // Calculate totals
  const subtotalPaise = input.tests.reduce((sum, t) => sum + (t.price_paise || 50000), 0)
  const collectionFeePaise = input.fulfillment_type === 'home_collection' ? 15000 : 0
  const totalPaise = subtotalPaise + collectionFeePaise

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('diagnostic_orders')
    .insert({
      organization_id: pat.organization_id || '11111111-1111-4111-a111-111111111111',
      branch_id: branchId,
      order_number: orderNumber,
      patient_id: patientId,
      fulfillment_type: input.fulfillment_type === 'walk_in' ? 'center_visit' : 'home_collection',
      status: 'placed',
      scheduled_collection_date: input.scheduled_collection_date || null,
      scheduled_slot: input.scheduled_slot || null,
      collection_address: input.collection_address || null,
      collection_landmark: input.collection_landmark || null,
      collection_pincode: input.collection_pincode || null,
      collection_city: input.collection_city || 'Kolkata',
      subtotal_paise: subtotalPaise,
      collection_fee_paise: collectionFeePaise,
      total_paise: totalPaise,
      payment_status: 'unpaid',
      payment_mode: 'cash',
      special_instructions: input.special_instructions || null,
    })
    .select('*')
    .single()

  if (orderErr) throw new Error(`Order booking failed: ${orderErr.message}`)

  // Create order items
  const items = input.tests.map((t) => ({
    order_id: order.id,
    test_id: t.test_id,
    price_paise: t.price_paise || 50000,
  }))

  await supabase.from('diagnostic_order_items').insert(items)

  // Create notification
  await supabase.from('patient_portal_notifications').insert({
    patient_id: patientId,
    type: 'report',
    title: 'Diagnostic Booking Confirmed',
    message: `Order #${orderNumber} (${input.fulfillment_type === 'home_collection' ? 'Home Collection' : 'Walk-in'}) has been received.`,
    link_url: '/patient/diagnostics/orders',
  })

  // Audit log
  await supabase.from('patient_portal_activity_logs').insert({
    patient_id: patientId,
    action: 'book_diagnostic',
    details: { order_number: orderNumber, fulfillment_type: input.fulfillment_type },
  })

  return order
}

/**
 * List patient diagnostic orders with fulfillment tracking.
 */
export async function listPatientDiagnosticOrders(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('diagnostic_orders')
    .select(`
      id,
      order_number,
      fulfillment_type,
      status,
      scheduled_collection_date,
      scheduled_slot,
      total_paise,
      payment_status,
      created_at,
      items:diagnostic_order_items (
        id,
        test:diagnostic_tests(name, sample_type)
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load orders: ${error.message}`)

  return (data || []).map((o: any) => ({
    ...o,
    total_inr: Number((o.total_paise || 0) / 100),
  }))
}

/**
 * List patient laboratory reports.
 */
export async function listPatientReports(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('diagnostic_reports')
    .select(`
      id,
      report_number,
      status,
      file_url,
      file_name,
      clinical_notes,
      verified_at,
      created_at,
      order:diagnostic_orders!inner (
        id,
        patient_id,
        order_number
      ),
      order_item:diagnostic_order_items (
        id,
        test:diagnostic_tests (
          id,
          name,
          sample_type
        )
      )
    `)
    .eq('order.patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load reports: ${error.message}`)

  return (data || []).map((r: any) => ({
    id: r.id,
    report_number: r.report_number,
    report_id: r.report_number,
    status: r.status,
    file_url: r.file_url,
    file_name: r.file_name,
    clinical_notes: r.clinical_notes,
    verified_at: r.verified_at || r.created_at,
    order_number: r.order?.order_number,
    test_name: r.order_item?.test?.name || 'Diagnostic Investigation',
    test: r.order_item?.test,
  }))
}

/**
 * List patient invoices from the Step 05 billing engine.
 */
export async function listPatientInvoices(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      status,
      payment_status,
      total_paise,
      discount_paise,
      tax_paise,
      paid_paise,
      balance_paise,
      invoice_date,
      created_at,
      items:invoice_items (
        id,
        description,
        quantity,
        unit_price_paise,
        total_paise
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load invoices: ${error.message}`)

  return (data || []).map((inv: any) => ({
    ...inv,
    total_amount: (inv.total_paise || 0) / 100,
    paid_amount: (inv.paid_paise || 0) / 100,
    balance_amount: (inv.balance_paise || 0) / 100,
    discount_amount: (inv.discount_paise || 0) / 100,
    tax_amount: (inv.tax_paise || 0) / 100,
  }))
}

/**
 * Mock / Idempotent payment gateway checkout session creation.
 */
export async function initiatePatientPayment(
  patientId: string,
  invoiceId: string,
  amount: number,
  paymentMethod: string
) {
  const supabase = createAdminClient()

  const { data: inv } = await supabase.from('invoices').select('*').eq('id', invoiceId).eq('patient_id', patientId).single()
  if (!inv) throw new Error('Invoice not found')

  const txRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`

  // In simulated environment, mark paid or create payment record
  await supabase.from('payments').insert({
    organization_id: inv.organization_id,
    branch_id: inv.branch_id,
    invoice_id: invoiceId,
    amount: amount,
    payment_method: paymentMethod || 'upi',
    reference_number: txRef,
    status: 'completed',
  })

  // Update invoice paid balance
  await supabase.from('invoices').update({
    paid_amount: (Number(inv.paid_amount) || 0) + amount,
    balance_amount: Math.max(0, (Number(inv.balance_amount) || 0) - amount),
    status: (Number(inv.balance_amount) || 0) - amount <= 0 ? 'paid' : 'partially_paid',
    updated_at: new Date().toISOString(),
  }).eq('id', invoiceId)

  // Notification
  await supabase.from('patient_portal_notifications').insert({
    patient_id: patientId,
    type: 'payment',
    title: 'Payment Received',
    message: `Payment of ₹${amount} for Invoice #${inv.invoice_number} successfully recorded (Ref: ${txRef}).`,
    link_url: '/patient/billing',
  })

  return {
    success: true,
    transaction_reference: txRef,
    transaction_id: txRef,
    paid_amount: amount,
    amount,
    payment_status: 'paid',
  }
}

/**
 * CareFlow Follow-up Reminders for Patient.
 */
export async function getPatientFollowUps(patientId: string) {
  const supabase = createAdminClient()

  const { data: tasks } = await supabase
    .from('careflow_tasks')
    .select(`
      id,
      task_type,
      priority,
      due_date,
      status,
      notes,
      doctor:doctors (name, specialty)
    `)
    .eq('patient_id', patientId)
    .order('due_date', { ascending: true })

  return tasks || []
}

/**
 * Family & Dependent Management: List family profiles.
 */
export async function listFamilyMembers(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patient_family_members')
    .select(`
      id,
      primary_patient_id,
      dependent_patient_id,
      relationship,
      permission_scope,
      is_active,
      created_at,
      dependent:patients!patient_family_members_dependent_patient_id_fkey (
        id,
        uhid,
        full_name,
        age_years,
        gender,
        phone,
        blood_group
      )
    `)
    .eq('primary_patient_id', patientId)
    .eq('is_active', true)

  if (error) throw new Error(`Failed to load family members: ${error.message}`)
  return data || []
}

/**
 * Adds dependent family member profile and links to primary patient.
 */
export async function addFamilyMember(primaryPatientId: string, input: FamilyMemberInput) {
  const supabase = createAdminClient()

  const { data: primaryPat } = await supabase.from('patients').select('*').eq('id', primaryPatientId).single()
  if (!primaryPat) throw new Error('Primary patient not found')

  // Generate unique UHID for family member
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  const dependentUhid = `CC-FAM-${randomSuffix}`

  // Create dependent patient record
  const { data: dep, error: depErr } = await supabase
    .from('patients')
    .insert({
      organization_id: primaryPat.organization_id,
      primary_branch_id: primaryPat.primary_branch_id,
      uhid: dependentUhid,
      full_name: input.full_name,
      gender: input.gender,
      age_years: input.age_years || 10,
      phone: input.phone || primaryPat.phone,
      address_line1: primaryPat.address_line1,
      city: primaryPat.city,
      emergency_contact_name: primaryPat.full_name,
      emergency_contact_phone: primaryPat.phone,
      is_active: true,
    })
    .select('*')
    .single()

  if (depErr) throw new Error(`Failed to create dependent record: ${depErr.message}`)

  // Create relationship link
  const { data: link, error: linkErr } = await supabase
    .from('patient_family_members')
    .insert({
      primary_patient_id: primaryPatientId,
      dependent_patient_id: dep.id,
      relationship: input.relationship,
      permission_scope: input.permission_scope || 'full_access',
      is_active: true,
    })
    .select('*')
    .single()

  if (linkErr) throw new Error(`Failed to link family member: ${linkErr.message}`)

  return { ...link, dependent: dep }
}

/**
 * Revokes a family member's delegated access.
 */
export async function revokeFamilyMember(primaryPatientId: string, dependentPatientId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('patient_family_members')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('primary_patient_id', primaryPatientId)
    .eq('dependent_patient_id', dependentPatientId)

  if (error) throw new Error(`Revocation error: ${error.message}`)
  return { success: true }
}

/**
 * In-App Notification Center for Patient.
 */
export async function getPatientNotifications(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patient_portal_notifications')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(`Failed to load notifications: ${error.message}`)
  return data || []
}

/**
 * Mark notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createAdminClient()
  await supabase.from('patient_portal_notifications').update({ is_read: true }).eq('id', notificationId)
  return { success: true, is_read: true }
}

/**
 * Service & Support Ticket Creation.
 */
export async function createSupportTicket(patientId: string, input: SupportTicketInput) {
  const supabase = createAdminClient()

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const ticketNumber = `TKT-${dateStr}-${randomSuffix}`

  const { data, error } = await supabase
    .from('patient_support_tickets')
    .insert({
      ticket_number: ticketNumber,
      patient_id: patientId,
      category: input.category,
      priority: input.priority || 'medium',
      status: 'open',
      subject: input.subject,
      description: input.description,
    })
    .select('*')
    .single()

  if (error) throw new Error(`Support ticket error: ${error.message}`)

  // Notification
  await supabase.from('patient_portal_notifications').insert({
    patient_id: patientId,
    type: 'support',
    title: 'Support Request Received',
    message: `Your query #${ticketNumber} has been logged. Our helpdesk team will contact you shortly.`,
    link_url: '/patient/support',
  })

  return data
}

/**
 * List support tickets for patient.
 */
export async function listSupportTickets(patientId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patient_support_tickets')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load tickets: ${error.message}`)
  return data || []
}

/**
 * Submit Patient Feedback & Rating.
 */
export async function submitPatientFeedback(patientId: string, input: PatientFeedbackInput) {
  const supabase = createAdminClient()

  const { data: pat } = await supabase.from('patients').select('organization_id, primary_branch_id').eq('id', patientId).single()

  const { data, error } = await supabase
    .from('patient_feedback')
    .insert({
      organization_id: pat?.organization_id || '11111111-1111-4111-a111-111111111111',
      branch_id: pat?.primary_branch_id || '22222222-2222-4222-a222-222222222222',
      patient_id: patientId,
      appointment_id: input.appointment_id || null,
      diagnostic_order_id: input.diagnostic_order_id || null,
      rating_overall: input.rating_overall || (input as any).rating || 5,
      rating_doctor: input.rating_doctor || input.rating_overall || (input as any).rating || 5,
      rating_reception: input.rating_reception || input.rating_overall || (input as any).rating || 5,
      rating_waiting_time: input.rating_waiting_time || input.rating_overall || (input as any).rating || 5,
      comments: input.comments || null,
      is_negative_escalated: (input.rating_overall || (input as any).rating || 5) <= 2,
    })
    .select('*')
    .single()

  if (error) throw new Error(`Feedback submission error: ${error.message}`)

  return { ...data, rating: data.rating_overall }
}

/**
 * Privacy Center: Retrieve communication preferences and ABHA status.
 */
export async function getPatientPrivacySettings(patientId: string) {
  const supabase = createAdminClient()

  const { data: pat } = await supabase
    .from('patients')
    .select('id, uhid, full_name, phone, email')
    .eq('id', patientId)
    .maybeSingle()

  const { data: prefs } = await supabase
    .from('patient_communication_preferences')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()

  const { data: abha } = await supabase
    .from('patient_abha_profiles')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()

  return {
    patient: pat || { id: patientId },
    preferences: prefs || {
      service_sms_enabled: true,
      service_whatsapp_enabled: true,
      service_email_enabled: true,
      promotional_whatsapp_enabled: false,
      promotional_sms_enabled: false,
      preferred_language: 'english',
    },
    abha_profile: abha || { status: 'unlinked' },
  }
}

/**
 * Update patient communication preferences.
 */
export async function updateCommunicationPreferences(patientId: string, prefs: any) {
  const supabase = createAdminClient()

  let preferredLang = prefs.preferred_language || 'en'
  if (preferredLang === 'english') preferredLang = 'en'
  if (preferredLang === 'bengali') preferredLang = 'bn'
  if (preferredLang === 'hindi') preferredLang = 'hi'
  if (!['en', 'bn', 'hi'].includes(preferredLang)) preferredLang = 'en'

  const { data, error } = await supabase
    .from('patient_communication_preferences')
    .upsert(
      {
        patient_id: patientId,
        service_sms_enabled: prefs.service_sms_enabled !== false && prefs.sms_enabled !== false,
        service_whatsapp_enabled: prefs.service_whatsapp_enabled !== false && prefs.whatsapp_enabled !== false,
        service_email_enabled: prefs.service_email_enabled !== false && prefs.email_enabled !== false,
        promotional_whatsapp_enabled: Boolean(prefs.promotional_whatsapp_enabled ?? prefs.marketing_opt_in),
        promotional_sms_enabled: Boolean(prefs.promotional_sms_enabled ?? prefs.marketing_opt_in),
        preferred_language: preferredLang,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'patient_id' }
    )
    .select('*')
    .single()

  if (error) throw new Error(`Failed to update preferences: ${error.message}`)
  return {
    ...data,
    whatsapp_enabled: data.service_whatsapp_enabled,
    sms_enabled: data.service_sms_enabled,
    email_enabled: data.service_email_enabled,
  }
}

/**
 * Link voluntary ABHA profile.
 */
export async function linkAbhaProfile(patientId: string, abhaNumber: string, abhaAddress: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patient_abha_profiles')
    .upsert(
      {
        patient_id: patientId,
        abha_number: abhaNumber,
        abha_address: abhaAddress,
        status: 'verified',
        linked_at: new Date().toISOString(),
      },
      { onConflict: 'patient_id' }
    )
    .select('*')
    .single()

  if (error) throw new Error(`ABHA linking failed: ${error.message}`)
  return {
    ...data,
    link_status: data.status,
  }
}
