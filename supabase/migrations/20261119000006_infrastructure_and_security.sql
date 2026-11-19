-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 006: INFRASTRUCTURE & SECURITY (RLS)
-- ==============================================================================
-- Scope: Audit Logs, Idempotency Keys, Notification Jobs, Security Helper
--        Functions, and Comprehensive Row-Level Security (RLS) Policies
-- Security Standard: Deny-by-default, branch-scoped RBAC, patient self-access,
--                    search_path sanitized security definer functions
-- ==============================================================================

-- 1. Audit Logs (Immutable security tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- e.g. 'PATIENT_REGISTERED', 'PRICE_UPDATED'
  entity_type VARCHAR(100) NOT NULL, -- 'patient', 'appointment', 'order'
  entity_id VARCHAR(100) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- 2. Idempotency Keys (API replay and duplicate transaction defense)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL UNIQUE,
  request_path VARCHAR(255) NOT NULL,
  response_status INT NOT NULL,
  response_body JSONB NOT NULL,
  locked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_lookup ON idempotency_keys(key, locked_until);

-- 3. Notification Jobs Queue
CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel VARCHAR(30) NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  recipient VARCHAR(255) NOT NULL,
  template_name VARCHAR(100),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON notification_jobs(status, scheduled_at);

-- ==============================================================================
-- SECURITY HELPER FUNCTIONS (SANITIZED SEARCH PATH)
-- ==============================================================================

-- Check if current authenticated user has a specific role (or is super_admin)
CREATE OR REPLACE FUNCTION has_role(required_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_role_assignments ura
    JOIN public.roles r ON r.id = ura.role_id
    WHERE ura.user_id = auth.uid()
      AND (r.name = required_role OR r.name = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Check if current authenticated user has access to a specific branch
CREATE OR REPLACE FUNCTION has_branch_access(target_branch_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_role_assignments ura
    JOIN public.roles r ON r.id = ura.role_id
    WHERE ura.user_id = auth.uid()
      AND (
        r.name = 'super_admin' OR 
        ura.branch_id IS NULL OR 
        ura.branch_id = target_branch_id
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ==============================================================================
-- ROW-LEVEL SECURITY POLICIES (DENY BY DEFAULT ON ALL TABLES)
-- ==============================================================================

-- Enable RLS across every table in the schema
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Organizations Policies
DROP POLICY IF EXISTS "Public view organizations" ON organizations;
CREATE POLICY "Public view organizations" ON organizations
  FOR SELECT USING (is_active = true OR has_role('super_admin'));

DROP POLICY IF EXISTS "SuperAdmin manage organizations" ON organizations;
CREATE POLICY "SuperAdmin manage organizations" ON organizations
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- 2. Branches Policies
DROP POLICY IF EXISTS "Public view branches" ON branches;
CREATE POLICY "Public view branches" ON branches
  FOR SELECT USING (is_active = true OR has_role('super_admin') OR has_branch_access(id));

DROP POLICY IF EXISTS "Admin manage branches" ON branches;
CREATE POLICY "Admin manage branches" ON branches
  FOR ALL USING (has_role('super_admin') OR has_branch_access(id))
  WITH CHECK (has_role('super_admin') OR has_branch_access(id));

-- 3. Roles & Assignments
DROP POLICY IF EXISTS "Anyone view roles" ON roles;
CREATE POLICY "Anyone view roles" ON roles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "SuperAdmin manage roles" ON roles;
CREATE POLICY "SuperAdmin manage roles" ON roles
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

DROP POLICY IF EXISTS "Users view own role assignments" ON user_role_assignments;
CREATE POLICY "Users view own role assignments" ON user_role_assignments
  FOR SELECT USING (user_id = auth.uid() OR has_role('super_admin') OR has_role('branch_admin'));

DROP POLICY IF EXISTS "SuperAdmin manage role assignments" ON user_role_assignments;
CREATE POLICY "SuperAdmin manage role assignments" ON user_role_assignments
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- 4. Profiles Policies
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR has_role('super_admin') OR has_role('branch_admin'));

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "SuperAdmin manage profiles" ON profiles;
CREATE POLICY "SuperAdmin manage profiles" ON profiles
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- 5. Doctors & Schedules Policies (Public read for active catalogue, restricted write)
DROP POLICY IF EXISTS "Public view doctors" ON doctors;
CREATE POLICY "Public view doctors" ON doctors
  FOR SELECT USING (is_active = true OR has_role('super_admin') OR has_role('branch_admin') OR profile_id = auth.uid());

DROP POLICY IF EXISTS "Admin manage doctors" ON doctors;
CREATE POLICY "Admin manage doctors" ON doctors
  FOR ALL USING (has_role('super_admin') OR has_role('branch_admin'))
  WITH CHECK (has_role('super_admin') OR has_role('branch_admin'));

DROP POLICY IF EXISTS "Public view doctor branches" ON doctor_branches;
CREATE POLICY "Public view doctor branches" ON doctor_branches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage doctor branches" ON doctor_branches;
CREATE POLICY "Admin manage doctor branches" ON doctor_branches
  FOR ALL USING (has_role('super_admin') OR has_role('branch_admin'))
  WITH CHECK (has_role('super_admin') OR has_role('branch_admin'));

DROP POLICY IF EXISTS "Public view doctor schedules" ON doctor_schedules;
CREATE POLICY "Public view doctor schedules" ON doctor_schedules
  FOR SELECT USING (is_active = true OR has_role('super_admin') OR has_branch_access(branch_id));

DROP POLICY IF EXISTS "Admin manage doctor schedules" ON doctor_schedules;
CREATE POLICY "Admin manage doctor schedules" ON doctor_schedules
  FOR ALL USING (has_role('super_admin') OR has_branch_access(branch_id))
  WITH CHECK (has_role('super_admin') OR has_branch_access(branch_id));

DROP POLICY IF EXISTS "Public view schedule exceptions" ON schedule_exceptions;
CREATE POLICY "Public view schedule exceptions" ON schedule_exceptions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage schedule exceptions" ON schedule_exceptions;
CREATE POLICY "Admin manage schedule exceptions" ON schedule_exceptions
  FOR ALL USING (has_role('super_admin') OR (branch_id IS NOT NULL AND has_branch_access(branch_id)))
  WITH CHECK (has_role('super_admin') OR (branch_id IS NOT NULL AND has_branch_access(branch_id)));

-- 6. Diagnostic Catalogue Policies (Public read for active tests/packages/prices)
DROP POLICY IF EXISTS "Public view diagnostic categories" ON diagnostic_categories;
CREATE POLICY "Public view diagnostic categories" ON diagnostic_categories
  FOR SELECT USING (is_active = true OR has_role('super_admin'));

DROP POLICY IF EXISTS "Admin manage diagnostic categories" ON diagnostic_categories;
CREATE POLICY "Admin manage diagnostic categories" ON diagnostic_categories
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

DROP POLICY IF EXISTS "Public view diagnostic tests" ON diagnostic_tests;
CREATE POLICY "Public view diagnostic tests" ON diagnostic_tests
  FOR SELECT USING (is_active = true OR has_role('super_admin'));

DROP POLICY IF EXISTS "Admin manage diagnostic tests" ON diagnostic_tests;
CREATE POLICY "Admin manage diagnostic tests" ON diagnostic_tests
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

DROP POLICY IF EXISTS "Public view diagnostic packages" ON diagnostic_packages;
CREATE POLICY "Public view diagnostic packages" ON diagnostic_packages
  FOR SELECT USING (is_active = true OR has_role('super_admin'));

DROP POLICY IF EXISTS "Admin manage diagnostic packages" ON diagnostic_packages;
CREATE POLICY "Admin manage diagnostic packages" ON diagnostic_packages
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

DROP POLICY IF EXISTS "Public view diagnostic package items" ON diagnostic_package_items;
CREATE POLICY "Public view diagnostic package items" ON diagnostic_package_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage diagnostic package items" ON diagnostic_package_items;
CREATE POLICY "Admin manage diagnostic package items" ON diagnostic_package_items
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

DROP POLICY IF EXISTS "Public view diagnostic prices" ON diagnostic_prices;
CREATE POLICY "Public view diagnostic prices" ON diagnostic_prices
  FOR SELECT USING (is_active = true OR has_role('super_admin') OR (branch_id IS NOT NULL AND has_branch_access(branch_id)));

DROP POLICY IF EXISTS "Admin manage diagnostic prices" ON diagnostic_prices;
CREATE POLICY "Admin manage diagnostic prices" ON diagnostic_prices
  FOR ALL USING (has_role('super_admin')) WITH CHECK (has_role('super_admin'));

-- 7. Patient Policies (Clinical staff + self-service patient access)
DROP POLICY IF EXISTS "Staff and Patient view patients" ON patients;
CREATE POLICY "Staff and Patient view patients" ON patients
  FOR SELECT USING (
    profile_id = auth.uid() OR
    has_role('super_admin') OR
    (has_branch_access(primary_branch_id) AND (
      has_role('branch_admin') OR
      has_role('receptionist') OR
      has_role('nurse') OR
      has_role('doctor') OR
      has_role('careflow_manager') OR
      has_role('caller') OR
      has_role('lab_staff')
    ))
  );

DROP POLICY IF EXISTS "Authorized staff create patients" ON patients;
CREATE POLICY "Authorized staff create patients" ON patients
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR
    has_role('branch_admin') OR
    has_role('receptionist') OR
    has_role('nurse') OR
    has_role('caller') OR
    profile_id = auth.uid()
  );

DROP POLICY IF EXISTS "Authorized staff update patients" ON patients;
CREATE POLICY "Authorized staff update patients" ON patients
  FOR UPDATE USING (
    has_role('super_admin') OR
    (has_branch_access(primary_branch_id) AND (
      has_role('branch_admin') OR
      has_role('receptionist') OR
      has_role('nurse')
    ))
  );

DROP POLICY IF EXISTS "Staff and Patient view contacts" ON patient_contacts;
CREATE POLICY "Staff and Patient view contacts" ON patient_contacts
  FOR SELECT USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_contacts.patient_id 
        AND (p.profile_id = auth.uid() OR (has_branch_access(p.primary_branch_id) AND (
          has_role('branch_admin') OR has_role('receptionist') OR has_role('nurse') OR has_role('caller')
        )))
    )
  );

DROP POLICY IF EXISTS "Staff manage contacts" ON patient_contacts;
CREATE POLICY "Staff manage contacts" ON patient_contacts
  FOR ALL USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_contacts.patient_id 
        AND (p.profile_id = auth.uid() OR (has_branch_access(p.primary_branch_id) AND (
          has_role('branch_admin') OR has_role('receptionist')
        )))
    )
  ) WITH CHECK (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_contacts.patient_id 
        AND (p.profile_id = auth.uid() OR (has_branch_access(p.primary_branch_id) AND (
          has_role('branch_admin') OR has_role('receptionist')
        )))
    )
  );

