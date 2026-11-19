import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface StaffMemberRecord {
  id: string
  fullName: string
  email: string | null
  phone: string
  gender: string | null
  isActive: boolean
  mfaEnabled: boolean
  createdAt: string
  employeeId?: string
  designation?: string
  department?: string
  employmentStatus?: string
  joiningDate?: string
  workScheduleNotes?: string | null
  internalNotes?: string | null
  roles: Array<{
    role: string
    branchId: string | null
    branchName?: string
  }>
}

/**
 * List staff members with their employment details, branches, and assigned roles.
 */
export async function listStaffMembers(params?: {
  branchId?: string
  status?: string
  department?: string
  search?: string
}) {
  const adminClient = createAdminClient()

  // Fetch profiles that have staff / administrative roles
  let query = adminClient
    .from('profiles')
    .select(`
      id, full_name, email, phone, gender, is_active, mfa_enabled, created_at, organization_id,
      staff_details!staff_details_user_id_fkey (
        employee_id, designation, department, employment_status, joining_date,
        work_schedule_notes, internal_notes
      ),
      user_role_assignments!user_role_assignments_user_id_fkey (
        branch_id,
        roles ( name ),
        branches ( name )
      )
    `)
    .order('created_at', { ascending: false })

  if (params?.search) {
    query = query.or(`full_name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list staff: ${error.message}`)
  }

  const members: StaffMemberRecord[] = (data || []).map((row: any) => {
    const sd = Array.isArray(row.staff_details) ? row.staff_details[0] : row.staff_details
    const roles = (row.user_role_assignments || []).map((ura: any) => ({
      role: ura.roles?.name || 'staff',
      branchId: ura.branch_id,
      branchName: ura.branches?.name || 'All Branches',
    }))

    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      gender: row.gender,
      isActive: row.is_active,
      mfaEnabled: Boolean(row.mfa_enabled),
      createdAt: row.created_at,
      employeeId: sd?.employee_id || 'PENDING',
      designation: sd?.designation || 'Staff Member',
      department: sd?.department || 'Operations',
      employmentStatus: sd?.employment_status || 'active',
      joiningDate: sd?.joining_date || row.created_at.split('T')[0],
      workScheduleNotes: sd?.work_schedule_notes || null,
      internalNotes: sd?.internal_notes || null,
      roles,
    }
  })

  // Filter in memory for branch or department if requested
  return members.filter((m) => {
    if (params?.branchId) {
      const matchesBranch = m.roles.some((r) => !r.branchId || r.branchId === params.branchId)
      if (!matchesBranch) return false
    }
    if (params?.status && m.employmentStatus !== params.status) {
      return false
    }
    if (params?.department && m.department && m.department.toLowerCase() !== params.department.toLowerCase()) {
      return false
    }
    return true
  })
}

/**
 * Onboard a new staff member or link existing profile.
 */
