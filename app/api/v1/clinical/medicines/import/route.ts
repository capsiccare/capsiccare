import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { bulkImportMedicines } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { csvContent } = body

    if (!csvContent) {
      throw new Error('csvContent is required')
    }

    const result = await bulkImportMedicines(csvContent)
    return successResponse(result, { message: `Bulk imported ${result.imported} medicines` }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
