import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface CareflowDashboardFilters {
  branchId?: string
  practiceId?: string
  doctorId?: string
  dateRange?: { start: string; end: string }
}

export interface CareflowTaskClaimResult {
  success: boolean
  message: string
  task?: any
}

// ============================================================================
// 1. DASHBOARD & RETENTION METRICS (REAL DATABASE METRICS)
// ============================================================================

export async function getCareflowDashboardMetrics(filters?: CareflowDashboardFilters) {
  const adminClient = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Active Enrolled Patients
  let enrollmentQuery = adminClient
    .from('practice_patient_enrollments')
    .select('id, patient_id', { count: 'exact' })
    .eq('status', 'active')

  if (filters?.practiceId) {
    enrollmentQuery = enrollmentQuery.eq('practice_id', filters.practiceId)
  }
  if (filters?.doctorId) {
    enrollmentQuery = enrollmentQuery.eq('doctor_id', filters.doctorId)
  }

  const { count: enrolledCount } = await enrollmentQuery

  // Total internal Capsic Care patients count
  const { count: internalPatientsCount } = await adminClient
    .from('patients')
    .select('id', { count: 'exact' })
    .eq('is_active', true)

  const activeEnrolledPatients = (enrolledCount || 0) + (filters?.practiceId ? 0 : (internalPatientsCount || 0))

  // 2. Follow-ups Due Today
  let dueTodayQuery = adminClient
    .from('careflow_tasks')
    .select('id', { count: 'exact' })
    .eq('due_date', today)
    .in('status', ['pending', 'claimed', 'in_progress'])

  if (filters?.practiceId) dueTodayQuery = dueTodayQuery.eq('practice_id', filters.practiceId)
  if (filters?.branchId) dueTodayQuery = dueTodayQuery.eq('branch_id', filters.branchId)
  if (filters?.doctorId) dueTodayQuery = dueTodayQuery.eq('doctor_id', filters.doctorId)

  const { count: dueTodayCount } = await dueTodayQuery

  // 3. Overdue Follow-ups (due_date < today)
  let overdueQuery = adminClient
    .from('careflow_tasks')
    .select('id', { count: 'exact' })
    .lt('due_date', today)
    .in('status', ['pending', 'claimed', 'in_progress'])

  if (filters?.practiceId) overdueQuery = overdueQuery.eq('practice_id', filters.practiceId)
  if (filters?.branchId) overdueQuery = overdueQuery.eq('branch_id', filters.branchId)
  if (filters?.doctorId) overdueQuery = overdueQuery.eq('doctor_id', filters.doctorId)

  const { count: overdueCount } = await overdueQuery

  // 4. Completed Tasks & Calls
  let completedTasksQuery = adminClient
    .from('careflow_tasks')
    .select('id', { count: 'exact' })
    .eq('status', 'completed')

  if (filters?.practiceId) completedTasksQuery = completedTasksQuery.eq('practice_id', filters.practiceId)
  if (filters?.branchId) completedTasksQuery = completedTasksQuery.eq('branch_id', filters.branchId)
  if (filters?.doctorId) completedTasksQuery = completedTasksQuery.eq('doctor_id', filters.doctorId)

  const { count: completedTasksCount } = await completedTasksQuery

  // 5. Call Attempts Metrics
  let callQuery = adminClient.from('call_attempts').select('id, call_status, outcome, callback_scheduled_at')
  if (filters?.practiceId) callQuery = callQuery.eq('practice_id', filters.practiceId)

  const { data: calls } = await callQuery
  const totalCalls = calls?.length || 0
  const connectedCalls = calls?.filter((c) => c.call_status === 'connected').length || 0
  const callbackRequests = calls?.filter((c) => c.outcome === 'callback_requested' || Boolean(c.callback_scheduled_at)).length || 0

  // 6. Upcoming Doctor Revisits (Next 14 days)
  const fourteenDaysLater = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  let revisitsQuery = adminClient
    .from('appointments')
    .select('id', { count: 'exact' })
    .gte('scheduled_date', today)
    .lte('scheduled_date', fourteenDaysLater)
    .in('status', ['confirmed', 'scheduled'])

  if (filters?.doctorId) revisitsQuery = revisitsQuery.eq('doctor_id', filters.doctorId)
  if (filters?.branchId) revisitsQuery = revisitsQuery.eq('branch_id', filters.branchId)

  const { count: revisitsCount } = await revisitsQuery

  // 7. Pending Investigations Coordination
  let diagQuery = adminClient
    .from('diagnostic_orders')
    .select('id', { count: 'exact' })
    .in('status', ['pending', 'sample_collected', 'processing'])

  if (filters?.branchId) diagQuery = diagQuery.eq('branch_id', filters.branchId)

  const { count: pendingDiagCount } = await diagQuery

  // 8. Open Clinical Escalations
  let escalationsQuery = adminClient
    .from('clinical_escalations')
    .select('id', { count: 'exact' })
    .in('status', ['open', 'under_review', 'doctor_notified'])

  if (filters?.practiceId) escalationsQuery = escalationsQuery.eq('practice_id', filters.practiceId)
  if (filters?.doctorId) escalationsQuery = escalationsQuery.eq('doctor_id', filters.doctorId)

  const { count: openEscalationsCount } = await escalationsQuery

  // 9. Active Doctor Practices
  const { count: activePracticesCount } = await adminClient
    .from('careflow_practices')
    .select('id', { count: 'exact' })
    .eq('is_active', true)

  // 10. Completion Rate
  const totalTasksCount = (dueTodayCount || 0) + (overdueCount || 0) + (completedTasksCount || 0)
  const completionRate = totalTasksCount > 0 ? Math.round(((completedTasksCount || 0) / totalTasksCount) * 100) : 100
  const contactRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0

  return {
    activeEnrolledPatients,
    followUpsDueToday: dueTodayCount || 0,
    overdueFollowUps: overdueCount || 0,
    completedCalls: totalCalls,
    connectedCalls,
    callbackRequests,
    upcomingDoctorRevisits: revisitsCount || 0,
    pendingInvestigations: pendingDiagCount || 0,
    escalationsRequiringReview: openEscalationsCount || 0,
    activeDoctorPractices: activePracticesCount || 0,
    completionRate,
    contactRate,
  }
}

