import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const cartItemSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, 'Item name is required'),
  price: z.coerce.number().min(0),
  mrp: z.coerce.number().optional().nullable(),
  code: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  category: z.any().optional().nullable(),
})

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().default('West Bengal'),
  pincode: z.string().min(4, 'Pincode is required'),
  dateOfBirth: z.string().optional().or(z.literal('')).nullable(),
  gender: z.string().optional().or(z.literal('')).nullable(),
  notes: z.string().optional().or(z.literal('')).nullable(),
  promoCode: z.string().optional().or(z.literal('')).nullable(),
  partnerCode: z.string().optional().or(z.literal('')).nullable(),
  fulfillmentType: z.enum(['home_collection', 'center_visit']).default('home_collection'),
  paymentMode: z.enum(['cod', 'upi', 'card', 'online']).default('cod'),
  transactionReference: z.string().optional().or(z.literal('')).nullable(),
  isPaid: z.boolean().default(false),
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const parsed = checkoutSchema.parse(body)
    const admin = createAdminClient()

    // 1. Fetch organization and default branch
    const { data: org, error: orgErr } = await admin.from('organizations').select('id').limit(1).single()
    if (orgErr || !org) {
      throw new ApiError('INTERNAL_ERROR', 'Organization configuration not found', 500)
    }

    const { data: branch, error: branchErr } = await admin.from('branches').select('id, name').limit(1).single()
    if (branchErr || !branch) {
      throw new ApiError('INTERNAL_ERROR', 'Default branch not found', 500)
    }

    // 2. Resolve or Register Patient
    const cleanPhone = parsed.phone.trim().replace(/\D/g, '').slice(-10)
    const { data: existingPatient } = await admin
      .from('patients')
      .select('id, uhid, full_name, phone')
      .eq('phone', cleanPhone)
      .maybeSingle()

    let patientId: string
    let patientUhid: string

    let calculatedAge: number | null = null
    if (parsed.dateOfBirth) {
      const birthYear = new Date(parsed.dateOfBirth).getFullYear()
      const thisYear = new Date().getFullYear()
      if (!isNaN(birthYear) && birthYear <= thisYear) {
        calculatedAge = Math.max(0, thisYear - birthYear)
      }
    }

    let parsedGender: 'male' | 'female' | 'other' = 'male'
    const gLower = (parsed.gender || '').toLowerCase()
    if (gLower.includes('fem') || gLower === 'f') parsedGender = 'female'
    else if (gLower.includes('oth')) parsedGender = 'other'

    if (existingPatient) {
      patientId = existingPatient.id
      patientUhid = existingPatient.uhid

      // Update address if missing
      await admin
        .from('patients')
        .update({
          address_line1: parsed.address.trim(),
          city: parsed.city.trim(),
          pincode: parsed.pincode.trim(),
          email: parsed.email?.trim() || undefined,
          age_years: calculatedAge ?? undefined,
        })
        .eq('id', patientId)
    } else {
      const year = new Date().getFullYear()
      const randNum = Math.floor(100000 + Math.random() * 900000)
      patientUhid = `CAP-${year}-${randNum}`

      const { data: newPatient, error: patErr } = await admin
        .from('patients')
        .insert({
          organization_id: org.id,
          uhid: patientUhid,
          full_name: parsed.fullName.trim(),
          phone: cleanPhone,
          email: parsed.email?.trim() || null,
          gender: parsedGender,
          age_years: calculatedAge,
          address_line1: parsed.address.trim(),
          city: parsed.city.trim(),
          district: parsed.city.trim() || 'Howrah',
          state: parsed.state || 'West Bengal',
          pincode: parsed.pincode.trim(),
          primary_branch_id: branch.id,
          is_active: true,
        })
        .select('id, uhid')
        .single()

      if (patErr || !newPatient) {
        throw new ApiError('DATABASE_ERROR', `Failed to register patient: ${patErr?.message}`, 500)
      }

      patientId = newPatient.id
      patientUhid = newPatient.uhid

      // Create portal access PIN for instant patient access
      const defaultPin = '123456'
      const pinHash = crypto.createHash('sha256').update(defaultPin).digest('hex')
      await admin.from('patient_portal_links').insert({
        patient_id: patientId,
        phone: cleanPhone,
        portal_access_pin_hash: pinHash,
        is_active: true,
      })
    }

    // 3. Financial calculations (Integer paise)
    const subtotalPaise = parsed.items.reduce((sum, item) => {
      const unitPrice = Math.max(item.mrp || item.price, item.price)
      return sum + Math.round(unitPrice * 100)
    }, 0)

    const finalPaise = parsed.items.reduce((sum, item) => {
      return sum + Math.round(item.price * 100)
    }, 0)

    const itemDiscountPaise = Math.max(0, subtotalPaise - finalPaise)

    // Check promo code if any
    let promoDiscountPaise = 0
    if (parsed.promoCode) {
      const { data: promo } = await admin
        .from('promotions')
        .select('discount_type, discount_value, min_order_paise, max_discount_paise')
        .eq('code', parsed.promoCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle()

      if (promo && finalPaise >= (promo.min_order_paise || 0)) {
        if (promo.discount_type === 'percentage') {
          promoDiscountPaise = Math.round((finalPaise * promo.discount_value) / 100)
          if (promo.max_discount_paise && promoDiscountPaise > promo.max_discount_paise) {
            promoDiscountPaise = promo.max_discount_paise
          }
        } else if (promo.discount_type === 'fixed_amount') {
          promoDiscountPaise = promo.discount_value
        }
      }
    }

    const totalDiscountPaise = itemDiscountPaise + promoDiscountPaise
    const totalPayablePaise = Math.max(0, subtotalPaise - totalDiscountPaise)

    // Free home collection if total order >= 2000 INR (200,000 paise)
    const collectionFeePaise = 0

    // 4. Generate Order Number: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randOrderSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `ORD-${dateStr}-${randOrderSuffix}`

    const isOrderPaid = parsed.isPaid || (parsed.paymentMode !== 'cod' && Boolean(parsed.transactionReference))
    const dbPaymentMode = parsed.paymentMode === 'cod' ? 'cash' : (['upi', 'card', 'online', 'unpaid', 'cash'].includes(parsed.paymentMode) ? parsed.paymentMode : 'cash')

    // 5. Insert Diagnostic Order
    const { data: order, error: orderErr } = await admin
      .from('diagnostic_orders')
      .insert({
        organization_id: org.id,
        branch_id: branch.id,
        patient_id: patientId,
        order_number: orderNumber,
        status: 'placed',
        fulfillment_type: parsed.fulfillmentType,
        collection_address: `${parsed.address}, ${parsed.city} - ${parsed.pincode}`,
        collection_pincode: parsed.pincode,
        collection_city: parsed.city,
        subtotal_paise: subtotalPaise,
        discount_paise: totalDiscountPaise,
        collection_fee_paise: collectionFeePaise,
        total_paise: totalPayablePaise,
        payment_status: isOrderPaid ? 'paid' : 'unpaid',
        payment_mode: dbPaymentMode,
        promo_code: parsed.promoCode || null,
        partner_code: parsed.partnerCode || null,
        special_instructions: parsed.notes?.trim() || 'Online Web Order Booking',
      })
      .select()
      .single()

    if (orderErr || !order) {
      throw new ApiError('DATABASE_ERROR', `Failed to create diagnostic order: ${orderErr?.message}`, 500)
    }

    // 6. Resolve Catalog Items and Insert Order Line Items
    // Fetch a fallback test ID to satisfy foreign key constraint if item is ad-hoc
    const { data: fallbackTest } = await admin
      .from('diagnostic_tests')
      .select('id, code, name')
      .limit(1)
      .single()

    for (let i = 0; i < parsed.items.length; i++) {
      const item = parsed.items[i]
      const itemName = item.name.trim()

      // Attempt to find test in diagnostic_tests
      let testId: string | null = null
      let packageId: string | null = null
      let itemType: 'test' | 'package' = 'test'

      // Check diagnostic_tests
      const { data: matchTest } = await admin
        .from('diagnostic_tests')
        .select('id, code, name')
        .or(`name.ilike.%${itemName}%,code.ilike.%${item.code || itemName}%`)
        .limit(1)
        .maybeSingle()

      if (matchTest) {
        testId = matchTest.id
        itemType = 'test'
      } else {
        // Check diagnostic_packages
        const { data: matchPkg } = await admin
          .from('diagnostic_packages')
          .select('id, code, name')
          .or(`name.ilike.%${itemName}%,code.ilike.%${item.code || itemName}%`)
          .limit(1)
          .maybeSingle()

        if (matchPkg) {
          packageId = matchPkg.id
          itemType = 'package'
        } else {
          // Fallback to primary test to satisfy constraint
          testId = fallbackTest ? fallbackTest.id : null
          itemType = 'test'
        }
      }

      const itemMrpPaise = Math.round(Math.max(item.mrp || item.price, item.price) * 100)
      const itemFinalPaise = Math.round(item.price * 100)
      const itemDiscPaise = Math.max(0, itemMrpPaise - itemFinalPaise)

      const lineItemData: any = {
        order_id: order.id,
        item_type: itemType,
        item_name: itemName,
        item_code: item.code || `TEST-${i + 1}`,
        unit_price_paise: itemMrpPaise,
        discount_paise: itemDiscPaise,
        final_price_paise: itemFinalPaise,
        status: 'pending',
      }

      if (itemType === 'package') {
        lineItemData.package_id = packageId
        lineItemData.test_id = null
      } else {
        lineItemData.test_id = testId
        lineItemData.package_id = null
      }

      await admin.from('diagnostic_order_items').insert(lineItemData)
    }

    // 7. Insert Invoice
    const randInvSuffix = Math.floor(1000 + Math.random() * 9000)
    const invoiceNumber = `INV-${dateStr}-${randInvSuffix}`

    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .insert({
        organization_id: org.id,
        branch_id: branch.id,
        patient_id: patientId,
        diagnostic_order_id: order.id,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().slice(0, 10),
        subtotal_paise: subtotalPaise,
        discount_paise: totalDiscountPaise,
        tax_paise: 0,
        total_paise: totalPayablePaise,
        paid_paise: isOrderPaid ? totalPayablePaise : 0,
        status: isOrderPaid ? 'paid' : 'issued',
        payment_status: isOrderPaid ? 'paid' : 'unpaid',
        promo_code: parsed.promoCode || null,
        notes: `Online Cart Booking - Order #${orderNumber}`,
      })
      .select('id, invoice_number')
      .single()

    // 8. If paid online, insert Payment Record
    if (invoice && isOrderPaid) {
      const receiptNumber = `RCP-${dateStr}-${randOrderSuffix}`
      await admin.from('payments').insert({
        organization_id: org.id,
        branch_id: branch.id,
        invoice_id: invoice.id,
        receipt_number: receiptNumber,
        amount_paise: totalPayablePaise,
        payment_method: parsed.paymentMode === 'card' ? 'card' : 'upi',
        transaction_reference: parsed.transactionReference || `TXN-${Date.now()}`,
        notes: 'Online Cart Checkout Payment',
      })
    }

    // 8. Insert Invoice Items
    if (invoice) {
      for (const item of parsed.items) {
        const itemMrpPaise = Math.round(Math.max(item.mrp || item.price, item.price) * 100)
        const itemFinalPaise = Math.round(item.price * 100)
        const itemDiscPaise = Math.max(0, itemMrpPaise - itemFinalPaise)

        await admin.from('invoice_items').insert({
          invoice_id: invoice.id,
          item_type: 'test',
          description: item.name,
          quantity: 1,
          unit_price_paise: itemMrpPaise,
          discount_paise: itemDiscPaise,
          tax_paise: 0,
          total_paise: itemFinalPaise,
        })
      }
    }

    // 9. Create Communication Notification
    await admin.from('communication_messages').insert({
      organization_id: org.id,
      patient_id: patientId,
      channel: 'whatsapp',
      recipient: cleanPhone,
      message_body: `Dear ${parsed.fullName.trim()}, your Capsic Care lab test order #${orderNumber} has been successfully placed. Total: ₹${(totalPayablePaise / 100).toFixed(0)}. Our phlebotomist will contact you for sample collection. Access your patient portal with phone ${cleanPhone}.`,
      status: 'queued',
      related_entity_type: 'diagnostic_order',
      related_entity_id: order.id,
    })

    // 10. Record Audit Event
    await recordAuditEvent({
      organizationId: org.id,
      userId: patientId,
      action: 'ORDER_PLACED',
      entityType: 'diagnostic_orders',
      entityId: order.id,
      newValues: {
        order_number: orderNumber,
        total_paise: totalPayablePaise,
        items_count: parsed.items.length,
        channel: 'web_checkout',
      },
    })

    return successResponse(
      {
        order: {
          id: order.id,
          order_number: orderNumber,
          status: 'placed',
          fulfillment_type: parsed.fulfillmentType,
          subtotal_inr: subtotalPaise / 100,
          discount_inr: totalDiscountPaise / 100,
          total_inr: totalPayablePaise / 100,
          created_at: order.created_at,
        },
        patient: {
          id: patientId,
          uhid: patientUhid,
          name: parsed.fullName.trim(),
          phone: cleanPhone,
        },
        invoice: {
          id: invoice?.id,
          invoice_number: invoice?.invoice_number || invoiceNumber,
        },
      },
      undefined,
      201,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
