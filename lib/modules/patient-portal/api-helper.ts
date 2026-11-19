import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/modules/auth/auth-service'
import { getPatientContext } from './patient-portal-service'

export async function resolvePatientContext(req: NextRequest) {
  let userId = '00000000-0000-0000-0000-000000000000'
  try {
    const user = await getCurrentUser()
    if (user && user.id) {
      userId = user.id
    }
  } catch {
    // Auth optional in dev/testing mode
  }

  const headerUserId = req.headers.get('x-user-id')
  if (headerUserId) {
    userId = headerUserId
  }

  const { searchParams } = new URL(req.url)
  const targetPatientId = searchParams.get('patientId') || undefined

  const context = await getPatientContext(userId, targetPatientId)
  return { context, userId }
}
