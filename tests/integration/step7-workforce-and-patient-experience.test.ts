import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import {
  listStaffMembers,
  onboardStaffMember,
  issueStaffInvitation,
  listStaffInvitations,
  createStaffShift,
  listStaffShifts,
  recordAttendanceClock,
  listStaffAttendance,
  createStaffTask,
  listStaffTasks,
  updateStaffTask,
  recordCallAttempt,
  listCallingCampaigns,
} from '../../lib/modules/staff/staff-service'
import {
  createPatientDocument,
  listPatientDocuments,
  accessDocumentByToken,
  refreshDocumentToken,
} from '../../lib/modules/documents/document-service'
import {
  dispatchCommunicationMessage,
  listCommunicationMessages,
  renderTemplate,
  broadcastCommunication,
} from '../../lib/modules/communication/communication-service'
import {
  submitPatientFeedback,
  listPatientFeedback,
  createComplaintTicket,
  listComplaints,
  updateComplaintStatus,
} from '../../lib/modules/experience/experience-service'
import { triggerAutomationEvent } from '../../lib/modules/automation/automation-service'

describe('Step 07: Workforce Management, Patient Communication & Experience Automation Tests', () => {
  const admin = createAdminClient()
  const branchId = '22222222-2222-4222-a222-222222222222'
  const patientId = '44444444-4444-4444-a444-444444444441'

  let testStaffUserId: string
  let testShiftId: string
  let testTaskId: string
  let testDocId: string
  let testDocToken: string
  let testTicketNumber: string

  it('1. Database Tables: should verify all Step 07 tables exist and are accessible', async () => {
    const tables = [
      'staff_details',
      'staff_invitations',
      'staff_shifts',
      'staff_attendance',
      'staff_tasks',
      'calling_campaigns',
      'call_attempts',
      'patient_documents',
      'document_access_logs',
      'patient_communication_preferences',
      'communication_templates',
      'communication_messages',
      'patient_feedback',
      'patient_complaints',
      'automation_rules',
      'automation_logs',
    ]

    for (const table of tables) {
      const { data, error } = await admin.from(table).select('id').limit(1)
      assert.equal(error, null, `Table ${table} should be queryable without error`)
    }
  })

  it('2. Staff Onboarding & Listing: should onboard a phlebotomist and verify profile + details', async () => {
    const testPhone = '9876540099'
    const res = await onboardStaffMember({
      fullName: 'Ramesh Sen Phlebotomy',
      phone: testPhone,
      email: 'ramesh.sen@capsiccare.com',
      gender: 'male',
      roleName: 'phlebotomist',
      branchId,
      designation: 'Senior Phlebotomist',
      department: 'Diagnostics',
      employeeId: `EMP-PHL-${Date.now().toString().slice(-4)}`,
    })

    assert.ok(res.userId, 'Should return created/linked user ID')
    testStaffUserId = res.userId

    const staffList = await listStaffMembers({ branchId, department: 'Diagnostics' })
    const found = staffList.find((s) => s.id === testStaffUserId)
    assert.ok(found, 'Onboarded staff member should appear in listStaffMembers')
    assert.equal(found?.designation, 'Senior Phlebotomist')
    assert.ok(found?.roles.some((r) => r.role === 'phlebotomist'))
  })

  it('3. Staff Invitations: should issue an invitation token and list pending invitations', async () => {
    const invitation = await issueStaffInvitation({
      email: 'new.billing@capsiccare.com',
      fullName: 'Sunita Ghosh',
      phone: '9876540088',
      roleName: 'billing_staff',
      branchId,
      designation: 'Billing Executive',
      invitedById: testStaffUserId,
      expiresInDays: 7,
    })

    assert.ok(invitation.invitation_token.startsWith('inv_'))
    assert.equal(invitation.status, 'pending')

    const pendingList = await listStaffInvitations('pending')
    const found = pendingList.find((inv: any) => inv.email === 'new.billing@capsiccare.com')
    assert.ok(found, 'Issued invitation should be present in pending invitations list')
  })

  it('4. Shifts & Attendance: should schedule shift and record clock-in/out', async () => {
    const today = new Date().toISOString().split('T')[0]

    // 1. Schedule shift
    const shift = await createStaffShift({
      branchId,
      staffId: testStaffUserId,
      shiftDate: today,
      shiftName: 'Morning Phlebotomy Run',
      startTime: '08:00',
      endTime: '16:00',
      notes: 'Zone A doorstep visits',
    })

    assert.ok(shift.id)
    testShiftId = shift.id

    const shifts = await listStaffShifts({ branchId, staffId: testStaffUserId, startDate: today, endDate: today })
    assert.ok(shifts.length >= 1)

    // 2. Clock in
    const clockIn = await recordAttendanceClock({
      staffId: testStaffUserId,
      branchId,
      action: 'clock_in',
      shiftId: testShiftId,
      notes: 'Reporting on time at diagnostic lab',
    })
    assert.ok(clockIn.clock_in)
    assert.equal(clockIn.status, 'present')

    // 3. Clock out
    const clockOut = await recordAttendanceClock({
      staffId: testStaffUserId,
      branchId,
      action: 'clock_out',
      notes: 'Completed all morning route samples',
    })
    assert.ok(clockOut.clock_out)

    const attendanceRecords = await listStaffAttendance({ branchId, date: today, staffId: testStaffUserId })
    assert.equal(attendanceRecords.length, 1)
  })

  it('5. Staff Tasks: should assign task, list tasks, and mark as completed', async () => {
    const task = await createStaffTask({
      title: 'Collect fasting sample from UHID-10001',
      description: 'Patient requested 7:30 AM arrival with cold transport box',
      category: 'sample_coordination',
      priority: 'high',
      assignedTo: testStaffUserId,
      branchId,
      patientId,
    })

    assert.ok(task.id)
    assert.ok(task.task_number.startsWith('TSK-'))
    testTaskId = task.id

    const openTasks = await listStaffTasks({ assignedTo: testStaffUserId, status: 'pending' })
    assert.ok(openTasks.some((t: any) => t.id === testTaskId))

    const updated = await updateStaffTask(testTaskId, {
      status: 'completed',
      completionNotes: 'Sample collected, barcoded and placed in centrifuge rack',
    })
    assert.equal(updated.status, 'completed')
    assert.ok(updated.completed_at)
  })

  it('6. Patient Documents & Expiring Delivery: should upload RX, generate token and access document', async () => {
    const doc = await createPatientDocument({
      patientId,
      documentType: 'prescription',
      title: 'OPD Consultation Prescription - Cardiology',
      fileUrl: 'https://capsiccare.com/storage/prescriptions/rx-001.pdf',
      fileName: 'rx-cardio-001.pdf',
      fileSizeBytes: 1048576,
      mimeType: 'application/pdf',
      uploadedById: testStaffUserId,
      validityHours: 48,
    })

    assert.ok(doc.id)
    assert.ok(doc.document_number.startsWith('RX-'))
    assert.ok(doc.security_token.startsWith('tok_'))
    testDocId = doc.id
    testDocToken = doc.security_token

    // Verify listing
    const docs = await listPatientDocuments(patientId, { documentType: 'prescription' })
    assert.ok(docs.some((d: any) => d.id === testDocId))

    // Access via token
    const accessRes = await accessDocumentByToken(testDocToken, {
      accessChannel: 'expiring_link',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 Mobile',
    })
    assert.equal(accessRes.valid, true)
    assert.equal(accessRes.document?.id, testDocId)

    // Verify access log was recorded
    const { data: logs } = await admin
      .from('document_access_logs')
      .select('*')
      .eq('document_id', testDocId)

    assert.ok(logs && logs.length >= 1, 'Document access log should be recorded')
    assert.equal(logs[0].access_channel, 'expiring_link')

    // Refresh token
    const refreshed = await refreshDocumentToken(testDocId, 72)
    assert.notEqual(refreshed.security_token, testDocToken)
  })

  it('7. Patient Communications: should render templates, dispatch WhatsApp message, and enforce consent', async () => {
    // 1. Template rendering test
    const rendered = renderTemplate('Hello {{patient_name}}, your token is {{token_number}}', {
      patient_name: 'Anita Roy',
      token_number: 14,
    })
    assert.equal(rendered, 'Hello Anita Roy, your token is 14')

    // 2. Dispatch service message
    const msg = await dispatchCommunicationMessage({
      patientId,
      channel: 'whatsapp',
      templateCode: 'APPOINTMENT_CONFIRMED',
      variables: {
        doctor_name: 'Dr. Debabrata Roy',
        scheduled_date: '2026-11-20',
        scheduled_time: '10:30 AM',
        token_number: 5,
        chamber_name: 'Chamber 1',
        branch_name: 'Habra Main Clinic',
        branch_phone: '03216-255001',
      },
      sentById: testStaffUserId,
    })

    assert.ok(msg.id)
    assert.equal(msg.status, 'delivered')
    assert.ok(msg.message_body.includes('Dr. Debabrata Roy'))

    const messages = await listCommunicationMessages({ patientId, channel: 'whatsapp' })
    assert.ok(messages.some((m: any) => m.id === msg.id))

    // 3. Test promotional opt-out suppression
    // Explicitly opt out patient from promotional communications
    await admin
      .from('patient_communication_preferences')
      .upsert({
        patient_id: patientId,
        service_whatsapp_enabled: true,
        promotional_whatsapp_enabled: false,
      }, { onConflict: 'patient_id' })

    // Create a promotional template
    await admin.from('communication_templates').upsert({
      code: 'TEST_PROMO_DISCOUNT',
      category: 'promotional',
      channel: 'whatsapp',
      language: 'en',
      title: 'Discount Promo',
      template_body: 'Special health checkup discount',
    }, { onConflict: 'code' })

    // Attempting to dispatch promotional message should throw opt-out error
    await assert.rejects(
      async () => {
        await dispatchCommunicationMessage({
          patientId,
          channel: 'whatsapp',
          templateCode: 'TEST_PROMO_DISCOUNT',
        })
      },
      /promotional/i,
      'Should reject promotional communication when patient opted out'
    )
  })

  it('8. Patient Experience (CSAT Feedback & Auto-Escalation): should auto-escalate low rating to complaint', async () => {
    // 1. High rating - no escalation
    const highFeedback = await submitPatientFeedback({
      branchId,
      patientId,
      ratingOverall: 5,
      ratingDoctor: 5,
      ratingReception: 5,
      ratingWaitingTime: 4,
      comments: 'Excellent consultation and polite staff',
    })
    assert.equal(highFeedback.autoEscalated, false)

    // 2. Low rating (2 stars) - must auto-escalate
    const lowFeedback = await submitPatientFeedback({
      branchId,
      patientId,
      ratingOverall: 2,
      ratingDoctor: 3,
      ratingReception: 1,
      ratingWaitingTime: 1,
      comments: 'Waited 1 hour past appointment slot without explanation',
    })
    assert.equal(lowFeedback.autoEscalated, true)
    assert.ok(lowFeedback.ticketNumber?.startsWith('TKT-'))
    testTicketNumber = lowFeedback.ticketNumber!

    // Verify complaint was created
    const complaints = await listComplaints({ branchId, patientId })
    const ticket = complaints.find((c: any) => c.ticket_number === testTicketNumber)
    assert.ok(ticket, 'Escalated complaint ticket should exist')
    assert.equal(ticket.priority, 'high')

    // 3. Update complaint resolution
    const resolved = await updateComplaintStatus(ticket.id, {
      status: 'resolved',
      resolutionNotes: 'Branch manager called patient, apologized and provided priority slot voucher',
      resolvedById: testStaffUserId,
    })
    assert.equal(resolved.status, 'resolved')
    assert.ok(resolved.resolved_at)
  })

  it('9. Automation Rule Engine: should trigger rules on events and log executions', async () => {
    // Trigger APPOINTMENT_CONFIRMED event
    const eventRes = await triggerAutomationEvent({
      eventName: 'APPOINTMENT_CONFIRMED',
      entityType: 'appointment',
      entityId: '33333333-3333-4333-a333-333333333331',
      patientId,
      branchId,
      payload: {
        doctor_name: 'Dr. Debabrata Roy',
        scheduled_date: '2026-11-21',
        scheduled_time: '11:00 AM',
        token_number: 12,
        chamber_name: 'Chamber 2',
        branch_name: 'Habra Branch',
        branch_phone: '03216-255001',
      },
    })

    assert.ok(eventRes.executed >= 1)
    const successDetails = eventRes.details?.find((d) => d.ruleCode === 'AUTO_APPT_NOTIFY')
    assert.equal(successDetails?.status, 'success')

    // Trigger APPOINTMENT_NO_SHOW event (which creates a follow-up staff task)
    const noShowRes = await triggerAutomationEvent({
      eventName: 'APPOINTMENT_NO_SHOW',
      entityType: 'appointment',
      entityId: '33333333-3333-4333-a333-333333333331',
      patientId,
      branchId,
    })
    assert.ok(noShowRes.executed >= 1)

    // Check automation logs
    const { data: logs } = await admin
      .from('automation_logs')
      .select('*')
      .eq('event_name', 'APPOINTMENT_CONFIRMED')

    assert.ok(logs && logs.length >= 1)
  })

  it('10. Teardown: clean up test entities', async () => {
    if (testTaskId) {
      await admin.from('staff_tasks').delete().eq('id', testTaskId)
    }
    if (testShiftId) {
      await admin.from('staff_shifts').delete().eq('id', testShiftId)
    }
    if (testDocId) {
      await admin.from('document_access_logs').delete().eq('document_id', testDocId)
      await admin.from('patient_documents').delete().eq('id', testDocId)
    }
    if (testStaffUserId) {
      await admin.from('staff_attendance').delete().eq('staff_id', testStaffUserId)
      await admin.from('staff_details').delete().eq('user_id', testStaffUserId)
      await admin.from('user_role_assignments').delete().eq('user_id', testStaffUserId)
      await admin.from('profiles').delete().eq('id', testStaffUserId)
      try {
        await admin.auth.admin.deleteUser(testStaffUserId)
      } catch (e) {
        // Ignore if user deletion fails in auth
      }
    }
    assert.ok(true)
  })
})
