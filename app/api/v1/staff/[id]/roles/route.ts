import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAnyRole } from '@/lib/modules/auth/auth-service'
import { updateStaffRoles } from '@/lib/modules/staff/staff-service'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const updateRolesSchema = z.object({
  roles: z.array(z.string()).min(1, 'At least one role must be assigned'),
  branch_id: z.string().uuid().optional().nullable(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const { id: userId } = await params
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('user_role_assignments')
      .select(`
        id, branch_id,
        roles ( id, name, description ),
        branches ( id, name )
      `)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    return successResponse({ roles: data || [] }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const { id: userId } = await params
    const body = await req.json()
    const validated = updateRolesSchema.parse(body)

    const result = await updateStaffRoles(userId, validated.roles, validated.branch_id)

    await recordAuditEvent({
      userId: caller.id,
      organizationId: caller.organizationId,
      action: 'UPDATE_ROLES',
      entityType: 'user_role_assignments',
      entityId: userId,
      newValues: { roles: validated.roles, branch_id: validated.branch_id },
    })

    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
