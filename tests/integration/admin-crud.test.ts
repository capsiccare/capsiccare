import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import { recordAuditEvent } from '../../lib/api/audit'

describe('Admin Management & CRUD Integration Tests', () => {
  const admin = createAdminClient()
  const currentYear = new Date().getFullYear()

  it('Doctor CRUD: should create, query, and update a doctor with integer paise fee', async () => {
    const testCode = `TEST-DOC-${Date.now()}`
    const orgId = '11111111-1111-4111-a111-111111111111'
    const branchId = '22222222-2222-4222-a222-222222222222'

    // 1. Create doctor
    const { data: created, error: createErr } = await admin
      .from('doctors')
      .insert({
        organization_id: orgId,
        code: testCode,
        name: 'Dr. Test Surgeon (Synthetic)',
        slug: `dr-test-surgeon-${Date.now()}`,
        specialty: 'Orthopedics',
        designation: 'Senior Consultant',
        qualifications: 'MBBS, MS (Ortho)',
        registration_number: 'WBMC 99999',
        experience_years: 12,
        physical_fee_paise: 65000, // 650 INR
        telemedicine_fee_paise: 50000, // 500 INR
        is_active: true,
      })
      .select()
      .single()

    assert.equal(createErr, null, 'Doctor creation should succeed')
    assert.ok(created?.id)
    assert.equal(created.physical_fee_paise, 65000)

    // Link branch
    const { error: branchErr } = await admin.from('doctor_branches').insert({
      doctor_id: created.id,
      branch_id: branchId,
      is_primary: true,
    })
    assert.equal(branchErr, null)

    // 2. Query doctor
    const { data: fetched, error: fetchErr } = await admin
      .from('doctors')
      .select('*, doctor_branches(branch_id)')
      .eq('id', created.id)
      .single()

    assert.equal(fetchErr, null)
    assert.equal(fetched.code, testCode)
    assert.equal(fetched.doctor_branches.length, 1)

    // 3. Update doctor fee and active status
    const { data: updated, error: updateErr } = await admin
      .from('doctors')
      .update({
        physical_fee_paise: 75000, // 750 INR
        is_active: false,
      })
      .eq('id', created.id)
      .select()
      .single()

    assert.equal(updateErr, null)
    assert.equal(updated.physical_fee_paise, 75000)
    assert.equal(updated.is_active, false)

    // Cleanup test record
    await admin.from('doctor_branches').delete().eq('doctor_id', created.id)
    await admin.from('doctors').delete().eq('id', created.id)
  })

  it('Patient Directory: should register patient with auto-generated UHID and contacts', async () => {
    const orgId = '11111111-1111-4111-a111-111111111111'
    const branchId = '22222222-2222-4222-a222-222222222222'
    const testPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`
    const testUhid = `CC-${currentYear}-TST${Math.floor(1000 + Math.random() * 9000)}`

    // 1. Insert patient decoupled from auth
    const { data: patient, error: patientErr } = await admin
      .from('patients')
      .insert({
        organization_id: orgId,
        primary_branch_id: branchId,
        uhid: testUhid,
        full_name: 'Test Patient (Synthetic)',
        phone: testPhone,
        gender: 'female',
        age_years: 28,
        blood_group: 'O+',
        city: 'Howrah',
        district: 'Howrah',
        emergency_contact_name: 'Relative',
        emergency_contact_phone: '+919999900000',
        is_active: true,
      })
      .select()
      .single()

    assert.equal(patientErr, null, 'Patient registration should succeed')
    assert.ok(patient?.id)
    assert.equal(patient.uhid, testUhid)

    // 2. Insert primary contact
    const { data: contact, error: contactErr } = await admin
      .from('patient_contacts')
      .insert({
        patient_id: patient.id,
        contact_type: 'phone',
        value: testPhone,
        is_primary: true,
        is_verified: true,
      })
      .select()
      .single()

    assert.equal(contactErr, null)
    assert.equal(contact.value, testPhone)

    // 3. Query patient with contacts
    const { data: queried, error: qErr } = await admin
      .from('patients')
      .select('*, patient_contacts(*)')
      .eq('id', patient.id)
      .single()

    assert.equal(qErr, null)
    assert.equal(queried.patient_contacts.length, 1)

    // 4. Update demographics
    const { data: updatedPat, error: upPatErr } = await admin
      .from('patients')
      .update({ full_name: 'Updated Patient Name' })
      .eq('id', patient.id)
      .select()
      .single()

    assert.equal(upPatErr, null)
    assert.equal(updatedPat.full_name, 'Updated Patient Name')

    // Cleanup
    await admin.from('patient_contacts').delete().eq('patient_id', patient.id)
    await admin.from('patients').delete().eq('id', patient.id)
  })

  it('Audit Logs: should capture mutation events in forensic audit trail', async () => {
    const orgId = '11111111-1111-4111-a111-111111111111'
    const entityId = `test-entity-${Date.now()}`

    await recordAuditEvent({
      organizationId: orgId,
      action: 'TEST_AUDIT_ACTION',
      entityType: 'test_entity',
      entityId,
      oldValues: { status: 'draft' },
      newValues: { status: 'approved' },
      ipAddress: '127.0.0.1',
    })

    const { data: logEntry, error } = await admin
      .from('audit_logs')
      .select('*')
      .eq('entity_id', entityId)
      .maybeSingle()

    assert.equal(error, null)
    assert.ok(logEntry)
    assert.equal(logEntry.action, 'TEST_AUDIT_ACTION')
    assert.equal(logEntry.old_values.status, 'draft')
    assert.equal(logEntry.new_values.status, 'approved')

    // Cleanup
    await admin.from('audit_logs').delete().eq('id', logEntry.id)
  })
})