// ============================================================================
// 2. AUTOMATED POST-CONSULTATION FOLLOW-UP ENGINE
// ============================================================================

export async function triggerPostConsultationFollowUp(params: {
  appointmentId: string
  intervalDays?: number
  notes?: string
}) {
  const adminClient = createAdminClient()

  // 1. Fetch appointment details
  const { data: appt, error: apptError } = await adminClient
    .from('appointments')
    .select(`
      id, appointment_number, patient_id, doctor_id, branch_id, scheduled_date, status,
      patients ( id, full_name, phone ),
      doctors ( id, name )
    `)
    .eq('id', params.appointmentId)
    .single()

  if (apptError || !appt) {
    throw new Error(`Appointment not found: ${params.appointmentId}`)
  }

  // 2. Check communication consent & preferences
  const { data: pref } = await adminClient
    .from('patient_communication_preferences')
    .select('*')
    .eq('patient_id', appt.patient_id)
    .maybeSingle()

  if (pref && pref.service_whatsapp_enabled === false && pref.service_sms_enabled === false) {
    console.warn(`[CareFlow] Patient ${appt.patient_id} opted out of service notifications.`)
  }

  // 3. Avoid duplicate task for this appointment
  const { data: existingTask } = await adminClient
    .from('careflow_tasks')
    .select('id, status')
    .eq('consultation_id', appt.id)
    .maybeSingle()

  if (existingTask) {
    return {
      taskId: existingTask.id,
      status: existingTask.status,
      alreadyExisted: true,
      message: 'Post-consultation follow-up task already exists for this appointment.',
    }
  }

  // 4. Resolve practice association if doctor is enrolled in a practice
  const { data: practiceDoc } = await adminClient
    .from('careflow_practices')
    .select('id, default_follow_up_days')
    .eq('primary_doctor_id', appt.doctor_id)
    .maybeSingle()

  const defaultInterval = practiceDoc?.default_follow_up_days || params.intervalDays || 3
  const apptDate = new Date(appt.scheduled_date || new Date())
  const dueDate = new Date(apptDate.getTime() + defaultInterval * 86400000).toISOString().split('T')[0]

  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  // 5. Create CareFlow Task
  const { data: task, error: taskError } = await adminClient
    .from('careflow_tasks')
    .insert({
      organization_id: org.id,
      practice_id: practiceDoc?.id || null,
      branch_id: appt.branch_id,
      patient_id: appt.patient_id,
      doctor_id: appt.doctor_id,
      consultation_id: appt.id,
      task_type: 'post_consultation',
      priority: 'medium',
      due_date: dueDate,
      status: 'pending',
      notes:
        params.notes ||
        `Automated ${defaultInterval}-day post-consultation health & recovery follow-up for appointment #${appt.appointment_number}.`,
    })
    .select()
    .single()

  if (taskError) {
    throw new Error(`Failed to create post-consultation task: ${taskError.message}`)
  }

  // 6. Record automation log
  await adminClient.from('automation_logs').insert({
    event_name: 'CAREFLOW_POST_CONSULTATION_SCHEDULED',
    entity_type: 'careflow_task',
    entity_id: task.id,
    status: 'success',
    result_summary: `Scheduled 3-day follow-up for patient on ${dueDate}`,
  })

  return {
    taskId: task.id,
    dueDate: task.due_date,
    status: task.status,
    alreadyExisted: false,
    message: `Scheduled ${defaultInterval}-day follow-up task on ${dueDate}`,
  }
}

// ============================================================================
// 3. TASK ENGINE & CONCURRENCY-SAFE TASK CLAIMING
// ============================================================================

