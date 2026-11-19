import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/config/env'
import { AuthUser, AppRole, UserRoleAssignment } from './types'

/**
 * Retrieves the current authenticated user and their active role assignments.
 * Returns null if the user is unauthenticated or unconfigured.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch user profile and assigned roles from the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, organization_id, phone, full_name, email, gender, mfa_enabled, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    return null
  }

  const { data: roleRows } = await supabase
    .from('user_role_assignments')
    .select(`
      organization_id,
      branch_id,
      roles ( name )
    `)
    .eq('user_id', user.id)

  const roles: UserRoleAssignment[] = (roleRows || []).map((row: any) => ({
    role: row.roles?.name as AppRole,
    organizationId: row.organization_id,
    branchId: row.branch_id,
  }))

  return {
    id: profile.id,
    phone: profile.phone,
    fullName: profile.full_name,
    email: profile.email ?? user.email ?? null,
    gender: profile.gender,
    organizationId: profile.organization_id,
    roles,
    mfaEnabled: Boolean(profile.mfa_enabled),
    isActive: Boolean(profile.is_active),
  }
}

/**
 * Checks if a user holds a specific role globally or within a specific branch.
 */
export function hasRole(user: AuthUser, requiredRole: AppRole, branchId?: string): boolean {
  if (!user.isActive) return false

  // Super admin possesses platform-wide privileges
  const isSuperAdmin = user.roles.some((r) => r.role === 'super_admin' || r.role === 'org_admin')
  if (isSuperAdmin) return true

  return user.roles.some((r) => {
    if (r.role !== requiredRole) return false
    // If the role is organization-wide (branchId is null), it grants access across all branches
    if (!r.branchId) return true
    // If branchId is specified, check for exact match
    if (branchId) return r.branchId === branchId
    return true
  })
}

/**
 * Checks if a user holds any of the specified roles.
 */
export function hasAnyRole(user: AuthUser, allowedRoles: AppRole[], branchId?: string): boolean {
  if (!user.isActive) return false
  const isSuperAdmin = user.roles.some((r) => r.role === 'super_admin' || r.role === 'org_admin')
  if (isSuperAdmin) return true

  return allowedRoles.some((role) => hasRole(user, role, branchId))
}

/**
 * Asserts the caller has any of the required roles.
 */
export async function requireAnyRole(allowedRoles: AppRole[], branchId?: string): Promise<AuthUser> {
  const user = await requireAuth()
  if (!hasAnyRole(user, allowedRoles, branchId)) {
    throw new Error(`FORBIDDEN: Requires one of roles: [${allowedRoles.join(', ')}]`)
  }
  return user
}

/**
 * Checks if a user has access to a specific branch.
 */
export function hasBranchAccess(user: AuthUser, branchId: string): boolean {
  if (!user.isActive) return false

  const isSuperAdmin = user.roles.some((r) => r.role === 'super_admin')
  if (isSuperAdmin) return true

  return user.roles.some((r) => !r.branchId || r.branchId === branchId)
}

/**
 * Asserts the caller is authenticated. Throws an error otherwise.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required')
  }
  return user
}

/**
 * Asserts the caller has a required role. Throws an error otherwise.
 */
export async function requireRole(requiredRole: AppRole, branchId?: string): Promise<AuthUser> {
  const user = await requireAuth()
  if (!hasRole(user, requiredRole, branchId)) {
    throw new Error(`FORBIDDEN: Requires role '${requiredRole}'`)
  }
  return user
}

/**
 * Safe bootstrap procedure for the initial Super Administrator.
 * Can only be executed once when NO super_admin exists in the system.
 */
export async function bootstrapFirstAdmin(params: {
  email: string
  password: string
  fullName: string
  phone: string
  organizationName?: string
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Provide development credentials in .env.local first.')
  }

  const adminClient = createAdminClient()

  // 1. Verify if any super_admin already exists
  const { data: existingAdmins } = await adminClient
    .from('user_role_assignments')
    .select('id, roles!inner(name)')
    .eq('roles.name', 'super_admin')
    .limit(1)

  if (existingAdmins && existingAdmins.length > 0) {
    throw new Error('BOOTSTRAP_LOCKED: A Super Administrator already exists. Self-bootstrap is permanently closed.')
  }

  // 2. Fetch or create the primary organization
  let orgId: string
  const { data: existingOrg } = await adminClient
    .from('organizations')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existingOrg) {
    orgId = existingOrg.id
  } else {
    const { data: newOrg, error: orgError } = await adminClient
      .from('organizations')
      .insert({
        name: params.organizationName || 'Capsic Care Health Network',
        code: 'CAPSIC_CARE',
        is_active: true,
      })
      .select('id')
      .single()

    if (orgError || !newOrg) {
      throw new Error(`Failed to create primary organization: ${orgError?.message}`)
    }
    orgId = newOrg.id
  }

  // 3. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: params.email,
    password: params.password,
    phone: params.phone,
    email_confirm: true,
    user_metadata: { full_name: params.fullName },
  })

  if (authError || !authUser.user) {
    throw new Error(`Failed to create Auth user: ${authError?.message}`)
  }

  // 4. Create Profile
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authUser.user.id,
    organization_id: orgId,
    phone: params.phone,
    full_name: params.fullName,
    email: params.email,
    is_active: true,
  })

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  // 5. Fetch super_admin role ID
  const { data: roleData, error: roleError } = await adminClient
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single()

  if (roleError || !roleData) {
    throw new Error('super_admin role not found in database. Run database migrations first.')
  }

  // 6. Assign super_admin role
  const { error: assignError } = await adminClient.from('user_role_assignments').insert({
    user_id: authUser.user.id,
    role_id: roleData.id,
    organization_id: orgId,
  })

  if (assignError) {
    throw new Error(`Failed to assign super_admin role: ${assignError.message}`)
  }

  return {
    success: true,
    userId: authUser.user.id,
    email: params.email,
    organizationId: orgId,
  }
}
