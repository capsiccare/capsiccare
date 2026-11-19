import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { getPatientHealthRecords } from '@/lib/modules/patient-portal/patient-portal-service'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const patientUploadDocSchema = z.object({
  title: z.string().min(2, 'Document title is required'),
  document_type: z.enum(['prescription', 'diagnostic_report', 'discharge_summary', 'consent_form', 'other']),
  file_url: z.string().min(5, 'File URL or data is required'),
  file_name: z.string().default('document.pdf'),
  doctor_name: z.string().optional().nullable(),
  document_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const records = await getPatientHealthRecords(context.patient.id)

    // Also fetch uploaded patient_documents
    const admin = createAdminClient()
    const { data: uploadedDocs } = await admin
      .from('patient_documents')
      .select('id, document_number, document_type, title, file_url, file_name, created_at, is_verified, security_token')
      .eq('patient_id', context.patient.id)
      .order('created_at', { ascending: false })

    return successResponse(
      {
        ...records,
        uploaded_documents: uploadedDocs || [],
      },
      undefined,
      200,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const parsed = patientUploadDocSchema.parse(body)
    const admin = createAdminClient()

    const securityToken = crypto.randomBytes(24).toString('hex')
    const tokenExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    const docNumber = `DOC-PAT-${Date.now().toString().slice(-6)}`

    // Use patient profile or system profile
    const { data: sysProfile } = await admin.from('profiles').select('id').limit(1).single()
    const uploadedBy = sysProfile?.id || context.patient.id

    const { data: docRecord, error: docErr } = await admin
      .from('patient_documents')
      .insert({
        organization_id: (context.patient as any).organization_id || '11111111-1111-4111-a111-111111111111',
        patient_id: context.patient.id,
        document_number: docNumber,
        document_type: parsed.document_type,
        title: parsed.title.trim(),
        file_url: parsed.file_url,
        file_name: parsed.file_name,
        is_verified: false, // self-uploaded by patient
        security_token: securityToken,
        token_expires_at: tokenExpiresAt,
        uploaded_by: uploadedBy,
      })
      .select()
      .single()

    if (docErr) {
      throw new ApiError('DATABASE_ERROR', `Failed to save patient document: ${docErr.message}`, 500)
    }

    // Add activity log
    await admin.from('patient_portal_activity_logs').insert({
      patient_id: context.patient.id,
      action: 'DOCUMENT_SELF_UPLOADED',
      details: {
        documentNumber: docNumber,
        title: parsed.title,
        type: parsed.document_type,
      },
    })

    return successResponse(
      {
        document: docRecord,
        message: 'Medical document uploaded to your secure digital health locker.',
      },
      undefined,
      201,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
