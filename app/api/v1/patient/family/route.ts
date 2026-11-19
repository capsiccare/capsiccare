import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { resolvePatientContext } from '@/lib/modules/patient-portal/api-helper'
import { listFamilyMembers, addFamilyMember, revokeFamilyMember } from '@/lib/modules/patient-portal/patient-portal-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const members = await listFamilyMembers(context.patient.id)
    return successResponse(members, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const body = await req.json()
    const member = await addFamilyMember(context.patient.id, body)
    return successResponse(member, { message: 'Family member linked successfully' }, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const { context } = await resolvePatientContext(req)
    const { searchParams } = new URL(req.url)
    const dependentPatientId = searchParams.get('dependentPatientId')

    if (!dependentPatientId) {
      throw new Error('dependentPatientId is required')
    }

    const res = await revokeFamilyMember(context.patient.id, dependentPatientId)
    return successResponse(res, { message: 'Family delegation revoked successfully' }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
