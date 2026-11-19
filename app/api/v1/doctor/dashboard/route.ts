import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getDoctorContext, getDoctorDashboard } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const requestedDoctorId = searchParams.get('doctorId') || undefined
    const branchId = searchParams.get('branchId') || undefined

    const doctor = await getDoctorContext(user.id, requestedDoctorId)
    if (!doctor) {
      return successResponse({ error: 'No doctor assigned or found' }, undefined, 404, requestId)
    }

    const dashboard = await getDoctorDashboard(doctor.id, branchId)
    return successResponse(dashboard, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
