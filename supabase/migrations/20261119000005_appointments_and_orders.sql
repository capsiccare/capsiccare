-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 005: APPOINTMENTS & DIAGNOSTIC ORDERS
-- ==============================================================================
-- Scope: Doctor Appointments, Status History, Diagnostic Orders, Order Items,
--        and Overlap Prevention Trigger
-- Monetary Units: Integer paise
-- ==============================================================================

-- 1. Appointments Master
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'APT-2026-00001'
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  consultation_type VARCHAR(30) NOT NULL CHECK (consultation_type IN ('physical', 'telemedicine')),
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  fee_paise INT NOT NULL DEFAULT 0 CHECK (fee_paise >= 0),
  status VARCHAR(40) NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show')
  ),
  booking_source VARCHAR(40) NOT NULL DEFAULT 'web' CHECK (
    booking_source IN ('web', 'mobile', 'call_center', 'reception', 'partner')
  ),
  token_number INT,
  chief_complaint TEXT,
  cancellation_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_branch ON appointments(branch_id);

-- Overlap Prevention Trigger for Active Doctor Appointments
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate non-cancelled appointments
  IF NEW.status NOT IN ('cancelled', 'no_show') THEN
    IF EXISTS (
      SELECT 1 FROM appointments
      WHERE doctor_id = NEW.doctor_id
        AND scheduled_date = NEW.scheduled_date
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status NOT IN ('cancelled', 'no_show')
        AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
    ) THEN
      RAISE EXCEPTION 'Doctor is already booked for an overlapping consultation on % between % and %',
        NEW.scheduled_date, NEW.start_time, NEW.end_time;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_appointment_overlap ON appointments;
CREATE TRIGGER trg_prevent_appointment_overlap
BEFORE INSERT OR UPDATE OF doctor_id, scheduled_date, start_time, end_time, status
ON appointments
FOR EACH ROW
EXECUTE FUNCTION check_appointment_overlap();

-- 2. Appointment Status History
CREATE TABLE IF NOT EXISTS appointment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  from_status VARCHAR(40),
  to_status VARCHAR(40) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apt_status_history_apt ON appointment_status_history(appointment_id);

-- 3. Diagnostic Orders Master
CREATE TABLE IF NOT EXISTS diagnostic_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'ORD-2026-00001'
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  status VARCHAR(40) NOT NULL DEFAULT 'placed' CHECK (
    status IN ('draft', 'placed', 'confirmed', 'phlebotomist_assigned', 'sample_collected', 'in_transit', 'received_at_lab', 'processing', 'partially_reported', 'completed', 'cancelled')
  ),
  fulfillment_type VARCHAR(40) NOT NULL DEFAULT 'home_collection' CHECK (
    fulfillment_type IN ('home_collection', 'center_visit')
  ),
  collection_address TEXT,
  collection_landmark TEXT,
  collection_pincode VARCHAR(10),
  collection_city VARCHAR(100) DEFAULT 'Howrah',
  scheduled_collection_date DATE,
  scheduled_slot VARCHAR(50),
  assigned_phlebotomist_id UUID REFERENCES profiles(id),
  subtotal_paise INT NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
  discount_paise INT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  collection_fee_paise INT NOT NULL DEFAULT 0 CHECK (collection_fee_paise >= 0),
  total_paise INT NOT NULL DEFAULT 0 CHECK (total_paise >= 0),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')
  ),
  payment_mode VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (
    payment_mode IN ('cash', 'upi', 'card', 'online', 'unpaid')
  ),
  promo_code VARCHAR(50),
  partner_code VARCHAR(50),
  special_instructions TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_orders_patient ON diagnostic_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_diag_orders_status ON diagnostic_orders(status);
CREATE INDEX IF NOT EXISTS idx_diag_orders_branch ON diagnostic_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_diag_orders_phleb ON diagnostic_orders(assigned_phlebotomist_id);

-- 4. Diagnostic Order Items (Line Items)
CREATE TABLE IF NOT EXISTS diagnostic_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('test', 'package')),
  test_id UUID REFERENCES diagnostic_tests(id) ON DELETE RESTRICT,
  package_id UUID REFERENCES diagnostic_packages(id) ON DELETE RESTRICT,
  item_name VARCHAR(255) NOT NULL,
  item_code VARCHAR(50) NOT NULL,
  unit_price_paise INT NOT NULL CHECK (unit_price_paise >= 0),
  discount_paise INT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  final_price_paise INT NOT NULL CHECK (final_price_paise >= 0),
  sample_barcode VARCHAR(100),
  status VARCHAR(40) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sample_collected', 'processing', 'reported', 'cancelled')
  ),
  report_url TEXT,
  reported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (item_type = 'test' AND test_id IS NOT NULL AND package_id IS NULL) OR
    (item_type = 'package' AND package_id IS NOT NULL AND test_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_diag_order_items_order ON diagnostic_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_diag_order_items_barcode ON diagnostic_order_items(sample_barcode);

-- 5. Diagnostic Order Status History
CREATE TABLE IF NOT EXISTS diagnostic_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,
  from_status VARCHAR(40),
  to_status VARCHAR(40) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_order_history_order ON diagnostic_order_status_history(order_id);
