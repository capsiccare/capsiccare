import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listPatientDocuments, createPatientDocument } from '@/lib/modules/documents/document-service'

export const dynamic = 'force-dynamic'

const prescriptionSchema = z.object({
  title: z.string().min(2, 'Title required'),
  file_url: z.string().url('Valid file URL required'),
  file_name: z.string().min(1),
  file_size_bytes: z.number().int().optional(),
  mime_type: z.string().default('application/pdf'),
  doctor_id: z.string().uuid().optional().nullable(),
  consultation_id: z.string().uuid().optional().nullable(),
  validity_hours: z.number().int().min(1).max(720).default(48),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id: patientId } = await params
    const documents = await listPatientDocuments(patientId, { documentType: 'prescription' })

    return successResponse({ prescriptions: documents, total: documents.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { id: patientId } = await params
    const body = await req.json()
    const validated = prescriptionSchema.parse(body)

    const doc = await createPatientDocument({
      patientId,
      documentType: 'prescription',
      title: validated.title,
      fileUrl: validated.file_url,
      fileName: validated.file_name,
      fileSizeBytes: validated.file_size_bytes,
      mimeType: validated.mime_type,
      doctorId: validated.doctor_id,
      consultationId: validated.consultation_id,
      uploadedById: caller.id,
      validityHours: validated.validity_hours,
    })

    return successResponse(doc, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
