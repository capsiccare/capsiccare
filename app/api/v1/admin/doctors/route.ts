import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { parsePaginationParams } from '@/lib/api/pagination'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createDoctorSchema = z.object({
  code: z.string().min(2, 'Doctor code is required').max(50),
  name: z.string().min(2, 'Doctor name is required').max(150),
  slug: z.string().optional(),
  specialty: z.string().min(2, 'Specialty is required').max(150),
  designation: z.string().min(2, 'Designation is required').max(150),
  qualifications: z.string().min(2, 'Qualifications are required'),
  registration_number: z.string().min(2, 'Medical registration number is required').max(100),
  experience_years: z.number().int().min(0).default(0),
  physical_fee_paise: z.number().int().min(0, 'Physical consultation fee must be non-negative'),
  telemedicine_fee_paise: z.number().int().min(0).default(0),
  follow_up_fee_paise: z.number().int().min(0).default(0),
  branch_ids: z.array(z.string().uuid()).optional().default([]),
  languages: z.array(z.string()).optional().default(['Bengali', 'English', 'Hindi']),
  areas_of_expertise: z.array(z.string()).optional().default([]),
  about: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const { page, limit, offset } = parsePaginationParams(searchParams)
    const search = searchParams.get('q')?.trim()
    const specialty = searchParams.get('specialty')?.trim()
    const branchId = searchParams.get('branchId')?.trim()
    const active = searchParams.get('active')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('doctors')
      .select(`
        id, code, name, slug, specialty, designation, qualifications,
        registration_number, experience_years, physical_fee_paise,
        telemedicine_fee_paise, follow_up_fee_paise, languages,
        areas_of_expertise, is_active, created_at, updated_at,
        doctor_branches (
          branch_id, is_primary,
          branches ( id, name, code )
        )
      `, { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,specialty.ilike.%${search}%,registration_number.ilike.%${search}%`)
    }

    if (specialty && specialty !== 'all') {
      query = query.eq('specialty', specialty)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    query = query.order('name', { ascending: true }).range(offset, offset + limit - 1)

    const { data: rawDoctors, count, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query doctors: ${error.message}`, 500)
    }

    let doctors = rawDoctors || []

    // If branch filter specified, filter in memory if branch relation is present
    if (branchId && branchId !== 'all') {
      doctors = doctors.filter((doc: any) =>
        doc.doctor_branches?.some((db: any) => db.branch_id === branchId)
      )
    }

    // Transform into clean response structure
    const items = doctors.map((doc: any) => ({
      id: doc.id,
      code: doc.code,
      name: doc.name,
      slug: doc.slug,
      specialty: doc.specialty,
      designation: doc.designation,
      qualifications: doc.qualifications,
      registrationNumber: doc.registration_number,
      experienceYears: doc.experience_years,
      physicalFeePaise: doc.physical_fee_paise,
      physicalFeeInr: Math.round(doc.physical_fee_paise / 100),
      telemedicineFeePaise: doc.telemedicine_fee_paise,
      telemedicineFeeInr: Math.round(doc.telemedicine_fee_paise / 100),
      followUpFeePaise: doc.follow_up_fee_paise,
      followUpFeeInr: Math.round(doc.follow_up_fee_paise / 100),
      languages: doc.languages || [],
      areasOfExpertise: doc.areas_of_expertise || [],
      isActive: doc.is_active,
      branches: (doc.doctor_branches || []).map((db: any) => ({
        id: db.branches?.id || db.branch_id,
        name: db.branches?.name || 'Unknown Branch',
        code: db.branches?.code || '',
        isPrimary: db.is_primary,
      })),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
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
    const parsed = createDoctorSchema.parse(body)

    const admin = createAdminClient()

    // 1. Check if doctor code already exists
    const { data: existingCode } = await admin
      .from('doctors')
      .select('id')
      .eq('code', parsed.code)
      .maybeSingle()

    if (existingCode) {
      throw new ApiError('CONFLICT', `A doctor with code '${parsed.code}' already exists`, 409)
    }

    // Generate unique slug
    let slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name)
    const { data: existingSlug } = await admin
      .from('doctors')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    // 2. Insert Doctor Record
    const { data: newDoctor, error: insertError } = await admin
      .from('doctors')
      .insert({
        organization_id: user.organizationId,
        code: parsed.code,
        name: parsed.name,
        slug,
        specialty: parsed.specialty,
        designation: parsed.designation,
        qualifications: parsed.qualifications,
        registration_number: parsed.registration_number,
        experience_years: parsed.experience_years,
        physical_fee_paise: parsed.physical_fee_paise,
        telemedicine_fee_paise: parsed.telemedicine_fee_paise,
        follow_up_fee_paise: parsed.follow_up_fee_paise,
        languages: parsed.languages,
        areas_of_expertise: parsed.areas_of_expertise,
        about: parsed.about || null,
        is_active: parsed.is_active,
      })
      .select()
      .single()

    if (insertError || !newDoctor) {
      throw new ApiError('DATABASE_ERROR', `Failed to create doctor: ${insertError?.message}`, 500)
    }

    // 3. Link Branch Affiliations
    if (parsed.branch_ids && parsed.branch_ids.length > 0) {
      const branchLinks = parsed.branch_ids.map((branchId, index) => ({
        doctor_id: newDoctor.id,
        branch_id: branchId,
        is_primary: index === 0,
      }))

      const { error: branchError } = await admin
        .from('doctor_branches')
        .insert(branchLinks)

      if (branchError) {
        console.error('Warning: Failed to link doctor branches:', branchError.message)
      }
    }

    // 4. Record Audit Event
    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DOCTOR_CREATED',
      entityType: 'doctor',
      entityId: newDoctor.id,
      newValues: {
        code: newDoctor.code,
        name: newDoctor.name,
        specialty: newDoctor.specialty,
        physical_fee_paise: newDoctor.physical_fee_paise,
        branch_ids: parsed.branch_ids,
      },
    })

    return successResponse(newDoctor, undefined, 201, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
