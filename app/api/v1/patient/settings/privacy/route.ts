import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import {
  getPatientPrivacySettings,
  updateCommunicationPreferences,
  linkAbhaProfile,
} from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const settings = await getPatientPrivacySettings(context.patient.id)
    return successResponse(settings, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const { preferences } = body

    if (!preferences) {
      throw new Error('Preferences payload is required')
    }

    const updated = await updateCommunicationPreferences(context.patient.id, preferences)
    return successResponse(updated, { message: 'Preferences updated successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const { abhaNumber, abhaAddress } = body

    if (!abhaNumber || !abhaAddress) {
      throw new Error('abhaNumber and abhaAddress are required')
    }

    const linked = await linkAbhaProfile(context.patient.id, abhaNumber, abhaAddress)
    return successResponse(linked, { message: 'ABHA account linked successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
