import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import { getDoctorDayAvailability } from '../../lib/modules/appointments/availability-service'
import { recordAuditEvent } from '../../lib/api/audit'

describe('Step 04: Unified Appointments, Scheduling & Reception Tests', () => {
  const admin = createAdminClient()
  const orgId = '11111111-1111-4111-a111-111111111111'
  const branchId = '22222222-2222-4222-a222-222222222222'
  const doctorId = '33333333-3333-4333-a333-333333333331' // Dr. Sanjoy Kumar Dey
  const patientId = '44444444-4444-4444-a444-444444444441' // Rahul Sen
  const chamberId = '55555555-5555-5555-a555-555555555552' // Chamber 102 - Pediatrics

  it('Chambers Master: should verify active chambers configured in branch', async () => {
    const { data: chambers, error } = await admin
      .from('chambers')
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_active', true)

    assert.equal(error, null)
    assert.ok(chambers && chambers.length >= 3, 'Should have at least 3 active chambers')
    const chamber101 = chambers.find((c) => c.room_number === 'Room 101')
    assert.ok(chamber101, 'Chamber 101 must exist')
  })

  it('Availability Engine: should generate slots for doctor working day and handle bookings', async () => {
    // Pick next Monday to test clean working schedule
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7))
    const dateStr = targetDate.toISOString().split('T')[0]

    const availability = await getDoctorDayAvailability({
      doctorId,
      date: dateStr,
      branchId,
    })

    assert.equal(availability.doctorId, doctorId)
    assert.ok(Array.isArray(availability.slots))
    assert.ok(availability.slots.length > 0, 'Doctor should have active slots on working day')
    assert.equal(availability.slots[0].feePaise, 40000, 'Fee should snapshot 40,000 paise (400 INR)')
  })

  it('Availability Engine: should handle schedule exceptions (leaves/holidays)', async () => {
    const testDate = '2026-12-25' // Future holiday test

    // Add exception
    const { data: exc, error: excErr } = await admin
      .from('schedule_exceptions')
      .insert({
        doctor_id: doctorId,
        branch_id: branchId,
        exception_date: testDate,
        exception_type: 'leave',
        reason: 'Annual medical conference',
      })
      .select()
      .single()

    assert.equal(excErr, null)

    const availability = await getDoctorDayAvailability({
      doctorId,
      date: testDate,
      branchId,
    })

    assert.equal(availability.isWorkingDay, false)
    assert.equal(availability.hasException, true)
    assert.ok(availability.exceptionReason?.includes('Annual medical conference'))

    // Cleanup exception
    await admin.from('schedule_exceptions').delete().eq('id', exc.id)
  })

  it('Appointment Booking & Token Assignment: should book an appointment with token number', async () => {
    const testDate = '2026-11-30'
    const aptNumber = `TEST-APT-${Date.now()}`

    const { data: apt, error } = await admin
      .from('appointments')
      .insert({
        appointment_number: aptNumber,
        organization_id: orgId,
        branch_id: branchId,
        doctor_id: doctorId,
        patient_id: patientId,
        chamber_id: chamberId,
        consultation_type: 'physical',
        scheduled_date: testDate,
        start_time: '18:00:00',
        end_time: '18:15:00',
        fee_paise: 50000,
        status: 'confirmed',
        booking_source: 'reception',
        token_number: 99,
      })
      .select()
      .single()

    assert.equal(error, null, 'Appointment booking should succeed')
    assert.ok(apt?.id)
    assert.equal(apt.token_number, 99)
    assert.equal(apt.fee_paise, 50000)

    // Verify chamber assignment
    assert.equal(apt.chamber_id, chamberId)

    // Cleanup
    await admin.from('appointments').delete().eq('id', apt.id)
  })

  it('Concurrency Guard: database trigger prevents double-booking same doctor at same time', async () => {
    const testDate = '2026-11-28'
    const aptNumber1 = `TEST-CONC-1-${Date.now()}`
    const aptNumber2 = `TEST-CONC-2-${Date.now()}`

    // Insert first appointment
    const { data: apt1, error: err1 } = await admin
      .from('appointments')
      .insert({
        appointment_number: aptNumber1,
        organization_id: orgId,
        branch_id: branchId,
        doctor_id: doctorId,
        patient_id: patientId,
        consultation_type: 'physical',
        scheduled_date: testDate,
        start_time: '14:00:00',
        end_time: '14:30:00',
        fee_paise: 50000,
        status: 'confirmed',
      })
      .select()
      .single()

    assert.equal(err1, null)

    // Attempt overlapping appointment for the same doctor
    const { data: apt2, error: err2 } = await admin
      .from('appointments')
      .insert({
        appointment_number: aptNumber2,
        organization_id: orgId,
        branch_id: branchId,
        doctor_id: doctorId,
        patient_id: patientId,
        consultation_type: 'physical',
        scheduled_date: testDate,
        start_time: '14:15:00',
        end_time: '14:45:00',
        fee_paise: 50000,
        status: 'confirmed',
      })
      .select()
      .single()

    assert.ok(err2, 'Database trigger must prevent overlapping doctor appointment')
    assert.ok(err2.message.includes('overlapping consultation'))

    // Cleanup
    await admin.from('appointments').delete().eq('id', apt1.id)
  })

  it('Status Transition & History: should transition through valid states and record timestamps', async () => {
    const testDate = '2026-11-29'
    const aptNumber = `TEST-STATUS-${Date.now()}`

    // 1. Create appointment
    const { data: apt } = await admin
      .from('appointments')
      .insert({
        appointment_number: aptNumber,
        organization_id: orgId,
        branch_id: branchId,
        doctor_id: doctorId,
        patient_id: patientId,
        chamber_id: chamberId,
        consultation_type: 'physical',
        scheduled_date: testDate,
        start_time: '10:00:00',
        end_time: '10:15:00',
        fee_paise: 50000,
        status: 'confirmed',
      })
      .select()
      .single()

    assert.ok(apt?.id)

    // 2. Transition to checked_in
    const nowIso = new Date().toISOString()
    const { data: checkedIn, error: errCheckIn } = await admin
      .from('appointments')
      .update({
        status: 'checked_in',
        check_in_time: nowIso,
      })
      .eq('id', apt.id)
      .select()
      .single()

    assert.equal(errCheckIn, null)
    assert.equal(checkedIn.status, 'checked_in')
    assert.ok(checkedIn.check_in_time)

    // 3. Transition to in_consultation
    const { data: inConsult, error: errInConsult } = await admin
      .from('appointments')
      .update({
        status: 'in_consultation',
        consultation_start_time: nowIso,
      })
      .eq('id', apt.id)
      .select()
      .single()

    assert.equal(errInConsult, null)
    assert.equal(inConsult.status, 'in_consultation')
    assert.ok(inConsult.consultation_start_time)

    // 4. Transition to completed
    const { data: completed, error: errComplete } = await admin
      .from('appointments')
      .update({
        status: 'completed',
        consultation_end_time: nowIso,
      })
      .eq('id', apt.id)
      .select()
      .single()

    assert.equal(errComplete, null)
    assert.equal(completed.status, 'completed')
    assert.ok(completed.consultation_end_time)

    // Record status history
    await admin.from('appointment_status_history').insert([
      { appointment_id: apt.id, from_status: 'confirmed', to_status: 'checked_in', reason: 'Patient arrived' },
      { appointment_id: apt.id, from_status: 'checked_in', to_status: 'in_consultation', reason: 'Called into Chamber 102' },
      { appointment_id: apt.id, from_status: 'in_consultation', to_status: 'completed', reason: 'Consultation finished' },
    ])

    const { data: history } = await admin
      .from('appointment_status_history')
      .select('*')
      .eq('appointment_id', apt.id)

    assert.equal(history?.length, 3, 'Should record all 3 status transitions')

    // Cleanup
    await admin.from('appointment_status_history').delete().eq('appointment_id', apt.id)
    await admin.from('appointments').delete().eq('id', apt.id)
  })
})
