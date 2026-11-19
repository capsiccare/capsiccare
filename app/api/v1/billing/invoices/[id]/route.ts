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

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        patients ( id, full_name, uhid, phone, gender, age_years, address ),
        branches ( id, name, code, phone, address ),
        invoice_items (
          id, item_type, reference_id, description, quantity,
          unit_price_paise, discount_paise, tax_paise, total_paise, hsn_sac
        ),
        payments (
          id, receipt_number, amount_paise, payment_method,
          transaction_reference, payment_date, notes
        ),
        refunds (
          id, refund_number, amount_paise, refund_method, reason, created_at
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query invoice: ${error.message}`, 500)
    }

    if (!invoice) {
      throw new ApiError('NOT_FOUND', `Invoice '${id}' not found`, 404)
    }

    const result = {
      ...invoice,
      subtotalInr: Math.round(invoice.subtotal_paise / 100),
      discountInr: Math.round(invoice.discount_paise / 100),
      taxInr: Math.round(invoice.tax_paise / 100),
      totalInr: Math.round(invoice.total_paise / 100),
      paidInr: Math.round(invoice.paid_paise / 100),
      balanceInr: Math.round(invoice.balance_paise / 100),
      items: (invoice.invoice_items || []).map((it: any) => ({
        ...it,
        unitPriceInr: Math.round(it.unit_price_paise / 100),
        discountInr: Math.round(it.discount_paise / 100),
        taxInr: Math.round(it.tax_paise / 100),
        totalInr: Math.round(it.total_paise / 100),
      })),
      payments: (invoice.payments || []).map((p: any) => ({
        ...p,
        amountInr: Math.round(p.amount_paise / 100),
      })),
      refunds: (invoice.refunds || []).map((r: any) => ({
        ...r,
        amountInr: Math.round(r.amount_paise / 100),
      })),
    }

    return successResponse(result, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
