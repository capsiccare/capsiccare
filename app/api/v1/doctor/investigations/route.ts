import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { addInvestigationRequest } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const { encounterId, patientId, doctorId, testName, diagnosticTestId, clinicalIndication, priority } = body

    if (!encounterId || !patientId || !doctorId || !testName) {
      throw new Error('encounterId, patientId, doctorId, and testName are required')
    }

    const test = await addInvestigationRequest(encounterId, {
      patient_id: patientId,
      doctor_id: doctorId,
      test_name: testName,
      diagnostic_test_id: diagnosticTestId,
      clinical_indication: clinicalIndication,
      priority,
    })

    return successResponse(test, { message: 'Investigation request added' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
