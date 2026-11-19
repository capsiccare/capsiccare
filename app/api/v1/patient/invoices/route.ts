import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { listPatientInvoices, initiatePatientPayment } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const invoices = await listPatientInvoices(context.patient.id)
    return successResponse(invoices, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const { invoiceId, amount, paymentMethod } = body

    if (!invoiceId || !amount) {
      throw new Error('invoiceId and amount are required')
    }

    const receipt = await initiatePatientPayment(context.patient.id, invoiceId, amount, paymentMethod || 'upi')
    return successResponse(receipt, { message: 'Payment recorded successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