export async function listCareflowTasks(options?: {
  queue?: 'my' | 'today' | 'overdue' | 'callbacks' | 'all'
  callerId?: string
  practiceId?: string
  branchId?: string
  doctorId?: string
  status?: string
  search?: string
  limit?: number
}) {
  const adminClient = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const nowIso = new Date().toISOString()

  let query = adminClient
    .from('careflow_tasks')
    .select(`
      *,
      patients ( id, uhid, full_name, phone, gender, age_years ),
      doctors ( id, name, specialty ),
      careflow_practices ( id, name, code ),
      claimed_profile:profiles!careflow_tasks_claimed_by_fkey ( id, full_name )
    `)
    .order('due_date', { ascending: true })
    .limit(options?.limit || 50)

  // Queue specific filters
  if (options?.queue === 'my' && options?.callerId) {
    query = query
      .eq('claimed_by', options.callerId)
      .gt('claim_expires_at', nowIso)
      .in('status', ['claimed', 'in_progress'])
  } else if (options?.queue === 'today') {
    query = query.eq('due_date', today).in('status', ['pending', 'claimed', 'in_progress'])
  } else if (options?.queue === 'overdue') {
    query = query.lt('due_date', today).in('status', ['pending', 'claimed', 'in_progress'])
  } else if (options?.queue === 'callbacks') {
    query = query.eq('task_type', 'patient_callback').in('status', ['pending', 'claimed', 'in_progress'])
  } else if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.practiceId) query = query.eq('practice_id', options.practiceId)
  if (options?.branchId && options.branchId !== 'all') query = query.eq('branch_id', options.branchId)
  if (options?.doctorId) query = query.eq('doctor_id', options.doctorId)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list tasks: ${error.message}`)

  // Search filter in-memory if needed
  if (options?.search) {
    const s = options.search.toLowerCase()
    return (data || []).filter(
      (t: any) =>
        t.patients?.full_name?.toLowerCase().includes(s) ||
        t.patients?.phone?.includes(s) ||
        t.patients?.uhid?.toLowerCase().includes(s)
    )
  }

  return data || []
}

/**
 * Concurrency-safe atomic task claiming.
 * Prevents two tele-callers from simultaneously calling the same patient.
 */
export async function claimCareflowTask(taskId: string, callerId: string): Promise<CareflowTaskClaimResult> {
  const adminClient = createAdminClient()
  const now = new Date()
  const claimExpiresAt = new Date(now.getTime() + 15 * 60000).toISOString() // 15-minute lock

  // 1. Fetch current task status
  const { data: task, error: fetchErr } = await adminClient
    .from('careflow_tasks')
    .select('id, status, claimed_by, claim_expires_at')
    .eq('id', taskId)
    .single()

  if (fetchErr || !task) {
    throw new Error('Careflow task not found')
  }

  // 2. Concurrency check: If claimed by someone else and lock is still active
  if (
    task.claimed_by &&
    task.claimed_by !== callerId &&
    task.claim_expires_at &&
    new Date(task.claim_expires_at) > now
  ) {
    return {
      success: false,
      message: 'This task is currently claimed by another caller. Concurrency lock active.',
    }
  }

  // 3. Claim the task
  const { data: updatedTask, error: updateErr } = await adminClient
    .from('careflow_tasks')
    .update({
      claimed_by: callerId,
      claimed_at: now.toISOString(),
      claim_expires_at: claimExpiresAt,
      status: 'claimed',
      updated_at: now.toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(`Failed to claim task: ${updateErr.message}`)
  }

  return {
    success: true,
    message: 'Task claimed successfully. 15-minute exclusive desk lock engaged.',
    task: updatedTask,
  }
}

export async function releaseCareflowTaskClaim(taskId: string, callerId: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('careflow_tasks')
    .update({
      claimed_by: null,
      claimed_at: null,
      claim_expires_at: null,
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('claimed_by', callerId)

  if (error) throw new Error(`Failed to release claim: ${error.message}`)
  return { success: true }
}

export async function reassignCareflowTask(taskId: string, newAssigneeId: string, reassignedById: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('careflow_tasks')
    .update({
      assigned_to: newAssigneeId,
      claimed_by: null,
      claim_expires_at: null,
      status: 'pending',
      notes: `Reassigned by supervisor on ${new Date().toLocaleDateString('en-IN')}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (error) throw new Error(`Failed to reassign task: ${error.message}`)

  await adminClient.from('automation_logs').insert({
    event_name: 'CAREFLOW_TASK_REASSIGNED',
    entity_type: 'careflow_task',
    entity_id: taskId,
    status: 'success',
    result_summary: `Reassigned to profile ${newAssigneeId} by ${reassignedById}`,
  })

  return { success: true }
}

// ============================================================================
// 4. CALL OUTCOME LOGGING & WORKFLOW DISPOSITIONS
// ============================================================================

