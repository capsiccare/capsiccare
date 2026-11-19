import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { confirmHdfcPayment } from '@/lib/services/hdfc-bank'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const payload = await req.json()
    // HDFC SmartHub Vyapar webhook payload structure
    const utr = payload.rrn || payload.utr || payload.bank_reference || payload.txn_id
    const amountRupees = payload.amount || payload.txn_amount
    const orderNumber = payload.order_id || payload.merchant_reference
    const amountPaise = amountRupees ? Math.round(Number(amountRupees) * 100) : 0

    if (!utr) {
      throw new Error('Invalid HDFC webhook callback: missing UTR/RRN')
    }

    const result = await confirmHdfcPayment({
      utr,
      orderNumber,
      amountPaise,
      notes: `HDFC Bank SmartHub Webhook: Status=${payload.status || 'SUCCESS'}`,
    })

    return successResponse({
      status: 'SUCCESS',
      message: 'Callback processed successfully',
      result,
    }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
