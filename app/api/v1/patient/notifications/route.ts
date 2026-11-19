import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { getPatientNotifications, markNotificationAsRead } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const notifications = await getPatientNotifications(context.patient.id)
    return successResponse(notifications, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const { notificationId } = body
    if (!notificationId) {
      throw new Error('notificationId is required')
    }

    const updated = await markNotificationAsRead(notificationId)
    return successResponse(updated, { message: 'Notification marked as read' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
