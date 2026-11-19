import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { reassignCareflowTask } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const reassignSchema = z.object({
  new_assignee_id: z.string().uuid(),
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { id: taskId } = await params
    const body = await req.json()
    const validated = reassignSchema.parse(body)

    const result = await reassignCareflowTask(taskId, validated.new_assignee_id, caller.id)

    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
