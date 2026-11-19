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
  let targetPatientId = searchParams.get('patientId') || undefined

  // Also read patientId from secure session cookie if not explicitly passed in query
  if (!targetPatientId) {
    const sessionCookie = req.cookies.get('capsic_patient_session')?.value
    if (sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'))
        if (decoded.patientId) {
          targetPatientId = decoded.patientId
        }
      } catch {
        // Fallback
      }
    }
  }

  const context = await getPatientContext(userId, targetPatientId)
  return { context, userId }
}
