import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getClinicalTemplates, saveClinicalTemplate } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctorId') || undefined
    const specialty = searchParams.get('specialty') || undefined

    const templates = await getClinicalTemplates(doctorId, specialty)
    return successResponse(templates, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const template = await saveClinicalTemplate(body)
    return successResponse(template, { message: 'Clinical template saved' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