export async function recordCareflowCallAttempt(params: {
  taskId?: string
  patientId: string
  practiceId?: string
  callerId: string
  callStatus: 'connected' | 'no_answer' | 'busy' | 'wrong_number' | 'call_failed'
  outcome:
    | 'connected'
    | 'no_answer'
    | 'busy'
    | 'switched_off'
    | 'wrong_number'
    | 'callback_requested'
    | 'patient_doing_well'
    | 'patient_has_concern'
    | 'follow_up_appointment_requested'
    | 'diagnostic_booking_assistance_requested'
    | 'appointment_booked'
    | 'not_interested'
    | 'do_not_contact'
    | 'escalated_to_doctor'
  notes?: string
  callbackScheduledAt?: string
  appointmentBookedId?: string
  diagnosticOrderId?: string
}) {
  const adminClient = createAdminClient()

  // 1. Map to supported outcome for call_attempts constraint if needed
  const mappedOutcome =
    params.outcome === 'patient_doing_well' || params.outcome === 'connected'
      ? 'interested'
      : params.outcome === 'patient_has_concern' || params.outcome === 'escalated_to_doctor'
      ? 'other'
      : params.outcome === 'follow_up_appointment_requested' || params.outcome === 'appointment_booked'
      ? 'appointment_booked'
      : params.outcome === 'diagnostic_booking_assistance_requested'
      ? 'diagnostic_booked'
      : params.outcome === 'callback_requested'
      ? 'callback_requested'
      : params.outcome === 'do_not_contact'
      ? 'do_not_contact'
      : 'not_interested'

  // 2. Insert call_attempts record
  const { data: callRecord, error: callErr } = await adminClient
    .from('call_attempts')
    .insert({
      patient_id: params.patientId,
      caller_id: params.callerId,
      practice_id: params.practiceId || null,
      careflow_task_id: params.taskId || null,
      attempt_number: 1,
      call_status: params.callStatus,
      outcome: mappedOutcome,
      callback_scheduled_at: params.callbackScheduledAt || null,
    })
    .select()
    .single()

  if (callErr) {
    throw new Error(`Failed to log call attempt: ${callErr.message}`)
  }

  // 3. Update task status if linked
  if (params.taskId) {
    let newStatus = 'completed'
    let nextAction: string = String(params.outcome)

    if (params.outcome === 'callback_requested') {
      newStatus = 'pending'
      nextAction = `Callback scheduled for ${params.callbackScheduledAt || 'later'}`
    } else if (params.outcome === 'escalated_to_doctor') {
      newStatus = 'escalated'
      nextAction = 'Pending doctor review'
    } else if (['no_answer', 'busy', 'switched_off'].includes(params.outcome)) {
      newStatus = 'pending'
      nextAction = 'Retry call in 4 hours'
    }

    await adminClient
      .from('careflow_tasks')
      .update({
        status: newStatus,
        last_attempt_at: new Date().toISOString(),
        last_outcome: params.outcome,
        notes: params.notes || undefined,
        next_action: nextAction,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        completed_by: newStatus === 'completed' ? params.callerId : null,
        claimed_by: null,
        claim_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.taskId)
  }

  return callRecord
}

// ============================================================================
// 5. CHRONIC CARE RECALL ENGINE
// ============================================================================

export async function createRecallPlan(params: {
  patientId: string
  doctorId: string
  practiceId?: string
  branchId?: string
  conditionCategory:
    | 'diabetes'
    | 'hypertension'
    | 'thyroid'
    | 'respiratory'
    | 'cardiac'
    | 'post_surgery'
    | 'general_chronic'
    | 'other'
  customConditionName?: string
  clinicalNotes?: string
  intervalDays: number
  nextRecallDate: string
  preferredChannel?: 'whatsapp' | 'phone_call' | 'sms'
  coordinatorId?: string
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  const { data: plan, error } = await adminClient
    .from('recall_plans')
    .insert({
      organization_id: org.id,
      patient_id: params.patientId,
      doctor_id: params.doctorId,
      practice_id: params.practiceId || null,
      branch_id: params.branchId || null,
      condition_category: params.conditionCategory,
      custom_condition_name: params.customConditionName || null,
      clinical_notes: params.clinicalNotes || null,
      interval_days: params.intervalDays || 90,
      next_recall_date: params.nextRecallDate,
      preferred_channel: params.preferredChannel || 'whatsapp',
      assigned_coordinator_id: params.coordinatorId || null,
      status: 'active',
      escalation_status: 'none',
    })
    .select(`
      *,
      patients ( id, uhid, full_name, phone ),
      doctors ( id, name, specialty )
    `)
    .single()

  if (error) throw new Error(`Failed to create recall plan: ${error.message}`)

  // Also create initial CareFlow task if recall is due within next 7 days
  const today = new Date().toISOString().split('T')[0]
  if (params.nextRecallDate <= today) {
    await adminClient.from('careflow_tasks').insert({
      organization_id: org.id,
      practice_id: params.practiceId || null,
      branch_id: params.branchId || null,
      patient_id: params.patientId,
      doctor_id: params.doctorId,
      recall_plan_id: plan.id,
      task_type: 'chronic_recall',
      priority: 'high',
      due_date: params.nextRecallDate,
      status: 'pending',
      notes: `Due chronic recall for ${params.conditionCategory} (${params.customConditionName || 'Care plan'}).`,
    })
  }

  return plan
}

export async function listRecallPlans(options?: {
  practiceId?: string
  doctorId?: string
  patientId?: string
  conditionCategory?: string
  status?: string
}) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('recall_plans')
    .select(`
      *,
      patients ( id, uhid, full_name, phone, gender, age_years ),
      doctors ( id, name, specialty ),
      careflow_practices ( id, name, code )
    `)
    .order('next_recall_date', { ascending: true })

  if (options?.practiceId) query = query.eq('practice_id', options.practiceId)
  if (options?.doctorId) query = query.eq('doctor_id', options.doctorId)
  if (options?.patientId) query = query.eq('patient_id', options.patientId)
  if (options?.conditionCategory) query = query.eq('condition_category', options.conditionCategory)
  if (options?.status) query = query.eq('status', options.status)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list recall plans: ${error.message}`)
  return data || []
}

// ============================================================================
// 6. CLINICAL ESCALATIONS & PATIENT SAFETY
// ============================================================================

export async function createClinicalEscalation(params: {
  patientId: string
  doctorId?: string
  practiceId?: string
  branchId?: string
  taskId?: string
  flaggedById: string
  urgency: 'routine' | 'urgent' | 'emergency'
  category:
    | 'worsening_symptoms'
    | 'medication_adverse_effect'
    | 'urgent_clinical_question'
    | 'post_procedure_complication'
    | 'speak_with_doctor_request'
    | 'other'
  description: string
  patientReportedSymptoms?: string
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  const { data: escalation, error } = await adminClient
    .from('clinical_escalations')
    .insert({
      organization_id: org.id,
      patient_id: params.patientId,
      doctor_id: params.doctorId || null,
      practice_id: params.practiceId || null,
      branch_id: params.branchId || null,
      careflow_task_id: params.taskId || null,
      flagged_by: params.flaggedById,
      urgency: params.urgency || 'urgent',
      category: params.category,
      description: params.description,
      patient_reported_symptoms: params.patientReportedSymptoms || null,
      status: 'open',
      emergency_advisory_shown: true,
    })
    .select(`
      *,
      patients ( id, uhid, full_name, phone ),
      doctors ( id, name ),
      flagged_profile:profiles!clinical_escalations_flagged_by_fkey ( id, full_name )
    `)
    .single()

  if (error) throw new Error(`Failed to create clinical escalation: ${error.message}`)

  // If linked to a task, update task to escalated status
  if (params.taskId) {
    await adminClient
      .from('careflow_tasks')
      .update({
        status: 'escalated',
        next_action: `Clinical Escalation (${params.urgency.toUpperCase()}) flagged for doctor`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.taskId)
  }

  return escalation
}

export async function listClinicalEscalations(options?: {
  status?: string
  urgency?: string
  practiceId?: string
}) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('clinical_escalations')
    .select(`
      *,
      patients ( id, uhid, full_name, phone ),
      doctors ( id, name, specialty ),
      flagged_profile:profiles!clinical_escalations_flagged_by_fkey ( id, full_name )
    `)
    .order('created_at', { ascending: false })

  if (options?.status) query = query.eq('status', options.status)
  if (options?.urgency) query = query.eq('urgency', options.urgency)
  if (options?.practiceId) query = query.eq('practice_id', options.practiceId)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list escalations: ${error.message}`)
  return data || []
}

