import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { enrollPatientInPractice } from '@/lib/modules/careflow/careflow-service'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const enrollSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid().optional().nullable(),
  source: z.enum(['individual', 'csv_import', 'consultation_referral', 'clinic_intake']).default('individual'),
  consent_verified: z.boolean().default(true),
  consent_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id: practiceId } = await params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'active'
    const search = searchParams.get('search') || undefined

    const adminClient = createAdminClient()
    let query = adminClient
      .from('practice_patient_enrollments')
      .select(`
        id, enrolled_at, source, consent_verified, tags, status,
        patients ( id, uhid, full_name, phone, gender, age_years, city ),
        doctors ( id, name, specialty )
      `)
      .eq('practice_id', practiceId)
      .order('enrolled_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to list enrolled patients: ${error.message}`)

    let filtered = data || []
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (e: any) =>
          e.patients?.full_name?.toLowerCase().includes(s) ||
          e.patients?.phone?.includes(s) ||
          e.patients?.uhid?.toLowerCase().includes(s)
      )
    }

    return successResponse({ patients: filtered, total: filtered.length }, undefined, 200, requestId)
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
    await requireAuth()
    const { id: practiceId } = await params
    const body = await req.json()
    const validated = enrollSchema.parse(body)

    const enrollment = await enrollPatientInPractice({
      practiceId,
      patientId: validated.patient_id,
      doctorId: validated.doctor_id || undefined,
      source: validated.source,
      consentVerified: validated.consent_verified,
      consentNotes: validated.consent_notes,
      tags: validated.tags,
    })

    return successResponse(enrollment, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
