import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '@/lib/supabase/admin'

test('Public Doctor Consultation and Diagnostic Checkout Flow', async (t) => {
  const admin = createAdminClient()

  // Generate unique test phone
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000)
  const patientName = 'Automated Verification Patient'

  await t.test('1. Should book a doctor appointment via public API and allocate queue token', async () => {
    // Fetch a doctor from doctors table
    const { data: doc, error: docErr } = await admin.from('doctors').select('id, name').limit(1).single()
    assert.ok(doc && !docErr, 'A doctor should be present in the database')

    const scheduledDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    // Simulate POST /api/v1/appointments/public
    const res = await fetch('http://localhost:3000/api/v1/appointments/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_name: patientName,
        patient_phone: testPhone,
        patient_age: 38,
        patient_gender: 'male',
        doctor_id: doc.id,
        consultation_type: 'physical',
        scheduled_date: scheduledDate,
        slot: 'Early Clinic Slot (Morning 10:00 AM - 12:00 PM)',
        symptoms: 'Follow-up consultation for seasonal health check',
      }),
    })

    const body = await res.json()
    assert.strictEqual(res.status, 201, `Booking should succeed: ${JSON.stringify(body)}`)
    assert.strictEqual(body.success, true)
    assert.ok(body.data.appointment.appointment_number.startsWith('APT-'))
    assert.ok(typeof body.data.appointment.token_number === 'number')
    assert.ok(body.data.patient.uhid.startsWith('CAP-'))

    // Verify database record
    const { data: aptRow } = await admin
      .from('appointments')
      .select('id, appointment_number, token_number, consultation_type, status, booking_source')
      .eq('appointment_number', body.data.appointment.appointment_number)
      .single()

    assert.ok(aptRow)
    assert.strictEqual(aptRow.consultation_type, 'physical')
    assert.strictEqual(aptRow.status, 'confirmed')
    assert.strictEqual(aptRow.booking_source, 'web')
  })

  await t.test('2. Should checkout a diagnostic cart via public API without WhatsApp redirection', async () => {
    // Fetch a test from diagnostic_tests
    const { data: testItem } = await admin.from('diagnostic_tests').select('id, name, code').limit(1).single()
    assert.ok(testItem, 'A diagnostic test should be present')

    // Simulate POST /api/v1/checkout
    const res = await fetch('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: patientName,
        phone: testPhone,
        email: 'test.patient@example.com',
        address: 'Dewan Para Rd, Bankra',
        city: 'Howrah',
        state: 'West Bengal',
        pincode: '711403',
        dateOfBirth: '1986-05-15',
        gender: 'Male',
        notes: 'Please collect blood sample before 9:00 AM',
        fulfillmentType: 'home_collection',
        items: [
          {
            id: testItem.id,
            name: testItem.name,
            code: testItem.code,
            price: 499,
            mrp: 799,
          },
        ],
      }),
    })

    const body = await res.json()
    assert.strictEqual(res.status, 201, `Checkout should succeed: ${JSON.stringify(body)}`)
    assert.strictEqual(body.success, true)
    assert.ok(body.data.order.order_number.startsWith('ORD-'))
    assert.strictEqual(body.data.order.status, 'placed')
    assert.strictEqual(body.data.order.fulfillment_type, 'home_collection')
    assert.strictEqual(body.data.order.total_inr, 499)

    // Verify order in diagnostic_orders
    const { data: orderRow } = await admin
      .from('diagnostic_orders')
      .select('id, order_number, status, total_paise, fulfillment_type')
      .eq('order_number', body.data.order.order_number)
      .single()

    assert.ok(orderRow)
    assert.strictEqual(orderRow.status, 'placed')
    assert.strictEqual(orderRow.total_paise, 49900)

    // Verify diagnostic order line items
    const { data: lineItems } = await admin
      .from('diagnostic_order_items')
      .select('id, item_name, unit_price_paise, final_price_paise, status')
      .eq('order_id', orderRow.id)

    assert.ok(lineItems && lineItems.length >= 1)
    assert.strictEqual(lineItems[0].status, 'pending')
    assert.strictEqual(lineItems[0].final_price_paise, 49900)

    // Verify invoice generated
    const { data: invRow } = await admin
      .from('invoices')
      .select('id, invoice_number, total_paise, status, payment_status')
      .eq('diagnostic_order_id', orderRow.id)
      .single()

    assert.ok(invRow)
    assert.strictEqual(invRow.status, 'issued')
    assert.strictEqual(invRow.payment_status, 'unpaid')
    assert.strictEqual(invRow.total_paise, 49900)

    // Verify communication message queued
    const { data: comms } = await admin
      .from('communication_messages')
      .select('id, channel, recipient, message_body')
      .eq('recipient', testPhone)

    assert.ok(comms && comms.length >= 2, 'Should queue both appointment and order SMS/WhatsApp messages')
  })
})