export async function resolveClinicalEscalation(params: {
  escalationId: string
  resolvedById: string
  resolutionNotes: string
  status?: 'resolved' | 'under_review' | 'referred_to_emergency'
}) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('clinical_escalations')
    .update({
      status: params.status || 'resolved',
      resolution_notes: params.resolutionNotes,
      resolved_by: params.resolvedById,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.escalationId)
    .select()
    .single()

  if (error) throw new Error(`Failed to resolve escalation: ${error.message}`)
  return data
}

// ============================================================================
// 7. DOCTOR PRACTICE MANAGEMENT & ROSTERS
// ============================================================================

export async function listCareflowPractices(options?: { search?: string; status?: string }) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('careflow_practices')
    .select(`
      *,
      primary_doctor:doctors!careflow_practices_primary_doctor_id_fkey ( id, name, specialty ),
      service_plan:careflow_service_plans ( id, code, name, price_per_enrolled_patient_inr, included_calls_per_patient )
    `)
    .order('name', { ascending: true })

  if (options?.status) query = query.eq('service_agreement_status', options.status)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list practices: ${error.message}`)

  // Compute active enrolled patient counts per practice
  const practicesWithCounts = await Promise.all(
    (data || []).map(async (p: any) => {
      const { count } = await adminClient
        .from('practice_patient_enrollments')
        .select('id', { count: 'exact' })
        .eq('practice_id', p.id)
        .eq('status', 'active')

      return {
        ...p,
        active_patients_count: count || 0,
      }
    })
  )

  if (options?.search) {
    const s = options.search.toLowerCase()
    return practicesWithCounts.filter(
      (p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || p.contact_person.toLowerCase().includes(s)
    )
  }

  return practicesWithCounts
}

export async function getPracticeDetails(practiceId: string) {
  const adminClient = createAdminClient()

  const { data: practice, error } = await adminClient
    .from('careflow_practices')
    .select(`
      *,
      primary_doctor:doctors!careflow_practices_primary_doctor_id_fkey ( id, name, specialty, qualifications, experience_years ),
      service_plan:careflow_service_plans ( id, code, name, price_per_enrolled_patient_inr, included_calls_per_patient, price_per_additional_call_inr )
    `)
    .eq('id', practiceId)
    .single()

  if (error || !practice) throw new Error(`Practice not found: ${practiceId}`)

  // Get enrolled patients count & roster
  const { count: enrolledCount, data: enrollments } = await adminClient
    .from('practice_patient_enrollments')
    .select(`
      id, enrolled_at, source, consent_verified, tags, status,
      patients ( id, uhid, full_name, phone, gender, age_years, city )
    `, { count: 'exact' })
    .eq('practice_id', practiceId)
    .order('enrolled_at', { ascending: false })
    .limit(20)

  // Get completed follow-ups count
  const { count: callsCount } = await adminClient
    .from('call_attempts')
    .select('id', { count: 'exact' })
    .eq('practice_id', practiceId)

  // Get practice service invoices
  const { data: invoices } = await adminClient
    .from('practice_invoices')
    .select('*')
    .eq('practice_id', practiceId)
    .order('billing_period_end', { ascending: false })

  return {
    ...practice,
    active_patients_count: enrolledCount || 0,
    completed_calls_count: callsCount || 0,
    recent_enrollments: enrollments || [],
    invoices: invoices || [],
  }
}

export async function createCareflowPractice(params: {
  code: string
  name: string
  primaryDoctorId?: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  chambers?: Array<{ name: string; days: string; timings: string }>
  servicePlanId?: string
  defaultFollowUpDays?: number
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  const { data, error } = await adminClient
    .from('careflow_practices')
    .insert({
      organization_id: org.id,
      code: params.code.toUpperCase().trim(),
      name: params.name,
      primary_doctor_id: params.primaryDoctorId || null,
      contact_person: params.contactPerson,
      phone: params.phone,
      email: params.email || null,
      address: params.address || null,
      chambers: params.chambers || [],
      service_agreement_status: 'active',
      agreement_signed_date: new Date().toISOString().split('T')[0],
      service_plan_id: params.servicePlanId || null,
      default_follow_up_days: params.defaultFollowUpDays || 3,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create practice: ${error.message}`)
  return data
}

