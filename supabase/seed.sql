-- ==============================================================================
-- CAPSIC CARE OS — SYNTHETIC DEVELOPMENT SEED DATA
-- ==============================================================================
-- Purpose: Populates fictional organization, branch, doctors, patients,
--          catalogue items, prices, schedules, and sample appointments for local dev.
-- Standard: Idempotent (ON CONFLICT DO NOTHING / UPDATE), clearly synthetic.
-- ==============================================================================

DO $$
DECLARE
  v_org_id UUID := '11111111-1111-4111-a111-111111111111'::uuid;
  v_branch_id UUID := '22222222-2222-4222-a222-222222222222'::uuid;
  v_doc1_id UUID := '33333333-3333-4333-a333-333333333331'::uuid;
  v_doc2_id UUID := '33333333-3333-4333-a333-333333333332'::uuid;
  v_patient1_id UUID := '44444444-4444-4444-a444-444444444441'::uuid;
  v_patient2_id UUID := '44444444-4444-4444-a444-444444444442'::uuid;
  v_cat_blood UUID := '55555555-5555-4555-a555-555555555551'::uuid;
  v_cat_cardiac UUID := '55555555-5555-4555-a555-555555555552'::uuid;
  v_cat_diabetes UUID := '55555555-5555-4555-a555-555555555553'::uuid;
  v_test_cbc UUID := '66666666-6666-4666-a666-666666666661'::uuid;
  v_test_lipid UUID := '66666666-6666-4666-a666-666666666662'::uuid;
  v_test_hba1c UUID := '66666666-6666-4666-a666-666666666663'::uuid;
  v_pkg_basic UUID := '77777777-7777-4777-a777-777777777771'::uuid;
