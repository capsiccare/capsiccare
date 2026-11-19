import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { parsePaginationParams, paginateArray } from '@/lib/api/pagination'
import { isSupabaseConfigured } from '@/lib/config/env'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { doctorsData } from '@/data/doctors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const { searchParams } = new URL(req.url)
    const { page, limit, offset } = parsePaginationParams(searchParams)
    const specialtyFilter = searchParams.get('specialty')?.toLowerCase()
    const query = searchParams.get('q')?.toLowerCase()

    // Database querying path when Supabase is configured
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient()
      let dbQuery = supabase
        .from('doctors')
        .select(`
          id, code, name, slug, specialty, designation, qualifications,
          registration_number, experience_years, physical_fee_paise,
          telemedicine_fee_paise, follow_up_fee_paise, image_url, about,
          languages, areas_of_expertise, services_offered, is_active
        `, { count: 'exact' })
        .eq('is_active', true)

      if (specialtyFilter) {
        dbQuery = dbQuery.ilike('specialty', `%${specialtyFilter}%`)
      }

      if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,specialty.ilike.%${query}%`)
      }

      const { data: doctors, count, error } = await dbQuery
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        // Transparent failure: do not silently mask database query errors with static mock data
        throw new ApiError('DATABASE_ERROR', `Failed to query doctors from database: ${error.message}`, 500)
      }

      const doctorList = doctors || []
      const total = count ?? doctorList.length
      const totalPages = Math.ceil(total / limit) || 1

      return successResponse(
        doctorList,
        {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        200,
        requestId
      )
    }

    // Static / Local catalogue fallback path (offline development only)
    let filtered = doctorsData.map((d) => ({
      id: d.id,
      code: `DOC-${d.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
      name: d.name,
      slug: d.id,
      specialty: d.specialty,
      designation: d.designation,
      qualifications: d.qualifications || '',
      registration_number: d.registrationNumber || 'Verified WBMC',
      experience_years: parseInt(d.experience || '5', 10) || 5,
      physical_fee_paise: (d.physicalConsultationFee ?? d.consultationFee ?? 300) * 100,
      telemedicine_fee_paise: (d.telemedicineConsultationFee ?? d.consultationFee ?? 300) * 100,
      follow_up_fee_paise: (d.followUpFee ?? 0) * 100,
      image_url: d.image || null,
      about: d.about || d.description,
      languages: d.languages || ['Bengali', 'English', 'Hindi'],
      areas_of_expertise: d.areasOfExpertise || [],
      services_offered: d.servicesOffered || [],
      is_active: true,
    }))

    if (specialtyFilter) {
      filtered = filtered.filter((d) => d.specialty.toLowerCase().includes(specialtyFilter))
    }

    if (query) {
      filtered = filtered.filter(
        (d) => d.name.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query)
      )
    }

    const paginated = paginateArray(filtered, page, limit)

    return successResponse(paginated.items, paginated.meta, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
