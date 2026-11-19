import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createReportSchema = z.object({
  order_id: z.string().uuid('Order ID required'),
  order_item_id: z.string().uuid().optional().nullable(),
  file_url: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  clinical_notes: z.string().optional().nullable(),
  status: z.enum(['pending', 'received_from_lab', 'verified', 'ready_for_delivery', 'delivered']).default('received_from_lab'),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')?.trim()
    const orderId = searchParams.get('orderId')?.trim()

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('diagnostic_reports')
      .select(`
        id, report_number, order_id, order_item_id, status,
        file_url, file_name, clinical_notes, verified_at,
        delivered_at, created_at,
        diagnostic_orders (
          id, order_number, branch_id,
          patients ( id, full_name, uhid, phone ),
          branches ( id, name )
        ),
        profiles:verified_by ( id, full_name )
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    const { data: reports, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query diagnostic reports: ${error.message}`, 500)
    }

    const items = (reports || []).map((r: any) => ({
      id: r.id,
      reportNumber: r.report_number,
      orderId: r.order_id,
      orderNumber: r.diagnostic_orders?.order_number,
      patientName: r.diagnostic_orders?.patients?.full_name || 'Patient',
      patientUhid: r.diagnostic_orders?.patients?.uhid || '-',
      patientPhone: r.diagnostic_orders?.patients?.phone || '-',
      branchName: r.diagnostic_orders?.branches?.name || 'Clinic',
      status: r.status,
      fileUrl: r.file_url,
      fileName: r.file_name,
      clinicalNotes: r.clinical_notes,
      verifiedBy: r.profiles?.full_name,
      verifiedAt: r.verified_at,
      deliveredAt: r.delivered_at,
      createdAt: r.created_at,
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
    const parsed = createReportSchema.parse(body)
    const admin = createAdminClient()

    const reportNumber = `REP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    const isVerified = parsed.status === 'verified' || parsed.status === 'ready_for_delivery'

    const { data: report, error } = await admin
      .from('diagnostic_reports')
      .insert({
        organization_id: user.organizationId,
        order_id: parsed.order_id,
        order_item_id: parsed.order_item_id || null,
        report_number: reportNumber,
        status: parsed.status,
        file_url: parsed.file_url || null,
        file_name: parsed.file_name || null,
        clinical_notes: parsed.clinical_notes || null,
        verified_by: isVerified ? user.id : null,
        verified_at: isVerified ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error || !report) {
      throw new ApiError('DATABASE_ERROR', `Failed to register report: ${error?.message}`, 500)
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DIAGNOSTIC_REPORT_REGISTERED',
      entityType: 'diagnostic_report',
      entityId: report.id,
      newValues: report,
    })

    return successResponse(report, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
