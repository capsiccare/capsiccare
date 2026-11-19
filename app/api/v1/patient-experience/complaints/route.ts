import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listComplaints, createComplaintTicket, updateComplaintStatus } from '@/lib/modules/experience/experience-service'

export const dynamic = 'force-dynamic'

const createComplaintSchema = z.object({
  branch_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  category: z.enum([
    'clinical_quality',
    'billing_dispute',
    'delayed_service',
    'staff_behavior',
    'report_error',
    'facility_hygiene',
    'other',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  description: z.string().min(5),
  assigned_to: z.string().uuid().optional().nullable(),
  resolution_target_hours: z.number().int().min(1).max(168).default(48),
})

const updateComplaintSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'in_investigation', 'resolved', 'escalated', 'closed']),
  resolution_notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId') || undefined
    const patientId = searchParams.get('patientId') || undefined
    const status = searchParams.get('status') || undefined
    const priority = searchParams.get('priority') || undefined

    const complaints = await listComplaints({ branchId, patientId, status, priority })

    return successResponse({ complaints, total: complaints.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = createComplaintSchema.parse(body)

    const complaint = await createComplaintTicket({
      branchId: validated.branch_id,
      patientId: validated.patient_id,
      category: validated.category,
      priority: validated.priority,
      description: validated.description,
      assignedTo: validated.assigned_to,
      resolutionTargetHours: validated.resolution_target_hours,
    })

    return successResponse(complaint, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = updateComplaintSchema.parse(body)

    const updated = await updateComplaintStatus(validated.id, {
      status: validated.status,
      resolutionNotes: validated.resolution_notes,
      resolvedById: caller.id,
    })

    return successResponse(updated, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
