import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { confirmHdfcPayment } from '@/lib/services/hdfc-bank'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const { utr, orderNumber, invoiceNumber, amountPaise, patientId, notes } = body

    if (!utr) {
      throw new Error('Bank UTR / Transaction Reference is required.')
    }

    const result = await confirmHdfcPayment({
      utr,
      orderNumber,
      invoiceNumber,
      amountPaise: Number(amountPaise) || 0,
      patientId,
      notes,
    })

    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
