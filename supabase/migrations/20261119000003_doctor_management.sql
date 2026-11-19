-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 003: DOCTOR MANAGEMENT
-- ==============================================================================
-- Scope: Doctors, Doctor-Branch links, Schedules, and Schedule Exceptions
-- Monetary Units: Integer paise (e.g. 400 INR = 40,000 paise)
-- ==============================================================================

-- 1. Doctors Master
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Optional link to auth user
  code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'DOC-SKD'
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  specialty VARCHAR(150) NOT NULL,
  designation VARCHAR(150) NOT NULL,
  qualifications TEXT NOT NULL,
  registration_number VARCHAR(100) NOT NULL, -- e.g. 'WBMC 46483'
  experience_years INT NOT NULL DEFAULT 0,
  physical_fee_paise INT NOT NULL DEFAULT 0 CHECK (physical_fee_paise >= 0),
  telemedicine_fee_paise INT NOT NULL DEFAULT 0 CHECK (telemedicine_fee_paise >= 0),
  follow_up_fee_paise INT NOT NULL DEFAULT 0 CHECK (follow_up_fee_paise >= 0),
  image_url TEXT,
  about TEXT,
  languages TEXT[] DEFAULT ARRAY['Bengali', 'English', 'Hindi']::TEXT[],
  areas_of_expertise TEXT[] DEFAULT ARRAY[]::TEXT[],
  services_offered TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_org ON doctors(organization_id);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);

-- 2. Doctor Branches (Many-to-Many affiliation)
CREATE TABLE IF NOT EXISTS doctor_branches (
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (doctor_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_branches_branch ON doctor_branches(branch_id);

-- 3. Doctor Schedules
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  consultation_type VARCHAR(30) NOT NULL CHECK (consultation_type IN ('physical', 'telemedicine')),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 15 CHECK (slot_duration_minutes > 0),
  max_patients_per_slot INT NOT NULL DEFAULT 1 CHECK (max_patients_per_slot > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_lookup 
ON doctor_schedules(doctor_id, branch_id, day_of_week, consultation_type);

-- 4. Schedule Exceptions (Leaves, Holidays, Schedule modifications)
CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE, -- NULL means doctor is unavailable across all branches
  exception_date DATE NOT NULL,
  exception_type VARCHAR(50) NOT NULL CHECK (exception_type IN ('leave', 'holiday', 'extended_hours', 'cancelled')),
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date 
ON schedule_exceptions(doctor_id, exception_date);
