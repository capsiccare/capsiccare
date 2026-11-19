import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getBusinessTargets, createBusinessTarget } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

const createTargetSchema = z.object({
  branch_id: z.string().uuid().optional().nullable(),
  target_metric: z.string().min(2),
  period_start: z.string().min(10),
  period_end: z.string().min(10),
  target_value: z.number().positive(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined

    const targets = await getBusinessTargets(branchId)

    return successResponse({ targets, total: targets.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = createTargetSchema.parse(body)

    const target = await createBusinessTarget({
      branchId: validated.branch_id || undefined,
      targetMetric: validated.target_metric,
      periodStart: validated.period_start,
      periodEnd: validated.period_end,
      targetValue: validated.target_value,
      notes: validated.notes,
    })

    return successResponse(target, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
