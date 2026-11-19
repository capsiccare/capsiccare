import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listCareflowTasks } from '@/lib/modules/careflow/careflow-service'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const createTaskSchema = z.object({
  patient_id: z.string().uuid(),
  practice_id: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  doctor_id: z.string().uuid().optional().nullable(),
  task_type: z.enum([
    'post_consultation',
    'chronic_recall',
    'missed_appointment',
    'report_follow_up',
    'patient_callback',
    'doctor_request',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().min(10),
  assigned_to: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { searchParams } = new URL(req.url)
    const queue = (searchParams.get('queue') as any) || undefined
    const practiceId = searchParams.get('practiceId') || undefined
    const branchId = searchParams.get('branchId') || undefined
    const doctorId = searchParams.get('doctorId') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const tasks = await listCareflowTasks({
      queue,
      callerId: caller.id,
      practiceId,
      branchId,
      doctorId,
      status,
      search,
      limit,
    })

    return successResponse({ tasks, total: tasks.length }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const validated = createTaskSchema.parse(body)

    const adminClient = createAdminClient()
    const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error('No organization found')

    const { data: task, error } = await adminClient
      .from('careflow_tasks')
      .insert({
        organization_id: org.id,
        patient_id: validated.patient_id,
        practice_id: validated.practice_id || null,
        branch_id: validated.branch_id || null,
        doctor_id: validated.doctor_id || null,
        task_type: validated.task_type,
        priority: validated.priority,
        due_date: validated.due_date,
        assigned_to: validated.assigned_to || null,
        notes: validated.notes || null,
        status: 'pending',
      })
      .select(`
        *,
        patients ( id, uhid, full_name, phone ),
        doctors ( id, name )
      `)
      .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)

    return successResponse(task, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
