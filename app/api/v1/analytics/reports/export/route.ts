import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { generateReportExport } from '@/lib/modules/analytics/analytics-service'

export const dynamic = 'force-dynamic'

const exportSchema = z.object({
  report_title: z.string().min(2),
  report_type: z.string().min(2),
  file_format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
  data: z.array(z.any()),
  filters: z.any().optional(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = exportSchema.parse(body)

    const result = await generateReportExport({
      reportTitle: validated.report_title,
      reportType: validated.report_type,
      fileFormat: validated.file_format,
      data: validated.data,
      filters: validated.filters,
      createdById: caller.id,
    })

    return successResponse(result, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
