import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getDoctorFavorites, toggleDoctorFavorite, getDoctorContext } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const requestedDoctorId = searchParams.get('doctorId') || undefined

    const doctor = await getDoctorContext(user.id, requestedDoctorId)
    if (!doctor) throw new Error('Doctor profile not found')

    const favorites = await getDoctorFavorites(doctor.id)
    return successResponse(favorites, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const { doctorId: requestedDoctorId, itemType, itemId, preset } = body

    const doctor = await getDoctorContext(user.id, requestedDoctorId)
    if (!doctor) throw new Error('Doctor profile not found')

    if (!itemType || !itemId) {
      throw new Error('itemType and itemId are required')
    }

    const result = await toggleDoctorFavorite(doctor.id, itemType, itemId, preset)
    return successResponse(result, { message: 'Doctor favorite updated' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
