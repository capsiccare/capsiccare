-- ==============================================================================
-- CAPSIC CARE OS — STEP 08: CAREFLOW PATIENT RETENTION, FOLLOW-UP & DOCTOR RELATIONSHIP MANAGEMENT
-- Migration: 20261119000010_careflow_retention_and_doctor_crm.sql
-- ==============================================================================

-- 1. CareFlow Managed-Service Plans for External Doctor Practices
CREATE TABLE IF NOT EXISTS careflow_service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price_per_enrolled_patient_inr INT NOT NULL DEFAULT 150,
  included_calls_per_patient INT NOT NULL DEFAULT 3,
  price_per_additional_call_inr INT NOT NULL DEFAULT 40,
  whatsapp_reminders_included BOOLEAN NOT NULL DEFAULT true,
  billing_cycle VARCHAR(30) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed core CareFlow commercial plans
INSERT INTO careflow_service_plans (code, name, description, price_per_enrolled_patient_inr, included_calls_per_patient, price_per_additional_call_inr, whatsapp_reminders_included, billing_cycle)
VALUES
  ('CF_STARTER', 'CareFlow Starter Practice', 'Essential 3-day post-consultation check-in & WhatsApp report notifications', 100, 2, 40, true, 'monthly'),
  ('CF_PRO', 'CareFlow Pro Clinical Retention', 'Post-OPD check-ins, quarterly chronic care recalls & dedicated tele-caller desk', 180, 4, 35, true, 'monthly'),
  ('CF_ENTERPRISE', 'CareFlow High-Volume Clinic Suite', 'Unlimited quarterly recalls, automated escalation desk, and practice analytics', 250, 6, 25, true, 'quarterly')
ON CONFLICT (code) DO NOTHING;

-- 2. External Doctor Practices & Clinic Accounts
CREATE TABLE IF NOT EXISTS careflow_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  primary_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  contact_person VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  chambers JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_agreement_status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (
    service_agreement_status IN ('pending', 'active', 'suspended', 'cancelled')
  ),
  agreement_signed_date DATE,
  service_plan_id UUID REFERENCES careflow_service_plans(id) ON DELETE SET NULL,
  assigned_account_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_coordinator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  default_follow_up_days INT NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practices_org ON careflow_practices(organization_id);
CREATE INDEX IF NOT EXISTS idx_practices_doctor ON careflow_practices(primary_doctor_id);
CREATE INDEX IF NOT EXISTS idx_practices_code ON careflow_practices(code);

-- 3. Practice Memberships / Authorized Doctor & Clinic Staff
CREATE TABLE IF NOT EXISTS practice_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES careflow_practices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'practice_doctor' CHECK (
    role IN ('practice_doctor', 'practice_admin', 'practice_staff')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practice_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_members_user ON practice_members(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_members_practice ON practice_members(practice_id);

-- 4. Practice Patient Enrollments (Practice-level Roster & Data Isolation)
CREATE TABLE IF NOT EXISTS practice_patient_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES careflow_practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(50) NOT NULL DEFAULT 'individual' CHECK (
    source IN ('individual', 'csv_import', 'consultation_referral', 'clinic_intake')
  ),
  consent_verified BOOLEAN NOT NULL DEFAULT true,
  consent_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'opted_out', 'withdrawn', 'archived')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practice_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_enrollments_practice ON practice_patient_enrollments(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_enrollments_patient ON practice_patient_enrollments(patient_id);
CREATE INDEX IF NOT EXISTS idx_practice_enrollments_status ON practice_patient_enrollments(status);

-- 5. External Patient Import Batches
CREATE TABLE IF NOT EXISTS patient_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES careflow_practices(id) ON DELETE CASCADE,
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  imported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  file_name VARCHAR(255) NOT NULL,
  total_rows INT NOT NULL DEFAULT 0,
  valid_rows INT NOT NULL DEFAULT 0,
  duplicate_rows INT NOT NULL DEFAULT 0,
  error_rows INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (
    status IN ('uploaded', 'validated', 'processing', 'completed', 'failed')
  ),
  error_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_imports_practice ON patient_import_batches(practice_id);

-- 6. Chronic Care Recall Plans
CREATE TABLE IF NOT EXISTS recall_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES careflow_practices(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  condition_category VARCHAR(50) NOT NULL CHECK (
    condition_category IN ('diabetes', 'hypertension', 'thyroid', 'respiratory', 'cardiac', 'post_surgery', 'general_chronic', 'other')
  ),
  custom_condition_name VARCHAR(150),
  clinical_notes TEXT,
  interval_days INT NOT NULL DEFAULT 90,
  last_consultation_date DATE,
  next_recall_date DATE NOT NULL,
  preferred_channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp' CHECK (
    preferred_channel IN ('whatsapp', 'phone_call', 'sms')
  ),
  assigned_coordinator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'paused', 'completed', 'discontinued')
  ),
  escalation_status VARCHAR(30) NOT NULL DEFAULT 'none' CHECK (
    escalation_status IN ('none', 'flagged', 'escalated')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recall_plans_patient ON recall_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_recall_plans_doctor ON recall_plans(doctor_id);
CREATE INDEX IF NOT EXISTS idx_recall_plans_next_date ON recall_plans(next_recall_date);
CREATE INDEX IF NOT EXISTS idx_recall_plans_status ON recall_plans(status);

-- 7. Follow-Up Task Engine & Concurrency Control Lock
CREATE TABLE IF NOT EXISTS careflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES careflow_practices(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES diagnostic_orders(id) ON DELETE SET NULL,
  recall_plan_id UUID REFERENCES recall_plans(id) ON DELETE SET NULL,
  task_type VARCHAR(50) NOT NULL CHECK (
    task_type IN ('post_consultation', 'chronic_recall', 'missed_appointment', 'report_follow_up', 'patient_callback', 'doctor_request')
  ),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'claimed', 'in_progress', 'completed', 'cancelled', 'escalated')
  ),
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  claim_expires_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  call_attempts_count INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  last_outcome VARCHAR(50),
  notes TEXT,
  next_action VARCHAR(100),
  next_action_due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_careflow_tasks_status ON careflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_careflow_tasks_due_date ON careflow_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_careflow_tasks_patient ON careflow_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_careflow_tasks_claimed ON careflow_tasks(claimed_by, claim_expires_at);
