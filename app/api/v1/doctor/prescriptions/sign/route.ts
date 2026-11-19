import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { signAndFinalizePrescription } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const { prescriptionId, doctorId } = body

    if (!prescriptionId || !doctorId) {
      throw new Error('prescriptionId and doctorId are required')
    }

    const result = await signAndFinalizePrescription(prescriptionId, doctorId, user.id)
    return successResponse(result, { message: 'Prescription digitally signed and finalized' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
