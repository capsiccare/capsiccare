import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { calculateCartPricing } from '@/lib/modules/pricing/pricing-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createInvoiceSchema = z.object({
  branch_id: z.string().uuid('Valid branch ID required'),
  patient_id: z.string().uuid().optional(),
  quick_patient: z.object({
    full_name: z.string().min(2),
    phone: z.string().min(10),
    gender: z.enum(['male', 'female', 'other']).default('other'),
    age_years: z.number().int().min(0).max(130).optional(),
    address: z.string().optional(),
  }).optional(),
  appointment_id: z.string().uuid().optional().nullable(),
  diagnostic_order_id: z.string().uuid().optional().nullable(),
  items: z.array(z.object({
    item_type: z.enum(['consultation', 'test', 'package', 'home_collection', 'other']),
    reference_id: z.string().uuid().optional().nullable(),
    description: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
    unit_price_paise: z.number().int().min(0).optional(),
  })).min(1, 'Invoice must contain at least one line item'),
  promo_code: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  initial_payment: z.object({
    method: z.enum(['cash', 'upi', 'card', 'bank_transfer']),
    amount_paise: z.number().int().min(1).optional(),
    reference: z.string().optional().nullable(),
  }).optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')?.trim()
    const status = searchParams.get('status')?.trim()
    const paymentStatus = searchParams.get('paymentStatus')?.trim()
    const date = searchParams.get('date')?.trim()
    const patientId = searchParams.get('patientId')?.trim()
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('invoices')
      .select(`
        id, invoice_number, branch_id, patient_id, appointment_id,
        diagnostic_order_id, invoice_date, subtotal_paise, discount_paise,
        tax_paise, total_paise, paid_paise, balance_paise, status,
        payment_status, promo_code, notes, created_at,
        patients ( id, full_name, uhid, phone, gender, age_years ),
        branches ( id, name, code, phone ),
        invoice_items ( id, item_type, description, quantity, unit_price_paise, total_paise, hsn_sac ),
        payments ( id, receipt_number, amount_paise, payment_method, payment_date )
      `)
      .order('invoice_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus)
    }

    if (date) {
      query = query.eq('invoice_date', date)
    }

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    const { data: rawInvoices, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query invoices: ${error.message}`, 500)
    }

    const items = (rawInvoices || []).map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      branchId: inv.branch_id,
      branchName: inv.branches?.name || 'Clinic',
      patientId: inv.patient_id,
      patientName: inv.patients?.full_name || 'Patient',
      patientUhid: inv.patients?.uhid || '-',
      patientPhone: inv.patients?.phone || '-',
      invoiceDate: inv.invoice_date,
      subtotalPaise: inv.subtotal_paise,
      subtotalInr: Math.round(inv.subtotal_paise / 100),
      discountPaise: inv.discount_paise,
      discountInr: Math.round(inv.discount_paise / 100),
      taxPaise: inv.tax_paise,
      taxInr: Math.round(inv.tax_paise / 100),
      totalPaise: inv.total_paise,
      totalInr: Math.round(inv.total_paise / 100),
      paidPaise: inv.paid_paise,
      paidInr: Math.round(inv.paid_paise / 100),
      balancePaise: inv.balance_paise,
      balanceInr: Math.round(inv.balance_paise / 100),
      status: inv.status,
      paymentStatus: inv.payment_status,
      promoCode: inv.promo_code,
      notes: inv.notes,
      appointmentId: inv.appointment_id,
      diagnosticOrderId: inv.diagnostic_order_id,
      lineItemsCount: inv.invoice_items?.length || 0,
      paymentsCount: inv.payments?.length || 0,
      items: (inv.invoice_items || []).map((it: any) => ({
        id: it.id,
        itemType: it.item_type,
        description: it.description,
        quantity: it.quantity,
        unitPriceInr: Math.round(it.unit_price_paise / 100),
        totalInr: Math.round(it.total_paise / 100),
        hsnSac: it.hsn_sac,
      })),
      payments: (inv.payments || []).map((p: any) => ({
        id: p.id,
        receiptNumber: p.receipt_number,
        amountInr: Math.round(p.amount_paise / 100),
        paymentMethod: p.payment_method,
        paymentDate: p.payment_date,
        reference: p.transaction_reference,
      })),
      createdAt: inv.created_at,
    }))

    return successResponse(items, { total: items.length, limit, offset }, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createInvoiceSchema.parse(body)
    const admin = createAdminClient()

    // 1. Resolve Patient
    let patientId = parsed.patient_id
    if (!patientId && parsed.quick_patient) {
      const qp = parsed.quick_patient
      const { data: existing } = await admin
        .from('patients')
        .select('id')
        .eq('phone', qp.phone.trim())
        .maybeSingle()

      if (existing) {
        patientId = existing.id
      } else {
        const uhid = `UHID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
        const { data: newP, error: pErr } = await admin
          .from('patients')
          .insert({
            organization_id: user.organizationId,
            uhid,
            full_name: qp.full_name.trim(),
            phone: qp.phone.trim(),
            gender: qp.gender,
            age_years: qp.age_years || null,
            address: qp.address || null,
          })
          .select('id')
          .single()

        if (pErr || !newP) {
          throw new ApiError('DATABASE_ERROR', `Failed to register patient: ${pErr?.message}`, 500)
        }
        patientId = newP.id
      }
    }

    if (!patientId) {
      throw new ApiError('BAD_REQUEST', 'Patient identification is required', 400)
    }

    // 2. Calculate Pricing & Taxes Server-side
    const pricing = await calculateCartPricing({
      branchId: parsed.branch_id,
      items: parsed.items.map((it) => ({
        itemType: it.item_type,
        referenceId: it.reference_id || undefined,
        description: it.description,
        unitPricePaise: it.unit_price_paise,
        quantity: it.quantity,
      })),
      isHomeCollection: parsed.items.some((it) => it.item_type === 'home_collection'),
      promoCode: parsed.promo_code || undefined,
    })

    // 3. Generate Unique Invoice Number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    // Initial Payment calculation
    const payPaise = parsed.initial_payment
      ? (parsed.initial_payment.amount_paise || pricing.totalPaise)
      : 0
    const isPaid = payPaise >= pricing.totalPaise
    const isPartial = payPaise > 0 && !isPaid

    // 4. Create Invoice
    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        organization_id: user.organizationId,
        branch_id: parsed.branch_id,
        patient_id: patientId,
        appointment_id: parsed.appointment_id || null,
        diagnostic_order_id: parsed.diagnostic_order_id || null,
        subtotal_paise: pricing.subtotalPaise,
        discount_paise: pricing.discountPaise,
        tax_paise: pricing.taxPaise,
        total_paise: pricing.totalPaise,
        paid_paise: payPaise,
        status: isPaid ? 'paid' : (isPartial ? 'partially_paid' : 'issued'),
        payment_status: isPaid ? 'paid' : (isPartial ? 'partially_paid' : 'unpaid'),
        promo_code: pricing.promoCode || null,
        notes: parsed.notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (invErr || !invoice) {
      throw new ApiError('DATABASE_ERROR', `Failed to create invoice: ${invErr?.message}`, 500)
    }

    // 5. Insert Invoice Items
    for (const item of pricing.items) {
      await admin.from('invoice_items').insert({
        invoice_id: invoice.id,
        item_type: item.itemType,
        reference_id: item.referenceId || null,
        description: item.description,
        quantity: item.quantity,
        unit_price_paise: item.unitPricePaise,
        discount_paise: item.discountPaise,
        tax_paise: item.taxPaise,
        total_paise: item.totalPaise,
        hsn_sac: item.hsnSac,
      })
    }

    // 6. Record Initial Payment Receipt if supplied
    let paymentRecord: any = null
    if (parsed.initial_payment && payPaise > 0) {
      // Check active cash session if cash
      let sessionId: string | null = null
      if (parsed.initial_payment.method === 'cash') {
        const { data: session } = await admin
          .from('cash_counter_sessions')
          .select('id, cash_collected_paise')
          .eq('staff_id', user.id)
          .eq('branch_id', parsed.branch_id)
          .eq('status', 'open')
          .maybeSingle()

        if (session) {
          sessionId = session.id
          // Increment cash collected
          await admin
            .from('cash_counter_sessions')
            .update({ cash_collected_paise: (session.cash_collected_paise || 0) + payPaise })
            .eq('id', session.id)
        }
      }

      const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      const { data: payment, error: payErr } = await admin
        .from('payments')
        .insert({
          receipt_number: receiptNumber,
          organization_id: user.organizationId,
          branch_id: parsed.branch_id,
          invoice_id: invoice.id,
          amount_paise: payPaise,
          payment_method: parsed.initial_payment.method,
          transaction_reference: parsed.initial_payment.reference || null,
          cash_counter_session_id: sessionId,
          recorded_by: user.id,
        })
        .select()
        .single()

      if (!payErr && payment) {
        paymentRecord = payment
      }
    }

    // 7. Audit Log
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'INVOICE_CREATED',
      entityType: 'invoice',
      entityId: invoice.id,
      newValues: {
        invoice_number: invoice.invoice_number,
        total_paise: invoice.total_paise,
        paid_paise: invoice.paid_paise,
        status: invoice.status,
      },
    })

    return successResponse({
      invoice,
      pricing,
      payment: paymentRecord,
    }, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
