import { NextRequest } from 'next/server'
import { successResponse, errorResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { getCurrentUser } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'No active session found. Please sign in.', 401, undefined, requestId)
    }

    return successResponse(
      {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        organizationId: user.organizationId,
        roles: user.roles,
        mfaEnabled: user.mfaEnabled,
      },
      undefined,
      200,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
