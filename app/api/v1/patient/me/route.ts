import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { linkUhidToProfile } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    return successResponse(context, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { userId } = await resolvePatientContext(req)
    const body = await req.json()
    const { uhid, phone, birthDate } = body

    if (!uhid) {
      throw new Error('UHID is required for linking')
    }

    const link = await linkUhidToProfile(userId, uhid, { phone, birthDate })
    return successResponse(link, { message: 'UHID linked successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
