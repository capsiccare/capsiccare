import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listRecallPlans, createRecallPlan } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const createRecallSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  practice_id: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  condition_category: z.enum([
    'diabetes',
    'hypertension',
    'thyroid',
    'respiratory',
    'cardiac',
    'post_surgery',
    'general_chronic',
    'other',
  ]),
  custom_condition_name: z.string().optional(),
  clinical_notes: z.string().optional(),
  interval_days: z.number().int().min(7).max(365).default(90),
  next_recall_date: z.string().min(10),
  preferred_channel: z.enum(['whatsapp', 'phone_call', 'sms']).default('whatsapp'),
  coordinator_id: z.string().uuid().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const practiceId = searchParams.get('practiceId') || undefined
    const doctorId = searchParams.get('doctorId') || undefined
    const patientId = searchParams.get('patientId') || undefined
    const conditionCategory = searchParams.get('conditionCategory') || undefined
    const status = searchParams.get('status') || undefined

    const recalls = await listRecallPlans({
      practiceId,
      doctorId,
      patientId,
      conditionCategory,
      status,
    })

    return successResponse({ recalls, total: recalls.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = createRecallSchema.parse(body)

    const plan = await createRecallPlan({
      patientId: validated.patient_id,
      doctorId: validated.doctor_id,
      practiceId: validated.practice_id || undefined,
      branchId: validated.branch_id || undefined,
      conditionCategory: validated.condition_category,
      customConditionName: validated.custom_condition_name,
      clinicalNotes: validated.clinical_notes,
      intervalDays: validated.interval_days,
      nextRecallDate: validated.next_recall_date,
      preferredChannel: validated.preferred_channel,
      coordinatorId: validated.coordinator_id || undefined,
    })

    return successResponse(plan, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
