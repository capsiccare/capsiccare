import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { searchDiagnosticCatalogue, bookDiagnosticOrder } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || undefined
    const categoryId = searchParams.get('categoryId') || undefined

    const tests = await searchDiagnosticCatalogue(query, categoryId)
    return successResponse(tests, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()

    const order = await bookDiagnosticOrder(context.patient.id, body)
    return successResponse(order, { message: 'Diagnostic order placed successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
