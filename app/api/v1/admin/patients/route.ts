import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { parsePaginationParams } from '@/lib/api/pagination'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createPatientSchema = z.object({
  full_name: z.string().min(2, 'Patient full name is required').max(150),
  phone: z.string().min(10, 'Valid 10-digit phone number is required').max(20),
  email: z.string().email().optional().nullable().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']),
  date_of_birth: z.string().optional().nullable(),
  age_years: z.number().int().min(0).max(130).optional().nullable(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  address_line1: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().default('Howrah'),
  district: z.string().default('Howrah'),
  state: z.string().default('West Bengal'),
  pincode: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  primary_branch_id: z.string().uuid('Valid branch selection is required'),
  is_active: z.boolean().default(true),
})

/**
 * Generates an auto-incremented Universal Health ID (UHID):
 * Format: CC-YYYY-XXXXX (e.g. CC-2026-00003)
 */
async function generateNextUhid(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = `CC-${currentYear}-`

  const { data: latestPatients } = await admin
    .from('patients')
    .select('uhid')
    .ilike('uhid', `${prefix}%`)
    .order('uhid', { ascending: false })
    .limit(1)

  let nextSequence = 1
  if (latestPatients && latestPatients.length > 0) {
    const lastUhid = latestPatients[0].uhid
    const parts = lastUhid.split('-')
    const lastNumStr = parts[parts.length - 1]?.replace(/\D/g, '')
    const parsedNum = parseInt(lastNumStr, 10)
    if (!isNaN(parsedNum)) {
      nextSequence = parsedNum + 1
    }
  }

  const paddedSequence = String(nextSequence).padStart(5, '0')
  return `${prefix}${paddedSequence}`
}

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const { page, limit, offset } = parsePaginationParams(searchParams)
    const search = searchParams.get('q')?.trim()
    const branchId = searchParams.get('branchId')?.trim()
    const active = searchParams.get('active')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('patients')
      .select(`
        id, uhid, full_name, phone, email, gender, date_of_birth,
        age_years, blood_group, address_line1, landmark, city,
        district, state, pincode, emergency_contact_name,
        emergency_contact_phone, is_active, created_at, updated_at,
        primary_branch_id,
        branches!patients_primary_branch_id_fkey ( id, name, code, city )
      `, { count: 'exact' })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,uhid.ilike.%${search}%`)
    }

    if (branchId && branchId !== 'all') {
      query = query.eq('primary_branch_id', branchId)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data: rawPatients, count, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query patients: ${error.message}`, 500)
    }

    const items = (rawPatients || []).map((p: any) => ({
      id: p.id,
      uhid: p.uhid,
      fullName: p.full_name,
      phone: p.phone,
      email: p.email || null,
      gender: p.gender,
      dateOfBirth: p.date_of_birth,
      ageYears: p.age_years,
      bloodGroup: p.blood_group,
      addressLine1: p.address_line1,
      landmark: p.landmark,
      city: p.city,
      district: p.district,
      state: p.state,
      pincode: p.pincode,
      emergencyContactName: p.emergency_contact_name,
      emergencyContactPhone: p.emergency_contact_phone,
      isActive: p.is_active,
      primaryBranchId: p.primary_branch_id,
      branchName: p.branches?.name || 'Main Branch',
      branchCode: p.branches?.code || '',
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))

    const total = count || items.length
    const totalPages = Math.ceil(total / limit) || 1

    return successResponse(items, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createPatientSchema.parse(body)

    const admin = createAdminClient()

    // Normalize phone number (keep standard format e.g. +91...)
    let normalizedPhone = parsed.phone.trim()
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.length === 10) {
        normalizedPhone = `+91${normalizedPhone}`
      }
    }

    // Generate Universal Health ID
    const uhid = await generateNextUhid(admin)

    // Calculate age if date of birth provided and age not explicitly given
    let calculatedAge = parsed.age_years
    if (!calculatedAge && parsed.date_of_birth) {
      const birthDate = new Date(parsed.date_of_birth)
      const diffMs = Date.now() - birthDate.getTime()
      calculatedAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))
    }

    // Insert Patient record (Decoupled from auth identity)
    const { data: newPatient, error: insertError } = await admin
      .from('patients')
      .insert({
        organization_id: user.organizationId,
        primary_branch_id: parsed.primary_branch_id,
        uhid,
        full_name: parsed.full_name.trim(),
        phone: normalizedPhone,
        email: parsed.email && parsed.email.trim() ? parsed.email.trim() : null,
        gender: parsed.gender,
        date_of_birth: parsed.date_of_birth || null,
        age_years: calculatedAge ?? null,
        blood_group: parsed.blood_group || null,
        address_line1: parsed.address_line1 || null,
        landmark: parsed.landmark || null,
        city: parsed.city,
        district: parsed.district,
        state: parsed.state,
        pincode: parsed.pincode || null,
        emergency_contact_name: parsed.emergency_contact_name || null,
        emergency_contact_phone: parsed.emergency_contact_phone || null,
        created_by: user.id,
        is_active: parsed.is_active,
      })
      .select()
      .single()

    if (insertError || !newPatient) {
      throw new ApiError('DATABASE_ERROR', `Failed to register patient: ${insertError?.message}`, 500)
    }

    // Add primary contact to patient_contacts
    await admin.from('patient_contacts').insert({
      patient_id: newPatient.id,
      contact_type: 'phone',
      value: normalizedPhone,
      is_primary: true,
      is_verified: true,
      verified_at: new Date().toISOString(),
    })

    // If emergency contact phone exists, store in patient_contacts
    if (parsed.emergency_contact_phone) {
      await admin.from('patient_contacts').insert({
        patient_id: newPatient.id,
        contact_type: 'emergency',
        value: parsed.emergency_contact_phone,
        is_primary: false,
      })
    }

    // Record Audit Event
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'PATIENT_REGISTERED',
      entityType: 'patient',
      entityId: newPatient.id,
      newValues: {
        uhid: newPatient.uhid,
        full_name: newPatient.full_name,
        phone: newPatient.phone,
        primary_branch_id: newPatient.primary_branch_id,
      },
    })

    return successResponse(newPatient, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
