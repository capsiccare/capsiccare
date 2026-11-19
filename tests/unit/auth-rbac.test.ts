import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { hasRole, hasBranchAccess } from '../../lib/modules/auth/auth-service'
import { AuthUser } from '../../lib/modules/auth/types'

describe('Auth & RBAC Unit Tests', () => {
  const superAdminUser: AuthUser = {
    id: 'u-super-1',
    phone: '+919876543200',
    fullName: 'Global Admin',
    email: 'admin@capsic.in',
    organizationId: 'org-1',
    roles: [{ role: 'super_admin', organizationId: 'org-1', branchId: null }],
    mfaEnabled: true,
    isActive: true,
  }

  const branchAdminUser: AuthUser = {
    id: 'u-branch-1',
    phone: '+919876543201',
    fullName: 'Bankra Branch Admin',
    email: 'bankra.admin@capsic.in',
    organizationId: 'org-1',
    roles: [{ role: 'branch_admin', organizationId: 'org-1', branchId: 'branch-bankra' }],
    mfaEnabled: false,
    isActive: true,
  }

  const doctorUser: AuthUser = {
    id: 'u-doc-1',
    phone: '+919876543202',
    fullName: 'Dr. Consultant',
    email: 'doc@capsic.in',
    organizationId: 'org-1',
    roles: [{ role: 'doctor', organizationId: 'org-1', branchId: 'branch-bankra' }],
    mfaEnabled: false,
    isActive: true,
  }

  const inactiveUser: AuthUser = {
    id: 'u-inactive-1',
    phone: '+919876543203',
    fullName: 'Suspended Staff',
    email: 'suspended@capsic.in',
    organizationId: 'org-1',
    roles: [{ role: 'receptionist', organizationId: 'org-1', branchId: null }],
    mfaEnabled: false,
    isActive: false,
  }

  it('super_admin should possess permissions across any role', () => {
    assert.equal(hasRole(superAdminUser, 'super_admin'), true)
    assert.equal(hasRole(superAdminUser, 'branch_admin'), true)
    assert.equal(hasRole(superAdminUser, 'doctor'), true)
    assert.equal(hasRole(superAdminUser, 'receptionist'), true)
  })

  it('super_admin should have access to all branches', () => {
    assert.equal(hasBranchAccess(superAdminUser, 'branch-bankra'), true)
    assert.equal(hasBranchAccess(superAdminUser, 'branch-domjur'), true)
    assert.equal(hasBranchAccess(superAdminUser, 'branch-saltlake'), true)
  })

  it('branch_admin should have access to assigned branch but not other branches', () => {
    assert.equal(hasRole(branchAdminUser, 'branch_admin', 'branch-bankra'), true)
    assert.equal(hasRole(branchAdminUser, 'branch_admin', 'branch-domjur'), false)
    assert.equal(hasBranchAccess(branchAdminUser, 'branch-bankra'), true)
    assert.equal(hasBranchAccess(branchAdminUser, 'branch-domjur'), false)
  })

  it('doctor should have doctor role but not branch_admin role', () => {
    assert.equal(hasRole(doctorUser, 'doctor'), true)
    assert.equal(hasRole(doctorUser, 'branch_admin'), false)
    assert.equal(hasRole(doctorUser, 'super_admin'), false)
  })

  it('inactive user should be denied all role and branch checks', () => {
    assert.equal(hasRole(inactiveUser, 'receptionist'), false)
    assert.equal(hasBranchAccess(inactiveUser, 'branch-bankra'), false)
  })
})
