-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 001: FOUNDATION CORE
-- ==============================================================================
-- Scope: Organizations, Branches, Profiles, Roles, and Role Assignments
-- Architecture: Multi-tenant, branch-scoped RBAC, integer paise monetary values
-- ==============================================================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

-- 2. Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Howrah',
  district VARCHAR(100) NOT NULL DEFAULT 'Howrah',
  state VARCHAR(100) NOT NULL DEFAULT 'West Bengal',
  pincode VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  is_headquarters BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_org ON branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_district ON branches(district);

-- 3. Profiles (Tied to Supabase Auth user identity)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  phone VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  mfa_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- 4. Roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed predefined system roles
INSERT INTO roles (name, description, is_system_role)
VALUES 
  ('super_admin', 'Global platform administrator with full multi-organization privileges', true),
  ('branch_admin', 'Branch administrator responsible for branch operations and personnel', true),
  ('receptionist', 'Front-desk staff for in-person bookings, patient intake, and payments', true),
  ('nurse', 'Clinical nursing staff for triage, sample collection, and vital signs', true),
  ('lab_staff', 'Laboratory technician responsible for diagnostic specimen processing and reports', true),
  ('caller', 'Customer care and CareFlow tele-caller for patient follow-up', true),
  ('field_staff', 'Phlebotomists and field agents conducting home sample collection', true),
  ('finance', 'Accounting and billing staff for revenue reconciliation and partner payouts', true),
  ('doctor', 'Medical consultant conducting physical or telemedicine appointments', true),
  ('careflow_manager', 'Care coordinator overseeing chronic care recall pipelines', true),
  ('patient', 'Registered patient account accessing personal health records', true)
ON CONFLICT (name) DO NOTHING;

-- 5. User Role Assignments (Scoped per organization and optional branch)
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_role_assignment_unique 
ON user_role_assignments (user_id, role_id, organization_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_org_branch ON user_role_assignments(organization_id, branch_id);
