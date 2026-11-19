import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const patientRegisterSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(150),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  email: z.string().email().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  date_of_birth: z.string().optional().nullable(),
  age_years: z.coerce.number().min(0).max(130).optional().nullable(),
  blood_group: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  city: z.string().default('Howrah'),
  district: z.string().default('Howrah'),
  state: z.string().default('West Bengal'),
  pincode: z.string().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  preferred_language: z.enum(['en', 'bn', 'hi']).default('en'),
})

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const parsed = patientRegisterSchema.parse(body)
    const admin = createAdminClient()

    // 1. Get primary organization
    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (orgErr || !org) {
      throw new ApiError('INTERNAL_ERROR', 'Organization configuration not found', 500)
    }

    // 2. Resolve branch
    let branchId = parsed.branch_id
    if (!branchId) {
      const { data: defaultBranch } = await admin
        .from('branches')
        .select('id')
        .limit(1)
        .single()
      branchId = defaultBranch?.id
    }

    if (!branchId) {
      throw new ApiError('INTERNAL_ERROR', 'No active branch found', 500)
    }

    // 3. Check if patient already exists by phone
    const { data: existingPatient } = await admin
      .from('patients')
      .select('id, uhid, full_name, phone')
      .eq('phone', parsed.phone.trim())
      .maybeSingle()

    let patientRecord: any
    let isExisting = false

    if (existingPatient) {
      patientRecord = existingPatient
      isExisting = true
    } else {
      // Generate unique UHID: CAP-YYYY-XXXXXX
      const year = new Date().getFullYear()
      const randNum = Math.floor(100000 + Math.random() * 900000)
      const uhid = `CAP-${year}-${randNum}`

      const { data: newPat, error: patErr } = await admin
        .from('patients')
        .insert({
          organization_id: org.id,
          uhid,
          full_name: parsed.full_name.trim(),
          phone: parsed.phone.trim(),
          email: parsed.email?.toLowerCase().trim() || null,
          gender: parsed.gender,
          date_of_birth: parsed.date_of_birth || null,
          age_years: parsed.age_years || (parsed.date_of_birth ? new Date().getFullYear() - new Date(parsed.date_of_birth).getFullYear() : null),
          blood_group: parsed.blood_group || null,
          address_line1: parsed.address_line1?.trim() || null,
          city: parsed.city,
          district: parsed.district,
          state: parsed.state,
          pincode: parsed.pincode?.trim() || null,
          primary_branch_id: branchId,
          is_active: true,
        })
        .select()
        .single()

      if (patErr || !newPat) {
        throw new ApiError('DATABASE_ERROR', `Failed to create patient profile: ${patErr?.message}`, 500)
      }

      patientRecord = newPat
    }

    // 4. Ensure Patient Portal Link exists
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex')

    await admin.from('patient_portal_links').upsert({
      patient_id: patientRecord.id,
      phone: parsed.phone.trim(),
      portal_access_pin_hash: pinHash,
      is_active: true,
      primary_language: parsed.preferred_language,
      last_login_at: new Date().toISOString(),
    }, { onConflict: 'patient_id' })

    // 5. Audit log
    await recordAuditEvent({
      userId: patientRecord.id,
      organizationId: org.id,
      action: isExisting ? 'PATIENT_PORTAL_LINKED' : 'PATIENT_SELF_REGISTERED',
      entityType: 'patients',
      entityId: patientRecord.id,
      newValues: {
        uhid: patientRecord.uhid,
        phone: patientRecord.phone,
        fullName: patientRecord.full_name,
      },
    })

    return successResponse(
      {
        patient: {
          id: patientRecord.id,
          uhid: patientRecord.uhid,
          fullName: patientRecord.full_name,
          phone: patientRecord.phone,
        },
        redirectUrl: `/patient?patientId=${patientRecord.id}&uhid=${patientRecord.uhid}`,
        isExisting,
        message: isExisting
          ? 'Existing health records linked to your mobile number. Welcome back!'
          : 'Registration successful! Your Unique Health ID (UHID) has been generated.',
      },
      undefined,
      201,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
