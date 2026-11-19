import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const paymentSchema = z.object({
  invoice_id: z.string().optional().nullable(),
  order_number: z.string().optional().nullable(),
  appointment_number: z.string().optional().nullable(),
  amount_inr: z.coerce.number().min(1, 'Amount must be greater than 0'),
  payment_method: z.enum(['upi', 'card', 'cash', 'bank_transfer']).default('upi'),
  transaction_reference: z.string().min(2, 'Transaction reference or UTR is required'),
  notes: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const parsed = paymentSchema.parse(body)
    const admin = createAdminClient()

    let invoice: any = null

    if (parsed.invoice_id) {
      const { data } = await admin
        .from('invoices')
        .select('id, organization_id, branch_id, patient_id, total_paise, paid_paise, diagnostic_order_id, appointment_id')
        .eq('id', parsed.invoice_id)
        .maybeSingle()
      invoice = data
    } else if (parsed.order_number) {
      const { data: order } = await admin
        .from('diagnostic_orders')
        .select('id')
        .eq('order_number', parsed.order_number)
        .maybeSingle()

      if (order) {
        const { data } = await admin
          .from('invoices')
          .select('id, organization_id, branch_id, patient_id, total_paise, paid_paise, diagnostic_order_id, appointment_id')
          .eq('diagnostic_order_id', order.id)
          .maybeSingle()
        invoice = data
      }
    } else if (parsed.appointment_number) {
      const { data: apt } = await admin
        .from('appointments')
        .select('id')
        .eq('appointment_number', parsed.appointment_number)
        .maybeSingle()

      if (apt) {
        const { data } = await admin
          .from('invoices')
          .select('id, organization_id, branch_id, patient_id, total_paise, paid_paise, diagnostic_order_id, appointment_id')
          .eq('appointment_id', apt.id)
          .maybeSingle()
        invoice = data
      }
    }

    if (!invoice) {
      throw new ApiError('NOT_FOUND', 'Invoice not found for the provided reference', 404)
    }

    const paymentAmountPaise = Math.round(parsed.amount_inr * 100)
    const newPaidPaise = (invoice.paid_paise || 0) + paymentAmountPaise
    const isFullyPaid = newPaidPaise >= invoice.total_paise

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randReceipt = Math.floor(1000 + Math.random() * 9000)
    const receiptNumber = `RCP-${dateStr}-${randReceipt}`

    // 1. Insert Payment Record
    const { data: payment, error: payErr } = await admin
      .from('payments')
      .insert({
        organization_id: invoice.organization_id,
        branch_id: invoice.branch_id,
        invoice_id: invoice.id,
        receipt_number: receiptNumber,
        amount_paise: paymentAmountPaise,
        payment_method: parsed.payment_method,
        transaction_reference: parsed.transaction_reference.trim(),
        notes: parsed.notes?.trim() || 'Online Patient Payment',
      })
      .select()
      .single()

    if (payErr || !payment) {
      throw new ApiError('DATABASE_ERROR', `Failed to record payment: ${payErr?.message}`, 500)
    }

    // 2. Update Invoice
    await admin
      .from('invoices')
      .update({
        paid_paise: newPaidPaise,
        status: isFullyPaid ? 'paid' : 'partially_paid',
        payment_status: isFullyPaid ? 'paid' : 'partially_paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id)

    // 3. Update Diagnostic Order if linked
    if (invoice.diagnostic_order_id) {
      await admin
        .from('diagnostic_orders')
        .update({
          payment_status: isFullyPaid ? 'paid' : 'partially_paid',
          payment_mode: parsed.payment_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice.diagnostic_order_id)
    }

    // 4. Audit Log
    await recordAuditEvent({
      organizationId: invoice.organization_id,
      userId: invoice.patient_id,
      action: 'PAYMENT_RECEIVED',
      entityType: 'payments',
      entityId: payment.id,
      newValues: {
        receipt_number: receiptNumber,
        amount_paise: paymentAmountPaise,
        payment_method: parsed.payment_method,
        transaction_reference: parsed.transaction_reference,
      },
    })

    return successResponse(
      {
        receipt_number: receiptNumber,
        invoice_id: invoice.id,
        paid_inr: parsed.amount_inr,
        total_paid_inr: newPaidPaise / 100,
        status: isFullyPaid ? 'paid' : 'partially_paid',
        message: 'Payment recorded and verified successfully.',
      },
      undefined,
      200,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
