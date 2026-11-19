import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { calculateCartPricing } from '@/lib/modules/pricing/pricing-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createOrderSchema = z.object({
  branch_id: z.string().uuid('Valid branch ID required'),
  patient_id: z.string().uuid().optional(),
  // Quick registration if patient_id is not supplied
  quick_patient: z.object({
    full_name: z.string().min(2),
    phone: z.string().min(10),
    gender: z.enum(['male', 'female', 'other']).default('other'),
    age_years: z.number().int().min(0).max(130).optional(),
    address: z.string().optional(),
  }).optional(),
  fulfillment_type: z.enum(['home_collection', 'center_visit']).default('center_visit'),
  collection_address: z.string().optional().nullable(),
  collection_landmark: z.string().optional().nullable(),
  collection_pincode: z.string().optional().nullable(),
  scheduled_collection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduled_slot: z.string().optional().nullable(),
  items: z.array(z.object({
    item_type: z.enum(['test', 'package']),
    reference_id: z.string().uuid('Item reference ID is required'),
    quantity: z.number().int().min(1).default(1),
  })).min(1, 'Order must contain at least one diagnostic test or package'),
  promo_code: z.string().optional().nullable(),
  partner_code: z.string().optional().nullable(),
  special_instructions: z.string().optional().nullable(),
  create_invoice: z.boolean().default(true),
  payment: z.object({
    method: z.enum(['cash', 'upi', 'card', 'bank_transfer']),
    amount_paise: z.number().int().min(1).optional(),
    reference: z.string().optional(),
  }).optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')?.trim()
    const status = searchParams.get('status')?.trim()
    const fulfillment = searchParams.get('fulfillment')?.trim()
    const date = searchParams.get('date')?.trim()
    const query = searchParams.get('q')?.trim()
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const supabase = await createServerSupabaseClient()

    let q = supabase
      .from('diagnostic_orders')
      .select(`
        id, order_number, organization_id, branch_id, patient_id,
        status, fulfillment_type, collection_address, collection_landmark,
        collection_pincode, collection_city, scheduled_collection_date,
        scheduled_slot, assigned_phlebotomist_id, subtotal_paise,
        discount_paise, collection_fee_paise, total_paise, payment_status,
        payment_mode, promo_code, partner_code, special_instructions,
        created_at, updated_at,
        patients ( id, full_name, uhid, phone, gender, age_years ),
        branches ( id, name, code, phone ),
        diagnostic_order_items (
          id, item_type, test_id, package_id, item_name, item_code,
          unit_price_paise, discount_paise, final_price_paise,
          sample_barcode, status, report_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (branchId && branchId !== 'all') {
      q = q.eq('branch_id', branchId)
    }

    if (status && status !== 'all') {
      q = q.eq('status', status)
    }

    if (fulfillment && fulfillment !== 'all') {
      q = q.eq('fulfillment_type', fulfillment)
    }

    if (date) {
      q = q.eq('scheduled_collection_date', date)
    }

    const { data: rawOrders, error } = await q

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query diagnostic orders: ${error.message}`, 500)
    }

    const items = (rawOrders || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      branchId: o.branch_id,
      branchName: o.branches?.name || 'Clinic',
      patientId: o.patient_id,
      patientName: o.patients?.full_name || 'Walk-in Patient',
      patientUhid: o.patients?.uhid || '-',
      patientPhone: o.patients?.phone || '-',
      patientGender: o.patients?.gender,
      patientAge: o.patients?.age_years,
      status: o.status,
      fulfillmentType: o.fulfillment_type,
      collectionAddress: o.collection_address,
      collectionLandmark: o.collection_landmark,
      collectionPincode: o.collection_pincode,
      scheduledCollectionDate: o.scheduled_collection_date,
      scheduledSlot: o.scheduled_slot,
      assignedPhlebotomistId: o.assigned_phlebotomist_id,
      subtotalPaise: o.subtotal_paise,
      subtotalInr: Math.round(o.subtotal_paise / 100),
      discountPaise: o.discount_paise,
      discountInr: Math.round(o.discount_paise / 100),
      collectionFeePaise: o.collection_fee_paise,
      collectionFeeInr: Math.round(o.collection_fee_paise / 100),
      totalPaise: o.total_paise,
      totalInr: Math.round(o.total_paise / 100),
      paymentStatus: o.payment_status,
      paymentMode: o.payment_mode,
      promoCode: o.promo_code,
      specialInstructions: o.special_instructions,
      itemsCount: o.diagnostic_order_items?.length || 0,
      items: (o.diagnostic_order_items || []).map((it: any) => ({
        id: it.id,
        itemType: it.item_type,
        testId: it.test_id,
        packageId: it.package_id,
        name: it.item_name,
        code: it.item_code,
        pricePaise: it.final_price_paise,
        priceInr: Math.round(it.final_price_paise / 100),
        status: it.status,
        sampleBarcode: it.sample_barcode,
        reportUrl: it.report_url,
      })),
      createdAt: o.created_at,
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
    const parsed = createOrderSchema.parse(body)
    const admin = createAdminClient()

    // 1. Resolve Patient
    let patientId = parsed.patient_id
    if (!patientId && parsed.quick_patient) {
      const qp = parsed.quick_patient
      // Check existing patient by phone
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
            address: qp.address || parsed.collection_address || null,
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

    // 2. Server-side Pricing Engine evaluation
    const isHome = parsed.fulfillment_type === 'home_collection'
    const cartInputs = parsed.items.map((it) => ({
      itemType: it.item_type,
      referenceId: it.reference_id,
      quantity: it.quantity,
    }))

    const pricing = await calculateCartPricing({
      branchId: parsed.branch_id,
      items: cartInputs,
      isHomeCollection: isHome,
      promoCode: parsed.promo_code || undefined,
    })

    // 3. Generate Unique Order Number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    // 4. Create Diagnostic Order
    const { data: order, error: orderErr } = await admin
      .from('diagnostic_orders')
      .insert({
        order_number: orderNumber,
        organization_id: user.organizationId,
        branch_id: parsed.branch_id,
        patient_id: patientId,
        status: 'placed',
        fulfillment_type: parsed.fulfillment_type,
        collection_address: parsed.collection_address || null,
        collection_landmark: parsed.collection_landmark || null,
        collection_pincode: parsed.collection_pincode || null,
        scheduled_collection_date: parsed.scheduled_collection_date || null,
        scheduled_slot: parsed.scheduled_slot || null,
        subtotal_paise: pricing.subtotalPaise,
        discount_paise: pricing.discountPaise,
        collection_fee_paise: pricing.collectionFeePaise,
        total_paise: pricing.totalPaise,
        payment_status: parsed.payment ? 'paid' : 'unpaid',
        payment_mode: parsed.payment ? parsed.payment.method : 'cash',
        promo_code: pricing.promoCode || null,
        partner_code: parsed.partner_code || null,
        special_instructions: parsed.special_instructions || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (orderErr || !order) {
      throw new ApiError('DATABASE_ERROR', `Failed to create diagnostic order: ${orderErr?.message}`, 500)
    }

    // 5. Insert Diagnostic Order Items
    for (const item of pricing.items) {
      if (item.itemType === 'home_collection') continue // handled in collection_fee_paise

      await admin.from('diagnostic_order_items').insert({
        order_id: order.id,
        item_type: item.itemType === 'package' ? 'package' : 'test',
        test_id: item.itemType === 'test' ? item.referenceId : null,
        package_id: item.itemType === 'package' ? item.referenceId : null,
        item_name: item.description,
        item_code: item.hsnSac || 'TEST',
        unit_price_paise: item.unitPricePaise,
        discount_paise: item.discountPaise,
        final_price_paise: item.totalPaise,
        status: 'pending',
      })
    }

    // 6. Record Initial Order Status History
    await admin.from('diagnostic_order_status_history').insert({
      order_id: order.id,
      from_status: null,
      to_status: 'placed',
      changed_by: user.id,
      note: 'Diagnostic order recorded via clinic portal',
    })

    // 7. Auto-Create Invoice & Payment if requested
    let createdInvoice: any = null
    let createdPayment: any = null

    if (parsed.create_invoice) {
      const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      const payPaise = parsed.payment ? (parsed.payment.amount_paise || pricing.totalPaise) : 0
      const isPaid = payPaise >= pricing.totalPaise
      const isPartial = payPaise > 0 && !isPaid

      const { data: inv, error: invErr } = await admin
        .from('invoices')
        .insert({
          invoice_number: invNumber,
          organization_id: user.organizationId,
          branch_id: parsed.branch_id,
          patient_id: patientId,
          diagnostic_order_id: order.id,
          subtotal_paise: pricing.subtotalPaise,
          discount_paise: pricing.discountPaise,
          tax_paise: pricing.taxPaise,
          total_paise: pricing.totalPaise,
          paid_paise: payPaise,
          status: isPaid ? 'paid' : (isPartial ? 'partially_paid' : 'issued'),
          payment_status: isPaid ? 'paid' : (isPartial ? 'partially_paid' : 'unpaid'),
          promo_code: pricing.promoCode || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (!invErr && inv) {
        createdInvoice = inv
        // Insert invoice line items
        for (const item of pricing.items) {
          await admin.from('invoice_items').insert({
            invoice_id: inv.id,
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

        // If payment was provided, record payment receipt
        if (parsed.payment && payPaise > 0) {
          const recNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
          const { data: payRow } = await admin
            .from('payments')
            .insert({
              receipt_number: recNumber,
              organization_id: user.organizationId,
              branch_id: parsed.branch_id,
              invoice_id: inv.id,
              amount_paise: payPaise,
              payment_method: parsed.payment.method,
              transaction_reference: parsed.payment.reference || null,
              recorded_by: user.id,
            })
            .select()
            .single()

          createdPayment = payRow
        }
      }
    }

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DIAGNOSTIC_ORDER_CREATED',
      entityType: 'diagnostic_order',
      entityId: order.id,
      newValues: {
        order_number: order.order_number,
        total_paise: order.total_paise,
        fulfillment_type: order.fulfillment_type,
        invoice_id: createdInvoice?.id,
        receipt_id: createdPayment?.id,
      },
    })

    return successResponse({
      order,
      pricing,
      invoice: createdInvoice,
      payment: createdPayment,
    }, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
