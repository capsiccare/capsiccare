import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { sendOtpToRecipient } from '@/lib/modules/auth/otp-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const identifier = body.identifier || body.phone || body.uhid || body.email
    const channel = body.channel || 'auto'

    if (!identifier) {
      throw new Error('Please enter a valid mobile number, UHID, or email address.')
    }

    const result = await sendOtpToRecipient(identifier, channel)
    return successResponse(result, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
