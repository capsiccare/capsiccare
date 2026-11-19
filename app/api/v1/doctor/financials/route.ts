import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { getDoctorFinancialAnalytics, getDoctorContext } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const requestedDoctorId = searchParams.get('doctorId') || undefined
    const period = searchParams.get('period') || undefined

    const doctor = await getDoctorContext(user.id, requestedDoctorId)
    if (!doctor) throw new Error('Doctor profile not found')

    const stats = await getDoctorFinancialAnalytics(doctor.id, period)
    return successResponse(stats, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
