import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordVitals } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const { patientId, encounterId, ...vitalsData } = body

    if (!patientId) {
      throw new Error('patientId is required')
    }

    const record = await recordVitals(patientId, vitalsData, encounterId, user.id)
    return successResponse(record, { message: 'Vital signs recorded successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
