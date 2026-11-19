import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listPracticeInvoices, generatePracticeInvoice } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const generateInvoiceSchema = z.object({
  practice_id: z.string().uuid(),
  period_start: z.string().min(10).optional(),
  period_end: z.string().min(10).optional(),
  billing_period_start: z.string().min(10).optional(),
  billing_period_end: z.string().min(10).optional(),
}).refine(data => (data.period_start || data.billing_period_start) && (data.period_end || data.billing_period_end), {
  message: "Either period_start or billing_period_start and period_end or billing_period_end must be provided"
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const practiceId = searchParams.get('practiceId') || undefined

    const invoices = await listPracticeInvoices(practiceId)

    return successResponse({ invoices, total: invoices.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = generateInvoiceSchema.parse(body)

    const invoice = await generatePracticeInvoice({
      practiceId: validated.practice_id,
      periodStart: (validated.period_start || validated.billing_period_start)!,
      periodEnd: (validated.period_end || validated.billing_period_end)!,
    })

    return successResponse(invoice, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
