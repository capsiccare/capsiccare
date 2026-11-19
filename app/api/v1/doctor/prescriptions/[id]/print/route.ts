import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getPrescriptionPrintData } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const printData = await getPrescriptionPrintData(id)
    return successResponse(printData, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
