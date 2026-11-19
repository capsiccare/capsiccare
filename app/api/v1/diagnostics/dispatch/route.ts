import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const assignPhlebotomistSchema = z.object({
  order_id: z.string().uuid('Valid order ID is required'),
  phlebotomist_id: z.string().uuid('Valid phlebotomist ID is required'),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Query active clinical staff / phlebotomists
    const { data: staff, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, is_active, user_roles ( role )')
      .eq('is_active', true)

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query phlebotomist directory: ${error.message}`, 500)
    }

    const phlebotomists = (staff || []).map((s: any) => ({
      id: s.id,
      name: s.full_name || 'Staff Member',
      email: s.email,
      phone: s.phone || '',
      roles: (s.user_roles || []).map((r: any) => r.role),
    }))

    return successResponse(phlebotomists, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = assignPhlebotomistSchema.parse(body)
    const admin = createAdminClient()

    // 1. Fetch Order
    const { data: order, error: orderErr } = await admin
      .from('diagnostic_orders')
      .select('*')
      .eq('id', parsed.order_id)
      .maybeSingle()

    if (orderErr || !order) {
      throw new ApiError('NOT_FOUND', `Diagnostic order '${parsed.order_id}' not found`, 404)
    }

    // 2. Fetch Phlebotomist profile
    const { data: phleb, error: phlebErr } = await admin
      .from('profiles')
      .select('id, full_name')
      .eq('id', parsed.phlebotomist_id)
      .maybeSingle()

    if (phlebErr || !phleb) {
      throw new ApiError('NOT_FOUND', `Phlebotomist '${parsed.phlebotomist_id}' not found`, 404)
    }

    const previousStatus = order.status
    const newStatus = order.status === 'placed' ? 'phlebotomist_assigned' : order.status

    // 3. Update order
    const { data: updatedOrder, error: updateErr } = await admin
      .from('diagnostic_orders')
      .update({
        assigned_phlebotomist_id: phleb.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.order_id)
      .select()
      .single()

    if (updateErr || !updatedOrder) {
      throw new ApiError('DATABASE_ERROR', `Failed to assign phlebotomist: ${updateErr?.message}`, 500)
    }

    // 4. Record history
    await admin.from('diagnostic_order_status_history').insert({
      order_id: parsed.order_id,
      from_status: previousStatus,
      to_status: newStatus,
      changed_by: user.id,
      note: `Assigned to phlebotomist ${phleb.full_name}. ${parsed.notes || ''}`.trim(),
    })

    // 5. Audit Log
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'PHLEBOTOMIST_ASSIGNED',
      entityType: 'diagnostic_order',
      entityId: parsed.order_id,
      newValues: {
        assigned_phlebotomist_id: phleb.id,
        phlebotomist_name: phleb.full_name,
        status: newStatus,
      },
    })

    return successResponse(updatedOrder, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
