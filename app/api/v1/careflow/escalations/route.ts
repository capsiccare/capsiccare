import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listClinicalEscalations, createClinicalEscalation } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const createEscalationSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid().optional().nullable(),
  practice_id: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  task_id: z.string().uuid().optional().nullable(),
  urgency: z.enum(['routine', 'urgent', 'emergency']).default('urgent'),
  category: z.enum([
    'worsening_symptoms',
    'medication_adverse_effect',
    'urgent_clinical_question',
    'post_procedure_complication',
    'speak_with_doctor_request',
    'other',
  ]),
  description: z.string().min(5),
  patient_reported_symptoms: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const urgency = searchParams.get('urgency') || undefined
    const practiceId = searchParams.get('practiceId') || undefined

    const escalations = await listClinicalEscalations({ status, urgency, practiceId })

    return successResponse({ escalations, total: escalations.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = createEscalationSchema.parse(body)

    const escalation = await createClinicalEscalation({
      patientId: validated.patient_id,
      doctorId: validated.doctor_id || undefined,
      practiceId: validated.practice_id || undefined,
      branchId: validated.branch_id || undefined,
      taskId: validated.task_id || undefined,
      flaggedById: caller.id,
      urgency: validated.urgency,
      category: validated.category,
      description: validated.description,
      patientReportedSymptoms: validated.patient_reported_symptoms,
    })

    return successResponse(escalation, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