DROP POLICY IF EXISTS "Staff and Patient view consents" ON patient_consents;
CREATE POLICY "Staff and Patient view consents" ON patient_consents
  FOR SELECT USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_consents.patient_id 
        AND (p.profile_id = auth.uid() OR (has_branch_access(p.primary_branch_id) AND (
          has_role('branch_admin') OR has_role('receptionist') OR has_role('nurse') OR has_role('caller')
        )))
    )
  );

DROP POLICY IF EXISTS "Staff manage consents" ON patient_consents;
CREATE POLICY "Staff manage consents" ON patient_consents
  FOR ALL USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_consents.patient_id 
        AND (p.profile_id = auth.uid() OR (has_branch_access(p.primary_branch_id) AND (
          has_role('branch_admin') OR has_role('receptionist') OR has_role('nurse')
        )))
    )
  ) WITH CHECK (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_consents.patient_id 
        AND (p.profile_id = auth.uid() OR (has_branch_access(p.primary_branch_id) AND (
          has_role('branch_admin') OR has_role('receptionist') OR has_role('nurse')
        )))
    )
  );

-- 8. Appointments Policies
DROP POLICY IF EXISTS "Staff and Patients view appointments" ON appointments;
CREATE POLICY "Staff and Patients view appointments" ON appointments
  FOR SELECT USING (
    has_role('super_admin') OR
    (has_branch_access(branch_id) AND (
      has_role('branch_admin') OR
      has_role('receptionist') OR
      has_role('nurse') OR
      has_role('doctor') OR
      has_role('caller')
    )) OR
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Create appointments" ON appointments;
CREATE POLICY "Create appointments" ON appointments
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR
    has_role('branch_admin') OR
    has_role('receptionist') OR
    has_role('caller') OR
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Update appointments" ON appointments;
CREATE POLICY "Update appointments" ON appointments
  FOR UPDATE USING (
    has_role('super_admin') OR
    (has_branch_access(branch_id) AND (
      has_role('branch_admin') OR
      has_role('receptionist') OR
      has_role('nurse') OR
      has_role('doctor')
    ))
  );

DROP POLICY IF EXISTS "Staff view appointment status history" ON appointment_status_history;
CREATE POLICY "Staff view appointment status history" ON appointment_status_history
  FOR SELECT USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.id = appointment_status_history.appointment_id 
        AND (has_branch_access(a.branch_id) OR EXISTS (
          SELECT 1 FROM patients p WHERE p.id = a.patient_id AND p.profile_id = auth.uid()
        ))
    )
  );

