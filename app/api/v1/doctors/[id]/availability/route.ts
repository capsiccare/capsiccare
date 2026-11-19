import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { getDoctorDayAvailability } from '@/lib/modules/appointments/availability-service'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')?.trim()
    const branchId = searchParams.get('branchId')?.trim()

    if (!date) {
      throw new ApiError('BAD_REQUEST', "Query parameter 'date' (YYYY-MM-DD) is required", 400)
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError('BAD_REQUEST', "Date must follow 'YYYY-MM-DD' format", 400)
    }

    const availability = await getDoctorDayAvailability({
      doctorId: id,
      date,
      branchId: branchId && branchId !== 'all' ? branchId : undefined,
    })

    return successResponse(availability, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
