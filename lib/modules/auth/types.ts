export type AppRole =
  | 'super_admin'
  | 'org_admin'
  | 'branch_admin'
  | 'receptionist'
  | 'nurse'
  | 'lab_staff'
  | 'phlebotomist'
  | 'billing_staff'
  | 'caller'
  | 'calling_executive'
  | 'field_staff'
  | 'finance'
  | 'auditor'
  | 'doctor'
  | 'careflow_manager'
  | 'patient'

export interface UserRoleAssignment {
  role: AppRole
  organizationId: string
  branchId: string | null
}

export interface AuthUser {
  id: string
  phone: string
  fullName: string
  email: string | null
  gender?: 'male' | 'female' | 'other'
  organizationId: string
  roles: UserRoleAssignment[]
  mfaEnabled: boolean
  isActive: boolean
}

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
}
