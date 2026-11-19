-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 002: PATIENT MANAGEMENT
-- ==============================================================================
-- Scope: Patients, Patient Contacts, and Patient Consents
-- Design: Patient identity decoupled from auth identity. Staff can register
--         patients without patient login. Optional link to auth profile.
-- ==============================================================================

-- 1. Patients Master
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  primary_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  uhid VARCHAR(50) NOT NULL UNIQUE, -- Universal Health ID (e.g. CC-2026-00001)
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  age_years INT,
  blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  address_line1 TEXT,
  landmark TEXT,
  city VARCHAR(100) NOT NULL DEFAULT 'Howrah',
  district VARCHAR(100) NOT NULL DEFAULT 'Howrah',
  state VARCHAR(100) NOT NULL DEFAULT 'West Bengal',
  pincode VARCHAR(10),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Linked auth account (if patient registers)
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(20),
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_org ON patients(organization_id);
CREATE INDEX IF NOT EXISTS idx_patients_branch ON patients(primary_branch_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_uhid ON patients(uhid);
CREATE INDEX IF NOT EXISTS idx_patients_profile ON patients(profile_id);

-- 2. Patient Contacts
CREATE TABLE IF NOT EXISTS patient_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('phone', 'whatsapp', 'email', 'emergency')),
  value VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_contacts_patient ON patient_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_contacts_value ON patient_contacts(value);

-- 3. Patient Consents (DISHA / DPDP Act compliance)
CREATE TABLE IF NOT EXISTS patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL CHECK (consent_type IN ('telemedicine', 'home_sample_collection', 'whatsapp_reports', 'data_processing')),
  is_granted BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  recorded_by UUID REFERENCES profiles(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_patient_consents_patient ON patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_type ON patient_consents(patient_id, consent_type);