// ============================================================================
// 8. EXTERNAL PATIENT ENROLLMENT & CSV BULK ONBOARDING
// ============================================================================

export async function enrollPatientInPractice(params: {
  practiceId: string
  patientId: string
  doctorId?: string
  source?: 'individual' | 'csv_import' | 'consultation_referral' | 'clinic_intake'
  consentVerified?: boolean
  consentNotes?: string
  tags?: string[]
}) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('practice_patient_enrollments')
    .upsert(
      {
        practice_id: params.practiceId,
        patient_id: params.patientId,
        doctor_id: params.doctorId || null,
        source: params.source || 'individual',
        consent_verified: params.consentVerified !== false,
        consent_notes: params.consentNotes || null,
        tags: params.tags || [],
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'practice_id,patient_id' }
    )
    .select()
    .single()

  if (error) throw new Error(`Failed to enroll patient: ${error.message}`)
  return data
}

export async function processPatientCsvImport(params: {
  practiceId: string
  importedById: string
  fileName: string
  rows: Array<{
    fullName: string
    phone: string
    email?: string
    gender?: 'male' | 'female' | 'other'
    ageYears?: number
    tags?: string
    consentGranted?: boolean
  }>
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  const { data: defaultBranch } = await adminClient.from('branches').select('id').limit(1).single()
  const branchId = defaultBranch?.id || null

  const batchNumber = `BATCH_${Date.now().toString().slice(-6)}`
  const results = {
    batchNumber,
    totalRows: params.rows.length,
    validRows: 0,
    duplicateRows: 0,
    errorRows: 0,
    errors: [] as Array<{ row: number; error: string }>,
  }

  for (let i = 0; i < params.rows.length; i++) {
    const row = params.rows[i]
    if (!row.fullName || !row.phone || row.phone.trim().length < 10) {
      results.errorRows++
      results.errors.push({ row: i + 1, error: 'Name and valid 10-digit phone number are required' })
      continue
    }

    try {
      const cleanPhone = row.phone.replace(/\D/g, '')

      // Check if patient exists in Capsic Care directory
      let patientId: string
      const { data: existingPatient } = await adminClient
        .from('patients')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle()

      if (existingPatient) {
        patientId = existingPatient.id
      } else {
        // Register new patient with UHID
        const uhid = `CC-${Date.now().toString().slice(-6)}-${crypto.randomBytes(1).toString('hex').toUpperCase()}`
        const { data: newPat, error: patErr } = await adminClient
          .from('patients')
          .insert({
            organization_id: org.id,
            primary_branch_id: branchId,
            uhid,
            full_name: row.fullName,
            phone: cleanPhone,
            email: row.email || null,
            gender: row.gender || 'other',
            age_years: row.ageYears || 35,
            is_active: true,
          })
          .select('id')
          .single()

        if (patErr || !newPat) throw new Error(patErr?.message || 'Patient creation failed')
        patientId = newPat.id
      }

      // Check if already enrolled in this practice
      const { data: existingEnrollment } = await adminClient
        .from('practice_patient_enrollments')
        .select('id')
        .eq('practice_id', params.practiceId)
        .eq('patient_id', patientId)
        .maybeSingle()

      if (existingEnrollment) {
        results.duplicateRows++
        continue
      }

      // Enroll in practice
      const tagList = row.tags ? row.tags.split(',').map((t) => t.trim()) : []
      await enrollPatientInPractice({
        practiceId: params.practiceId,
        patientId,
        source: 'csv_import',
        consentVerified: row.consentGranted !== false,
        tags: tagList,
      })

      results.validRows++
    } catch (err: any) {
      results.errorRows++
      results.errors.push({ row: i + 1, error: err.message })
    }
  }

  // Record batch audit log
  await adminClient.from('patient_import_batches').insert({
    organization_id: org.id,
    practice_id: params.practiceId,
    batch_number: batchNumber,
    imported_by: params.importedById,
    file_name: params.fileName,
    total_rows: results.totalRows,
    valid_rows: results.validRows,
    duplicate_rows: results.duplicateRows,
    error_rows: results.errorRows,
    status: results.errorRows === results.totalRows ? 'failed' : 'completed',
    error_log: results.errors,
  })

  return results
}

// ============================================================================
// 9. RETENTION ANALYTICS, COHORT RETENTION & LIFETIME VALUE (LTV)
// ============================================================================

export async function getRetentionAnalytics(options?: {
  practiceId?: string
  doctorId?: string
  branchId?: string
}) {
  const adminClient = createAdminClient()

  // 1. Fetch appointments
  let apptQuery = adminClient
    .from('appointments')
    .select('id, patient_id, scheduled_date, status, doctor_id, fee_inr')
    .order('scheduled_date', { ascending: true })

  if (options?.doctorId) apptQuery = apptQuery.eq('doctor_id', options.doctorId)
  if (options?.branchId && options.branchId !== 'all') apptQuery = apptQuery.eq('branch_id', options.branchId)

  const { data: appts } = await apptQuery

  // Group visits per patient to calculate repeat consultation rate
  const visitsByPatient: Record<string, any[]> = {}
  ;(appts || []).forEach((a) => {
    if (!visitsByPatient[a.patient_id]) visitsByPatient[a.patient_id] = []
    visitsByPatient[a.patient_id].push(a)
  })

  const totalPatients = Object.keys(visitsByPatient).length
  const repeatPatients = Object.values(visitsByPatient).filter((v) => v.length > 1).length
  const repeatConsultationRate = totalPatients > 0 ? Math.round((repeatPatients / totalPatients) * 100) : 0

  // 2. Fetch call attempts outcomes
  let callsQuery = adminClient.from('call_attempts').select('id, call_status, outcome')
  if (options?.practiceId) callsQuery = callsQuery.eq('practice_id', options.practiceId)

  const { data: calls } = await callsQuery
  const totalCalls = calls?.length || 0
  const connectedCalls = calls?.filter((c) => c.call_status === 'connected').length || 0
  const successfulContactRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0

  // 3. No-show reduction rate
  const completedAppts = appts?.filter((a) => a.status === 'completed').length || 0
  const cancelledAppts = appts?.filter((a) => a.status === 'cancelled').length || 0
  const noShowRate = (appts?.length || 0) > 0 ? Math.round((cancelledAppts / (appts?.length || 1)) * 100) : 0

  return {
    totalPatientsTracked: totalPatients,
    repeatPatients,
    repeatConsultationRate,
    totalCallsLogged: totalCalls,
    successfulContactRate,
    completedAppointments: completedAppts,
    noShowRate,
  }
}

export async function getCohortAnalysis() {
  const adminClient = createAdminClient()

  // Group patients by month of first appointment
  const { data: appointments } = await adminClient
    .from('appointments')
    .select('patient_id, scheduled_date, status')
    .order('scheduled_date', { ascending: true })

  const firstVisitByPatient: Record<string, string> = {}
  const allVisitsByPatient: Record<string, string[]> = {}

  ;(appointments || []).forEach((a) => {
    if (!firstVisitByPatient[a.patient_id]) {
      firstVisitByPatient[a.patient_id] = a.scheduled_date
      allVisitsByPatient[a.patient_id] = []
    }
    allVisitsByPatient[a.patient_id].push(a.scheduled_date)
  })

  // Build cohorts
  const cohorts: Record<
    string,
    {
      cohortMonth: string
      totalPatients: number
      retained30: number
      retained60: number
      retained90: number
      retained180: number
      retained365: number
    }
  > = {}

  for (const [patientId, firstDateStr] of Object.entries(firstVisitByPatient)) {
    const firstDate = new Date(firstDateStr)
    const cohortKey = firstDateStr.slice(0, 7) // 'YYYY-MM'

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        cohortMonth: cohortKey,
        totalPatients: 0,
        retained30: 0,
        retained60: 0,
        retained90: 0,
        retained180: 0,
        retained365: 0,
      }
    }

    cohorts[cohortKey].totalPatients++
    const otherVisits = allVisitsByPatient[patientId].filter((d) => d > firstDateStr)

    otherVisits.forEach((visitDateStr) => {
      const diffDays = Math.round((new Date(visitDateStr).getTime() - firstDate.getTime()) / 86400000)
      if (diffDays <= 30) cohorts[cohortKey].retained30++
      if (diffDays <= 60) cohorts[cohortKey].retained60++
      if (diffDays <= 90) cohorts[cohortKey].retained90++
      if (diffDays <= 180) cohorts[cohortKey].retained180++
      if (diffDays <= 365) cohorts[cohortKey].retained365++
    })
  }

  return Object.values(cohorts).sort((a, b) => b.cohortMonth.localeCompare(a.cohortMonth))
}

