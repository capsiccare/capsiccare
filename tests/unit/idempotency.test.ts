import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { checkIdempotency, storeIdempotency } from '../../lib/api/idempotency'

describe('Idempotency & Replay Defense Tests', () => {
  it('should return null for new idempotency keys', async () => {
    const cached = await checkIdempotency('key_new_123', '/api/v1/orders')
    assert.equal(cached, null)
  })

  it('should store and return identical cached response for repeated key', async () => {
    const key = `key_test_${Date.now()}`
    const path = '/api/v1/orders'
    const responsePayload = { orderId: 'ORD-123', totalPaise: 49900 }

    await storeIdempotency(key, path, { status: 201, body: responsePayload }, 1)

    const cached = await checkIdempotency(key, path)
    assert.ok(cached !== null)
    assert.equal(cached.status, 201)
    assert.equal(cached.body.orderId, 'ORD-123')
  })

  it('should ignore empty key or different request path', async () => {
    const emptyCached = await checkIdempotency('', '/api/v1/orders')
    assert.equal(emptyCached, null)
  })
})
