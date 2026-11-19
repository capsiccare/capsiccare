import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth, requireAnyRole } from '@/lib/modules/auth/auth-service'
import { listStaffShifts, createStaffShift } from '@/lib/modules/staff/staff-service'

export const dynamic = 'force-dynamic'

const createShiftSchema = z.object({
  branch_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  shift_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required'),
  shift_name: z.string().default('Morning Shift'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'HH:MM or HH:MM:SS required'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'HH:MM or HH:MM:SS required'),
  is_weekly_off: z.boolean().default(false),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const staffId = searchParams.get('staffId') || undefined
    const nowStr = new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('startDate') || nowStr
    const endDate = searchParams.get('endDate') || nowStr

    const shifts = await listStaffShifts({ branchId, staffId, startDate, endDate })

    return successResponse({ shifts, total: shifts.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const body = await req.json()
    const validated = createShiftSchema.parse(body)

    const shift = await createStaffShift({
      branchId: validated.branch_id,
      staffId: validated.staff_id,
      shiftDate: validated.shift_date,
      shiftName: validated.shift_name,
      startTime: validated.start_time,
      endTime: validated.end_time,
      isWeeklyOff: validated.is_weekly_off,
      notes: validated.notes,
    })

    return successResponse(shift, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