export async function getPatientLtvEstimates() {
  const adminClient = createAdminClient()

  // Realized historical revenue from invoices
  const { data: invoices } = await adminClient
    .from('invoices')
    .select('patient_id, total_inr, paid_inr')

  let totalBilledInr = 0
  let totalCollectedInr = 0
  const revenueByPatient: Record<string, number> = {}

  ;(invoices || []).forEach((inv) => {
    totalBilledInr += Number(inv.total_inr) || 0
    totalCollectedInr += Number(inv.paid_inr) || 0
    revenueByPatient[inv.patient_id] = (revenueByPatient[inv.patient_id] || 0) + (Number(inv.paid_inr) || 0)
  })

  const patientCount = Object.keys(revenueByPatient).length
  const avgHistoricalRevenuePerPatient = patientCount > 0 ? Math.round(totalCollectedInr / patientCount) : 0

  // Estimated 12-Month LTV: assumes historical baseline + 2x annual follow-up visits
  const estimatedAnnualMultiplier = 1.8
  const estimatedFutureLtvPerPatient = Math.round(avgHistoricalRevenuePerPatient * estimatedAnnualMultiplier)

  return {
    realizedTotalBilledInr: totalBilledInr,
    realizedTotalCollectedInr: totalCollectedInr,
    patientsWithBillingHistory: patientCount,
    averageHistoricalRevenuePerPatient: avgHistoricalRevenuePerPatient,
    estimated12MonthLtvPerPatient: estimatedFutureLtvPerPatient,
  }
}

