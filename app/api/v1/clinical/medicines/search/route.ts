import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { searchMedicines } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 25
    const route = searchParams.get('route') || undefined

    const results = await searchMedicines(query, { limit, route })
    return successResponse(results, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
