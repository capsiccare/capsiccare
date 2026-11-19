import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import {
  getDoctorContext,
  getDoctorDashboard,
  startConsultation,
  getEncounter,
  saveEncounterDraft,
  completeConsultation,
  recordVitals,
  addDiagnosis,
  getPatientEmr,
  searchMedicines,
  createOrUpdatePrescriptionDraft,
  runPrescriptionSafetyChecks,
  signAndFinalizePrescription,
  amendPrescription,
  getPrescriptionPrintData,
  deliverPrescription,
  addInvestigationRequest,
  getClinicalTemplates,
  getDoctorScheduleAndRoster,
  getDoctorFinancialAnalytics,
  getClinicalGovernanceOverview,
  recordClinicalAuditEvent,
} from '../../lib/modules/clinical/clinical-service'

describe('Step 10: Doctor Portal, EMR, E-Prescription & Clinical Workspace', () => {
  const supabase = createAdminClient()
  let testDoctor: any = null
  let testPatient: any = null
  let testAppointment: any = null
  let testEncounterId: string = ''
  let testPrescriptionId: string = ''

  it('1. Database Tables: should verify all Step 10 tables exist in PostgreSQL', async () => {
    const requiredTables = [
      'medicines_master',
      'clinical_encounters',
      'clinical_vitals',
      'clinical_diagnoses',
      'patient_allergies',
      'patient_chronic_conditions',
      'prescriptions',
      'prescription_items',
      'consultation_investigation_requests',
      'clinical_templates',
      'doctor_favorites',
      'clinical_documents',
      'clinical_audit_events',
    ]

    for (const table of requiredTables) {
      const { data, error } = await supabase.from(table).select('id').limit(1)
      assert.strictEqual(error, null, `Table ${table} must exist without error: ${error?.message}`)
    }
  })

  it('2. Doctor Context & Dashboard: should resolve active doctor and today queue metrics', async () => {
    // Fetch a test doctor
    const { data: doc } = await supabase.from('doctors').select('*').eq('is_active', true).limit(1).single()
    assert.ok(doc, 'Must find at least one active doctor')
    testDoctor = doc

    const contextDoc = await getDoctorContext('dummy-user-id', doc.id)
    assert.strictEqual(contextDoc.id, doc.id)

    const dashboard = await getDoctorDashboard(doc.id)
    assert.ok(dashboard.doctor)
    assert.strictEqual(dashboard.doctor.id, doc.id)
    assert.ok(dashboard.today_stats)
    assert.ok(Array.isArray(dashboard.queue))
  })

  it('3. Patient EMR & Demographics: should retrieve longitudinal medical record', async () => {
    const { data: pat } = await supabase.from('patients').select('*').limit(1).single()
    assert.ok(pat, 'Must find at least one patient')
    testPatient = pat

    const emr = await getPatientEmr(pat.id, testDoctor.id)
    assert.strictEqual(emr.patient.id, pat.id)
    assert.ok(Array.isArray(emr.conditions))
    assert.ok(Array.isArray(emr.allergies))
    assert.ok(Array.isArray(emr.vitals))
    assert.ok(Array.isArray(emr.encounters))
    assert.ok(Array.isArray(emr.prescriptions))
  })

  it('4. Consultation Lifecycle: should start consultation and create clinical encounter', async () => {
    // Unique scheduled date and time to avoid the schedule overlap trigger
    const randomDays = Math.floor(Math.random() * 300) + 10
    const dateStr = new Date(Date.now() + 86400000 * randomDays).toISOString().split('T')[0]
    const { data: branch } = await supabase.from('branches').select('id').limit(1).single()
    const branchId = branch?.id || '22222222-2222-4222-a222-222222222222'

    const { data: newApt, error } = await supabase
      .from('appointments')
      .insert({
        organization_id: '11111111-1111-4111-a111-111111111111',
        branch_id: branchId,
        appointment_number: `APT-TST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        doctor_id: testDoctor.id,
        patient_id: testPatient.id,
        consultation_type: 'physical',
        scheduled_date: dateStr,
        start_time: '11:00',
        end_time: '11:15',
        fee_paise: 50000,
        status: 'checked_in',
        token_number: 1,
        chief_complaint: 'Routine follow-up evaluation',
      })
      .select('*')
      .single()
    assert.strictEqual(error, null, error?.message)
    testAppointment = newApt

    const result = await startConsultation(testAppointment.id, testDoctor.id)
    assert.ok(result.encounterId, 'Must return a clinical encounter ID')
    testEncounterId = result.encounterId

    const encounter = await getEncounter(testEncounterId)
    assert.strictEqual(encounter.id, testEncounterId)
    assert.strictEqual(encounter.status, 'in_progress')
    assert.strictEqual(encounter.patient_id, testPatient.id)
  })

  it('5. Structured Vitals Management: should record and validate patient vital signs', async () => {
    const vitals = await recordVitals(
      testPatient.id,
      {
        patient_id: testPatient.id,
        blood_pressure_systolic: 126,
        blood_pressure_diastolic: 82,
        pulse_rate: 76,
        temperature_f: 98.4,
        spo2_percent: 99.0,
        height_cm: 172.0,
        weight_kg: 68.0,
        notes: 'Pre-consultation nurse triage vitals',
      },
      testEncounterId
    )

    assert.ok(vitals.id)
    assert.strictEqual(vitals.blood_pressure_systolic, 126)
    assert.strictEqual(vitals.blood_pressure_diastolic, 82)
    assert.strictEqual(vitals.bmi, 23.0) // 68 / (1.72^2) = 22.98 ~ 23.0
  })

  it('6. Clinical Documentation & Autosave: should persist SOAP consultation draft', async () => {
    const draft = await saveEncounterDraft(testEncounterId, {
      chief_complaint: 'Mild headache and sore throat for 2 days',
      history_of_present_illness: 'Patient reports insidious onset of throbbing frontal headache, no visual aura.',
      physical_examination: 'Bilateral vesicular breath sounds, throat mild erythema, no lymphadenopathy.',
      assessment: 'Acute Viral Pharyngitis with tension-type headache',
      treatment_plan: 'Oral hydration, rest, symptomatic analgesia',
      advice: 'Drink warm water with salt gargles. Avoid cold beverages.',
      follow_up_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      follow_up_instructions: 'Review if fever spikes or headache worsens',
    })

    assert.strictEqual(draft.success, true)

    const updatedEnc = await getEncounter(testEncounterId)
    assert.strictEqual(updatedEnc.chief_complaint, 'Mild headache and sore throat for 2 days')
    assert.ok(updatedEnc.assessment?.includes('Pharyngitis'))
  })

  it('7. Clinical Diagnoses & ICD-10: should record confirmed diagnosis', async () => {
    const diagnosis = await addDiagnosis(testEncounterId, {
      patient_id: testPatient.id,
      doctor_id: testDoctor.id,
      diagnosis_text: 'Acute nasopharyngitis [common cold]',
      icd10_code: 'J00',
      diagnosis_type: 'confirmed',
      is_chronic: false,
    })

    assert.ok(diagnosis.id)
    assert.strictEqual(diagnosis.icd10_code, 'J00')
    assert.strictEqual(diagnosis.diagnosis_type, 'confirmed')
  })

  it('8. Medicine Master & Search: should locate medicines across brand and generic names', async () => {
    const pcmResults = await searchMedicines('Paracetamol')
    assert.ok(pcmResults.length > 0, 'Should find Paracetamol in medicines master')
    assert.ok(pcmResults.some((m) => m.generic_name.toLowerCase().includes('paracetamol')))

    const brandResults = await searchMedicines('Dolo')
    assert.ok(brandResults.length > 0, 'Should find Dolo brand')
    assert.strictEqual(brandResults[0].brand_name, 'Dolo 650')
  })

  it('9. Digital Prescription Composer: should build structured prescription draft with dosage', async () => {
    const meds = await searchMedicines('Paracetamol')
    const paracetamol = meds[0]

    const draft = await createOrUpdatePrescriptionDraft(testEncounterId, testDoctor.id, {
      diagnosisSummary: 'Acute nasopharyngitis',
      adviceGeneral: 'Warm fluid intake, adequate sleep',
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      followUpReason: 'Clinical review',
      items: [
        {
          medicine_id: paracetamol.id,
          medicine_name: `${paracetamol.brand_name} (${paracetamol.strength})`,
          generic_name: paracetamol.generic_name,
          brand_name: paracetamol.brand_name,
          dosage_form: paracetamol.dosage_form,
          strength: paracetamol.strength,
          dose: '1 tablet',
          route: 'Oral',
          frequency: '1-0-1',
          timing: 'after_food',
          duration_value: 5,
          duration_unit: 'days',
          quantity: 10,
        },
      ],
    })

    assert.strictEqual(draft.success, true)
    assert.ok(draft.prescription_id)
    testPrescriptionId = draft.prescription_id
  })

  it('10. Validated Clinical Safety Checks: should detect duplicate ingredients and output disclaimer', async () => {
    // Evaluate combination that has duplicate paracetamol: Dolo 650 + Combiflam
    const safety = await runPrescriptionSafetyChecks(testPatient.id, [
      { medicine_name: 'Dolo 650', generic_name: 'Paracetamol', dosage_form: 'tablet' },
      { medicine_name: 'Combiflam', generic_name: 'Ibuprofen + Paracetamol', dosage_form: 'tablet' },
    ])

    assert.strictEqual(safety.is_safe, false, 'Should flag duplicate paracetamol as unsafe')
    assert.ok(safety.alerts.some((a) => a.type === 'duplicate_ingredient'))
    assert.ok(safety.disclaimer.includes('Absence of an automated alert does NOT certify clinical safety'))
  })

  it('11. Digital Signing & Cryptographic Immutability: should sign prescription with SHA-256 stamp', async () => {
    const signed = await signAndFinalizePrescription(testPrescriptionId, testDoctor.id, '1f3e75fe-855b-4677-a298-620ce7807028')
    assert.strictEqual(signed.success, true)
    assert.ok(signed.signature_hash, 'Must generate cryptographic hash')
    assert.strictEqual(signed.signature_hash.length, 64) // SHA-256 is 64 hex characters
  })

  it('12. Prescription Printing & Delivery: should format bilingual print data and simulate delivery', async () => {
    const printData = await getPrescriptionPrintData(testPrescriptionId)
    assert.ok(printData.prescription)
    assert.strictEqual(printData.prescription.id, testPrescriptionId)
    assert.ok(printData.prescription.items.length > 0)
    assert.ok(printData.prescription.items[0].bilingual_instructions)
    assert.ok(printData.prescription.items[0].bilingual_instructions.bengali)
    assert.ok(printData.prescription.items[0].bilingual_instructions.hindi)

    const delivery = await deliverPrescription(testPrescriptionId, 'whatsapp', '9876543210')
    assert.strictEqual(delivery.success, true)
    assert.strictEqual(delivery.delivered_via, 'whatsapp')
  })

  it('13. Diagnostic Ordering: should add laboratory investigation request', async () => {
    const inv = await addInvestigationRequest(testEncounterId, {
      patient_id: testPatient.id,
      doctor_id: testDoctor.id,
      test_name: 'Complete Blood Count (CBC) with ESR',
      priority: 'routine',
      clinical_indication: 'Baseline hematology evaluation for febrile episode',
    })

    assert.ok(inv.id)
    assert.strictEqual(inv.test_name, 'Complete Blood Count (CBC) with ESR')
    assert.strictEqual(inv.status, 'recommended')
  })

  it('14. Clinical Templates & Roster: should retrieve standard specialty templates', async () => {
    const templates = await getClinicalTemplates()
    assert.ok(templates.length >= 5, 'Should find at least 5 standard specialty templates')
    assert.ok(templates.some((t) => t.specialty === 'General Medicine'))
    assert.ok(templates.some((t) => t.specialty === 'Pediatrics'))
    assert.ok(templates.some((t) => t.specialty === 'Cardiology'))

    const roster = await getDoctorScheduleAndRoster(testDoctor.id)
    assert.ok(Array.isArray(roster))
  })

  it('15. Consultation Completion & CareFlow Recall: should finalize consultation and register follow-up', async () => {
    const comp = await completeConsultation(testEncounterId, testDoctor.id)
    assert.strictEqual(comp.success, true)
    assert.strictEqual(comp.status, 'completed')

    // Verify appointment status updated to completed
    const { data: apt } = await supabase.from('appointments').select('status').eq('id', testAppointment.id).single()
    assert.strictEqual(apt.status, 'completed')

    // Verify CareFlow task exists for this patient follow-up
    const { data: tasks } = await supabase.from('careflow_tasks').select('id, status').eq('patient_id', testPatient.id)
    assert.ok((tasks?.length || 0) > 0, 'CareFlow follow-up task should be registered')
  })

  it('16. Super Admin Clinical Governance & Audit: should retrieve governance metrics and audit log', async () => {
    const gov = await getClinicalGovernanceOverview()
    assert.ok(gov.doctors_count > 0)
    assert.ok(gov.formulary_medicines_count > 0)
    assert.ok(gov.signed_prescriptions > 0)

    // Verify audit log record
    await recordClinicalAuditEvent({
      patient_id: testPatient.id,
      doctor_id: testDoctor.id,
      event_type: 'break_glass_access',
      reason: 'Emergency clinical verification test',
    })

    const { data: auditEvents } = await supabase
      .from('clinical_audit_events')
      .select('id, event_type')
      .eq('event_type', 'break_glass_access')
      .limit(1)

    assert.ok(auditEvents && auditEvents.length > 0, 'Break glass event must be audited')
  })
})
