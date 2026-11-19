import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { parsePaginationParams } from '@/lib/api/pagination'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const { page, limit, offset } = parsePaginationParams(searchParams)
    const action = searchParams.get('action')?.trim()
    const entityType = searchParams.get('entityType')?.trim()

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('audit_logs')
      .select(`
        id, action, entity_type, entity_id, old_values,
        new_values, ip_address, user_agent, created_at,
        profiles ( full_name, phone, email )
      `, { count: 'exact' })

    if (action && action !== 'all') {
      query = query.eq('action', action)
    }

    if (entityType && entityType !== 'all') {
      query = query.eq('entity_type', entityType)
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data: logs, count, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to fetch audit logs: ${error.message}`, 500)
    }

    const items = (logs || []).map((l: any) => ({
      id: l.id,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      oldValues: l.old_values,
      newValues: l.new_values,
      ipAddress: l.ip_address,
      userAgent: l.user_agent,
      createdAt: l.created_at,
      actorName: l.profiles?.full_name || 'System Process',
      actorPhone: l.profiles?.phone || '-',
    }))

    const total = count || items.length
    const totalPages = Math.ceil(total / limit) || 1

    return successResponse(items, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
