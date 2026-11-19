import { NextRequest, NextResponse } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { verifyOtpCode } from '@/lib/modules/auth/otp-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const identifier = body.identifier || body.phone || body.uhid || body.email
    const otp = body.otp || body.code

    if (!identifier || !otp) {
      throw new Error('Identifier and OTP code are both required.')
    }

    const result = await verifyOtpCode(identifier, otp)

    // Build JSON response
    const res = NextResponse.json({
      success: true,
      data: {
        patient: result.patient,
        token: result.token,
        message: result.message,
        redirectUrl: '/patient',
      },
      error: null,
      requestId,
      timestamp: new Date().toISOString(),
    }, { status: 200 })

    // Set secure patient session cookie
    if (result.patient) {
      const sessionPayload = JSON.stringify({
        patientId: result.patient.id,
        uhid: result.patient.uhid,
        phone: result.patient.phone,
        fullName: result.patient.full_name,
        role: 'patient',
        loginTime: Date.now(),
      })

      res.cookies.set('capsic_patient_session', Buffer.from(sessionPayload).toString('base64'), {
        path: '/',
        httpOnly: false, // Allow client reading for state hydration
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    }

    return res
  } catch (error) {
    return handleApiError(error, req)
  }
}
