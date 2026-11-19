import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { bootstrapFirstAdmin } from '@/lib/modules/auth/auth-service'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/config/env'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const BootstrapSchema = z.object({
  email: z.string().email('Valid administrative email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
})

/**
 * Checks whether first-admin bootstrap is available
 */
export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    if (!isSupabaseConfigured()) {
      return errorResponse('UNCONFIGURED', 'Database is not configured', 503, undefined, requestId)
    }

    const admin = createAdminClient()
    const { data: existingAdmins, error } = await admin
      .from('user_role_assignments')
      .select('id, roles!inner(name)')
      .eq('roles.name', 'super_admin')
      .limit(1)

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query administrative status: ${error.message}`, 500)
    }

    const isAllowed = !existingAdmins || existingAdmins.length === 0

    return successResponse(
      {
        isBootstrapAllowed: isAllowed,
        message: isAllowed
          ? 'First-time administrative bootstrap is available'
          : 'First-time administrative bootstrap is permanently locked',
      },
      undefined,
      200,
      requestId
    )
  } catch (err) {
    return handleApiError(err, req)
  }
}

/**
 * Provisions the initial Super Administrator account
 */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    if (!isSupabaseConfigured()) {
      return errorResponse('UNCONFIGURED', 'Database is not configured', 503, undefined, requestId)
    }

    const body = await req.json()
    const parsed = BootstrapSchema.safeParse(body)

    if (!parsed.success) {
      return handleApiError(parsed.error, req)
    }

    const result = await bootstrapFirstAdmin({
      email: parsed.data.email,
      password: parsed.data.password,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
    })

    // Record system audit log
    await recordAuditEvent({
      action: 'SUPER_ADMIN_BOOTSTRAPPED',
      entityType: 'profile',
      entityId: result.userId,
      newValues: { email: parsed.data.email, fullName: parsed.data.fullName, phone: parsed.data.phone },
      organizationId: result.organizationId,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
    })

    return successResponse(
      {
        message: 'Super Administrator account provisioned successfully. You may now log in.',
        userId: result.userId,
        email: result.email,
      },
      undefined,
      201,
      requestId
    )
  } catch (err: any) {
    if (err.message?.includes('BOOTSTRAP_LOCKED')) {
      return errorResponse('BOOTSTRAP_LOCKED', err.message, 403, undefined, requestId)
    }
    return handleApiError(err, req)
  }
}
