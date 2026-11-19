import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // 1. Fetch organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organizationId)
      .single()

    // 2. Fetch branches
    const { data: branches } = await supabase
      .from('branches')
      .select('*')
      .eq('organization_id', user.organizationId)
      .order('is_headquarters', { ascending: false })
      .order('name', { ascending: true })

    // 3. Fetch system roles
    const { data: roles } = await supabase
      .from('roles')
      .select('id, name, description, is_system_role')
      .order('name', { ascending: true })

    // 4. Fetch staff profiles with roles
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`
        id, phone, full_name, email, is_active, created_at,
        user_role_assignments (
          id, branch_id,
          roles ( name ),
          branches ( name )
        )
      `)
      .eq('organization_id', user.organizationId)
      .limit(20)

    const staffList = (profiles || []).map((p: any) => ({
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      email: p.email,
      isActive: p.is_active,
      createdAt: p.created_at,
      roles: (p.user_role_assignments || []).map((ra: any) => ({
        role: ra.roles?.name || 'Staff',
        branchName: ra.branches?.name || 'Global',
      })),
    }))

    const standards = {
      timezone: 'Asia/Kolkata',
      currency: 'INR (₹)',
      monetaryUnit: 'Integer Paise (Zero Floating Point Imprecision)',
      uhidScheme: 'CC-YYYY-XXXXX (Universal Health Identifier)',
      compliance: 'DISHA & Digital Personal Data Protection (DPDP) Act 2023',
    }

    return successResponse({
      organization: organization || {
        id: user.organizationId,
        name: 'Capsic Care Health Network',
        code: 'CAPSIC_CARE_DEV',
        is_active: true,
      },
      branches: branches || [],
      roles: roles || [],
      staff: staffList,
      standards,
    }, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
