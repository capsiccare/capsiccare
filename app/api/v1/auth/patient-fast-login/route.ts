import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { sendOtpToRecipient } from '@/lib/modules/auth/otp-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const identifier = body.phone || body.uhid || body.identifier

    if (!identifier) {
      throw new Error('Phone number or UHID is required.')
    }

    const result = await sendOtpToRecipient(identifier, 'whatsapp')
    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
