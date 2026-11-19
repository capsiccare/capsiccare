import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listStaffAttendance, recordAttendanceClock } from '@/lib/modules/staff/staff-service'

export const dynamic = 'force-dynamic'

const clockSchema = z.object({
  staff_id: z.string().uuid(),
  branch_id: z.string().uuid(),
  action: z.enum(['clock_in', 'clock_out']),
  shift_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const staffId = searchParams.get('staffId') || undefined
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const attendance = await listStaffAttendance({ branchId, staffId, date })

    return successResponse({ attendance, total: attendance.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = clockSchema.parse(body)

    const record = await recordAttendanceClock({
      staffId: validated.staff_id,
      branchId: validated.branch_id,
      action: validated.action,
      shiftId: validated.shift_id,
      notes: validated.notes,
    })

    return successResponse(record, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
