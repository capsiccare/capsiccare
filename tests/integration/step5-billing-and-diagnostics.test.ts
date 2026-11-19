import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import { calculateCartPricing } from '../../lib/modules/pricing/pricing-service'

describe('Step 05: Unified Diagnostics, Home Sample Collection, Billing & POS Engine Tests', () => {
  const admin = createAdminClient()
  const orgId = '11111111-1111-4111-a111-111111111111'
  const branchId = '22222222-2222-4222-a222-222222222222'
  const patientId = '44444444-4444-4444-a444-444444444441'

  let testOrderId: string
  let testInvoiceId: string
  let testSessionId: string
  let testStaffId: string
  let testTestId: string

  it('1. Database Tables: should verify all Step 05 tables exist and are accessible', async () => {
    const tables = [
      'tax_classifications',
      'home_collection_rules',
      'promotions',
      'invoices',
      'invoice_items',
      'payments',
      'cash_counter_sessions',
      'diagnostic_reports',
    ]

    for (const table of tables) {
      const { data, error } = await admin.from(table).select('id').limit(1)
      assert.equal(error, null, `Table ${table} should be queryable without error`)
    }
  })

  it('2. Pricing Engine: should enforce free home collection on orders >= ₹1,000', async () => {
    // Sub-threshold cart: 1 test @ ₹400 (40,000 paise)
    const smallCart = await calculateCartPricing({
      branchId,
      items: [
        { itemType: 'test', unitPricePaise: 40000, quantity: 1 }
      ],
      fulfillmentType: 'home_collection',
    })

    assert.equal(smallCart.subtotalPaise, 40000)
    assert.equal(smallCart.collectionFeePaise, 10000, 'Home collection fee should be ₹100 (10,000 paise) for orders under ₹1,000')
    assert.equal(smallCart.totalPaise, 50000, 'Total should be ₹500')

    // Above-threshold cart: tests totaling ₹1,500 (150,000 paise)
    const largeCart = await calculateCartPricing({
      branchId,
      items: [
        { itemType: 'test', unitPricePaise: 150000, quantity: 1 }
      ],
      fulfillmentType: 'home_collection',
    })

    assert.equal(largeCart.subtotalPaise, 150000)
    assert.equal(largeCart.collectionFeePaise, 0, 'Home collection fee must be FREE (0 paise) for orders >= ₹1,000')
    assert.equal(largeCart.totalPaise, 150000, 'Total should equal subtotal without collection fee')
  })

  it('3. Pricing Engine: should apply promotional discounts (WELCOME10 - 10%)', async () => {
    const promoCart = await calculateCartPricing({
      branchId,
      items: [
        { itemType: 'test', unitPricePaise: 100000, quantity: 1 } // ₹1,000
      ],
      fulfillmentType: 'walk_in',
      promoCode: 'WELCOME10',
    })

    assert.equal(promoCart.subtotalPaise, 100000)
    assert.equal(promoCart.discountPaise, 10000, '10% discount on ₹1,000 should be ₹100 (10,000 paise)')
    assert.equal(promoCart.totalPaise, 90000, 'Total should be ₹900 (90,000 paise)')
  })

  it('4. Diagnostic Order Lifecycle: should create order with items and validate state machine', async () => {
    const orderNum = `ORD-TEST-${Date.now()}`

    const { data: order, error: orderErr } = await admin
      .from('diagnostic_orders')
      .insert({
        organization_id: orgId,
        branch_id: branchId,
        patient_id: patientId,
        order_number: orderNum,
        fulfillment_type: 'home_collection',
        collection_address: '14/2 Park Street, Flat 4B',
        collection_pincode: '700016',
        scheduled_collection_date: new Date().toISOString().split('T')[0],
        scheduled_slot: 'Morning (07:00 - 09:00)',
        status: 'placed',
        subtotal_paise: 120000,
        collection_fee_paise: 0,
        total_paise: 120000,
        payment_status: 'unpaid',
      })
      .select()
      .single()

    assert.equal(orderErr, null)
    assert.ok(order)
    testOrderId = order.id

    // Create a diagnostic test record to satisfy foreign key & check constraint
    const { data: createdTest, error: testCreateErr } = await admin
      .from('diagnostic_tests')
      .insert({
        organization_id: orgId,
        code: `TEST-CBC-${Date.now()}`,
        name: 'Complete Blood Count (CBC)',
        slug: `cbc-test-${Date.now()}`,
        sample_type: 'Blood (EDTA)',
        turnaround_hours: 24,
        home_collection_supported: true,
        is_active: true,
      })
      .select()
      .single()

    assert.equal(testCreateErr, null)
    assert.ok(createdTest)
    testTestId = createdTest.id

    // Insert order items
    const { error: itemsErr } = await admin
      .from('diagnostic_order_items')
      .insert([
        {
          order_id: testOrderId,
          item_type: 'test',
          test_id: testTestId,
          package_id: null,
          item_name: 'Complete Blood Count (CBC)',
          item_code: 'TEST-CBC',
          unit_price_paise: 35000,
          discount_paise: 0,
          final_price_paise: 35000,
          status: 'pending',
        },
      ])

    assert.equal(itemsErr, null)

    // State transition: placed -> phlebotomist_assigned
    const { data: updated1, error: transErr1 } = await admin
      .from('diagnostic_orders')
      .update({ status: 'phlebotomist_assigned' })
      .eq('id', testOrderId)
      .select()
      .single()

    assert.equal(transErr1, null)
    assert.equal(updated1.status, 'phlebotomist_assigned')

    // State transition: phlebotomist_assigned -> sample_collected
    const { data: updated2, error: transErr2 } = await admin
      .from('diagnostic_orders')
      .update({ status: 'sample_collected' })
      .eq('id', testOrderId)
      .select()
      .single()

    assert.equal(transErr2, null)
    assert.equal(updated2.status, 'sample_collected')

    // State transition: sample_collected -> received_at_lab
    const { data: updated3, error: transErr3 } = await admin
      .from('diagnostic_orders')
      .update({ status: 'received_at_lab' })
      .eq('id', testOrderId)
      .select()
      .single()

    assert.equal(transErr3, null)
    assert.equal(updated3.status, 'received_at_lab')
  })

  it('5. Diagnostic Reports: should register report and support pathologist verification', async () => {
    assert.ok(testOrderId, 'Test order must exist')
    const reportNum = `REP-TEST-${Date.now()}`

    const { data: report, error: repErr } = await admin
      .from('diagnostic_reports')
      .insert({
        organization_id: orgId,
        order_id: testOrderId,
        report_number: reportNum,
        status: 'received_from_lab',
        file_name: 'CBC_Report.pdf',
        file_url: 'https://storage.capsiccare.com/reports/sample.pdf',
        clinical_notes: 'Specimen examined. Hemoglobin 14.2 g/dL. All parameters normal.',
      })
      .select()
      .single()

    assert.equal(repErr, null)
    assert.ok(report)

    // Pathologist sign-off
    const { data: verifiedReport, error: verErr } = await admin
      .from('diagnostic_reports')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .eq('id', report.id)
      .select()
      .single()

    assert.equal(verErr, null)
    assert.equal(verifiedReport.status, 'verified')
    assert.ok(verifiedReport.verified_at)
  })

  it('6. Cash Counter Session: should open session, track collections and calculate closing variance', async () => {
    // Find active staff user
    const { data: staffList } = await admin.from('profiles').select('id').eq('is_active', true).limit(1)
    assert.ok(staffList && staffList.length > 0)
    testStaffId = staffList[0].id

    // Clean up any stale open session for this test staff
    await admin
      .from('cash_counter_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('staff_id', testStaffId)
      .eq('status', 'open')

    const openingPaise = 200000 // ₹2,000 opening float

    const { data: session, error: sessErr } = await admin
      .from('cash_counter_sessions')
      .insert({
        organization_id: orgId,
        branch_id: branchId,
        staff_id: testStaffId,
        session_date: new Date().toISOString().split('T')[0],
        opening_balance_paise: openingPaise,
        cash_collected_paise: 0,
        cash_refunded_paise: 0,
        status: 'open',
      })
      .select()
      .single()

    assert.equal(sessErr, null)
    assert.ok(session)
    testSessionId = session.id

    // Simulate cash collection of ₹1,500 (150,000 paise)
    const collectedPaise = 150000
    const { data: updatedSess, error: updateErr } = await admin
      .from('cash_counter_sessions')
      .update({ cash_collected_paise: collectedPaise })
      .eq('id', testSessionId)
      .select()
      .single()

    assert.equal(updateErr, null)
    assert.equal(updatedSess.cash_collected_paise, 150000)

    // Expected closing = 200,000 + 150,000 - 0 = 350,000 (₹3,500)
    const expectedPaise = openingPaise + collectedPaise
    const actualCountedPaise = 350000 // Exact match
    const variancePaise = actualCountedPaise - expectedPaise

    const { data: closedSess, error: closeErr } = await admin
      .from('cash_counter_sessions')
      .update({
        actual_closing_paise: actualCountedPaise,
        variance_paise: variancePaise,
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', testSessionId)
      .select()
      .single()

    assert.equal(closeErr, null)
    assert.equal(closedSess.status, 'closed')
    assert.equal(closedSess.variance_paise, 0, 'Variance should be exact 0 when counted matches expected')
  })

  it('7. Unified Billing & POS: should generate invoice and record partial + final payment', async () => {
    const invNum = `INV-TEST-${Date.now()}`
    const totalPaise = 100000 // ₹1,000

    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .insert({
        organization_id: orgId,
        branch_id: branchId,
        patient_id: patientId,
        invoice_number: invNum,
        subtotal_paise: totalPaise,
        discount_paise: 0,
        tax_paise: 0,
        total_paise: totalPaise,
        paid_paise: 0,
        status: 'issued',
        payment_status: 'unpaid',
      })
      .select()
      .single()

    assert.equal(invErr, null)
    assert.ok(invoice)
    assert.equal(invoice.balance_paise, totalPaise, 'PostgreSQL generated column balance_paise should equal total_paise - paid_paise')
    testInvoiceId = invoice.id

    // Insert line item
    await admin.from('invoice_items').insert({
      invoice_id: testInvoiceId,
      item_type: 'test',
      description: 'Thyroid Profile Total (T3, T4, TSH)',
      quantity: 1,
      unit_price_paise: totalPaise,
      total_paise: totalPaise,
      hsn_sac: '999312',
    })

    // Record Partial Payment 1: ₹600 via UPI
    const payment1Paise = 60000
    const { data: pay1, error: pay1Err } = await admin
      .from('payments')
      .insert({
        receipt_number: `REC-TEST-1-${Date.now()}`,
        organization_id: orgId,
        branch_id: branchId,
        invoice_id: testInvoiceId,
        amount_paise: payment1Paise,
        payment_method: 'upi',
        transaction_reference: 'UPI/38291038102',
      })
      .select()
      .single()

    assert.equal(pay1Err, null)
    assert.ok(pay1)

    // Update invoice balance
    const { data: invPartial } = await admin
      .from('invoices')
      .update({
        paid_paise: payment1Paise,
        payment_status: 'partially_paid',
      })
      .eq('id', testInvoiceId)
      .select()
      .single()

    assert.equal(invPartial.paid_paise, 60000)
    assert.equal(invPartial.balance_paise, 40000) // ₹400 remaining
    assert.equal(invPartial.payment_status, 'partially_paid')

    // Record Final Payment 2: ₹400 via Cash
    const payment2Paise = 40000
    const { data: pay2, error: pay2Err } = await admin
      .from('payments')
      .insert({
        receipt_number: `REC-TEST-2-${Date.now()}`,
        organization_id: orgId,
        branch_id: branchId,
        invoice_id: testInvoiceId,
        amount_paise: payment2Paise,
        payment_method: 'cash',
      })
      .select()
      .single()

    assert.equal(pay2Err, null)
    assert.ok(pay2)

    // Finalize invoice
    const { data: invPaid } = await admin
      .from('invoices')
      .update({
        paid_paise: totalPaise,
        payment_status: 'paid',
        status: 'paid',
      })
      .eq('id', testInvoiceId)
      .select()
      .single()

    assert.equal(invPaid.paid_paise, 100000)
    assert.equal(invPaid.balance_paise, 0)
    assert.equal(invPaid.payment_status, 'paid')
  })

  // Cleanup test artifacts
  it('8. Test Teardown: clean up synthetic integration test entities', async () => {
    if (testInvoiceId) {
      await admin.from('payments').delete().eq('invoice_id', testInvoiceId)
      await admin.from('invoice_items').delete().eq('invoice_id', testInvoiceId)
      await admin.from('invoices').delete().eq('id', testInvoiceId)
    }

    if (testOrderId) {
      await admin.from('diagnostic_reports').delete().eq('order_id', testOrderId)
      await admin.from('diagnostic_order_items').delete().eq('order_id', testOrderId)
      await admin.from('diagnostic_orders').delete().eq('id', testOrderId)
    }

    if (testTestId) {
      await admin.from('diagnostic_tests').delete().eq('id', testTestId)
    }

    if (testSessionId) {
      await admin.from('cash_counter_sessions').delete().eq('id', testSessionId)
    }
  })
})
