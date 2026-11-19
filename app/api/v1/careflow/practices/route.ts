import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listCareflowPractices, createCareflowPractice } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const createPracticeSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  primary_doctor_id: z.string().uuid().optional().nullable(),
  contact_person: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  chambers: z
    .array(
      z.object({
        name: z.string(),
        days: z.string(),
        timings: z.string(),
      })
    )
    .optional(),
  service_plan_id: z.string().uuid().optional().nullable(),
  default_follow_up_days: z.number().int().min(1).max(30).default(3),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined

    const practices = await listCareflowPractices({ search, status })

    return successResponse({ practices, total: practices.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = createPracticeSchema.parse(body)

    const practice = await createCareflowPractice({
      code: validated.code,
      name: validated.name,
      primaryDoctorId: validated.primary_doctor_id || undefined,
      contactPerson: validated.contact_person,
      phone: validated.phone,
      email: validated.email || undefined,
      address: validated.address || undefined,
      chambers: validated.chambers,
      servicePlanId: validated.service_plan_id || undefined,
      defaultFollowUpDays: validated.default_follow_up_days,
    })

    return successResponse(practice, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
