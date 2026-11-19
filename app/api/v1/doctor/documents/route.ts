import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { createClinicalDocument, signClinicalDocument, getDoctorContext } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const { action, documentId, patientId, doctorId: requestedDoctorId, documentType, title, content, metadata } = body

    const doctor = await getDoctorContext(user.id, requestedDoctorId)
    if (!doctor) throw new Error('Doctor profile not found')

    if (action === 'sign') {
      if (!documentId) throw new Error('documentId is required to sign')
      const signed = await signClinicalDocument(documentId, doctor.id, user.id)
      return successResponse(signed, { message: 'Clinical document signed successfully' }, 200, requestId)
    }

    if (!patientId || !title || !content || !documentType) {
      throw new Error('patientId, documentType, title, and content are required')
    }

    const doc = await createClinicalDocument(patientId, doctor.id, {
      document_type: documentType,
      title,
      content,
      metadata,
    })

    return successResponse(doc, { message: 'Clinical document drafted' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
