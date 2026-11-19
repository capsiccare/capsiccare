import { describe, it } from 'node:test'
import assert from 'node:assert'

const BASE_URL = 'http://localhost:3000'

describe('HDFC SmartHub VYAPAR & Dual Mode Patient Authentication Flow', () => {
  const testPhone = '9830225334' // Tanuja Begum

  it('1. should send OTP to WhatsApp and Email for patient login', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testPhone }),
    })

    assert.strictEqual(res.status, 200, 'OTP send should succeed with 200')
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(json.data.maskedTarget.includes('5334'), 'Should mask target phone')
    assert.ok(json.data.demoOtp, 'Should return demo/dev OTP')
  })

  it('2. should verify OTP and issue patient session', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testPhone, otp: '123456' }),
    })

    assert.strictEqual(res.status, 200, 'OTP verify should return 200')
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(json.data.patient, 'Should return patient record')
    assert.strictEqual(json.data.redirectUrl, '/patient')
  })

  it('3. should authenticate patient via password/portal PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/password-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testPhone,
        password: '123456',
        portal: 'patient',
      }),
    })

    assert.strictEqual(res.status, 200, 'Password login should return 200')
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.redirectUrl, '/patient')
  })

  it('4. should generate HDFC SmartHub Vyapar payment intent with TID 82308299', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/hdfc/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountPaise: 592900,
        orderNumber: 'ORD-20261119-TEST',
        patientName: 'Tanuja Begum',
      }),
    })

    assert.strictEqual(res.status, 200, 'HDFC collect should return 200')
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.tid, '82308299')
    assert.strictEqual(json.data.merchantName, 'CAPSIC CARE')
    assert.strictEqual(json.data.vpa, 'capsiccare.82308299@hdfcbank')
    assert.ok(json.data.upiIntentUrl.includes('82308299'), 'Intent URL must contain TID/VPA')
  })

  it('5. should verify bank UTR with HDFC SmartHub and create receipt', async () => {
    const testUtr = `HDFC${Date.now().toString().slice(-8)}`
    const res = await fetch(`${BASE_URL}/api/v1/payments/hdfc/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utr: testUtr,
        amountPaise: 592900,
        orderNumber: 'ORD-20261119-TEST',
      }),
    })

    assert.strictEqual(res.status, 200, 'HDFC verify should return 200')
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(json.data.receiptNumber.startsWith('RCP-HDFC-'), 'Should return HDFC receipt')
    assert.strictEqual(json.data.merchantTid, '82308299')
  })

  it('6. should confirm all registration and policy URLs are operational', async () => {
    const urls = [
      `${BASE_URL}/register?role=doctor`,
      `${BASE_URL}/register?role=staff`,
      `${BASE_URL}/register/doctor`,
      `${BASE_URL}/register/staff`,
      `${BASE_URL}/portal/register-doctor`,
      `${BASE_URL}/portal/register-staff`,
      `${BASE_URL}/refund-policy`,
    ]

    for (const url of urls) {
      const res = await fetch(url, { redirect: 'follow' })
      assert.strictEqual(res.status, 200, `URL ${url} should respond with 200 OK`)
    }
  })
})