DROP POLICY IF EXISTS "Staff insert appointment status history" ON appointment_status_history;
CREATE POLICY "Staff insert appointment status history" ON appointment_status_history
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.id = appointment_status_history.appointment_id 
        AND has_branch_access(a.branch_id)
    )
  );

-- 9. Diagnostic Orders Policies
DROP POLICY IF EXISTS "Staff and Patients view orders" ON diagnostic_orders;
CREATE POLICY "Staff and Patients view orders" ON diagnostic_orders
  FOR SELECT USING (
    has_role('super_admin') OR
    (has_branch_access(branch_id) AND (
      has_role('branch_admin') OR
      has_role('receptionist') OR
      has_role('lab_staff') OR
      has_role('field_staff') OR
      has_role('finance') OR
      has_role('caller')
    )) OR
    assigned_phlebotomist_id = auth.uid() OR
    EXISTS (SELECT 1 FROM patients p WHERE p.id = diagnostic_orders.patient_id AND p.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Create diagnostic orders" ON diagnostic_orders;
CREATE POLICY "Create diagnostic orders" ON diagnostic_orders
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR
    has_role('branch_admin') OR
    has_role('receptionist') OR
    has_role('caller') OR
    EXISTS (SELECT 1 FROM patients p WHERE p.id = diagnostic_orders.patient_id AND p.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Update diagnostic orders" ON diagnostic_orders;
CREATE POLICY "Update diagnostic orders" ON diagnostic_orders
  FOR UPDATE USING (
    has_role('super_admin') OR
    (has_branch_access(branch_id) AND (
      has_role('branch_admin') OR
      has_role('receptionist') OR
      has_role('lab_staff') OR
      has_role('field_staff')
    ))
  );

DROP POLICY IF EXISTS "Staff and Patients view order items" ON diagnostic_order_items;
CREATE POLICY "Staff and Patients view order items" ON diagnostic_order_items
  FOR SELECT USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM diagnostic_orders o 
      WHERE o.id = diagnostic_order_items.order_id 
        AND (has_branch_access(o.branch_id) OR o.assigned_phlebotomist_id = auth.uid() OR EXISTS (
          SELECT 1 FROM patients p WHERE p.id = o.patient_id AND p.profile_id = auth.uid()
        ))
    )
  );

DROP POLICY IF EXISTS "Staff manage order items" ON diagnostic_order_items;
CREATE POLICY "Staff manage order items" ON diagnostic_order_items
  FOR ALL USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM diagnostic_orders o 
      WHERE o.id = diagnostic_order_items.order_id 
        AND has_branch_access(o.branch_id)
    )
  ) WITH CHECK (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM diagnostic_orders o 
      WHERE o.id = diagnostic_order_items.order_id 
        AND has_branch_access(o.branch_id)
    )
  );