CREATE INDEX IF NOT EXISTS idx_careflow_tasks_practice ON careflow_tasks(practice_id);

-- 8. Clinical Escalations & Patient Safety
CREATE TABLE IF NOT EXISTS clinical_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES careflow_practices(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  careflow_task_id UUID REFERENCES careflow_tasks(id) ON DELETE SET NULL,
  flagged_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  urgency VARCHAR(20) NOT NULL DEFAULT 'urgent' CHECK (
    urgency IN ('routine', 'urgent', 'emergency')
  ),
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('worsening_symptoms', 'medication_adverse_effect', 'urgent_clinical_question', 'post_procedure_complication', 'speak_with_doctor_request', 'other')
  ),
  description TEXT NOT NULL,
  patient_reported_symptoms TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'under_review', 'doctor_notified', 'resolved', 'referred_to_emergency')
  ),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  emergency_advisory_shown BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalations_status ON clinical_escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_urgency ON clinical_escalations(urgency);
CREATE INDEX IF NOT EXISTS idx_escalations_patient ON clinical_escalations(patient_id);

-- 9. CareFlow Practice Managed-Service Invoices
CREATE TABLE IF NOT EXISTS practice_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES careflow_practices(id) ON DELETE RESTRICT,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  enrolled_patients_count INT NOT NULL DEFAULT 0,
  completed_calls_count INT NOT NULL DEFAULT 0,
  base_fee_inr INT NOT NULL DEFAULT 0,
  usage_fee_inr INT NOT NULL DEFAULT 0,
  discount_inr INT NOT NULL DEFAULT 0,
  tax_inr INT NOT NULL DEFAULT 0,
  total_inr INT NOT NULL DEFAULT 0,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'partially_paid', 'paid', 'overdue', 'waived')
  ),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_invoices_practice ON practice_invoices(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_invoices_status ON practice_invoices(payment_status);

-- 10. Enhance call_attempts with careflow_task_id & practice_id
ALTER TABLE call_attempts ADD COLUMN IF NOT EXISTS careflow_task_id UUID REFERENCES careflow_tasks(id) ON DELETE SET NULL;
ALTER TABLE call_attempts ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES careflow_practices(id) ON DELETE SET NULL;

-- 11. Seed Initial Clinical Practices & Sample CareFlow Recalls
DO $$
DECLARE
  v_org_id UUID;
  v_doc_skd UUID;
  v_doc_tm UUID;
  v_plan_pro UUID;
  v_plan_starter UUID;
  v_practice_skd UUID;
  v_practice_tm UUID;
  v_patient UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_doc_skd FROM doctors WHERE code = 'DOC-SKD-01' LIMIT 1;
  SELECT id INTO v_doc_tm FROM doctors WHERE code = 'DOC-TM-01' LIMIT 1;
  SELECT id INTO v_plan_pro FROM careflow_service_plans WHERE code = 'CF_PRO' LIMIT 1;
  SELECT id INTO v_plan_starter FROM careflow_service_plans WHERE code = 'CF_STARTER' LIMIT 1;
  SELECT id INTO v_patient FROM patients LIMIT 1;

  IF v_org_id IS NOT NULL AND v_doc_skd IS NOT NULL THEN
    -- Practice 1: Dr. Sanjoy Kumar Dey Pediatric Practice
    INSERT INTO careflow_practices (
      id, organization_id, code, name, primary_doctor_id, contact_person, phone, email, address,
      chambers, service_agreement_status, agreement_signed_date, service_plan_id, default_follow_up_days, is_active
    )
    VALUES (
      '55555555-5555-4555-a555-555555555551',
      v_org_id,
      'PRAC_SKD_PEDIATRICS',
      'Dr. S. K. Dey Child Health & Neonatal Practice',
      v_doc_skd,
      'Dr. Sanjoy Kumar Dey',
      '9830225334',
      'drskdey@capsiccare.com',
      'Bankra Bazar Chamber & Domjur Clinic',
      '[{"name": "Bankra OPD Chamber", "days": "Mon, Wed, Fri", "timings": "10:00 AM - 01:00 PM"}, {"name": "Domjur Evening Chamber", "days": "Tue, Thu, Sat", "timings": "05:00 PM - 08:00 PM"}]'::jsonb,
      'active',
      '2026-01-01',
      v_plan_pro,
      3,
      true
    )
    ON CONFLICT (code) DO NOTHING;

    -- Practice 2: Dr. Tooneer Mallik Family Health Clinic
    IF v_doc_tm IS NOT NULL THEN
      INSERT INTO careflow_practices (
        id, organization_id, code, name, primary_doctor_id, contact_person, phone, email, address,
        chambers, service_agreement_status, agreement_signed_date, service_plan_id, default_follow_up_days, is_active
      )
      VALUES (
        '55555555-5555-4555-a555-555555555552',
        v_org_id,
        'PRAC_TM_FAMILY',
        'Dr. Tooneer Mallik Comprehensive Family Health Clinic',
        v_doc_tm,
        'Dr. Tooneer Mallik',
        '8910260709',
        'drtmallik@capsiccare.com',
        'Howrah Central Chamber & Wellness Hub',
        '[{"name": "Central Howrah Chamber", "days": "Daily", "timings": "09:00 AM - 02:00 PM"}]'::jsonb,
        'active',
        '2026-01-15',
        v_plan_starter,
        3,
        true
      )
      ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Enroll sample patient into Practice 1
    IF v_patient IS NOT NULL THEN
      INSERT INTO practice_patient_enrollments (practice_id, patient_id, doctor_id, source, consent_verified, tags, status)
      VALUES (
        '55555555-5555-4555-a555-555555555551',
        v_patient,
        v_doc_skd,
        'clinic_intake',
        true,
        ARRAY['pediatric_checkup', 'vaccination_followup'],
        'active'
      )
      ON CONFLICT (practice_id, patient_id) DO NOTHING;

      -- Create sample chronic care recall plan
      INSERT INTO recall_plans (
        organization_id, practice_id, patient_id, doctor_id, condition_category,
        custom_condition_name, clinical_notes, interval_days, next_recall_date, preferred_channel, status
      )
      VALUES (
        v_org_id,
        '55555555-5555-4555-a555-555555555551',
        v_patient,
        v_doc_skd,
        'diabetes',
        'Type 2 Diabetes Mellitus & HbA1c Review',
        'Check HbA1c level quarterly, review morning fasting glucose, dietary compliance, and foot sensations.',
        90,
        CURRENT_DATE + INTERVAL '14 days',
        'whatsapp',
        'active'
      )
      ON CONFLICT DO NOTHING;

      -- Create sample post-consultation CareFlow task
      INSERT INTO careflow_tasks (
        organization_id, practice_id, patient_id, doctor_id, task_type, priority,
        due_date, status, notes
      )
      VALUES (
        v_org_id,
        '55555555-5555-4555-a555-555555555551',
        v_patient,
        v_doc_skd,
        'post_consultation',
        'medium',
        CURRENT_DATE,
        'pending',
        'Automated 3-day post-consultation recovery check-in for medication tolerance and symptom review.'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- 12. Row Level Security Policies
ALTER TABLE careflow_service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE careflow_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_patient_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recall_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE careflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_invoices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read service plans
DO $$ BEGIN
  CREATE POLICY "Allow authenticated read service plans" ON careflow_service_plans FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow service role full access to all CareFlow tables
DO $$ BEGIN
  CREATE POLICY "Service role full access careflow_service_plans" ON careflow_service_plans FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access careflow_practices" ON careflow_practices FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access practice_members" ON practice_members FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access practice_patient_enrollments" ON practice_patient_enrollments FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access patient_import_batches" ON patient_import_batches FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access recall_plans" ON recall_plans FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access careflow_tasks" ON careflow_tasks FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access clinical_escalations" ON clinical_escalations FOR ALL TO service_role USING (true);
  CREATE POLICY "Service role full access practice_invoices" ON practice_invoices FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow authenticated staff read access
DO $$ BEGIN
  CREATE POLICY "Authenticated staff read careflow_practices" ON careflow_practices FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read practice_members" ON practice_members FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read practice_patient_enrollments" ON practice_patient_enrollments FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read patient_import_batches" ON patient_import_batches FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read recall_plans" ON recall_plans FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read careflow_tasks" ON careflow_tasks FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read clinical_escalations" ON clinical_escalations FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated staff read practice_invoices" ON practice_invoices FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
