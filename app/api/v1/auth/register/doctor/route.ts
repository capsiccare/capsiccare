import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const doctorRegisterSchema = z.object({
  name: z.string().min(2, 'Doctor name is required').max(150),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  registration_number: z.string().min(3, 'Medical Council Registration Number is required'),
  specialty: z.string().min(2, 'Medical specialty is required'),
  qualifications: z.string().min(2, 'Qualifications (e.g. MBBS, MD) are required'),
  experience_years: z.coerce.number().min(0).default(3),
  consultation_fee: z.coerce.number().min(0).default(500), // In INR
  telemedicine_fee: z.coerce.number().min(0).default(400), // In INR
  branch_id: z.string().uuid().optional().nullable(),
  languages: z.array(z.string()).optional().default(['Bengali', 'English', 'Hindi']),
  about: z.string().optional().nullable(),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const body = await req.json()
    const parsed = doctorRegisterSchema.parse(body)
    const admin = createAdminClient()

    // 1. Get primary organization
    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (orgErr || !org) {
      throw new ApiError('INTERNAL_ERROR', 'Organization configuration not found in database', 500)
    }

    // 2. Check if registration number already registered
    const { data: existingReg } = await admin
      .from('doctors')
      .select('id, name')
      .eq('registration_number', parsed.registration_number.trim())
      .maybeSingle()

    if (existingReg) {
      throw new ApiError(
        'CONFLICT',
        `A doctor with Medical Council Registration Number '${parsed.registration_number}' is already registered (${existingReg.name}).`,
        409
      )
    }

    // 3. Create or find Auth User
    let userId: string
    const { data: existingUser } = await admin
      .from('profiles')
      .select('id')
      .or(`email.eq.${parsed.email.toLowerCase().trim()},phone.eq.${parsed.phone.trim()}`)
      .maybeSingle()

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: parsed.email.toLowerCase().trim(),
        password: parsed.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.name.trim(),
          phone: parsed.phone.trim(),
          role: 'doctor',
        },
      })

      if (authError || !authData.user) {
        throw new ApiError('AUTH_ERROR', `Failed to create authentication user: ${authError?.message}`, 400)
      }
      userId = authData.user.id
    }

    // 4. Upsert Profile
    await admin.from('profiles').upsert({
      id: userId,
      organization_id: org.id,
      full_name: parsed.name.trim(),
      email: parsed.email.toLowerCase().trim(),
      phone: parsed.phone.trim(),
      is_active: true,
    })

    // 5. Assign 'doctor' role
    const { data: doctorRole } = await admin
      .from('roles')
      .select('id')
      .eq('name', 'doctor')
      .single()

    if (doctorRole) {
      const { data: existingRole } = await admin
        .from('user_role_assignments')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', doctorRole.id)
        .maybeSingle()

      if (!existingRole) {
        await admin.from('user_role_assignments').insert({
          user_id: userId,
          role_id: doctorRole.id,
          organization_id: org.id,
          branch_id: parsed.branch_id || null,
        })
      }
    }

    // 6. Generate unique code and slug
    const cleanReg = parsed.registration_number.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const code = `DOC-${cleanReg.slice(-6) || Math.floor(100000 + Math.random() * 900000)}`
    let slug = slugify(parsed.name)
    const { data: existingSlug } = await admin
      .from('doctors')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    // 7. Insert Doctor Record
    const physicalFeePaise = Math.round(parsed.consultation_fee * 100)
    const teleFeePaise = Math.round(parsed.telemedicine_fee * 100)

    const { data: newDoctor, error: docError } = await admin
      .from('doctors')
      .insert({
        organization_id: org.id,
        profile_id: userId,
        code,
        name: parsed.name.trim(),
        slug,
        specialty: parsed.specialty.trim(),
        designation: `Consultant ${parsed.specialty.trim()}`,
        qualifications: parsed.qualifications.trim(),
        registration_number: parsed.registration_number.trim(),
        experience_years: parsed.experience_years,
        physical_fee_paise: physicalFeePaise,
        telemedicine_fee_paise: teleFeePaise,
        follow_up_fee_paise: Math.round(physicalFeePaise * 0.6),
        languages: parsed.languages,
        areas_of_expertise: [parsed.specialty.trim()],
        about: parsed.about || `Consultant ${parsed.specialty.trim()} with ${parsed.experience_years} years of clinical practice.`,
        is_active: true,
      })
      .select()
      .single()

    if (docError || !newDoctor) {
      throw new ApiError('DATABASE_ERROR', `Failed to create doctor record: ${docError?.message}`, 500)
    }

    // 8. Link branch if supplied
    if (parsed.branch_id) {
      await admin.from('doctor_branches').upsert({
        doctor_id: newDoctor.id,
        branch_id: parsed.branch_id,
        is_primary: true,
      }, { onConflict: 'doctor_id,branch_id' })
    }

    // 9. Audit log
    await recordAuditEvent({
      userId,
      organizationId: org.id,
      action: 'DOCTOR_SELF_REGISTERED',
      entityType: 'doctors',
      entityId: newDoctor.id,
      newValues: {
        name: newDoctor.name,
        code: newDoctor.code,
        specialty: newDoctor.specialty,
        registration_number: newDoctor.registration_number,
      },
    })

    return successResponse(
      {
        doctor: newDoctor,
        redirectUrl: '/doctor',
        message: 'Doctor chamber profile created successfully. You can now sign in.',
      },
      undefined,
      201,
      requestId
    )
  } catch (error) {
    return handleApiError(error, req)
  }
}
