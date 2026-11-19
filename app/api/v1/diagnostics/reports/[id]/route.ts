import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const updateReportSchema = z.object({
  status: z.enum(['pending', 'received_from_lab', 'verified', 'ready_for_delivery', 'delivered']).optional(),
  file_url: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  clinical_notes: z.string().optional().nullable(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const supabase = await createServerSupabaseClient()

    const { data: report, error } = await supabase
      .from('diagnostic_reports')
      .select(`
        *,
        diagnostic_orders (
          id, order_number, branch_id,
          patients ( id, full_name, uhid, phone, email, date_of_birth, gender ),
          branches ( id, name )
        ),
        profiles:verified_by ( id, full_name )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error || !report) {
      throw new ApiError('NOT_FOUND', `Report '${id}' not found`, 404)
    }

    return successResponse(report, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = updateReportSchema.parse(body)
    const admin = createAdminClient()

    const { data: existing, error: findErr } = await admin
      .from('diagnostic_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findErr || !existing) {
      throw new ApiError('NOT_FOUND', `Report '${id}' not found`, 404)
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (parsed.status !== undefined) {
      updates.status = parsed.status
      if ((parsed.status === 'verified' || parsed.status === 'ready_for_delivery') && !existing.verified_at) {
        updates.verified_by = user.id
        updates.verified_at = new Date().toISOString()
      }
      if (parsed.status === 'delivered' && !existing.delivered_at) {
        updates.delivered_at = new Date().toISOString()
      }
    }

    if (parsed.file_url !== undefined) updates.file_url = parsed.file_url
    if (parsed.file_name !== undefined) updates.file_name = parsed.file_name
    if (parsed.clinical_notes !== undefined) updates.clinical_notes = parsed.clinical_notes

    const { data: updated, error: updateErr } = await admin
      .from('diagnostic_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateErr || !updated) {
      throw new ApiError('DATABASE_ERROR', `Failed to update report: ${updateErr?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DIAGNOSTIC_REPORT_UPDATED',
      entityType: 'diagnostic_report',
      entityId: updated.id,
      oldValues: existing,
      newValues: updated,
    })

    return successResponse(updated, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
