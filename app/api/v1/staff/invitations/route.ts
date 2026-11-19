import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth, requireAnyRole } from '@/lib/modules/auth/auth-service'
import { listStaffInvitations, issueStaffInvitation } from '@/lib/modules/staff/staff-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const inviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  phone: z.string().min(10),
  role_name: z.string().min(2),
  branch_id: z.string().uuid().optional().nullable(),
  designation: z.string().optional(),
  expires_in_days: z.number().int().min(1).max(30).default(7),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined

    const invitations = await listStaffInvitations(status)

    return successResponse({ invitations, total: invitations.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const body = await req.json()
    const validated = inviteSchema.parse(body)

    const invitation = await issueStaffInvitation({
      email: validated.email,
      fullName: validated.full_name,
      phone: validated.phone,
      roleName: validated.role_name,
      branchId: validated.branch_id,
      designation: validated.designation,
      invitedById: caller.id,
      expiresInDays: validated.expires_in_days,
    })

    await recordAuditEvent({
      userId: caller.id,
      organizationId: caller.organizationId,
      action: 'CREATE',
      entityType: 'staff_invitations',
      entityId: invitation.id,
      newValues: { email: validated.email, role: validated.role_name },
    })

    return successResponse(invitation, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
