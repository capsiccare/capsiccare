import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listPatientDocuments, createPatientDocument } from '@/lib/modules/documents/document-service'

export const dynamic = 'force-dynamic'

const createDocSchema = z.object({
  document_type: z.enum([
    'prescription',
    'diagnostic_report',
    'consent_form',
    'invoice',
    'discharge_summary',
    'other',
  ]),
  title: z.string().min(2),
  file_url: z.string().url(),
  file_name: z.string().min(1),
  file_size_bytes: z.number().int().optional(),
  mime_type: z.string().default('application/pdf'),
  doctor_id: z.string().uuid().optional().nullable(),
  consultation_id: z.string().uuid().optional().nullable(),
  order_id: z.string().uuid().optional().nullable(),
  previous_version_id: z.string().uuid().optional().nullable(),
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
    const { searchParams } = new URL(req.url)
    const documentType = searchParams.get('documentType') || undefined

    const documents = await listPatientDocuments(patientId, { documentType })

    return successResponse({ documents, total: documents.length }, undefined, 200, requestId)
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
    const validated = createDocSchema.parse(body)

    const doc = await createPatientDocument({
      patientId,
      documentType: validated.document_type,
      title: validated.title,
      fileUrl: validated.file_url,
      fileName: validated.file_name,
      fileSizeBytes: validated.file_size_bytes,
      mimeType: validated.mime_type,
      doctorId: validated.doctor_id,
      consultationId: validated.consultation_id,
      orderId: validated.order_id,
      previousVersionId: validated.previous_version_id,
      uploadedById: caller.id,
      validityHours: validated.validity_hours,
    })

    return successResponse(doc, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
