import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth, requireAnyRole } from '@/lib/modules/auth/auth-service'
import { listStaffMembers, onboardStaffMember } from '@/lib/modules/staff/staff-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const onboardStaffSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  email: z.string().email().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  role_name: z.string().min(2, 'Role name is required'),
  branch_id: z.string().uuid().optional().nullable(),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  joining_date: z.string().optional(),
  reporting_manager_id: z.string().uuid().optional().nullable(),
  work_schedule_notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const status = searchParams.get('status') || undefined
    const department = searchParams.get('department') || undefined
    const search = searchParams.get('search') || undefined

    const staff = await listStaffMembers({ branchId, status, department, search })

    return successResponse({ staff, total: staff.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const body = await req.json()
    const validated = onboardStaffSchema.parse(body)

    const result = await onboardStaffMember({
      fullName: validated.full_name,
      phone: validated.phone,
      email: validated.email,
      gender: validated.gender,
      roleName: validated.role_name,
      branchId: validated.branch_id,
      designation: validated.designation,
      department: validated.department,
      employeeId: validated.employee_id,
      joiningDate: validated.joining_date,
      reportingManagerId: validated.reporting_manager_id,
      workScheduleNotes: validated.work_schedule_notes,
    })

    await recordAuditEvent({
      userId: caller.id,
      organizationId: caller.organizationId,
      action: 'CREATE',
      entityType: 'staff_details',
      entityId: result.userId,
      newValues: result,
    })

    return successResponse(result, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
