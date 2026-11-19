import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { id } = await params
    const supabase = await createServerSupabaseClient()

    const { data: order, error } = await supabase
      .from('diagnostic_orders')
      .select(`
        *,
        patients ( id, full_name, uhid, phone, gender, age_years, address ),
        branches ( id, name, code, phone, address ),
        diagnostic_order_items (
          id, item_type, test_id, package_id, item_name, item_code,
          unit_price_paise, discount_paise, final_price_paise,
          sample_barcode, status, report_url, reported_at
        ),
        diagnostic_order_status_history (
          id, from_status, to_status, note, created_at,
          profiles ( id, full_name )
        ),
        invoices (
          id, invoice_number, subtotal_paise, discount_paise, tax_paise,
          total_paise, paid_paise, status, payment_status,
          payments (
            id, receipt_number, amount_paise, payment_method,
            transaction_reference, payment_date
          )
        ),
        diagnostic_reports (
          id, report_number, status, file_url, file_name, clinical_notes,
          verified_at, delivered_at
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query order: ${error.message}`, 500)
    }

    if (!order) {
      throw new ApiError('NOT_FOUND', `Diagnostic order '${id}' not found`, 404)
    }

    const result = {
      ...order,
      subtotalInr: Math.round(order.subtotal_paise / 100),
      discountInr: Math.round(order.discount_paise / 100),
      collectionFeeInr: Math.round(order.collection_fee_paise / 100),
      totalInr: Math.round(order.total_paise / 100),
      items: (order.diagnostic_order_items || []).map((it: any) => ({
        ...it,
        unitPriceInr: Math.round(it.unit_price_paise / 100),
        finalPriceInr: Math.round(it.final_price_paise / 100),
      })),
    }

    return successResponse(result, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
