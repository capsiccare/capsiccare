import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import {
  getCareflowDashboardMetrics,
  triggerPostConsultationFollowUp,
  listCareflowTasks,
  claimCareflowTask,
  releaseCareflowTaskClaim,
  reassignCareflowTask,
  recordCareflowCallAttempt,
  createRecallPlan,
  listRecallPlans,
  createClinicalEscalation,
  listClinicalEscalations,
  resolveClinicalEscalation,
  listCareflowPractices,
  getPracticeDetails,
  createCareflowPractice,
  processPatientCsvImport,
  getRetentionAnalytics,
  getCohortAnalysis,
  getPatientLtvEstimates,
  listCareflowServicePlans,
  generatePracticeInvoice,
  listPracticeInvoices,
} from '../../lib/modules/careflow/careflow-service'

describe('Step 08: CareFlow Patient Retention, Follow-Up & Doctor Relationship Management Engine', () => {
  const admin = createAdminClient()
  const branchId = '22222222-2222-4222-a222-222222222222'
  const patientId = '44444444-4444-4444-a444-444444444441'
  const doctorId = '33333333-3333-4333-a333-333333333331'

  let testPracticeId: string
  let testTaskId: string
  let testEscalationId: string
  let testRecallPlanId: string
  let testCallerUserId: string
  let testAppointmentId: string

  it('1. Database Tables: should verify all Step 08 tables exist in PostgreSQL', async () => {
    const tables = [
      'careflow_service_plans',
      'careflow_practices',
      'practice_members',
      'practice_patient_enrollments',
      'patient_import_batches',
      'recall_plans',
      'careflow_tasks',
      'clinical_escalations',
      'practice_invoices',
    ]

    for (const table of tables) {
      const { error } = await admin.from(table).select('id').limit(1)
      assert.ok(!error, `Table ${table} should exist without error: ${error?.message}`)
    }
  })

  it('2. Service Plans: should verify seeded plans CF_STARTER, CF_PRO, CF_ENTERPRISE', async () => {
    const plans = await listCareflowServicePlans()
    assert.ok(plans.length >= 3, 'Should have at least 3 active plans')

    const codes = plans.map((p) => p.code)
    assert.ok(codes.includes('CF_STARTER'), 'Should contain CF_STARTER')
    assert.ok(codes.includes('CF_PRO'), 'Should contain CF_PRO')
    assert.ok(codes.includes('CF_ENTERPRISE'), 'Should contain CF_ENTERPRISE')
  })

  it('3. Practice Management (Mode B): should register a new doctor chamber practice', async () => {
    const uniqueSuffix = Date.now().toString().slice(-4)
    const practice = await createCareflowPractice({
      code: `PRAC_TEST_${uniqueSuffix}`,
      name: `Dr. Roy Test Chamber ${uniqueSuffix}`,
      primaryDoctorId: doctorId,
      contactPerson: 'Dr. A. Roy',
      phone: '9830099999',
      email: `roy_${uniqueSuffix}@chamber.com`,
      address: '77 Lake Road, Kolkata',
      chambers: [
        { name: 'Evening Chamber', days: 'Mon, Wed, Fri', timings: '6:00 PM - 8:30 PM' },
      ],
      defaultFollowUpDays: 3,
    })

    assert.ok(practice.id, 'Practice should have an ID')
    assert.equal(practice.name, `Dr. Roy Test Chamber ${uniqueSuffix}`)
    testPracticeId = practice.id

    const details = await getPracticeDetails(testPracticeId)
    assert.equal(details.id, testPracticeId)
    assert.equal(details.active_patients_count, 0)
  })

  it('4. CSV Patient Import & Duplicate Detection: should process batch import', async () => {
    const { data: profile } = await admin.from('profiles').select('id').limit(1).single()
    testCallerUserId = profile?.id || '11111111-1111-4111-a111-111111111111'

    const rows = [
      {
        fullName: 'Import Patient Alpha',
        phone: '9830199991',
        email: 'alpha@test.com',
        gender: 'male' as const,
        ageYears: 42,
        tags: 'Diabetes',
        consentGranted: true,
      },
      {
        fullName: 'Import Patient Beta',
        phone: '9830199992',
        email: 'beta@test.com',
        gender: 'female' as const,
        ageYears: 36,
        tags: 'Hypertension',
        consentGranted: true,
      },
      // Duplicate of Alpha to test duplicate detection
      {
        fullName: 'Import Patient Alpha Duplicate',
        phone: '9830199991',
        email: 'alpha_dup@test.com',
        gender: 'male' as const,
        ageYears: 42,
        tags: 'Diabetes',
        consentGranted: true,
      },
    ]

    const result = await processPatientCsvImport({
      practiceId: testPracticeId,
      importedById: testCallerUserId,
      fileName: 'test_patients.csv',
      rows,
    })

    assert.equal(result.totalRows, 3)
    assert.equal(result.validRows, 2, '2 unique patients should be imported')
    assert.equal(result.duplicateRows, 1, '1 duplicate patient should be skipped')
    assert.equal(result.errorRows, 0)
  })

  it('5. Post-Consultation Follow-Up Automation: should create a 3-day recovery task', async () => {
    // Look up or use existing appointment
    const { data: appt } = await admin.from('appointments').select('id').limit(1).single()
    assert.ok(appt?.id, 'Appointment should exist')
    testAppointmentId = appt.id

    const taskResult = await triggerPostConsultationFollowUp({
      appointmentId: testAppointmentId,
      intervalDays: 3,
      notes: 'Patient prescribed ACE inhibitors for BP stabilization.',
    })

    assert.ok(taskResult.taskId, 'Task should have an ID')
    assert.ok(taskResult.status, 'Task should have a status')
    testTaskId = taskResult.taskId

    // Test idempotency: calling again should not create duplicate task
    const duplicateResult = await triggerPostConsultationFollowUp({
      appointmentId: testAppointmentId,
      intervalDays: 3,
    })

    assert.equal(duplicateResult.taskId, testTaskId, 'Idempotency check should return existing task')
    assert.equal(duplicateResult.alreadyExisted, true, 'Should mark alreadyExisted = true')
  })

  it('6. Task Concurrency Locking: should claim, block collision, release, and reassign', async () => {
    // Reset task to pending & unassigned before locking test
    await admin
      .from('careflow_tasks')
      .update({ status: 'pending', claimed_by: null, claim_expires_at: null })
      .eq('id', testTaskId)

    // 1. Claim task
    const claimed = await claimCareflowTask(testTaskId, testCallerUserId)
    assert.equal(claimed.success, true)
    assert.equal(claimed.task.status, 'claimed')
    assert.equal(claimed.task.claimed_by, testCallerUserId)
    assert.ok(claimed.task.claim_expires_at, 'Should have lock expiration timestamp')

    // 2. Collision test: another user trying to claim should be rejected by concurrency lock
    const otherUserId = '99999999-9999-4999-a999-999999999999'
    const collision = await claimCareflowTask(testTaskId, otherUserId)
    assert.equal(collision.success, false)
    assert.ok(collision.message.includes('currently claimed by another caller'))

    // 3. Release lock
    const releaseRes = await releaseCareflowTaskClaim(testTaskId, testCallerUserId)
    assert.equal(releaseRes.success, true)

    const { data: releasedTask } = await admin.from('careflow_tasks').select('status, claimed_by').eq('id', testTaskId).single()
    assert.equal(releasedTask?.status, 'pending')
    assert.equal(releasedTask?.claimed_by, null)

    // 4. Reassign task
    const reassignRes = await reassignCareflowTask(testTaskId, testCallerUserId, testCallerUserId)
    assert.equal(reassignRes.success, true)
  })

  it('7. Tele-Caller Disposition Logging: should record call outcome and complete task', async () => {
    const callRecord = await recordCareflowCallAttempt({
      taskId: testTaskId,
      patientId,
      practiceId: testPracticeId,
      callerId: testCallerUserId,
      callStatus: 'connected',
      outcome: 'patient_doing_well',
      notes: 'Patient reports BP normalized to 124/82. No headaches. Continuing medication.',
    })

    assert.ok(callRecord.id, 'Call record should have an ID')
    assert.equal(callRecord.call_status, 'connected')

    // Verify task status was updated to completed
    const { data: updatedTask } = await admin
      .from('careflow_tasks')
      .select('status')
      .eq('id', testTaskId)
      .single()

    assert.equal(updatedTask?.status, 'completed')
  })

  it('8. Chronic Care Recall Engine: should create and list chronic recall plans', async () => {
    const nextDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    const plan = await createRecallPlan({
      patientId,
      doctorId,
      practiceId: testPracticeId,
      branchId,
      conditionCategory: 'diabetes',
      customConditionName: 'Type 2 Diabetes Mellitus',
      clinicalNotes: 'Check quarterly HbA1c and titration of Metformin.',
      intervalDays: 90,
      nextRecallDate: nextDate,
      preferredChannel: 'phone_call',
      coordinatorId: testCallerUserId,
    })

    assert.ok(plan.id, 'Recall plan should have an ID')
    assert.equal(plan.condition_category, 'diabetes')
    assert.equal(plan.interval_days, 90)
    testRecallPlanId = plan.id

    const plans = await listRecallPlans({ patientId })
    assert.ok(plans.length >= 1, 'Should find at least 1 plan for patient')
  })

  it('9. Clinical Safety & Adverse Symptom Escalations: should flag and resolve', async () => {
    const escalation = await createClinicalEscalation({
      patientId,
      doctorId,
      practiceId: testPracticeId,
      branchId,
      urgency: 'urgent',
      category: 'worsening_symptoms',
      description: 'Patient reports persistent dizziness and blood pressure spike to 170/105.',
      patientReportedSymptoms: 'severe dizziness, elevated BP',
      flaggedById: testCallerUserId,
    })

    assert.ok(escalation.id, 'Escalation should have an ID')
    assert.equal(escalation.urgency, 'urgent')
    assert.equal(escalation.status, 'open')
    testEscalationId = escalation.id

    // Resolve escalation
    const resolved = await resolveClinicalEscalation({
      escalationId: testEscalationId,
      resolvedById: testCallerUserId,
      resolutionNotes: 'Dr. Roy contacted. Dose adjusted to Telmisartan 40mg. Patient advised bed rest.',
      status: 'resolved',
    })

    assert.equal(resolved.status, 'resolved')
    assert.ok(resolved.resolved_at, 'Should record resolved_at timestamp')
  })

  it('10. Retention Analytics, Cohort Matrix & Transparent LTV: should calculate metrics', async () => {
    const retention = await getRetentionAnalytics({ branchId })
    assert.ok(typeof retention.totalPatientsTracked === 'number')
    assert.ok(typeof retention.repeatConsultationRate === 'number')

    const cohorts = await getCohortAnalysis()
    assert.ok(Array.isArray(cohorts), 'Cohorts should be an array')

    const ltv = await getPatientLtvEstimates()
    assert.ok(typeof ltv.realizedTotalBilledInr === 'number', 'Realized billed must be a number')
    assert.ok(typeof ltv.realizedTotalCollectedInr === 'number', 'Realized collected must be a number')
    assert.ok(typeof ltv.averageHistoricalRevenuePerPatient === 'number', 'Avg historical revenue must be a number')
    assert.ok(typeof ltv.estimated12MonthLtvPerPatient === 'number', 'Estimated LTV must be a number')

    // Confirm transparent distinction: future projection > 0 if historical revenue > 0
    if (ltv.averageHistoricalRevenuePerPatient > 0) {
      assert.ok(
        ltv.estimated12MonthLtvPerPatient >= ltv.averageHistoricalRevenuePerPatient,
        'Projected 12M LTV should extrapolate from historical baseline'
      )
    }
  })

  it('11. Practice Invoicing: should generate monthly service statement', async () => {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const invoice = await generatePracticeInvoice({
      practiceId: testPracticeId,
      periodStart,
      periodEnd,
    })

    assert.ok(invoice.id, 'Invoice should have an ID')
    assert.ok(invoice.invoice_number, 'Invoice should have a readable number')
    assert.ok(Number(invoice.total_inr) >= 0, 'Invoice total must be non-negative')
    assert.equal(invoice.payment_status, 'unpaid')

    const invoices = await listPracticeInvoices(testPracticeId)
    assert.ok(invoices.length >= 1, 'Should find practice invoice')
  })
})
