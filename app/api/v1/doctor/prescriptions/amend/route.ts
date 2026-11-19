import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { amendPrescription } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { originalPrescriptionId, doctorId, reason, updatedItems } = body

    if (!originalPrescriptionId || !doctorId || !reason) {
      throw new Error('originalPrescriptionId, doctorId, and reason are required')
    }

    const result = await amendPrescription(originalPrescriptionId, doctorId, reason, updatedItems || [])
    return successResponse(result, { message: 'Prescription amended successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