export async function onboardStaffMember(params: {
  fullName: string
  phone: string
  email?: string | null
  gender?: 'male' | 'female' | 'other'
  roleName: string
  branchId?: string | null
  designation: string
  department?: string
  employeeId?: string
  joiningDate?: string
  reportingManagerId?: string | null
  workScheduleNotes?: string
}) {
  const adminClient = createAdminClient()

  // 1. Get primary organization
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  // 2. Lookup role ID
  const { data: roleData, error: roleError } = await adminClient
    .from('roles')
    .select('id, name')
    .eq('name', params.roleName)
    .single()

  if (roleError || !roleData) {
    throw new Error(`Role '${params.roleName}' not found in database`)
  }

  // 3. Find or create profile
  let userId: string
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('phone', params.phone)
    .maybeSingle()

  if (existingProfile) {
    userId = existingProfile.id
    await adminClient
      .from('profiles')
      .update({
        full_name: params.fullName,
        email: params.email || undefined,
        gender: params.gender || undefined,
        is_active: true,
      })
      .eq('id', userId)
  } else {
    // 1. Create auth user first (since profiles.id references auth.users.id)
    const staffEmail = params.email || `staff_${params.phone}@capsiccare.local`
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email: staffEmail,
      password: `StaffPass_${crypto.randomBytes(4).toString('hex')}!`,
      email_confirm: true,
      user_metadata: { full_name: params.fullName },
    })

    if (authErr || !authData?.user) {
      throw new Error(`Failed to create Auth account for staff: ${authErr?.message}`)
    }
    userId = authData.user.id

    const { error: createError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        organization_id: org.id,
        phone: params.phone,
        email: params.email || staffEmail,
        full_name: params.fullName,
        gender: params.gender || 'other',
        is_active: true,
      })

    if (createError) {
      throw new Error(`Failed to create profile: ${createError?.message}`)
    }
  }

  // 4. Generate unique Employee ID if not provided
  const empId = params.employeeId || `EMP-${Date.now().toString().slice(-6)}`

  // 5. Insert or update staff_details
  const { error: staffDetailError } = await adminClient
    .from('staff_details')
    .upsert(
      {
        user_id: userId,
        organization_id: org.id,
        employee_id: empId,
        designation: params.designation,
        department: params.department || 'Operations',
        employment_status: 'active',
        reporting_manager_id: params.reportingManagerId || null,
        joining_date: params.joiningDate || new Date().toISOString().split('T')[0],
        work_schedule_notes: params.workScheduleNotes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (staffDetailError) {
    throw new Error(`Failed to save staff details: ${staffDetailError.message}`)
  }

  // 6. Assign role
  const { error: roleAssignError } = await adminClient
    .from('user_role_assignments')
    .upsert(
      {
        user_id: userId,
        role_id: roleData.id,
        organization_id: org.id,
        branch_id: params.branchId || null,
      },
      { onConflict: 'user_id,role_id' }
    )

  if (roleAssignError) {
    // If table doesn't have composite unique constraint on (user_id, role_id), insert with conflict handling
    await adminClient.from('user_role_assignments').insert({
      user_id: userId,
      role_id: roleData.id,
      organization_id: org.id,
      branch_id: params.branchId || null,
    })
  }

  return {
    userId,
    employeeId: empId,
    fullName: params.fullName,
    role: params.roleName,
    branchId: params.branchId || null,
  }
}

/**
 * Issue a staff onboarding invitation.
 */
export async function issueStaffInvitation(params: {
  email: string
  fullName: string
  phone: string
  roleName: string
  branchId?: string | null
  designation?: string
  invitedById: string
  expiresInDays?: number
}) {
  const adminClient = createAdminClient()

  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  const { data: role } = await adminClient.from('roles').select('id').eq('name', params.roleName).single()
  if (!role) throw new Error(`Role '${params.roleName}' not found`)

  const token = `inv_${crypto.randomBytes(24).toString('hex')}`
  const days = params.expiresInDays || 7
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await adminClient
    .from('staff_invitations')
    .insert({
      organization_id: org.id,
      branch_id: params.branchId || null,
      email: params.email.toLowerCase().trim(),
      full_name: params.fullName.trim(),
      phone: params.phone.trim(),
      role_id: role.id,
      designation: params.designation || 'Staff Member',
      invitation_token: token,
      status: 'pending',
      invited_by: params.invitedById,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to issue invitation: ${error.message}`)
  }

  return data
}

/**
 * List staff invitations.
 */
export async function listStaffInvitations(status?: string) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('staff_invitations')
    .select(`
      id, email, full_name, phone, designation, status, invitation_token,
      expires_at, accepted_at, created_at,
      roles ( name ),
      branches ( name )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to query invitations: ${error.message}`)
  return data || []
}

/**
 * Shifts & Rosters: List shifts by branch and date range.
 */
export async function listStaffShifts(params: {
  branchId?: string
  startDate: string
  endDate: string
  staffId?: string
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('staff_shifts')
    .select(`
      id, branch_id, staff_id, shift_date, shift_name, start_time, end_time,
      is_weekly_off, status, notes, created_at,
      profiles:staff_id ( full_name, phone, email ),
      branches ( name )
    `)
    .gte('shift_date', params.startDate)
    .lte('shift_date', params.endDate)
    .order('shift_date', { ascending: true })

  if (params.branchId) {
    query = query.eq('branch_id', params.branchId)
  }
  if (params.staffId) {
    query = query.eq('staff_id', params.staffId)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to list shifts: ${error.message}`)
  return data || []
}

/**
 * Create or schedule a staff shift.
 */
export async function createStaffShift(params: {
  branchId: string
  staffId: string
  shiftDate: string
  shiftName?: string
  startTime: string
  endTime: string
  isWeeklyOff?: boolean
  notes?: string
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  const { data, error } = await adminClient
    .from('staff_shifts')
    .insert({
      organization_id: org.id,
      branch_id: params.branchId,
      staff_id: params.staffId,
      shift_date: params.shiftDate,
      shift_name: params.shiftName || 'Morning Shift',
      start_time: params.startTime,
      end_time: params.endTime,
      is_weekly_off: Boolean(params.isWeeklyOff),
      status: 'scheduled',
      notes: params.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to schedule shift: ${error.message}`)
  return data
}

/**
 * Staff Attendance: List attendance for branch & date.
 */
export async function listStaffAttendance(params: {
  branchId?: string
  date: string
  staffId?: string
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('staff_attendance')
    .select(`
      id, branch_id, staff_id, shift_id, date, clock_in, clock_out,
      late_minutes, early_departure_minutes, overtime_minutes,
      status, approval_status, notes, created_at,
      profiles:staff_id ( full_name, phone ),
      branches ( name )
    `)
    .eq('date', params.date)

  if (params.branchId) {
    query = query.eq('branch_id', params.branchId)
  }
  if (params.staffId) {
    query = query.eq('staff_id', params.staffId)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to list attendance: ${error.message}`)
  return data || []
}

/**
 * Clock in/out for staff member.
 */
export async function recordAttendanceClock(params: {
  staffId: string
  branchId: string
  action: 'clock_in' | 'clock_out'
  shiftId?: string | null
  timestamp?: string
  notes?: string
}) {
  const adminClient = createAdminClient()
  const now = params.timestamp ? new Date(params.timestamp) : new Date()
  const dateStr = now.toISOString().split('T')[0]

  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  // Find existing record for today
  const { data: existing } = await adminClient
    .from('staff_attendance')
    .select('*')
    .eq('staff_id', params.staffId)
    .eq('date', dateStr)
    .maybeSingle()

  if (params.action === 'clock_in') {
    if (existing && existing.clock_in) {
      return existing // already clocked in
    }

    const { data, error } = await adminClient
      .from('staff_attendance')
      .upsert(
        {
          id: existing?.id || crypto.randomUUID(),
          organization_id: org.id,
          branch_id: params.branchId,
          shift_id: params.shiftId || null,
          staff_id: params.staffId,
          date: dateStr,
          clock_in: now.toISOString(),
          status: 'present',
          approval_status: 'approved',
          notes: params.notes || null,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) throw new Error(`Clock-in failed: ${error.message}`)
    return data
  } else {
    // clock_out
    if (!existing) {
      throw new Error('Cannot clock out before clocking in')
    }

    const { data, error } = await adminClient
      .from('staff_attendance')
      .update({
        clock_out: now.toISOString(),
        notes: params.notes || existing.notes,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(`Clock-out failed: ${error.message}`)
    return data
  }
}

/**
 * Staff Tasks: Create and manage operational tasks.
 */
export async function listStaffTasks(params?: {
  assignedTo?: string
  status?: string
  category?: string
  priority?: string
  branchId?: string
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('staff_tasks')
    .select(`
      id, task_number, title, description, category, priority, status,
      assigned_to, created_by, patient_id, appointment_id, diagnostic_order_id,
      due_date, completed_at, completion_notes, created_at,
      assigned_profile:assigned_to ( full_name, phone ),
      patients ( id, full_name, uhid, phone )
    `)
    .order('created_at', { ascending: false })

  if (params?.assignedTo) query = query.eq('assigned_to', params.assignedTo)
  if (params?.status) query = query.eq('status', params.status)
  if (params?.category) query = query.eq('category', params.category)
  if (params?.priority) query = query.eq('priority', params.priority)
  if (params?.branchId) query = query.eq('branch_id', params.branchId)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list tasks: ${error.message}`)
  return data || []
}

export async function createStaffTask(params: {
  title: string
  description?: string
  category: 'patient_call' | 'appointment_confirmation' | 'sample_coordination' | 'report_delivery' | 'complaint_resolution' | 'clinical_escalation' | 'administrative' | 'other'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  createdById?: string
  branchId?: string | null
  patientId?: string | null
  appointmentId?: string | null
  diagnosticOrderId?: string | null
  dueDate?: string | null
}) {
  const adminClient = createAdminClient()
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  const taskNumber = `TSK-${Date.now().toString().slice(-6)}`

  const { data, error } = await adminClient
    .from('staff_tasks')
    .insert({
      organization_id: org.id,
      branch_id: params.branchId || null,
      task_number: taskNumber,
      title: params.title,
      description: params.description || null,
      category: params.category,
      priority: params.priority || 'medium',
      status: 'pending',
      assigned_to: params.assignedTo,
      created_by: params.createdById || null,
      patient_id: params.patientId || null,
      appointment_id: params.appointmentId || null,
      diagnostic_order_id: params.diagnosticOrderId || null,
      due_date: params.dueDate || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create task: ${error.message}`)
  return data
}

export async function updateStaffTask(taskId: string, updates: {
  status?: 'pending' | 'in_progress' | 'completed' | 'escalated' | 'cancelled'
  completionNotes?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
}) {
  const adminClient = createAdminClient()
  const patch: any = {
    updated_at: new Date().toISOString(),
  }

  if (updates.status) {
    patch.status = updates.status
    if (updates.status === 'completed') {
      patch.completed_at = new Date().toISOString()
    }
  }
  if (updates.completionNotes !== undefined) {
    patch.completion_notes = updates.completionNotes
  }
  if (updates.priority) {
    patch.priority = updates.priority
  }
  if (updates.assignedTo) {
    patch.assigned_to = updates.assignedTo
  }

  const { data, error } = await adminClient
    .from('staff_tasks')
    .update(patch)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update task: ${error.message}`)
  return data
}

/**
 * Calling Campaigns & Patient Outreach
 */
export async function listCallingCampaigns() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('calling_campaigns')
    .select(`
      id, campaign_code, name, objective, status, total_leads, completed_calls,
      conversions_count, created_at, updated_at
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to list campaigns: ${error.message}`)
  return data || []
}

export async function recordCallAttempt(params: {
  campaignId?: string | null
  patientId: string
  callerId: string
  callStatus: 'connected' | 'no_answer' | 'busy' | 'wrong_number' | 'call_failed'
  outcome: 'appointment_booked' | 'diagnostic_booked' | 'interested' | 'not_interested' | 'callback_requested' | 'do_not_contact' | 'unreachable' | 'other'
  callbackScheduledAt?: string | null
  notes?: string
  attributedAppointmentId?: string | null
  attributedOrderId?: string | null
}) {
  const adminClient = createAdminClient()

  // 1. Insert attempt
  const { data, error } = await adminClient
    .from('call_attempts')
    .insert({
      campaign_id: params.campaignId || null,
      patient_id: params.patientId,
      caller_id: params.callerId,
      call_status: params.callStatus,
      outcome: params.outcome,
      callback_scheduled_at: params.callbackScheduledAt || null,
      notes: params.notes || null,
      attributed_appointment_id: params.attributedAppointmentId || null,
      attributed_order_id: params.attributedOrderId || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to record call attempt: ${error.message}`)

  // 2. Increment counters on campaign if associated
  if (params.campaignId) {
    const isConversion = params.outcome === 'appointment_booked' || params.outcome === 'diagnostic_booked'
    const { data: camp } = await adminClient
      .from('calling_campaigns')
      .select('completed_calls, conversions_count')
      .eq('id', params.campaignId)
      .single()

    if (camp) {
      await adminClient
        .from('calling_campaigns')
        .update({
          completed_calls: (camp.completed_calls || 0) + 1,
          conversions_count: (camp.conversions_count || 0) + (isConversion ? 1 : 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.campaignId)
    }
  }

  return data
}
