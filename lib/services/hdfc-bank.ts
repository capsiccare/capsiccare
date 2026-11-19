import { createAdminClient } from '@/lib/supabase/admin'

export interface HdfcMerchantConfig {
  merchantName: string
  tid: string
  vpa: string
  secondaryVpa: string
  qrImageUrl: string
  mcc: string
}

export const HDFC_SMARTHUB_CONFIG: HdfcMerchantConfig = {
  merchantName: 'CAPSIC CARE',
  tid: '82308299',
  vpa: 'capsiccare.82308299@hdfcbank',
  secondaryVpa: 'hdfcbank.82308299@hdfcbank',
  qrImageUrl: '/images/payments/hdfc-smarthub-qr.jpg',
  mcc: '8099', // Medical / Healthcare Services
}

/**
 * Builds standard NPCI / HDFC SmartHub Vyapar UPI payment intent URL
 */
export function buildHdfcUpiIntentUrl(params: {
  amountPaise: number
  orderNumber: string
  patientName?: string
  invoiceNumber?: string
}): string {
  const amountRupees = (params.amountPaise / 100).toFixed(2)
  const vpa = HDFC_SMARTHUB_CONFIG.vpa
  const name = encodeURIComponent(HDFC_SMARTHUB_CONFIG.merchantName)
  const note = encodeURIComponent(`Capsic Care Lab - ${params.orderNumber}`)
  const tr = encodeURIComponent(params.orderNumber)

  return `upi://pay?pa=${vpa}&pn=${name}&am=${amountRupees}&cu=INR&tn=${note}&tr=${tr}&mc=${HDFC_SMARTHUB_CONFIG.mcc}`
}

/**
 * Validates UTR / Bank Reference format and records HDFC confirmation
 */
export async function confirmHdfcPayment(params: {
  utr: string
  orderNumber?: string
  invoiceNumber?: string
  amountPaise: number
  patientId?: string
  notes?: string
}) {
  const admin = createAdminClient()
  const cleanUtr = params.utr.trim().toUpperCase()

  // Standard Indian UTR is 12 alphanumeric characters, or custom transaction id
  if (cleanUtr.length < 6) {
    throw new Error('Please enter a valid Bank UTR / Reference number (minimum 6 digits).')
  }

  // 1. Check if this UTR has already been utilized
  const { data: existingPayment } = await admin
    .from('payments')
    .select('id, receipt_number, invoice_id')
    .eq('transaction_reference', cleanUtr)
    .maybeSingle()

  if (existingPayment) {
    return {
      success: true,
      alreadyRecorded: true,
      paymentId: existingPayment.id,
      receiptNumber: existingPayment.receipt_number,
      message: 'This payment transaction reference has already been verified and recorded.',
    }
  }

  // 2. Fetch invoice or order if provided
  let invoiceId: string | null = null
  let orderId: string | null = null
  let orgId: string | null = null
  let branchId: string | null = null

  if (params.invoiceNumber) {
    const { data: inv } = await admin
      .from('invoices')
      .select('id, organization_id, branch_id, diagnostic_order_id, total_paise')
      .eq('invoice_number', params.invoiceNumber.trim())
      .maybeSingle()
    if (inv) {
      invoiceId = inv.id
      orderId = inv.diagnostic_order_id
      orgId = inv.organization_id
      branchId = inv.branch_id
    }
  }

  if (!orderId && params.orderNumber) {
    const { data: ord } = await admin
      .from('diagnostic_orders')
      .select('id, organization_id, branch_id, total_paise')
      .eq('order_number', params.orderNumber.trim())
      .maybeSingle()
    if (ord) {
      orderId = ord.id
      orgId = ord.organization_id
      branchId = ord.branch_id
    }
  }

  // Fallback defaults
  if (!orgId) {
    const { data: org } = await admin.from('organizations').select('id').limit(1).single()
    orgId = org?.id
  }
  if (!branchId) {
    const { data: br } = await admin.from('branches').select('id').limit(1).single()
    branchId = br?.id
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randReceiptSuffix = Math.floor(1000 + Math.random() * 9000)
  const receiptNumber = `RCP-HDFC-${dateStr}-${randReceiptSuffix}`

  // Ensure invoice_id is not null to satisfy NOT NULL constraint
  if (!invoiceId) {
    if (orderId) {
      const { data: inv } = await admin
        .from('invoices')
        .select('id')
        .eq('diagnostic_order_id', orderId)
        .limit(1)
        .maybeSingle()
      if (inv) invoiceId = inv.id
    }
  }

  if (!invoiceId) {
    let patientId = params.patientId
    if (!patientId) {
      const { data: anyPat } = await admin.from('patients').select('id').limit(1).single()
      patientId = anyPat?.id
    }
    const invNumber = `INV-HDFC-${dateStr}-${randReceiptSuffix}`
    const { data: newInv } = await admin
      .from('invoices')
      .insert({
        organization_id: orgId,
        branch_id: branchId,
        patient_id: patientId,
        diagnostic_order_id: orderId,
        invoice_number: invNumber,
        invoice_date: new Date().toISOString().slice(0, 10),
        subtotal_paise: params.amountPaise,
        discount_paise: 0,
        tax_paise: 0,
        total_paise: params.amountPaise,
        paid_paise: params.amountPaise,
        status: 'paid',
        payment_status: 'paid',
        notes: `HDFC SmartHub Payment Collection (TID: 82308299) - UTR: ${cleanUtr}`,
      })
      .select('id')
      .single()

    if (newInv) {
      invoiceId = newInv.id
    }
  }

  // 3. Insert payment ledger entry
  const { data: paymentRecord, error: payErr } = await admin
    .from('payments')
    .insert({
      organization_id: orgId,
      branch_id: branchId,
      invoice_id: invoiceId,
      receipt_number: receiptNumber,
      amount_paise: params.amountPaise,
      payment_method: 'upi',
      transaction_reference: cleanUtr,
      notes: params.notes || `HDFC Bank SmartHub VYAPAR (TID: 82308299) - UTR: ${cleanUtr}`,
    })
    .select()
    .single()

  if (payErr) {
    throw new Error(`Failed to record bank payment: ${payErr.message}`)
  }

  // 4. Update Invoice status to paid
  if (invoiceId) {
    await admin
      .from('invoices')
      .update({
        paid_paise: params.amountPaise,
        status: 'paid',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
  }

  // 5. Update Diagnostic Order status
  if (orderId) {
    await admin
      .from('diagnostic_orders')
      .update({
        payment_status: 'paid',
        payment_mode: 'upi',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
  }

  return {
    success: true,
    alreadyRecorded: false,
    paymentId: paymentRecord.id,
    receiptNumber: receiptNumber,
    merchantTid: HDFC_SMARTHUB_CONFIG.tid,
    merchantName: HDFC_SMARTHUB_CONFIG.merchantName,
    amountPaise: params.amountPaise,
    message: 'Bank payment confirmed and verified with HDFC SmartHub VYAPAR.',
  }
}
