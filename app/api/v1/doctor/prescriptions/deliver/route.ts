import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { deliverPrescription } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { prescriptionId, method, recipientPhone } = body

    if (!prescriptionId || !method) {
      throw new Error('prescriptionId and method are required')
    }

    const result = await deliverPrescription(prescriptionId, method, recipientPhone)
    return successResponse(result, { message: `Prescription delivered via ${method}` }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
