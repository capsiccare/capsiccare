import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const updateChamberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  room_number: z.string().min(1).max(50).optional(),
  floor: z.string().optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
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

    const { data: chamber, error } = await supabase
      .from('chambers')
      .select(`
        id, organization_id, branch_id, name, room_number,
        floor, is_active, metadata, created_at, updated_at,
        branches ( id, name, code )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query chamber: ${error.message}`, 500)
    }

    if (!chamber) {
      throw new ApiError('NOT_FOUND', `Chamber '${id}' not found`, 404)
    }

    return successResponse(chamber, undefined, 200, requestId)
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
    const parsed = updateChamberSchema.parse(body)

    const admin = createAdminClient()

    const { data: existing, error: fetchErr } = await admin
      .from('chambers')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new ApiError('NOT_FOUND', `Chamber '${id}' not found`, 404)
    }

    // If room_number is being changed, verify uniqueness within the branch
    if (parsed.room_number && parsed.room_number !== existing.room_number) {
      const { data: duplicate } = await admin
        .from('chambers')
        .select('id')
        .eq('branch_id', existing.branch_id)
        .eq('room_number', parsed.room_number)
        .neq('id', id)
        .maybeSingle()

      if (duplicate) {
        throw new ApiError('CONFLICT', `Room '${parsed.room_number}' already exists in this branch`, 409)
      }
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (parsed.name !== undefined) updatePayload.name = parsed.name
    if (parsed.room_number !== undefined) updatePayload.room_number = parsed.room_number
    if (parsed.floor !== undefined) updatePayload.floor = parsed.floor
    if (parsed.is_active !== undefined) updatePayload.is_active = parsed.is_active
    if (parsed.metadata !== undefined) updatePayload.metadata = parsed.metadata

    const { data: updated, error: updateErr } = await admin
      .from('chambers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr || !updated) {
      throw new ApiError('DATABASE_ERROR', `Failed to update chamber: ${updateErr?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CHAMBER_UPDATED',
      entityType: 'chamber',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    })

    return successResponse(updated, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { id } = await params
    const admin = createAdminClient()

    const { data: existing, error: fetchErr } = await admin
      .from('chambers')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new ApiError('NOT_FOUND', `Chamber '${id}' not found`, 404)
    }

    const { error: delErr } = await admin
      .from('chambers')
      .delete()
      .eq('id', id)

    if (delErr) {
      throw new ApiError('DATABASE_ERROR', `Failed to delete chamber: ${delErr.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CHAMBER_DELETED',
      entityType: 'chamber',
      entityId: id,
      oldValues: existing,
    })

    return successResponse({ deleted: true, id }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
