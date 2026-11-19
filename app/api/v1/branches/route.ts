import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { isSupabaseConfigured } from '@/lib/config/env'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAnyRole } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const defaultBranches = [
  {
    id: '22222222-2222-4222-a222-222222222222',
    code: 'HOWRAH_BANKRA_HQ',
    name: 'Capsic Care Diagnostic & Clinic (Bankra Hub)',
    address: 'Bankra Bazar, Dewan Para Road, Domjur',
    city: 'Howrah',
    district: 'Howrah',
    state: 'West Bengal',
    pincode: '711403',
    phone: '+918910260709',
    email: 'support@capsic.in',
    timezone: 'Asia/Kolkata',
    isHeadquarters: true,
    isActive: true,
  },
]

const createBranchSchema = z.object({
  code: z.string().min(2, 'Code required (e.g. BARASAT_HUB)').transform(s => s.toUpperCase().trim()),
  name: z.string().min(2, 'Branch name required'),
  address: z.string().min(3, 'Address required'),
  city: z.string().min(2, 'City required').default('Howrah'),
  district: z.string().min(2, 'District required').default('Howrah'),
  state: z.string().min(2, 'State required').default('West Bengal'),
  pincode: z.string().min(6, '6-digit pincode required'),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email().optional().nullable(),
  timezone: z.string().default('Asia/Kolkata'),
  is_headquarters: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

const updateBranchSchema = z.object({
  id: z.string().uuid('Valid branch ID required'),
  code: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  is_headquarters: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    if (!isSupabaseConfigured()) {
      return successResponse(defaultBranches, { total: defaultBranches.length }, 200, requestId)
    }

    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === 'true'

    const supabase = await createServerSupabaseClient()
    let query = supabase
      .from('branches')
      .select('id, code, name, address, city, district, state, pincode, phone, email, timezone, is_headquarters, is_active')
      .order('is_headquarters', { ascending: false })

    if (!showAll) {
      query = query.eq('is_active', true)
    }

    const { data: dbBranches, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query branches from database: ${error.message}`, 500)
    }

    const formatted = (dbBranches || []).map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      address: b.address,
      city: b.city,
      district: b.district,
      state: b.state,
      pincode: b.pincode,
      phone: b.phone,
      email: b.email,
      timezone: b.timezone,
      isHeadquarters: Boolean(b.is_headquarters),
      isActive: Boolean(b.is_active),
    }))

    return successResponse(formatted, { total: formatted.length }, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAnyRole(['super_admin', 'org_admin'])
    const body = await req.json()
    const validated = createBranchSchema.parse(body)

    const admin = createAdminClient()
    const { data: org } = await admin.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error('No organization found')

    const { data: created, error } = await admin
      .from('branches')
      .insert({
        organization_id: org.id,
        code: validated.code,
        name: validated.name,
        address: validated.address,
        city: validated.city,
        district: validated.district,
        state: validated.state,
        pincode: validated.pincode,
        phone: validated.phone,
        email: validated.email || null,
        timezone: validated.timezone,
        is_headquarters: validated.is_headquarters,
        is_active: validated.is_active,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create branch: ${error.message}`)
    }

    await recordAuditEvent({
      userId: caller.id,
      organizationId: caller.organizationId,
      action: 'CREATE_BRANCH',
      entityType: 'branches',
      entityId: created.id,
      newValues: { name: created.name, code: created.code },
    })

    return successResponse(created, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAnyRole(['super_admin', 'org_admin'])
    const body = await req.json()
    const validated = updateBranchSchema.parse(body)

    const admin = createAdminClient()
    const patchData: Record<string, any> = {}
    if (validated.code) patchData.code = validated.code.toUpperCase().trim()
    if (validated.name) patchData.name = validated.name
    if (validated.address) patchData.address = validated.address
    if (validated.city) patchData.city = validated.city
    if (validated.district) patchData.district = validated.district
    if (validated.state) patchData.state = validated.state
    if (validated.pincode) patchData.pincode = validated.pincode
    if (validated.phone) patchData.phone = validated.phone
    if (validated.email !== undefined) patchData.email = validated.email
    if (validated.is_headquarters !== undefined) patchData.is_headquarters = validated.is_headquarters
    if (validated.is_active !== undefined) patchData.is_active = validated.is_active

    const { data: updated, error } = await admin
      .from('branches')
      .update(patchData)
      .eq('id', validated.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update branch: ${error.message}`)

    await recordAuditEvent({
      userId: caller.id,
      organizationId: caller.organizationId,
      action: 'UPDATE_BRANCH',
      entityType: 'branches',
      entityId: validated.id,
      newValues: patchData,
    })

    return successResponse(updated, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
