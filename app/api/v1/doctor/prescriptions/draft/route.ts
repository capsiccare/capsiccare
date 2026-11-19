import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { createOrUpdatePrescriptionDraft } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { encounterId, doctorId, items, diagnosisSummary, adviceGeneral, dietLifestyleAdvice, followUpDate, followUpReason } = body

    if (!encounterId || !doctorId) {
      throw new Error('encounterId and doctorId are required')
    }

    const result = await createOrUpdatePrescriptionDraft(encounterId, doctorId, {
      diagnosis_summary: diagnosisSummary,
      advice_general: adviceGeneral,
      diet_lifestyle_advice: dietLifestyleAdvice,
      follow_up_date: followUpDate,
      follow_up_reason: followUpReason,
      items: items || [],
    })

    return successResponse(result, { message: 'Prescription draft saved successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
