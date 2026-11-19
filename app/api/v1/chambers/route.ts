import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createChamberSchema = z.object({
  branch_id: z.string().uuid('Valid branch ID is required'),
  name: z.string().min(2, 'Chamber name is required').max(100),
  room_number: z.string().min(1, 'Room number is required').max(50),
  floor: z.string().optional().default('Ground Floor'),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional().default({}),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')
    const active = searchParams.get('active')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('chambers')
      .select(`
        id, organization_id, branch_id, name, room_number,
        floor, is_active, metadata, created_at, updated_at,
        branches ( id, name, code )
      `)
      .order('room_number', { ascending: true })

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    const { data: chambers, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query chambers: ${error.message}`, 500)
    }

    const items = (chambers || []).map((c: any) => ({
      id: c.id,
      organizationId: c.organization_id,
      branchId: c.branch_id,
      branchName: c.branches?.name || 'Clinic',
      branchCode: c.branches?.code || '',
      name: c.name,
      roomNumber: c.room_number,
      floor: c.floor,
      isActive: c.is_active,
      metadata: c.metadata || {},
      createdAt: c.created_at,
    }))

    return successResponse(items, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createChamberSchema.parse(body)

    const admin = createAdminClient()

    // Check unique room_number within branch
    const { data: existing } = await admin
      .from('chambers')
      .select('id')
      .eq('branch_id', parsed.branch_id)
      .eq('room_number', parsed.room_number)
      .maybeSingle()

    if (existing) {
      throw new ApiError('CONFLICT', `Chamber with room number '${parsed.room_number}' already exists in this branch`, 409)
    }

    const { data: chamber, error } = await admin
      .from('chambers')
      .insert({
        organization_id: user.organizationId,
        branch_id: parsed.branch_id,
        name: parsed.name.trim(),
        room_number: parsed.room_number.trim(),
        floor: parsed.floor?.trim() || 'Ground Floor',
        is_active: parsed.is_active,
        metadata: parsed.metadata,
      })
      .select()
      .single()

    if (error || !chamber) {
      throw new ApiError('DATABASE_ERROR', `Failed to create chamber: ${error?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CHAMBER_CREATED',
      entityType: 'chamber',
      entityId: chamber.id,
      newValues: chamber,
    })

    return successResponse(chamber, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
