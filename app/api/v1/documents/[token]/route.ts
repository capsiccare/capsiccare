import { NextRequest, NextResponse } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, errorResponse } from '@/lib/api/response'
import { accessDocumentByToken } from '@/lib/modules/documents/document-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const { token } = await params
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || 'Unknown'

    const result = await accessDocumentByToken(token, {
      accessChannel: 'expiring_link',
      ipAddress,
      userAgent,
    })

    if (!result.valid || !result.document) {
      return errorResponse(
        'LINK_EXPIRED_OR_INVALID',
        result.error || 'Invalid or expired document link',
        403,
        undefined,
        requestId
      )
    }

    return successResponse(result.document, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
