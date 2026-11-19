-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 007: CHAMBERS & SCHEDULING ENHANCEMENTS
-- ==============================================================================
-- Scope: Chambers Master, Chamber Overlap Triggers, Appointment Lifecycle Timestamps,
--        and Waiting Status Support
-- ==============================================================================

-- 1. Chambers Master
CREATE TABLE IF NOT EXISTS chambers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  floor VARCHAR(50) DEFAULT 'Ground Floor',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_branch_room UNIQUE (branch_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_chambers_org ON chambers(organization_id);
CREATE INDEX IF NOT EXISTS idx_chambers_branch ON chambers(branch_id);
CREATE INDEX IF NOT EXISTS idx_chambers_active ON chambers(is_active);

-- Enable RLS on chambers
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active chambers"
  ON chambers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow full access for authenticated users to chambers"
  ON chambers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to chambers"
  ON chambers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Link Chamber to Doctor Schedules
ALTER TABLE doctor_schedules 
  ADD COLUMN IF NOT EXISTS chamber_id UUID REFERENCES chambers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_chamber ON doctor_schedules(chamber_id);

-- 3. Link Chamber and Lifecycle Timestamps to Appointments
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS chamber_id UUID REFERENCES chambers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consultation_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consultation_end_time TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_appointments_chamber_date ON appointments(chamber_id, scheduled_date);

-- 4. Update Status Check Constraint to include 'waiting'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'waiting', 'in_consultation', 'completed', 'cancelled', 'no_show'));

-- 5. Enhanced Overlap Prevention Trigger (Doctor and Chamber Overlap Protection)
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate non-cancelled and non-no_show appointments
  IF NEW.status NOT IN ('cancelled', 'no_show') THEN
    -- Check 1: Doctor overlap (a doctor cannot be booked for 2 simultaneous consultations)
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

    -- Check 2: Chamber overlap (two physical appointments cannot occupy the same chamber simultaneously)
    IF NEW.chamber_id IS NOT NULL AND NEW.consultation_type = 'physical' THEN
      IF EXISTS (
        SELECT 1 FROM appointments
        WHERE chamber_id = NEW.chamber_id
          AND scheduled_date = NEW.scheduled_date
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND status NOT IN ('cancelled', 'no_show')
          AND consultation_type = 'physical'
          AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
      ) THEN
        RAISE EXCEPTION 'Chamber is already reserved for an overlapping appointment on % between % and %',
          NEW.scheduled_date, NEW.start_time, NEW.end_time;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Seed Default Chambers for Synthetic Development Branch
INSERT INTO chambers (id, organization_id, branch_id, name, room_number, floor, is_active)
VALUES 
  (
    '55555555-5555-5555-a555-555555555551',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'Chamber 101 - General & Family Medicine',
    'Room 101',
    'Ground Floor',
    true
  ),
  (
    '55555555-5555-5555-a555-555555555552',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'Chamber 102 - Pediatrics & Neonatology',
    'Room 102',
    'Ground Floor',
    true
  ),
  (
    '55555555-5555-5555-a555-555555555553',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'Chamber 103 - Specialist Consultations',
    'Room 103',
    'First Floor',
    true
  )
ON CONFLICT (branch_id, room_number) DO UPDATE
SET name = EXCLUDED.name, floor = EXCLUDED.floor, is_active = true;

-- Link existing doctor schedules to chambers
UPDATE doctor_schedules
SET chamber_id = '55555555-5555-5555-a555-555555555552'
WHERE doctor_id = '33333333-3333-4333-a333-333333333331' AND chamber_id IS NULL; -- Dr. Sanjoy Kumar Dey (Pediatrics)

UPDATE doctor_schedules
SET chamber_id = '55555555-5555-5555-a555-555555555551'
WHERE doctor_id = '33333333-3333-4333-a333-333333333332' AND chamber_id IS NULL; -- Dr. Tooneer Mallik (General)
