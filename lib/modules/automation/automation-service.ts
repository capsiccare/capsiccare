import { createAdminClient } from '@/lib/supabase/admin'
import { dispatchCommunicationMessage } from '@/lib/modules/communication/communication-service'
import { createStaffTask } from '@/lib/modules/staff/staff-service'
import { createComplaintTicket } from '@/lib/modules/experience/experience-service'

export interface AutomationTriggerEvent {
  eventName: 'APPOINTMENT_CONFIRMED' | 'DIAGNOSTIC_REPORT_VERIFIED' | 'APPOINTMENT_NO_SHOW' | 'NEGATIVE_FEEDBACK_RECEIVED' | string
  entityType: 'appointment' | 'diagnostic_order' | 'feedback' | 'patient' | string
  entityId: string
  patientId: string
  branchId?: string | null
  payload?: Record<string, any>
}

/**
 * Event-driven automation rule engine.
 */
export async function triggerAutomationEvent(event: AutomationTriggerEvent) {
  const adminClient = createAdminClient()

  // 1. Fetch active rules matching this trigger event
  const { data: rules, error: rulesError } = await adminClient
    .from('automation_rules')
    .select('*')
    .eq('trigger_event', event.eventName)
    .eq('is_active', true)

  if (rulesError || !rules || rules.length === 0) {
    return { executed: 0, message: `No active rules for event ${event.eventName}` }
  }

  const results = []

  for (const rule of rules) {
    let status: 'success' | 'failed' | 'skipped' = 'success'
    let summary = ''

    try {
      const config = rule.action_config || {}

      if (rule.action_type === 'SEND_WHATSAPP') {
        const templateCode = config.template_code || 'APPOINTMENT_CONFIRMED'
        const msg = await dispatchCommunicationMessage({
          patientId: event.patientId,
          channel: 'whatsapp',
          templateCode,
          variables: event.payload || {},
          relatedEntityType: event.entityType,
          relatedEntityId: event.entityId,
        })
        summary = `WhatsApp sent (ID: ${msg.id}) using template ${templateCode}`
      } else if (rule.action_type === 'CREATE_TASK') {
        // Find a staff member to assign to, or fallback to first staff/profile
        const { data: staffList } = await adminClient
          .from('user_role_assignments')
          .select('user_id')
          .limit(1)

        const defaultAssignee = staffList?.[0]?.user_id

        if (defaultAssignee) {
          const task = await createStaffTask({
            title: config.task_title || `Automation: ${event.eventName}`,
            category: config.category || 'patient_call',
            priority: config.priority || 'medium',
            assignedTo: defaultAssignee,
            branchId: event.branchId || null,
            patientId: event.patientId,
            appointmentId: event.entityType === 'appointment' ? event.entityId : null,
            diagnosticOrderId: event.entityType === 'diagnostic_order' ? event.entityId : null,
          })
          summary = `Staff task created (${task.task_number}) for user ${defaultAssignee}`
        } else {
          status = 'skipped'
          summary = 'Skipped: No staff assignee found'
        }
      } else if (rule.action_type === 'CREATE_COMPLAINT') {
        let branchId = event.branchId
        if (!branchId) {
          const { data: b } = await adminClient.from('branches').select('id').limit(1).single()
          branchId = b?.id || ''
        }
        if (!branchId) {
          status = 'skipped'
          summary = 'Skipped: No valid branchId found for complaint'
        } else {
          const complaint = await createComplaintTicket({
            branchId,
            patientId: event.patientId,
            category: config.category || 'staff_behavior',
            priority: config.priority || 'high',
            description: event.payload?.description || `Auto-escalation from event ${event.eventName}`,
          })
          summary = `Complaint ticket created: ${complaint.ticket_number}`
        }
      } else {
        status = 'skipped'
        summary = `Unknown action type: ${rule.action_type}`
      }
    } catch (err: any) {
      status = 'failed'
      summary = `Execution error: ${err.message}`
    }

    // Log execution
    await adminClient.from('automation_logs').insert({
      rule_id: rule.id,
      event_name: event.eventName,
      entity_type: event.entityType,
      entity_id: event.entityId,
      status,
      result_summary: summary,
    })

    results.push({ ruleCode: rule.code, status, summary })
  }

  return { executed: results.length, details: results }
}
