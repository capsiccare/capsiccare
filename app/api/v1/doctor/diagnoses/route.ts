import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { addDiagnosis, deleteDiagnosis } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { encounterId, patientId, doctorId, diagnosisText, icd10Code, diagnosisType, isChronic, onsetDate, notes } = body

    if (!encounterId || !patientId || !doctorId || !diagnosisText) {
      throw new Error('encounterId, patientId, doctorId, and diagnosisText are required')
    }

    const diagnosis = await addDiagnosis(encounterId, {
      patient_id: patientId,
      doctor_id: doctorId,
      diagnosis_text: diagnosisText,
      icd10_code: icd10Code,
      diagnosis_type: diagnosisType,
      is_chronic: isChronic,
      onset_date: onsetDate,
      notes,
    })

    return successResponse(diagnosis, { message: 'Diagnosis added successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const diagnosisId = searchParams.get('id')

    if (!diagnosisId) {
      throw new Error('id parameter is required')
    }

    const result = await deleteDiagnosis(diagnosisId)
    return successResponse(result, { message: 'Diagnosis deleted' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
