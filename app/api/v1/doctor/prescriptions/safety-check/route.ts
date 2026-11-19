import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { runPrescriptionSafetyChecks } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { patientId, items } = body

    if (!patientId || !items) {
      throw new Error('patientId and items are required')
    }

    const report = await runPrescriptionSafetyChecks(patientId, items)
    return successResponse(report, { message: 'Prescription safety evaluated' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