DROP POLICY IF EXISTS "Staff view order status history" ON diagnostic_order_status_history;
CREATE POLICY "Staff view order status history" ON diagnostic_order_status_history
  FOR SELECT USING (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM diagnostic_orders o 
      WHERE o.id = diagnostic_order_status_history.order_id 
        AND (has_branch_access(o.branch_id) OR o.assigned_phlebotomist_id = auth.uid() OR EXISTS (
          SELECT 1 FROM patients p WHERE p.id = o.patient_id AND p.profile_id = auth.uid()
        ))
    )
  );

DROP POLICY IF EXISTS "Staff insert order status history" ON diagnostic_order_status_history;
CREATE POLICY "Staff insert order status history" ON diagnostic_order_status_history
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR
    EXISTS (
      SELECT 1 FROM diagnostic_orders o 
      WHERE o.id = diagnostic_order_status_history.order_id 
        AND (has_branch_access(o.branch_id) OR o.assigned_phlebotomist_id = auth.uid())
    )
  );

-- 10. Audit Logs Policies (Strictly append-only by system, viewable only by super_admin)
DROP POLICY IF EXISTS "SuperAdmin views audit logs" ON audit_logs;
CREATE POLICY "SuperAdmin views audit logs" ON audit_logs
  FOR SELECT USING (has_role('super_admin'));

DROP POLICY IF EXISTS "System insert audit logs" ON audit_logs;
CREATE POLICY "System insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- 11. Idempotency & Notifications (System operations)
DROP POLICY IF EXISTS "SuperAdmin views idempotency keys" ON idempotency_keys;
CREATE POLICY "SuperAdmin views idempotency keys" ON idempotency_keys
  FOR SELECT USING (has_role('super_admin'));

DROP POLICY IF EXISTS "System manage idempotency keys" ON idempotency_keys;
CREATE POLICY "System manage idempotency keys" ON idempotency_keys
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SuperAdmin views notification jobs" ON notification_jobs;
CREATE POLICY "SuperAdmin views notification jobs" ON notification_jobs
  FOR SELECT USING (has_role('super_admin'));

DROP POLICY IF EXISTS "System manage notification jobs" ON notification_jobs;
CREATE POLICY "System manage notification jobs" ON notification_jobs
  FOR ALL USING (true) WITH CHECK (true);
