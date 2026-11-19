import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { HDFC_SMARTHUB_CONFIG, buildHdfcUpiIntentUrl } from '@/lib/services/hdfc-bank'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const { amountPaise, orderNumber, patientName, invoiceNumber } = body

    if (!amountPaise || amountPaise <= 0) {
      throw new Error('Valid payable amount is required.')
    }

    const upiIntent = buildHdfcUpiIntentUrl({
      amountPaise,
      orderNumber: orderNumber || `ORD-${Date.now()}`,
      patientName,
      invoiceNumber,
    })

    return successResponse({
      merchantName: HDFC_SMARTHUB_CONFIG.merchantName,
      tid: HDFC_SMARTHUB_CONFIG.tid,
      vpa: HDFC_SMARTHUB_CONFIG.vpa,
      secondaryVpa: HDFC_SMARTHUB_CONFIG.secondaryVpa,
      qrImageUrl: HDFC_SMARTHUB_CONFIG.qrImageUrl,
      amountRupees: (amountPaise / 100).toFixed(2),
      upiIntentUrl: upiIntent,
      supportedApps: ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'WhatsApp Pay', 'Any UPI App'],
    }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
