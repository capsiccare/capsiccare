import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { isSupabaseConfigured } from '@/lib/config/env'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Default fallback branch data for offline development only
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

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    // In offline development without Supabase credentials, return local fixture
    if (!isSupabaseConfigured()) {
      return successResponse(defaultBranches, { total: defaultBranches.length }, 200, requestId)
    }

    const supabase = await createServerSupabaseClient()
    const { data: dbBranches, error } = await supabase
      .from('branches')
      .select('id, code, name, address, city, district, state, pincode, phone, email, timezone, is_headquarters, is_active')
      .eq('is_active', true)
      .order('is_headquarters', { ascending: false })

    if (error) {
      // Do not silently mask database query failures when Supabase is configured
      throw new ApiError('DATABASE_ERROR', `Failed to query branches from database: ${error.message}`, 500)
    }

    const branchesToReturn = dbBranches || []
    const formatted = branchesToReturn.map((b) => ({
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
