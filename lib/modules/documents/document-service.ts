import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface PatientDocumentInput {
  patientId: string
  documentType: 'prescription' | 'diagnostic_report' | 'consent_form' | 'invoice' | 'discharge_summary' | 'other'
  title: string
  fileUrl: string
  fileName: string
  fileSizeBytes?: number
  mimeType?: string
  doctorId?: string | null
  consultationId?: string | null
  orderId?: string | null
  uploadedById: string
  previousVersionId?: string | null
  validityHours?: number
}

/**
 * Register a patient medical document with secure expiring delivery token.
 */
export async function createPatientDocument(params: PatientDocumentInput) {
  const adminClient = createAdminClient()

  // 1. Organization lookup
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  // 2. Generate prefix-based document number
  const prefixMap: Record<string, string> = {
    prescription: 'RX',
    diagnostic_report: 'RPT',
    consent_form: 'CST',
    invoice: 'INV',
    discharge_summary: 'DIS',
    other: 'DOC',
  }
  const prefix = prefixMap[params.documentType] || 'DOC'
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase()
  const documentNumber = `${prefix}-${dateStr}-${randomSuffix}`

  // 3. Security token & expiry (default 48 hours)
  const securityToken = `tok_${crypto.randomBytes(24).toString('hex')}`
  const hours = params.validityHours || 48
  const tokenExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()

  let version = 1
  if (params.previousVersionId) {
    const { data: prevDoc } = await adminClient
      .from('patient_documents')
      .select('version')
      .eq('id', params.previousVersionId)
      .single()

    if (prevDoc) {
      version = (prevDoc.version || 1) + 1
      // Mark previous versions as not latest
      await adminClient
        .from('patient_documents')
        .update({ is_latest: false })
        .eq('id', params.previousVersionId)
    }
  }

  const { data, error } = await adminClient
    .from('patient_documents')
    .insert({
      organization_id: org.id,
      patient_id: params.patientId,
      document_number: documentNumber,
      document_type: params.documentType,
      title: params.title,
      file_url: params.fileUrl,
      file_name: params.fileName,
      file_size_bytes: params.fileSizeBytes || 0,
      mime_type: params.mimeType || 'application/pdf',
      doctor_id: params.doctorId || null,
      consultation_id: params.consultationId || null,
      order_id: params.orderId || null,
      is_verified: true,
      verified_by: params.uploadedById,
      verified_at: new Date().toISOString(),
      version,
      previous_version_id: params.previousVersionId || null,
      is_latest: true,
      security_token: securityToken,
      token_expires_at: tokenExpiresAt,
      uploaded_by: params.uploadedById,
    })
    .select(`
      *,
      doctors ( id, name, specialty, designation )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to create patient document: ${error.message}`)
  }

  return data
}

/**
 * List documents for a given patient.
 */
export async function listPatientDocuments(patientId: string, options?: {
  documentType?: string
  onlyLatest?: boolean
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('patient_documents')
    .select(`
      id, document_number, document_type, title, file_url, file_name, file_size_bytes,
      mime_type, doctor_id, consultation_id, order_id, is_verified, version,
      is_latest, security_token, token_expires_at, created_at,
      doctors ( id, name, specialty, designation ),
      uploader:uploaded_by ( full_name )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (options?.documentType) {
    query = query.eq('document_type', options.documentType)
  }
  if (options?.onlyLatest !== false) {
    query = query.eq('is_latest', true)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch documents: ${error.message}`)
  return data || []
}

/**
 * Verify and access a document by its secure expiring token, recording access log.
 */
export async function accessDocumentByToken(token: string, context?: {
  accessChannel?: 'admin_portal' | 'patient_portal' | 'expiring_link' | 'whatsapp' | 'email' | 'print_desk'
  ipAddress?: string
  userAgent?: string
  accessedById?: string
}) {
  const adminClient = createAdminClient()

  const { data: doc, error } = await adminClient
    .from('patient_documents')
    .select(`
      id, document_number, document_type, title, file_url, file_name,
      file_size_bytes, mime_type, patient_id, token_expires_at, is_latest,
      patients ( full_name, uhid, phone ),
      doctors ( id, name, specialty, designation )
    `)
    .eq('security_token', token)
    .maybeSingle()

  if (error || !doc) {
    return { valid: false, error: 'Document not found or token invalid' }
  }

  // Check token expiry
  if (doc.token_expires_at && new Date(doc.token_expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Document access link has expired. Request a renewed link from reception.' }
  }

  // Log access
  await adminClient.from('document_access_logs').insert({
    document_id: doc.id,
    patient_id: doc.patient_id,
    accessed_by: context?.accessedById || null,
    access_channel: context?.accessChannel || 'expiring_link',
    ip_address: context?.ipAddress || null,
    user_agent: context?.userAgent || null,
  })

  return {
    valid: true,
    document: doc,
  }
}

/**
 * Regenerate / renew the expiring security token for a document.
 */
export async function refreshDocumentToken(documentId: string, validityHours = 48) {
  const adminClient = createAdminClient()
  const newToken = `tok_${crypto.randomBytes(24).toString('hex')}`
  const tokenExpiresAt = new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await adminClient
    .from('patient_documents')
    .update({
      security_token: newToken,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select('id, document_number, security_token, token_expires_at')
    .single()

  if (error) throw new Error(`Failed to refresh document token: ${error.message}`)
  return data
}
