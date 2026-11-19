import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { GET as getHealth } from '../../app/api/v1/health/route'
import { GET as getBranches } from '../../app/api/v1/branches/route'
import { GET as getDoctors } from '../../app/api/v1/doctors/route'
import { GET as getMe } from '../../app/api/v1/me/route'

describe('Versioned API Foundation Integration Tests (/api/v1)', () => {
  it('GET /api/v1/health should return 200 with system health and environment', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/health')
    const res = await getHealth(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.equal(json.data.status, 'healthy')
    assert.ok(json.data.version)
    assert.ok(json.requestId)
    assert.ok(json.timestamp)
  })

  it('GET /api/v1/branches should return 200 with active branches', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/branches')
    const res = await getBranches(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.ok(Array.isArray(json.data))
    assert.ok(json.data.length > 0)
    assert.equal(json.data[0].code, 'HOWRAH_BANKRA_HQ')
  })

  it('GET /api/v1/doctors should return 200 with paginated doctor list and integer paise fees', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/doctors?page=1&limit=5')
    const res = await getDoctors(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.ok(Array.isArray(json.data))
    assert.ok(json.data.length <= 5)
    assert.ok(json.data.length > 0)
    assert.ok(json.data[0].physical_fee_paise >= 0)
    assert.ok(json.meta.total > 0)
    assert.equal(json.meta.page, 1)
    assert.equal(json.meta.limit, 5)
  })

  it('GET /api/v1/doctors?specialty=pediatrics should filter by specialty', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/doctors?specialty=pediatrics')
    const res = await getDoctors(req)
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.ok(json.data.every((doc: any) => doc.specialty.toLowerCase().includes('pediatric')))
  })

  it('GET /api/v1/me should return 401 UNAUTHORIZED when no auth session cookie is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/me')
    const res = await getMe(req)
    const json = await res.json()

    assert.equal(res.status, 401)
    assert.equal(json.success, false)
    assert.equal(json.error.code, 'UNAUTHORIZED')
    assert.equal(json.data, null)
  })
})
