import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '@/lib/supabase/admin'

describe('Doctor Schedules & Exceptions End-to-End Verification', () => {
  const admin = createAdminClient()

  it('should support full schedule session lifecycle with chamber assignment', async () => {
    // 1. Get branch and doctor
    const { data: doctor } = await admin.from('doctors').select('id, organization_id').limit(1).single()
    const { data: branch } = await admin.from('branches').select('id').limit(1).single()
    const { data: chamber } = await admin.from('chambers').select('id').eq('branch_id', branch!.id).limit(1).maybeSingle()

    assert.ok(doctor?.id)
    assert.ok(branch?.id)

    // 2. Create schedule session (Sunday day_of_week=0)
    const { data: createdSchedule, error: createErr } = await admin
      .from('doctor_schedules')
      .insert({
        doctor_id: doctor.id,
        branch_id: branch.id,
        chamber_id: chamber?.id || null,
        consultation_type: 'physical',
        day_of_week: 0,
        start_time: '14:00',
        end_time: '18:00',
        slot_duration_minutes: 20,
        max_patients_per_slot: 1,
        is_active: true,
      })
      .select()
      .single()

    assert.equal(createErr, null)
    assert.ok(createdSchedule?.id)
    assert.equal(createdSchedule.slot_duration_minutes, 20)

    // 3. Update schedule session
    const { data: updatedSchedule, error: updateErr } = await admin
      .from('doctor_schedules')
      .update({
        slot_duration_minutes: 30,
        end_time: '18:30',
      })
      .eq('id', createdSchedule.id)
      .select()
      .single()

    assert.equal(updateErr, null)
    assert.equal(updatedSchedule.slot_duration_minutes, 30)

    // 4. Create schedule exception (Doctor Leave on a specific date)
    const testDate = '2026-12-25'
    const { data: exception, error: exErr } = await admin
      .from('schedule_exceptions')
      .insert({
        doctor_id: doctor.id,
        branch_id: branch.id,
        exception_date: testDate,
        exception_type: 'holiday',
        reason: 'Christmas Holiday',
      })
      .select()
      .single()

    assert.equal(exErr, null)
    assert.ok(exception?.id)
    assert.equal(exception.exception_type, 'holiday')

    // 5. Query exceptions for doctor
    const { data: doctorExceptions } = await admin
      .from('schedule_exceptions')
      .select('*')
      .eq('doctor_id', doctor.id)
      .eq('exception_date', testDate)

    assert.ok(doctorExceptions && doctorExceptions.length > 0)

    // 6. Cleanup exception and schedule session
    await admin.from('schedule_exceptions').delete().eq('id', exception.id)
    await admin.from('doctor_schedules').delete().eq('id', createdSchedule.id)

    const { data: checkDeleted } = await admin
      .from('doctor_schedules')
      .select('id')
      .eq('id', createdSchedule.id)
      .maybeSingle()

    assert.equal(checkDeleted, null)
  })
})
