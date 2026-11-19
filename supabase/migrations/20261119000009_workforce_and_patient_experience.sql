-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 009: WORKFORCE MANAGEMENT, PATIENT COMMUNICATION,
-- PRESCRIPTIONS, DIAGNOSTIC DELIVERY & PATIENT EXPERIENCE AUTOMATION (STEP 07)
-- ==============================================================================

-- 1. Extend Roles with Step 07 Workforce Roles
INSERT INTO roles (name, description, is_system_role)
VALUES 
  ('org_admin', 'Organization-wide administrator managing branches and policies', true),
  ('phlebotomist', 'Certified phlebotomy technician for in-clinic and doorstep sample collection', true),
  ('billing_staff', 'Cashier and accounts executive handling patient billing, POS, and refunds', true),
  ('calling_executive', 'Patient relationship and calling executive handling appointments and follow-up campaigns', true),
  ('auditor', 'Read-only financial and clinical governance compliance auditor', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Staff Details (Employee Profile Extension)
CREATE TABLE IF NOT EXISTS staff_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  designation VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Operations',
  employment_status VARCHAR(40) NOT NULL DEFAULT 'active' CHECK (
    employment_status IN ('active', 'on_leave', 'probation', 'terminated', 'resigned')
  ),
  reporting_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_schedule_notes TEXT,
  qualifications JSONB DEFAULT '[]'::jsonb,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_details_user ON staff_details(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_details_org ON staff_details(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_details_emp_id ON staff_details(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_details_status ON staff_details(employment_status);

-- 3. Staff Invitations (Secure Invitation-based Onboarding)
CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  designation VARCHAR(100),
  employee_id VARCHAR(50),
  invitation_token VARCHAR(128) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'expired', 'revoked')
  ),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON staff_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON staff_invitations(status);

-- 4. Workforce Shifts & Rosters
CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_name VARCHAR(50) NOT NULL DEFAULT 'Morning Shift',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_weekly_off BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(40) NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'swapped', 'leave', 'absent', 'cancelled')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff ON staff_shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_branch_date ON staff_shifts(branch_id, shift_date);

-- 5. Staff Attendance Records
CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES staff_shifts(id) ON DELETE SET NULL,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  late_minutes INT DEFAULT 0,
  early_departure_minutes INT DEFAULT 0,
  overtime_minutes INT DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'present' CHECK (
    status IN ('present', 'late', 'half_day', 'absent', 'on_leave')
  ),
  approval_status VARCHAR(40) NOT NULL DEFAULT 'approved' CHECK (
    approval_status IN ('pending', 'approved', 'rejected')
  ),
  approved_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_date ON staff_attendance(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_branch ON staff_attendance(branch_id, date);

-- 6. Staff Task Management
CREATE TABLE IF NOT EXISTS staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  task_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'patient_call' CHECK (
    category IN ('patient_call', 'appointment_confirmation', 'sample_coordination', 'report_delivery', 'complaint_resolution', 'clinical_escalation', 'administrative', 'other')
  ),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  status VARCHAR(40) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'escalated', 'cancelled')
  ),
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnostic_order_id UUID REFERENCES diagnostic_orders(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned ON staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_patient ON staff_tasks(patient_id);

-- 7. Calling Campaigns & Patient Outreach
CREATE TABLE IF NOT EXISTS calling_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  campaign_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  objective TEXT,
  target_filter JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(40) NOT NULL DEFAULT 'active' CHECK (
    status IN ('draft', 'active', 'paused', 'completed', 'archived')
  ),
  total_leads INT NOT NULL DEFAULT 0,
  completed_calls INT NOT NULL DEFAULT 0,
  conversions_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES calling_campaigns(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  attempt_number INT NOT NULL DEFAULT 1,
  call_status VARCHAR(40) NOT NULL CHECK (
    call_status IN ('connected', 'no_answer', 'busy', 'wrong_number', 'call_failed')
  ),
  outcome VARCHAR(50) NOT NULL CHECK (
    outcome IN ('appointment_booked', 'diagnostic_booked', 'interested', 'not_interested', 'callback_requested', 'do_not_contact', 'unreachable', 'other')
  ),
  callback_scheduled_at TIMESTAMPTZ,
  notes TEXT,
  attributed_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  attributed_order_id UUID REFERENCES diagnostic_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_attempts_patient ON call_attempts(patient_id);
CREATE INDEX IF NOT EXISTS idx_call_attempts_caller ON call_attempts(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_attempts_campaign ON call_attempts(campaign_id);

-- 8. Patient Medical Documents (Prescriptions, Diagnostic Reports, Consents)
CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_number VARCHAR(50) NOT NULL UNIQUE,
  document_type VARCHAR(40) NOT NULL CHECK (
    document_type IN ('prescription', 'diagnostic_report', 'consent_form', 'invoice', 'discharge_summary', 'other')
  ),
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES diagnostic_orders(id) ON DELETE SET NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES patient_documents(id) ON DELETE SET NULL,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  security_token VARCHAR(128),
  token_expires_at TIMESTAMPTZ,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_documents_patient ON patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_type ON patient_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_patient_documents_token ON patient_documents(security_token);

CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES patient_documents(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES profiles(id),
  access_channel VARCHAR(40) NOT NULL CHECK (
    access_channel IN ('admin_portal', 'patient_portal', 'expiring_link', 'whatsapp', 'email', 'print_desk')
  ),
  ip_address VARCHAR(50),
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_access_document ON document_access_logs(document_id);

-- 9. Patient Communication Preferences & Consent
CREATE TABLE IF NOT EXISTS patient_communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
  service_sms_enabled BOOLEAN NOT NULL DEFAULT true,
  service_whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
  service_email_enabled BOOLEAN NOT NULL DEFAULT true,
  promotional_whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  promotional_sms_enabled BOOLEAN NOT NULL DEFAULT false,
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (
    preferred_language IN ('en', 'bn', 'hi')
  ),
  consent_source VARCHAR(50) DEFAULT 'in_clinic_registration',
  opted_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_comm_pref_patient ON patient_communication_preferences(patient_id);

-- 10. Communication Templates (Multi-lingual WhatsApp / SMS / Email)
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(40) NOT NULL DEFAULT 'service' CHECK (
    category IN ('service', 'transactional', 'promotional', 'emergency')
  ),
  channel VARCHAR(20) NOT NULL CHECK (
    channel IN ('whatsapp', 'sms', 'email')
  ),
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  title VARCHAR(255) NOT NULL,
  template_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed core medical & service communication templates
INSERT INTO communication_templates (code, category, channel, language, title, template_body, variables)
VALUES
  (
    'APPOINTMENT_CONFIRMED',
    'service',
    'whatsapp',
    'en',
    'Appointment Confirmation',
    'Dear {{patient_name}}, your appointment with {{doctor_name}} is confirmed for {{scheduled_date}} at {{scheduled_time}} (Token #{{token_number}}). Chamber: {{chamber_name}}, {{branch_name}}. Need help? Call {{branch_phone}}.',
    '["patient_name", "doctor_name", "scheduled_date", "scheduled_time", "token_number", "chamber_name", "branch_name", "branch_phone"]'::jsonb
  ),
  (
    'HOME_COLLECTION_CONFIRMED',
    'service',
    'whatsapp',
    'en',
    'Home Sample Collection Confirmed',
    'Dear {{patient_name}}, your home sample collection (Order #{{order_number}}) is confirmed for {{scheduled_date}} between {{slot_time}}. Phlebotomist {{phlebotomist_name}} will visit your address. CAPSIC CARE.',
    '["patient_name", "order_number", "scheduled_date", "slot_time", "phlebotomist_name"]'::jsonb
  ),
  (
    'DIAGNOSTIC_REPORT_READY',
    'service',
    'whatsapp',
    'en',
    'Diagnostic Report Ready',
    'Dear {{patient_name}}, your laboratory test report for Order #{{order_number}} is verified and ready. You can securely download your digital report here: {{report_url}} (valid for 48 hours). CAPSIC CARE.',
    '["patient_name", "order_number", "report_url"]'::jsonb
  ),
  (
    'PRESCRIPTION_AVAILABLE',
    'service',
    'whatsapp',
    'en',
    'Digital Prescription Ready',
    'Dear {{patient_name}}, Dr. {{doctor_name}} has uploaded your digital prescription for consultation on {{consultation_date}}. Access your private document securely: {{prescription_url}} (valid for 48 hours). CAPSIC CARE.',
    '["patient_name", "doctor_name", "consultation_date", "prescription_url"]'::jsonb
  ),
  (
    'FOLLOW_UP_REMINDER',
    'service',
    'whatsapp',
    'en',
    'CareFlow Follow-up Consultation Reminder',
    'Dear {{patient_name}}, you are due for your follow-up consultation with {{doctor_name}} this week. Book your priority slot: {{booking_url}} or call {{branch_phone}}. CAPSIC CARE.',
    '["patient_name", "doctor_name", "booking_url", "branch_phone"]'::jsonb
  )
ON CONFLICT (code) DO NOTHING;

-- 11. Communication Messages Ledger
CREATE TABLE IF NOT EXISTS communication_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES communication_templates(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  recipient VARCHAR(255) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'sending', 'sent', 'delivered', 'failed', 'cancelled')
  ),
  provider VARCHAR(50) NOT NULL DEFAULT 'mock_adapter',
  provider_message_id VARCHAR(150),
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  sent_by UUID REFERENCES profiles(id),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_messages_patient ON communication_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_comm_messages_status ON communication_messages(status);

-- 12. Patient Feedback & Satisfaction Ratings
CREATE TABLE IF NOT EXISTS patient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnostic_order_id UUID REFERENCES diagnostic_orders(id) ON DELETE SET NULL,
  rating_overall INT NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_doctor INT CHECK (rating_doctor >= 1 AND rating_doctor <= 5),
  rating_reception INT CHECK (rating_reception >= 1 AND rating_reception <= 5),
  rating_waiting_time INT CHECK (rating_waiting_time >= 1 AND rating_waiting_time <= 5),
  feedback_category VARCHAR(50) DEFAULT 'general',
  comments TEXT,
  is_negative_escalated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_feedback_patient ON patient_feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_feedback_branch ON patient_feedback(branch_id);

-- 13. Patient Complaints & Escalation Management
CREATE TABLE IF NOT EXISTS patient_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('clinical_quality', 'billing_dispute', 'delayed_service', 'staff_behavior', 'report_error', 'facility_hygiene', 'other')
  ),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'critical')
  ),
  status VARCHAR(40) NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_investigation', 'resolved', 'escalated', 'closed')
  ),
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolution_target_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_ticket ON patient_complaints(ticket_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON patient_complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_patient ON patient_complaints(patient_id);

-- 14. Automation Rules & Execution Logs
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'success' CHECK (
    status IN ('success', 'failed', 'skipped')
  ),
  result_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_event ON automation_logs(event_name);

-- Seed initial core automation rules
INSERT INTO automation_rules (code, name, trigger_event, action_type, action_config, is_active)
VALUES
  (
    'AUTO_APPT_NOTIFY',
    'Notify Patient on Appointment Confirmation',
    'APPOINTMENT_CONFIRMED',
    'SEND_WHATSAPP',
    '{"template_code": "APPOINTMENT_CONFIRMED"}'::jsonb,
    true
  ),
  (
    'AUTO_REPORT_READY_NOTIFY',
    'Notify Patient when Lab Report Verified',
    'DIAGNOSTIC_REPORT_VERIFIED',
    'SEND_WHATSAPP',
    '{"template_code": "DIAGNOSTIC_REPORT_READY"}'::jsonb,
    true
  ),
  (
    'AUTO_MISSED_APPT_TASK',
    'Create Follow-up Task on Missed Appointment',
    'APPOINTMENT_NO_SHOW',
    'CREATE_TASK',
    '{"task_title": "Call patient regarding missed OPD consultation", "priority": "high", "category": "patient_call"}'::jsonb,
    true
  ),
  (
    'AUTO_NEGATIVE_FEEDBACK_ESCALATION',
    'Escalate Low Rating (< 3 Stars) to Branch Manager',
    'NEGATIVE_FEEDBACK_RECEIVED',
    'CREATE_COMPLAINT',
    '{"category": "staff_behavior", "priority": "high"}'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- 15. Enable Row-Level Security on all newly created tables
ALTER TABLE staff_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calling_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- 16. Grant access to authenticated users and service_role
CREATE POLICY staff_details_select ON staff_details FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_details_all ON staff_details FOR ALL TO service_role USING (true);

CREATE POLICY staff_invitations_select ON staff_invitations FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_invitations_all ON staff_invitations FOR ALL TO service_role USING (true);

CREATE POLICY staff_shifts_select ON staff_shifts FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_shifts_all ON staff_shifts FOR ALL TO service_role USING (true);

CREATE POLICY staff_attendance_select ON staff_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_attendance_all ON staff_attendance FOR ALL TO service_role USING (true);

CREATE POLICY staff_tasks_select ON staff_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_tasks_all ON staff_tasks FOR ALL TO service_role USING (true);

CREATE POLICY calling_campaigns_select ON calling_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY calling_campaigns_all ON calling_campaigns FOR ALL TO service_role USING (true);

CREATE POLICY call_attempts_select ON call_attempts FOR SELECT TO authenticated USING (true);
CREATE POLICY call_attempts_all ON call_attempts FOR ALL TO service_role USING (true);

CREATE POLICY patient_documents_select ON patient_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY patient_documents_all ON patient_documents FOR ALL TO service_role USING (true);

CREATE POLICY doc_access_select ON document_access_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY doc_access_all ON document_access_logs FOR ALL TO service_role USING (true);

CREATE POLICY comm_pref_select ON patient_communication_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY comm_pref_all ON patient_communication_preferences FOR ALL TO service_role USING (true);

CREATE POLICY comm_templates_select ON communication_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY comm_templates_all ON communication_templates FOR ALL TO service_role USING (true);

CREATE POLICY comm_messages_select ON communication_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY comm_messages_all ON communication_messages FOR ALL TO service_role USING (true);

CREATE POLICY feedback_select ON patient_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY feedback_all ON patient_feedback FOR ALL TO service_role USING (true);

CREATE POLICY complaints_select ON patient_complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY complaints_all ON patient_complaints FOR ALL TO service_role USING (true);

CREATE POLICY auto_rules_select ON automation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY auto_rules_all ON automation_rules FOR ALL TO service_role USING (true);

CREATE POLICY auto_logs_select ON automation_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY auto_logs_all ON automation_logs FOR ALL TO service_role USING (true);
