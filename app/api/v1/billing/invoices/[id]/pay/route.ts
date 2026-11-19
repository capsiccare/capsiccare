import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const recordPaymentSchema = z.object({
  amount_paise: z.number().int().min(1, 'Payment amount must be greater than zero'),
  payment_method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'cheque']),
  transaction_reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
    const parsed = recordPaymentSchema.parse(body)
    const admin = createAdminClient()

    // 1. Fetch current invoice
    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (invErr || !invoice) {
      throw new ApiError('NOT_FOUND', `Invoice '${id}' not found`, 404)
    }

    const currentBalance = invoice.total_paise - invoice.paid_paise
    if (currentBalance <= 0) {
      throw new ApiError('BAD_REQUEST', 'Invoice is already fully paid', 400)
    }

    if (parsed.amount_paise > currentBalance) {
      throw new ApiError('BAD_REQUEST', `Payment amount (₹${Math.round(parsed.amount_paise / 100)}) exceeds remaining balance (₹${Math.round(currentBalance / 100)})`, 400)
    }

    // 2. Check for active cash counter session if method is Cash
    let sessionId: string | null = null
    if (parsed.payment_method === 'cash') {
      const { data: session } = await admin
        .from('cash_counter_sessions')
        .select('id, cash_collected_paise')
        .eq('staff_id', user.id)
        .eq('branch_id', invoice.branch_id)
        .eq('status', 'open')
        .maybeSingle()

      if (session) {
        sessionId = session.id
        await admin
          .from('cash_counter_sessions')
          .update({ cash_collected_paise: (session.cash_collected_paise || 0) + parsed.amount_paise })
          .eq('id', session.id)
      }
    }

    // 3. Insert Payment Record
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    const { data: payment, error: payErr } = await admin
      .from('payments')
      .insert({
        receipt_number: receiptNumber,
        organization_id: user.organizationId,
        branch_id: invoice.branch_id,
        invoice_id: invoice.id,
        amount_paise: parsed.amount_paise,
        payment_method: parsed.payment_method,
        transaction_reference: parsed.transaction_reference || null,
        cash_counter_session_id: sessionId,
        notes: parsed.notes || null,
        recorded_by: user.id,
      })
      .select()
      .single()

    if (payErr || !payment) {
      throw new ApiError('DATABASE_ERROR', `Failed to record payment: ${payErr?.message}`, 500)
    }

    // 4. Update Invoice Paid Amount & Status
    const newPaidPaise = invoice.paid_paise + parsed.amount_paise
    const isNowPaid = newPaidPaise >= invoice.total_paise
    const newStatus = isNowPaid ? 'paid' : 'partially_paid'

    const { data: updatedInvoice, error: updateErr } = await admin
      .from('invoices')
      .update({
        paid_paise: newPaidPaise,
        status: newStatus,
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr || !updatedInvoice) {
      throw new ApiError('DATABASE_ERROR', `Failed to update invoice totals: ${updateErr?.message}`, 500)
    }

    // 5. Update linked Diagnostic Order if exists
    if (invoice.diagnostic_order_id) {
      await admin
        .from('diagnostic_orders')
        .update({
          payment_status: newStatus,
          payment_mode: parsed.payment_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice.diagnostic_order_id)
    }

    // 6. Record Audit Event
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'PAYMENT_RECORDED',
      entityType: 'payment',
      entityId: payment.id,
      newValues: {
        receipt_number: payment.receipt_number,
        invoice_id: invoice.id,
        amount_paise: payment.amount_paise,
        payment_method: payment.payment_method,
        invoice_new_balance_paise: updatedInvoice.balance_paise,
      },
    })

    return successResponse({
      payment,
      invoice: updatedInvoice,
    }, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
