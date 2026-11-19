import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import { createAdminClient } from '@/lib/supabase/admin'

describe('Practicality, Business Delivery & Unified Auth System', () => {
  const admin = createAdminClient()
  let testBranchId: string
  let testDoctorId: string
  let testPatientId: string

  before(async () => {
    // Fetch a valid branch
    const { data: branch } = await admin.from('branches').select('id').limit(1).single()
    assert.ok(branch, 'Branch should exist')
    testBranchId = branch!.id
  })

  it('1. should self-register an individual doctor via API', async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const email = `dr.test${randomSuffix}@capsic.test`
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`
    const regNo = `WBMC-${randomSuffix}`

    const res = await fetch('http://localhost:3000/api/v1/auth/register/doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Dr. Somnath Banerjee ${randomSuffix}`,
        email,
        password: 'Password@123',
        phone,
        registration_number: regNo,
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD, DM (Cardiology)',
        experience_years: 12,
        consultation_fee: 700,
        telemedicine_fee: 600,
        branch_id: testBranchId,
      }),
    })

    const json = await res.json()
    if (res.status !== 201) {
      console.error('Doctor registration error response:', JSON.stringify(json, null, 2))
    }
    assert.strictEqual(res.status, 201)
    assert.strictEqual(json.success, true)
    assert.ok(json.data.doctor)
    assert.strictEqual(json.data.doctor.registration_number, regNo)
    assert.strictEqual(json.data.doctor.specialty, 'Cardiology')
    testDoctorId = json.data.doctor.id

    // Verify role assignment in DB
    const { data: roles } = await admin
      .from('user_role_assignments')
      .select('roles(name)')
      .eq('user_id', json.data.doctor.profile_id)
    assert.ok(roles?.some((r: any) => r.roles?.name === 'doctor'))
  })

  it('2. should self-register a staff member with branch assignment', async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const email = `reception.${randomSuffix}@capsic.test`
    const phone = `97${Math.floor(10000000 + Math.random() * 90000000)}`

    const res = await fetch('http://localhost:3000/api/v1/auth/register/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: `Tanmoy Das ${randomSuffix}`,
        email,
        password: 'Password@123',
        phone,
        role: 'receptionist',
        branch_id: testBranchId,
        designation: 'Front Desk Receptionist',
      }),
    })

    const json = await res.json()
    if (res.status !== 201) {
      console.error('Doctor registration error response:', JSON.stringify(json, null, 2))
    }
    assert.strictEqual(res.status, 201)
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.role, 'receptionist')
    assert.ok(json.data.employeeId)

    // Verify staff_details row in DB
    const { data: staff } = await admin
      .from('staff_details')
      .select('employee_id, designation')
      .eq('user_id', json.data.userId)
      .single()
    assert.strictEqual(staff?.employee_id, json.data.employeeId)
  })

  it('3. should register a new patient and automatically generate a UHID', async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const phone = `96${Math.floor(10000000 + Math.random() * 90000000)}`

    const res = await fetch('http://localhost:3000/api/v1/auth/register/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: `Bikramaditya Roy ${randomSuffix}`,
        phone,
        gender: 'male',
        age_years: 42,
        blood_group: 'B+',
        city: 'Howrah',
        district: 'Howrah',
        branch_id: testBranchId,
      }),
    })

    const json = await res.json()
    if (res.status !== 201) {
      console.error('Doctor registration error response:', JSON.stringify(json, null, 2))
    }
    assert.strictEqual(res.status, 201)
    assert.strictEqual(json.success, true)
    assert.match(json.data.patient.uhid, /^CAP-\d{4}-\d{6}$/)
    testPatientId = json.data.patient.id
  })

  it('4. should upload paper prescription by staff and dispatch to patient via WhatsApp', async () => {
    assert.ok(testPatientId)

    const res = await fetch(`http://localhost:3000/api/v1/patients/${testPatientId}/prescriptions/upload-paper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...',
        file_name: 'paper_prescription_scan.jpg',
        doctor_id: testDoctorId,
        doctor_name: 'Dr. Somnath Banerjee',
        diagnosis: 'Hypertension & Angina Evaluation',
        medicines_summary: 'Telmisartan 40mg once daily morning, Atorvastatin 20mg at night',
        dispatch_whatsapp: true,
      }),
    })

    const json = await res.json()
    if (res.status !== 201) {
      console.error('Doctor registration error response:', JSON.stringify(json, null, 2))
    }
    assert.strictEqual(res.status, 201)
    assert.strictEqual(json.success, true)
    assert.match(json.data.prescriptionNumber, /^RX-\d{8}-\d{4}$/)
    assert.ok(json.data.secureUrl.includes('/api/v1/documents/'))
    assert.strictEqual(json.data.whatsappDispatched, true)

    // Check communication message logged
    const { data: messages } = await admin
      .from('communication_messages')
      .select('id, message_body, status')
      .eq('patient_id', testPatientId)
    assert.ok(messages && messages.length > 0)
    assert.ok(messages![0].message_body.includes('digitized'))
  })

  it('5. should allow patient to self-upload outside medical documents into locker', async () => {
    assert.ok(testPatientId)

    const res = await fetch(`http://localhost:3000/api/v1/patient/health-records?patientId=${testPatientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Apollo Gleneagles ECG & Echo Report 2025',
        document_type: 'diagnostic_report',
        file_url: 'https://storage.capsiccare.in/records/echo_report.pdf',
        file_name: 'echo_report_2025.pdf',
      }),
    })

    const json = await res.json()
    if (res.status !== 201) {
      console.error('Doctor registration error response:', JSON.stringify(json, null, 2))
    }
    assert.strictEqual(res.status, 201)
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.document.title, 'Apollo Gleneagles ECG & Echo Report 2025')
  })

  it('6. should retrieve patient health records including digitized and uploaded documents', async () => {
    assert.ok(testPatientId)

    const res = await fetch(`http://localhost:3000/api/v1/patient/health-records?patientId=${testPatientId}`)
    const json = await res.json()
    assert.strictEqual(res.status, 200)
    assert.strictEqual(json.success, true)
    assert.ok(json.data.uploaded_documents)
    assert.ok(json.data.uploaded_documents.length >= 2)
  })
})
