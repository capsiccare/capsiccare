import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { listMedicines, createMedicine } from '@/lib/modules/clinical/clinical-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 25
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined

    const list = await listMedicines({ page, limit, search, category })
    return successResponse(list, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const body = await req.json()
    const medicine = await createMedicine(body)
    return successResponse(medicine, { message: 'Medicine registered in formulary' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
