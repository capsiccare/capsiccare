import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const staffRegisterSchema = z.object({
  full_name: z.string().min(2, 'Staff full name is required').max(150),
  email: z.string().email('Valid work email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  role: z.enum([
    'receptionist',
    'nurse',
    'lab_staff',
    'phlebotomist',
    'billing_staff',
    'calling_executive',
    'branch_admin',
  ]),
  branch_id: z.string().uuid('Valid branch selection is required'),
  designation: z.string().min(2, 'Designation is required').optional(),
  department: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const parsed = staffRegisterSchema.parse(body)
    const admin = createAdminClient()

    // 1. Get primary organization
    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (orgErr || !org) {
      throw new ApiError('INTERNAL_ERROR', 'Organization configuration not found', 500)
    }

    // 2. Validate branch
    const { data: branch, error: branchErr } = await admin
      .from('branches')
      .select('id, name')
      .eq('id', parsed.branch_id)
      .maybeSingle()

    if (branchErr || !branch) {
      throw new ApiError('NOT_FOUND', 'Selected branch was not found', 404)
    }

    // 3. Create or find Auth User
    let userId: string
    const { data: existingUser } = await admin
      .from('profiles')
      .select('id')
      .or(`email.eq.${parsed.email.toLowerCase().trim()},phone.eq.${parsed.phone.trim()}`)
      .maybeSingle()

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: parsed.email.toLowerCase().trim(),
        password: parsed.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.full_name.trim(),
          phone: parsed.phone.trim(),
          role: parsed.role,
          branch_id: parsed.branch_id,
        },
      })

      if (authError || !authData.user) {
        throw new ApiError('AUTH_ERROR', `Failed to register staff auth credentials: ${authError?.message}`, 400)
      }
      userId = authData.user.id
    }

    // 4. Upsert Profile
    await admin.from('profiles').upsert({
      id: userId,
      organization_id: org.id,
      full_name: parsed.full_name.trim(),
      email: parsed.email.toLowerCase().trim(),
      phone: parsed.phone.trim(),
      is_active: true,
    })

    // 5. Assign Role
    const { data: roleRow } = await admin
      .from('roles')
      .select('id')
      .eq('name', parsed.role)
      .single()

    if (roleRow) {
      const { data: existingRole } = await admin
        .from('user_role_assignments')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleRow.id)
        .maybeSingle()

      if (!existingRole) {
        await admin.from('user_role_assignments').insert({
          user_id: userId,
          role_id: roleRow.id,
          organization_id: org.id,
          branch_id: parsed.branch_id,
        })
      }
    }

    // 6. Generate employee ID and create staff_details
    const designation =
      parsed.designation ||
      (parsed.role === 'billing_staff'
        ? 'Billing Executive & Cashier'
        : parsed.role === 'receptionist'
        ? 'Front Desk Receptionist'
        : parsed.role === 'nurse'
        ? 'Staff Nurse'
        : parsed.role === 'lab_staff'
        ? 'Medical Lab Technician'
        : parsed.role === 'phlebotomist'
        ? 'Phlebotomist'
        : parsed.role === 'branch_admin'
        ? 'Branch Operations Manager'
        : 'Healthcare Executive')

    const department =
      parsed.department ||
      (parsed.role === 'billing_staff'
        ? 'Finance & Accounts'
        : parsed.role === 'lab_staff' || parsed.role === 'phlebotomist'
        ? 'Pathology & Diagnostics'
        : parsed.role === 'nurse'
        ? 'Nursing & OPD'
        : parsed.role === 'branch_admin'
        ? 'Management'
        : 'Operations')

    const employeeId = `CC-${parsed.role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`

    await admin.from('staff_details').upsert({
      user_id: userId,
      organization_id: org.id,
      employee_id: employeeId,
      designation,
      department,
      employment_status: 'active',
      joining_date: new Date().toISOString().split('T')[0],
      internal_notes: `Registered via portal onboarding for branch: ${branch.name}`,
    }, { onConflict: 'user_id' })

    // 7. Audit log
    await recordAuditEvent({
      userId,
      organizationId: org.id,
      action: 'STAFF_SELF_REGISTERED',
      entityType: 'staff_details',
      entityId: userId,
      newValues: {
        fullName: parsed.full_name,
        role: parsed.role,
        branchId: parsed.branch_id,
        branchName: branch.name,
      },
    })

    const redirectUrl =
      parsed.role === 'billing_staff'
        ? '/admin/billing'
        : parsed.role === 'receptionist' || parsed.role === 'nurse'
        ? '/admin/appointments/queue'
        : parsed.role === 'lab_staff' || parsed.role === 'phlebotomist'
        ? '/admin/diagnostics/orders'
        : '/admin'

    return successResponse(
      {
        userId,
        employeeId,
        role: parsed.role,
        branch: branch.name,
        redirectUrl,
        message: `Registered successfully as ${designation} for ${branch.name}.`,
      },
      undefined,
      201,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
