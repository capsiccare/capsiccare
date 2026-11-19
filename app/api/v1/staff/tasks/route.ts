import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listStaffTasks, createStaffTask, updateStaffTask } from '@/lib/modules/staff/staff-service'

export const dynamic = 'force-dynamic'

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum([
    'patient_call',
    'appointment_confirmation',
    'sample_coordination',
    'report_delivery',
    'complaint_resolution',
    'clinical_escalation',
    'administrative',
    'other',
  ]).default('patient_call'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigned_to: z.string().uuid(),
  branch_id: z.string().uuid().optional().nullable(),
  patient_id: z.string().uuid().optional().nullable(),
  appointment_id: z.string().uuid().optional().nullable(),
  diagnostic_order_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
})

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'completed', 'escalated', 'cancelled']).optional(),
  completion_notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().uuid().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const assignedTo = searchParams.get('assignedTo') || undefined
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const priority = searchParams.get('priority') || undefined
    const branchId = searchParams.get('branchId') || undefined

    const tasks = await listStaffTasks({ assignedTo, status, category, priority, branchId })

    return successResponse({ tasks, total: tasks.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const body = await req.json()
    const validated = createTaskSchema.parse(body)

    const task = await createStaffTask({
      title: validated.title,
      description: validated.description,
      category: validated.category,
      priority: validated.priority,
      assignedTo: validated.assigned_to,
      createdById: caller.id,
      branchId: validated.branch_id,
      patientId: validated.patient_id,
      appointmentId: validated.appointment_id,
      diagnosticOrderId: validated.diagnostic_order_id,
      dueDate: validated.due_date,
    })

    return successResponse(task, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = updateTaskSchema.parse(body)

    const updated = await updateStaffTask(validated.id, {
      status: validated.status,
      completionNotes: validated.completion_notes,
      priority: validated.priority,
      assignedTo: validated.assigned_to,
    })

    return successResponse(updated, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