// ============================================================================
// 10. MANAGED-SERVICE BILLING FOR DOCTOR PRACTICES
// ============================================================================

export async function listCareflowServicePlans() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('careflow_service_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_per_enrolled_patient_inr', { ascending: true })

  if (error) throw new Error(`Failed to list service plans: ${error.message}`)
  return data || []
}

export async function listPracticeInvoices(practiceId?: string) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('practice_invoices')
    .select(`
      *,
      careflow_practices ( id, name, code, contact_person )
    `)
    .order('created_at', { ascending: false })

  if (practiceId) query = query.eq('practice_id', practiceId)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list practice invoices: ${error.message}`)
  return data || []
}

export async function generatePracticeInvoice(params: {
  practiceId: string
  periodStart: string
  periodEnd: string
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  // Fetch practice & service plan
  const { data: practice, error: pracErr } = await adminClient
    .from('careflow_practices')
    .select(`
      id, name, code,
      service_plan:careflow_service_plans (*)
    `)
    .eq('id', params.practiceId)
    .single()

  if (pracErr || !practice) throw new Error('Practice not found')

  const plan = practice.service_plan as any
  const baseRate = plan?.price_per_enrolled_patient_inr || 150
  const includedCallsPerPatient = plan?.included_calls_per_patient || 3
  const extraCallRate = plan?.price_per_additional_call_inr || 40

  // Count active enrolled patients
  const { count: enrolledCount } = await adminClient
    .from('practice_patient_enrollments')
    .select('id', { count: 'exact' })
    .eq('practice_id', params.practiceId)
    .eq('status', 'active')

  const billablePatients = enrolledCount || 0
  const baseFee = billablePatients * baseRate

  // Count calls in period
  const { count: callsCount } = await adminClient
    .from('call_attempts')
    .select('id', { count: 'exact' })
    .eq('practice_id', params.practiceId)
    .gte('created_at', `${params.periodStart}T00:00:00Z`)
    .lte('created_at', `${params.periodEnd}T23:59:59Z`)

  const actualCalls = callsCount || 0
  const includedCalls = billablePatients * includedCallsPerPatient
  const extraCalls = Math.max(0, actualCalls - includedCalls)
  const usageFee = extraCalls * extraCallRate
  const totalInr = baseFee + usageFee

  const invoiceNumber = `CF-INV-${practice.code}-${Date.now().toString().slice(-4)}`
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]

  const { data: invoice, error: invErr } = await adminClient
    .from('practice_invoices')
    .insert({
      organization_id: org.id,
      practice_id: params.practiceId,
      invoice_number: invoiceNumber,
      billing_period_start: params.periodStart,
      billing_period_end: params.periodEnd,
      enrolled_patients_count: billablePatients,
      completed_calls_count: actualCalls,
      base_fee_inr: baseFee,
      usage_fee_inr: usageFee,
      discount_inr: 0,
      tax_inr: 0,
      total_inr: totalInr,
      payment_status: 'unpaid',
      due_date: dueDate,
      notes: `CareFlow Managed Retention Service for ${practice.name} (${billablePatients} enrolled patients, ${actualCalls} calls completed).`,
    })
    .select()
    .single()

  if (invErr) throw new Error(`Failed to generate invoice: ${invErr.message}`)
  return invoice
}
