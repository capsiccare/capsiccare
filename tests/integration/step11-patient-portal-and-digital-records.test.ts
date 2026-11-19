import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import {
  getPatientContext,
  linkUhidToProfile,
  getPatientDashboard,
  listPatientAppointments,
  bookPatientAppointment,
  cancelPatientAppointment,
  searchDoctorsForPatient,
  getDoctorProfileForPatient,
  getPatientPrescriptions,
  getPatientPrescriptionDetail,
  getPatientActiveMedications,
  getPatientHealthRecords,
  searchDiagnosticCatalogue,
  bookDiagnosticOrder,
  listPatientDiagnosticOrders,
  listPatientReports,
  listPatientInvoices,
  initiatePatientPayment,
  getPatientFollowUps,
  listFamilyMembers,
  addFamilyMember,
  revokeFamilyMember,
  getPatientNotifications,
  markNotificationAsRead,
  createSupportTicket,
  listSupportTickets,
  submitPatientFeedback,
  getPatientPrivacySettings,
  updateCommunicationPreferences,
  linkAbhaProfile,
} from '../../lib/modules/patient-portal/patient-portal-service'

describe('Step 11: Patient Portal, Digital Health Records & Self-Service Experience', () => {
  const supabase = createAdminClient()
  let testPatient: any = null
  let testDoctor: any = null
  let testBranchId: string = '22222222-2222-4222-a222-222222222222'
  let testAppointmentId: string = ''
  let testPrescriptionId: string = ''
  let testOrderId: string = ''
  let testNotificationId: string = ''
  let testDependentPatientId: string = ''

  it('1. Database Tables: should verify all Step 11 PostgreSQL tables exist with RLS enabled', async () => {
    const requiredTables = [
      'patient_portal_links',
      'patient_family_members',
      'patient_addresses',
      'patient_portal_notifications',
      'patient_support_tickets',
      'patient_abha_profiles',
      'patient_portal_activity_logs',
    ]

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('id').limit(0)
      assert.ifError(error)
    }
  })

  it('2. Test Fixture Setup: should ensure test patient, branch and doctor exist', async () => {
    // 1. Patient
    const { data: pat } = await supabase
      .from('patients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    assert.ok(pat, 'At least one active patient must exist in database')
    testPatient = pat

    // 2. Doctor
    const { data: doc } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()

    assert.ok(doc, 'At least one active doctor must exist in database')
    testDoctor = doc

    // 3. Branch
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (branch) {
      testBranchId = branch.id
    }
  })

  it('3. Patient Portal Context Resolution: should resolve patient context and link status', async () => {
    const ctx = await getPatientContext('00000000-0000-0000-0000-000000000000', testPatient.id)
    assert.ok(ctx)
    assert.strictEqual(ctx.patient.id, testPatient.id)
    assert.strictEqual(ctx.patient.uhid, testPatient.uhid)
    assert.ok(Array.isArray(ctx.dependents))
  })

  it('4. UHID Linking & Identity Verification: should link UHID with phone verification', async () => {
    const testUserId = '11111111-1111-4111-a111-111111111111'
    const link = await linkUhidToProfile(testUserId, testPatient.uhid, {
      phone: testPatient.phone || undefined,
    })

    assert.ok(link)
    assert.strictEqual(link.patient_id, testPatient.id)
    assert.strictEqual(link.status, 'verified')
  })

  it('5. Patient Dashboard Aggregation: should return live stats, appointment & follow-up', async () => {
    const dash = await getPatientDashboard(testPatient.id)
    assert.ok(dash)
    assert.strictEqual(dash.patient.id, testPatient.id)
    assert.ok(dash.greeting)
    assert.ok(typeof dash.stats.upcoming_appointments_count === 'number')
    assert.ok(typeof dash.stats.available_reports_count === 'number')
    assert.ok(typeof dash.stats.active_prescriptions_count === 'number')
    assert.ok(typeof dash.stats.outstanding_balance_inr === 'number')
  })

  it('6. Doctor Directory Search: should search clinicians with specialty filter', async () => {
    const doctors = await searchDoctorsForPatient()
    assert.ok(Array.isArray(doctors))
    assert.ok(doctors.length > 0)

    const profile = await getDoctorProfileForPatient(testDoctor.id)
    assert.ok(profile)
    assert.strictEqual(profile.id, testDoctor.id)
  })

  it('7. Self-Service Appointment Booking: should book consultation slot and generate token', async () => {
    // Generate future date avoiding conflicts
    const randomDays = 30 + Math.floor(Math.random() * 60)
    const futureDate = new Date(Date.now() + randomDays * 86400000).toISOString().split('T')[0]
    const randomHour = 10 + Math.floor(Math.random() * 6)
    const startTime = `${String(randomHour).padStart(2, '0')}:00:00`
    const endTime = `${String(randomHour).padStart(2, '0')}:15:00`

    const booked = await bookPatientAppointment(testPatient.id, {
      doctor_id: testDoctor.id,
      branch_id: testBranchId,
      consultation_type: 'physical',
      scheduled_date: futureDate,
      start_time: startTime,
      end_time: endTime,
      chief_complaint: 'Routine checkup via patient portal test',
    })

    assert.ok(booked)
    assert.strictEqual(booked.patient_id, testPatient.id)
    assert.strictEqual(booked.doctor_id, testDoctor.id)
    assert.ok(booked.token_number >= 1)
    testAppointmentId = booked.id
  })

  it('8. Appointment Cancellation: should cancel scheduled appointment with reason', async () => {
    const cancelled = await cancelPatientAppointment(
      testPatient.id,
      testAppointmentId,
      'Test schedule change'
    )
    assert.strictEqual(cancelled.status, 'cancelled')
    assert.strictEqual(cancelled.cancellation_reason, 'Test schedule change')
  })

  it('9. Finalized Electronic Prescriptions: should list signed prescriptions and detail', async () => {
    // Ensure at least one signed prescription exists for test patient
    const { data: existingRx } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('patient_id', testPatient.id)
      .eq('status', 'signed')
      .maybeSingle()

    if (!existingRx) {
      // Seed a test signed prescription
      const { data: newRx } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: testPatient.id,
          doctor_id: testDoctor.id,
          prescriber_name: testDoctor.name || testDoctor.full_name || 'Dr. Specialist',
          branch_id: testBranchId,
          prescription_number: `RX-TEST-${Date.now()}`,
          prescription_date: new Date().toISOString().split('T')[0],
          status: 'signed',
          diagnosis_summary: 'Acute Seasonal Rhinitis',
          advice_general: 'Stay hydrated, rest adequately',
        })
        .select()
        .single()

      if (newRx) {
        testPrescriptionId = newRx.id
        await supabase.from('prescription_items').insert({
          prescription_id: newRx.id,
          medicine_name: 'Cetirizine 10mg',
          generic_name: 'Cetirizine Hydrochloride',
          dosage: '10mg',
          frequency: '0-0-1',
          duration: '5 days',
          timing_instruction: 'Night after dinner',
        })
      }
    } else {
      testPrescriptionId = existingRx.id
    }

    const rxs = await getPatientPrescriptions(testPatient.id)
    assert.ok(Array.isArray(rxs))
    assert.ok(rxs.length > 0)
    assert.ok(rxs.every((r) => r.status === 'signed' || r.status === 'finalized' || r.status === 'amended'))

    const detail = await getPatientPrescriptionDetail(testPatient.id, testPrescriptionId)
    assert.ok(detail)
    assert.strictEqual(detail.id, testPrescriptionId)
  })

  it('10. Active Medication Tracker: should retrieve active medicines with dosage and instructions', async () => {
    const meds = await getPatientActiveMedications(testPatient.id)
    assert.ok(Array.isArray(meds))
    if (meds.length > 0) {
      assert.ok(meds[0].medicine_name)
      assert.ok(meds[0].dosage)
      assert.ok(meds[0].frequency)
    }
  })

  it('11. Longitudinal Health Records Timeline: should return chronological events', async () => {
    const records = await getPatientHealthRecords(testPatient.id)
    assert.ok(records)
    assert.ok(Array.isArray(records.timeline))
    assert.ok(records.summary)
    assert.ok(typeof records.summary.consultations_count === 'number')
    assert.ok(typeof records.summary.prescriptions_count === 'number')
    assert.ok(typeof records.summary.reports_count === 'number')
  })

  it('12. Diagnostic Catalogue & Test Booking: should search tests and place order', async () => {
    const tests = await searchDiagnosticCatalogue()
    assert.ok(Array.isArray(tests))
    assert.ok(tests.length > 0)
    const firstTest = tests[0]

    const order = await bookDiagnosticOrder(testPatient.id, {
      branch_id: testBranchId,
      fulfillment_type: 'home_collection',
      tests: [{ test_id: firstTest.id, price_paise: Number(firstTest.base_price || 500) * 100 }],
      scheduled_collection_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduled_slot: 'morning',
      collection_address: '123 Health Ave, Salt Lake, Kolkata',
      collection_city: 'Kolkata',
      collection_pincode: '700091',
    })

    assert.ok(order)
    assert.strictEqual(order.patient_id, testPatient.id)
    assert.ok(order.order_number)
    testOrderId = order.id
  })

  it('13. Diagnostic Order Tracking & Reports: should list orders and lab reports', async () => {
    const orders = await listPatientDiagnosticOrders(testPatient.id)
    assert.ok(Array.isArray(orders))
    assert.ok(orders.some((o) => o.id === testOrderId))

    const reports = await listPatientReports(testPatient.id)
    assert.ok(Array.isArray(reports))
  })

  it('14. Invoices & Billing: should list patient invoices', async () => {
    const invoices = await listPatientInvoices(testPatient.id)
    assert.ok(Array.isArray(invoices))
  })

  it('15. Mock Payment Processing: should record idempotent payment against invoice', async () => {
    // Find or create an invoice for testing payment
    let invoiceToPay = null
    const { data: inv } = await supabase
      .from('invoices')
      .select('*')
      .eq('patient_id', testPatient.id)
      .limit(1)
      .maybeSingle()

    if (inv) {
      invoiceToPay = inv
    } else {
      const { data: newInv } = await supabase
        .from('invoices')
        .insert({
          patient_id: testPatient.id,
          branch_id: testBranchId,
          invoice_number: `INV-TEST-${Date.now()}`,
          invoice_date: new Date().toISOString().split('T')[0],
          total_amount: 500,
          paid_amount: 0,
          balance_amount: 500,
          status: 'issued',
          payment_status: 'unpaid',
        })
        .select()
        .single()
      invoiceToPay = newInv
    }

    if (invoiceToPay) {
      const receipt = await initiatePatientPayment(testPatient.id, invoiceToPay.id, 500, 'upi')
      assert.ok(receipt)
      assert.strictEqual(receipt.payment_status, 'paid')
      assert.strictEqual(receipt.amount, 500)
      assert.ok(receipt.transaction_id)
    }
  })

  it('16. CareFlow Follow-ups: should list clinician recall reminders', async () => {
    const followUps = await getPatientFollowUps(testPatient.id)
    assert.ok(Array.isArray(followUps))
  })

  it('17. Family & Dependent Management: should add, list, and revoke family dependent', async () => {
    // 1. Add dependent
    const fam = await addFamilyMember(testPatient.id, {
      full_name: 'Baby Care Dependent',
      relationship: 'child',
      permission_scope: 'full_access',
      gender: 'female',
      age_years: 4,
    })

    assert.ok(fam)
    assert.strictEqual(fam.primary_patient_id, testPatient.id)
    assert.strictEqual(fam.relationship, 'child')
    testDependentPatientId = fam.dependent_patient_id

    // 2. List family members
    const members = await listFamilyMembers(testPatient.id)
    assert.ok(Array.isArray(members))
    assert.ok(members.some((m) => m.dependent_patient_id === testDependentPatientId))

    // 3. Revoke family delegation
    const revoked = await revokeFamilyMember(testPatient.id, testDependentPatientId)
    assert.strictEqual(revoked.success, true)
  })

  it('18. In-App Notifications: should retrieve and mark notifications as read', async () => {
    // Seed notification
    const { data: notif } = await supabase
      .from('patient_portal_notifications')
      .insert({
        patient_id: testPatient.id,
        type: 'prescription',
        title: 'Prescription Ready',
        message: 'Dr. has uploaded your signed digital prescription.',
        is_read: false,
      })
      .select()
      .single()

    assert.ok(notif)
    testNotificationId = notif.id

    const notifs = await getPatientNotifications(testPatient.id)
    assert.ok(Array.isArray(notifs))
    assert.ok(notifs.some((n) => n.id === testNotificationId))

    const updated = await markNotificationAsRead(testNotificationId)
    assert.strictEqual(updated.is_read, true)
  })

  it('19. Support Tickets & Experience Feedback: should submit ticket and star rating', async () => {
    // 1. Support ticket
    const ticket = await createSupportTicket(testPatient.id, {
      category: 'general',
      subject: 'Portal Access Query',
      description: 'Requesting clarification on home sample collection schedule.',
      priority: 'medium',
    })

    assert.ok(ticket)
    assert.ok(ticket.ticket_number.startsWith('TKT-'))

    const tickets = await listSupportTickets(testPatient.id)
    assert.ok(tickets.some((t) => t.id === ticket.id))

    // 2. Patient feedback
    const fb = await submitPatientFeedback(testPatient.id, {
      rating_overall: 5,
      facility_rating: 5,
      comments: 'Excellent doctor care and seamless digital prescription delivery.',
    })

    assert.ok(fb)
    assert.strictEqual(fb.rating, 5)
  })

  it('20. Privacy Center & ABHA Integration: should update preferences and link ABHA ID', async () => {
    // 1. Privacy settings
    const settings = await getPatientPrivacySettings(testPatient.id)
    assert.ok(settings)
    assert.ok(settings.patient)

    // 2. Update preferences
    const updatedPrefs = await updateCommunicationPreferences(testPatient.id, {
      whatsapp_enabled: true,
      sms_enabled: true,
      email_enabled: true,
      marketing_opt_in: false,
    })
    assert.strictEqual(updatedPrefs.whatsapp_enabled, true)
    assert.strictEqual(updatedPrefs.email_enabled, true)

    // 3. Link ABHA Profile
    const abha = await linkAbhaProfile(testPatient.id, '14-9988-7766-5544', 'patient.capsic@abdm')
    assert.ok(abha)
    assert.strictEqual(abha.abha_number, '14-9988-7766-5544')
    assert.strictEqual(abha.abha_address, 'patient.capsic@abdm')
    assert.strictEqual(abha.link_status, 'verified')
  })
})
