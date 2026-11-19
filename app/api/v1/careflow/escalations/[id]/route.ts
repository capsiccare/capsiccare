import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { resolveClinicalEscalation } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const resolveSchema = z.object({
  resolution_notes: z.string().min(3),
  status: z.enum(['resolved', 'under_review', 'referred_to_emergency']).default('resolved'),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { id: escalationId } = await params
    const body = await req.json()
    const validated = resolveSchema.parse(body)

    const resolved = await resolveClinicalEscalation({
      escalationId,
      resolvedById: caller.id,
      resolutionNotes: validated.resolution_notes,
      status: validated.status,
    })

    return successResponse(resolved, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
