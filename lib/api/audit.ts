import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/config/env'

export interface AuditEventParams {
  organizationId?: string
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldValues?: Record<string, any> | null
  newValues?: Record<string, any> | null
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Records an immutable audit log entry for sensitive healthcare actions.
 * Operates safely offline during local development.
 */
export async function recordAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[AUDIT (OFFLINE)] ${params.action} on ${params.entityType}:${params.entityId} by user ${params.userId || 'system'}`)
      }
      return
    }

    const admin = createAdminClient()
    await admin.from('audit_logs').insert({
      organization_id: params.organizationId,
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    })
  } catch (error) {
    // Audit failures should be recorded without breaking user transaction
    console.error('Failed to write audit log:', error)
  }
}
