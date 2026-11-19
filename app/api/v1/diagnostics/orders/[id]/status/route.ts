import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const statusTransitionSchema = z.object({
  status: z.enum([
    'draft',
    'placed',
    'confirmed',
    'phlebotomist_assigned',
    'sample_collected',
    'in_transit',
    'received_at_lab',
    'processing',
    'partially_reported',
    'completed',
    'cancelled',
  ]),
  note: z.string().optional().nullable(),
  assigned_phlebotomist_id: z.string().uuid().optional().nullable(),
  sample_barcode: z.string().optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = statusTransitionSchema.parse(body)
    const admin = createAdminClient()

    // 1. Fetch current order
    const { data: order, error: fetchErr } = await admin
      .from('diagnostic_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !order) {
      throw new ApiError('NOT_FOUND', `Diagnostic order '${id}' not found`, 404)
    }

    const previousStatus = order.status

    // 2. Prepare updates
    const updates: Record<string, any> = {
      status: parsed.status,
      updated_at: new Date().toISOString(),
    }

    if (parsed.assigned_phlebotomist_id !== undefined) {
      updates.assigned_phlebotomist_id = parsed.assigned_phlebotomist_id
    }

    // 3. Update order
    const { data: updatedOrder, error: updateErr } = await admin
      .from('diagnostic_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateErr || !updatedOrder) {
      throw new ApiError('DATABASE_ERROR', `Failed to transition order status: ${updateErr?.message}`, 500)
    }

    // 4. If sample_barcode provided or transitioning to sample_collected, update line items
    if (parsed.status === 'sample_collected' || parsed.sample_barcode) {
      const itemUpdate: Record<string, any> = {
        status: parsed.status === 'sample_collected' ? 'sample_collected' : undefined,
      }
      if (parsed.sample_barcode) {
        itemUpdate.sample_barcode = parsed.sample_barcode
      }
      // Remove undefined
      Object.keys(itemUpdate).forEach((k) => itemUpdate[k] === undefined && delete itemUpdate[k])

      if (Object.keys(itemUpdate).length > 0) {
        await admin
          .from('diagnostic_order_items')
          .update(itemUpdate)
          .eq('order_id', id)
      }
    }

    // 5. Record Order Status History
    await admin.from('diagnostic_order_status_history').insert({
      order_id: id,
      from_status: previousStatus,
      to_status: parsed.status,
      changed_by: user.id,
      note: parsed.note || `Transitioned to ${parsed.status}`,
    })

    // 6. Record Audit Event
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DIAGNOSTIC_ORDER_STATUS_CHANGED',
      entityType: 'diagnostic_order',
      entityId: id,
      oldValues: { status: previousStatus },
      newValues: { status: parsed.status, note: parsed.note },
    })

    return successResponse(updatedOrder, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
