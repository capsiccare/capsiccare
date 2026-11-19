import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'
import {
  successResponse,
  errorResponse,
  handleApiError,
  ApiError,
} from '../../lib/api/response'
import { parsePaginationParams, paginateArray } from '../../lib/api/pagination'

describe('API Envelopes & Response Format Tests', () => {
  it('successResponse should format a standard JSON envelope with requestId and timestamp', async () => {
    const res = successResponse({ testId: 'T1' }, undefined, 200, 'req_custom_123')
    const json = await res.json()

    assert.equal(res.status, 200)
    assert.equal(json.success, true)
    assert.equal(json.data.testId, 'T1')
    assert.equal(json.error, null)
    assert.equal(json.requestId, 'req_custom_123')
    assert.ok(typeof json.timestamp === 'string')
  })

  it('errorResponse should format a standard error envelope', async () => {
    const res = errorResponse('INVALID_PARAM', 'Parameter x is invalid', 400, [{ field: 'x', message: 'required' }], 'req_err_1')
    const json = await res.json()

    assert.equal(res.status, 400)
    assert.equal(json.success, false)
    assert.equal(json.data, null)
    assert.equal(json.error.code, 'INVALID_PARAM')
    assert.equal(json.error.message, 'Parameter x is invalid')
    assert.equal(json.error.details?.[0]?.field, 'x')
    assert.equal(json.requestId, 'req_err_1')
  })

  it('handleApiError should correctly format Zod validation errors', async () => {
    const TestSchema = z.object({
      age: z.number().min(18, 'Age must be 18+'),
      email: z.string().email('Invalid email address'),
    })

    const parseResult = TestSchema.safeParse({ age: 10, email: 'not-an-email' })
    assert.equal(parseResult.success, false)

    if (!parseResult.success) {
      const res = handleApiError(parseResult.error)
      const json = await res.json()

      assert.equal(res.status, 400)
      assert.equal(json.error.code, 'VALIDATION_ERROR')
      assert.equal(json.error.details?.length, 2)
    }
  })

  it('handleApiError should map custom ApiError correctly', async () => {
    const customError = new ApiError('SLOT_TAKEN', 'Selected slot is already booked', 409)
    const res = handleApiError(customError)
    const json = await res.json()

    assert.equal(res.status, 409)
    assert.equal(json.error.code, 'SLOT_TAKEN')
  })

  it('handleApiError should map unauthorized and forbidden errors to 401 and 403', async () => {
    const unauthErr = new Error('UNAUTHORIZED: Please sign in')
    const res1 = handleApiError(unauthErr)
    assert.equal(res1.status, 401)

    const forbidErr = new Error('FORBIDDEN: Admin only')
    const res2 = handleApiError(forbidErr)
    assert.equal(res2.status, 403)
  })

  it('parsePaginationParams should enforce default and max bounds', () => {
    const p1 = parsePaginationParams(new URLSearchParams('page=2&limit=15'))
    assert.equal(p1.page, 2)
    assert.equal(p1.limit, 15)
    assert.equal(p1.offset, 15)

    // Enforce limits
    const p2 = parsePaginationParams(new URLSearchParams('page=-5&limit=500'))
    assert.equal(p2.page, 1)
    assert.equal(p2.limit, 100) // capped at 100
    assert.equal(p2.offset, 0)
  })

  it('paginateArray should slice arrays and provide pagination metadata', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const page1 = paginateArray(items, 1, 3)
    assert.deepEqual(page1.items, [1, 2, 3])
    assert.equal(page1.meta.total, 10)
    assert.equal(page1.meta.totalPages, 4)
    assert.equal(page1.meta.hasNext, true)
    assert.equal(page1.meta.hasPrev, false)

    const page4 = paginateArray(items, 4, 3)
    assert.deepEqual(page4.items, [10])
    assert.equal(page4.meta.hasNext, false)
    assert.equal(page4.meta.hasPrev, true)
  })
})
