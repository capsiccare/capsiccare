import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface FeedbackInput {
  branchId: string
  patientId: string
  appointmentId?: string | null
  diagnosticOrderId?: string | null
  ratingOverall: number // 1 to 5
  ratingDoctor?: number | null
  ratingReception?: number | null
  ratingWaitingTime?: number | null
  feedbackCategory?: string
  comments?: string
}

export interface ComplaintInput {
  branchId: string
  patientId: string
  category: 'clinical_quality' | 'billing_dispute' | 'delayed_service' | 'staff_behavior' | 'report_error' | 'facility_hygiene' | 'other'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  description: string
  assignedTo?: string | null
  resolutionTargetHours?: number
}

/**
 * Submit patient feedback with automatic negative rating escalation.
 */
export async function submitPatientFeedback(params: FeedbackInput) {
  const adminClient = createAdminClient()

  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  const isNegative = params.ratingOverall < 3

  const { data: feedback, error } = await adminClient
    .from('patient_feedback')
    .insert({
      organization_id: org.id,
      branch_id: params.branchId,
      patient_id: params.patientId,
      appointment_id: params.appointmentId || null,
      diagnostic_order_id: params.diagnosticOrderId || null,
      rating_overall: params.ratingOverall,
      rating_doctor: params.ratingDoctor || null,
      rating_reception: params.ratingReception || null,
      rating_waiting_time: params.ratingWaitingTime || null,
      feedback_category: params.feedbackCategory || 'general',
      comments: params.comments || null,
      is_negative_escalated: isNegative,
    })
    .select(`
      *,
      patients ( full_name, uhid, phone ),
      branches ( name )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to submit feedback: ${error.message}`)
  }

  // Auto-escalation: If rating is low, automatically generate a complaint ticket
  let generatedTicketNumber: string | null = null
  if (isNegative) {
    const complaint = await createComplaintTicket({
      branchId: params.branchId,
      patientId: params.patientId,
      category: 'staff_behavior',
      priority: 'high',
      description: `[AUTO-ESCALATION] Low CSAT Rating (${params.ratingOverall}/5 Stars): ${params.comments || 'No comments provided'}`,
      resolutionTargetHours: 24,
    })
    generatedTicketNumber = complaint.ticket_number
  }

  return {
    feedback,
    autoEscalated: isNegative,
    ticketNumber: generatedTicketNumber,
  }
}

/**
 * List patient feedback submissions.
 */
export async function listPatientFeedback(options?: {
  branchId?: string
  patientId?: string
  negativeOnly?: boolean
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('patient_feedback')
    .select(`
      id, rating_overall, rating_doctor, rating_reception, rating_waiting_time,
      feedback_category, comments, is_negative_escalated, created_at,
      patients ( id, full_name, uhid, phone ),
      branches ( id, name )
    `)
    .order('created_at', { ascending: false })

  if (options?.branchId) query = query.eq('branch_id', options.branchId)
  if (options?.patientId) query = query.eq('patient_id', options.patientId)
  if (options?.negativeOnly) query = query.eq('is_negative_escalated', true)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list feedback: ${error.message}`)
  return data || []
}

/**
 * Create a patient complaint / grievance ticket.
 */
export async function createComplaintTicket(params: ComplaintInput) {
  const adminClient = createAdminClient()

  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase()
  const ticketNumber = `TKT-${dateStr}-${randomSuffix}`

  const targetHours = params.resolutionTargetHours || 48
  const resolutionTargetDate = new Date(Date.now() + targetHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await adminClient
    .from('patient_complaints')
    .insert({
      organization_id: org.id,
      branch_id: params.branchId,
      patient_id: params.patientId,
      ticket_number: ticketNumber,
      category: params.category,
      priority: params.priority || 'medium',
      status: 'open',
      description: params.description,
      assigned_to: params.assignedTo || null,
      resolution_target_date: resolutionTargetDate,
    })
    .select(`
      *,
      patients ( full_name, uhid, phone ),
      branches ( name )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to create complaint ticket: ${error.message}`)
  }

  return data
}

/**
 * List patient complaints.
 */
export async function listComplaints(options?: {
  branchId?: string
  patientId?: string
  status?: string
  priority?: string
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('patient_complaints')
    .select(`
      id, ticket_number, category, priority, status, description,
      resolution_notes, resolution_target_date, resolved_at, created_at,
      patients ( id, full_name, uhid, phone ),
      branches ( id, name ),
      assignee:assigned_to ( full_name )
    `)
    .order('created_at', { ascending: false })

  if (options?.branchId) query = query.eq('branch_id', options.branchId)
  if (options?.patientId) query = query.eq('patient_id', options.patientId)
  if (options?.status) query = query.eq('status', options.status)
  if (options?.priority) query = query.eq('priority', options.priority)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list complaints: ${error.message}`)
  return data || []
}

/**
 * Update complaint resolution status and notes.
 */
export async function updateComplaintStatus(ticketId: string, updates: {
  status: 'open' | 'in_investigation' | 'resolved' | 'escalated' | 'closed'
  resolutionNotes?: string
  resolvedById?: string
}) {
  const adminClient = createAdminClient()
  const patch: any = {
    status: updates.status,
    updated_at: new Date().toISOString(),
  }

  if (updates.resolutionNotes) {
    patch.resolution_notes = updates.resolutionNotes
  }
  if (updates.status === 'resolved' || updates.status === 'closed') {
    patch.resolved_at = new Date().toISOString()
    if (updates.resolvedById) {
      patch.resolved_by = updates.resolvedById
    }
  }

  const { data, error } = await adminClient
    .from('patient_complaints')
    .update(patch)
    .eq('id', ticketId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update complaint: ${error.message}`)
  return data
}
