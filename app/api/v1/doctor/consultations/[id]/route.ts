import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getEncounter, saveEncounterDraft, completeConsultation } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const encounter = await getEncounter(id)
    return successResponse(encounter, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const body = await req.json()
    const result = await saveEncounterDraft(id, body)
    return successResponse(result, { message: 'Consultation draft autosaved' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const doctorId = body.doctorId || user.id

    const result = await completeConsultation(id, doctorId)
    return successResponse(result, { message: 'Consultation completed successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