BEGIN

  -- 1. Fictional Organization
  INSERT INTO organizations (id, name, code, is_active, metadata)
  VALUES (
    v_org_id,
    'Capsic Care Health Network (Synthetic Dev)',
    'CAPSIC_CARE_DEV',
    true,
    '{"mode": "synthetic_test"}'::jsonb
  ) ON CONFLICT (code) DO NOTHING;

  -- 2. Fictional Branch
  INSERT INTO branches (
    id, organization_id, code, name, address, city, district, state, pincode, phone, email, timezone, is_headquarters, is_active
  ) VALUES (
    v_branch_id,
    v_org_id,
    'HOWRAH_BANKRA_CENTRAL',
    'Bankra Central Diagnostic Hub (Synthetic)',
    'Bankra Bazar, Dewan Para Road, Domjur',
    'Howrah',
    'Howrah',
    'West Bengal',
    '711403',
    '+918910260709',
    'support@capsic.in',
    'Asia/Kolkata',
    true,
    true
  ) ON CONFLICT (code) DO NOTHING;

  -- 3. Diagnostic Categories
  INSERT INTO diagnostic_categories (id, organization_id, code, name, slug, description, display_order, is_active)
  VALUES 
    (v_cat_blood, v_org_id, 'CAT-HEM', 'Haematology & Blood Work', 'blood-work', 'Routine complete blood counts and cellular evaluations', 1, true),
    (v_cat_cardiac, v_org_id, 'CAT-CARD', 'Cardiac & Lipid Evaluation', 'cardiac-health', 'Lipid panels and cardiac health markers', 2, true),
    (v_cat_diabetes, v_org_id, 'CAT-DIAB', 'Diabetes & Metabolic Care', 'diabetes-panel', 'Blood glucose, HbA1c, and metabolic markers', 3, true)
  ON CONFLICT (code) DO NOTHING;

  -- 4. Diagnostic Tests
  INSERT INTO diagnostic_tests (
    id, organization_id, code, name, slug, category_id, sample_type, fasting_required, fasting_hours, turnaround_hours, home_collection_supported, is_active
  ) VALUES
    (v_test_cbc, v_org_id, 'TEST-CBC-01', 'Complete Blood Count (CBC - 26 Parameters)', 'complete-blood-count-cbc', v_cat_blood, 'Blood (EDTA)', false, 0, 24, true, true),
    (v_test_lipid, v_org_id, 'TEST-LIPID-01', 'Lipid Profile (Cholesterol & Triglycerides)', 'lipid-profile', v_cat_cardiac, 'Blood (Serum)', true, 12, 24, true, true),
    (v_test_hba1c, v_org_id, 'TEST-HBA1C-01', 'HbA1c (Glycated Haemoglobin)', 'hba1c-glycated-haemoglobin', v_cat_diabetes, 'Blood (EDTA)', false, 0, 24, true, true)
  ON CONFLICT (code) DO NOTHING;

  -- 5. Diagnostic Packages
  INSERT INTO diagnostic_packages (
    id, organization_id, code, name, slug, badge, description, is_active
  ) VALUES (
    v_pkg_basic,
    v_org_id,
    'PKG-BASIC-01',
    'Basic Preventive Health Checkup',
    'basic-health-checkup',
    'MOST POPULAR',
    'Comprehensive full body baseline screening including CBC, Lipid Profile, and Blood Glucose',
    true
  ) ON CONFLICT (code) DO NOTHING;

  -- Link tests to package
  INSERT INTO diagnostic_package_items (package_id, test_id, display_order)
  VALUES
    (v_pkg_basic, v_test_cbc, 1),
    (v_pkg_basic, v_test_lipid, 2),
    (v_pkg_basic, v_test_hba1c, 3)
  ON CONFLICT (package_id, test_id) DO NOTHING;

  -- 6. Diagnostic Prices (Monetary values in integer paise)
  -- CBC: 249 INR (24900 paise), MRP 499 INR (49900 paise)
  INSERT INTO diagnostic_prices (organization_id, item_type, test_id, price_paise, mrp_paise, is_active)
  VALUES (v_org_id, 'test', v_test_cbc, 24900, 49900, true)
  ON CONFLICT DO NOTHING;

  -- Lipid Profile: 399 INR (39900 paise), MRP 599 INR (59900 paise)
  INSERT INTO diagnostic_prices (organization_id, item_type, test_id, price_paise, mrp_paise, is_active)
  VALUES (v_org_id, 'test', v_test_lipid, 39900, 59900, true)
  ON CONFLICT DO NOTHING;

  -- Basic Package: 599 INR (59900 paise), MRP 1199 INR (119900 paise)
  INSERT INTO diagnostic_prices (organization_id, item_type, package_id, price_paise, mrp_paise, is_active)
  VALUES (v_org_id, 'package', v_pkg_basic, 59900, 119900, true)
  ON CONFLICT DO NOTHING;

  -- 7. Fictional Doctors
  INSERT INTO doctors (
    id, organization_id, code, name, slug, specialty, designation, qualifications, registration_number, experience_years, physical_fee_paise, telemedicine_fee_paise, follow_up_fee_paise, about, is_active
  ) VALUES 
    (
      v_doc1_id,
      v_org_id,
      'DOC-SKD-01',
      'Dr. Sanjoy Kumar Dey (Synthetic)',
      'dr-sanjay-kumar-dey',
      'Pediatrics & Neonatology',
      'Senior Child Specialist & Neonatologist',
      'MBBS, D.C.H, IAP Life Member',
      'WBMC 46483',
      35,
      40000, -- 400 INR physical
      40000, -- 400 INR telemedicine
      40000,
      'Senior pediatrician and neonatologist with over 35 years of clinical practice in child wellness and newborn care.',
      true
    ),
    (
      v_doc2_id,
      v_org_id,
      'DOC-TM-01',
      'Dr. Tooneer Mallik (Synthetic)',
      'dr-tooneer-mallik',
      'Family Medicine & General Health',
      'Consultant Family Physician',
      'MBBS, DNB (Medicine)',
      'WBMC 86887',
      5,
      30000, -- 300 INR physical
      30000, -- 300 INR telemedicine
      0,     -- Free follow-up
      'Consultant family physician dedicated to comprehensive holistic health, chronic disease care, and wellness checks.',
      true
    )
  ON CONFLICT (code) DO NOTHING;

  -- Affiliate doctors to branch
  INSERT INTO doctor_branches (doctor_id, branch_id, is_primary)
  VALUES
    (v_doc1_id, v_branch_id, true),
    (v_doc2_id, v_branch_id, true)
  ON CONFLICT (doctor_id, branch_id) DO NOTHING;

  -- Doctor schedules
  INSERT INTO doctor_schedules (
    doctor_id, branch_id, consultation_type, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active
  ) VALUES
    (v_doc1_id, v_branch_id, 'physical', 1, '13:00'::time, '14:00'::time, 15, 1, true),
    (v_doc1_id, v_branch_id, 'telemedicine', 1, '09:00'::time, '17:00'::time, 20, 1, true),
    (v_doc2_id, v_branch_id, 'physical', 1, '11:00'::time, '12:00'::time, 15, 1, true),
    (v_doc2_id, v_branch_id, 'telemedicine', 1, '14:00'::time, '16:00'::time, 15, 1, true)
  ON CONFLICT DO NOTHING;

  -- 8. Fictional Patients (Decoupled from auth identity)
  INSERT INTO patients (
    id, organization_id, primary_branch_id, uhid, full_name, phone, gender, date_of_birth, age_years, address_line1, city, district, state, pincode, is_active
  ) VALUES
    (
      v_patient1_id,
      v_org_id,
      v_branch_id,
      'CC-2026-SYN001',
      'Rahul Sen (Synthetic)',
      '+919876543210',
      'male',
      '1985-06-15'::date,
      41,
      'Flat 4B, Green View Apartments, Bankra',
      'Howrah',
      'Howrah',
      'West Bengal',
      '711403',
      true
    ),
    (
      v_patient2_id,
      v_org_id,
      v_branch_id,
      'CC-2026-SYN002',
      'Fatima Begum (Synthetic)',
      '+919876543211',
      'female',
      '1992-09-22'::date,
      34,
      'Dewan Para Main Road, Near Market',
      'Howrah',
      'Howrah',
      'West Bengal',
      '711403',
      true
    )
  ON CONFLICT (uhid) DO NOTHING;

  -- 9. Sample Synthetic Appointment
  INSERT INTO appointments (
    organization_id, branch_id, doctor_id, patient_id, appointment_number, consultation_type, scheduled_date, start_time, end_time, fee_paise, status, booking_source
  ) VALUES (
    v_org_id,
    v_branch_id,
    v_doc1_id,
    v_patient1_id,
    'APT-2026-SYN0001',
    'physical',
    CURRENT_DATE + INTERVAL '1 day',
    '13:00'::time,
    '13:15'::time,
    40000,
    'confirmed',
    'web'
  ) ON CONFLICT (appointment_number) DO NOTHING;

  -- 10. Sample Synthetic Diagnostic Order
  INSERT INTO diagnostic_orders (
    organization_id, branch_id, patient_id, order_number, status, fulfillment_type, collection_address, collection_pincode, scheduled_collection_date, scheduled_slot, subtotal_paise, discount_paise, collection_fee_paise, total_paise, payment_status, payment_mode
  ) VALUES (
    v_org_id,
    v_branch_id,
    v_patient2_id,
    'ORD-2026-SYN0001',
    'placed',
    'home_collection',
    'Dewan Para Main Road, Near Market',
    '711403',
    CURRENT_DATE + INTERVAL '1 day',
    '08:00 AM - 09:00 AM',
    59900,
    0,
    0,
    59900,
    'unpaid',
    'cash'
  ) ON CONFLICT (order_number) DO NOTHING;

END $$;
