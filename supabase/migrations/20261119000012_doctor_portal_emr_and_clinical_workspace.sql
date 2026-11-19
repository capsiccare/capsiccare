-- ==============================================================================
-- CAPSIC CARE OS — STEP 10: DOCTOR PORTAL, EMR, E-PRESCRIPTION & CLINICAL WORKSPACE
-- Migration: 20261119000012_doctor_portal_emr_and_clinical_workspace.sql
-- ==============================================================================

-- 1. MEDICINES MASTER (Centralized Clinical Formulary & Catalogue)
CREATE TABLE IF NOT EXISTS public.medicines_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(50) NOT NULL, -- tablet, capsule, syrup, injection, ointment, drops, inhaler, powder
    strength VARCHAR(100) NOT NULL,    -- 500mg, 625mg, 5mg/ml, etc.
    strength_unit VARCHAR(30) DEFAULT 'mg',
    route VARCHAR(50) NOT NULL DEFAULT 'oral', -- oral, topical, iv, im, sc, inhalation, ophthalmic, otic
    therapeutic_class VARCHAR(150),
    standard_code VARCHAR(100),       -- RxNorm, IP, ATC code
    combination_ingredients JSONB DEFAULT '[]'::jsonb, -- Array of { ingredient: string, strength: string }
    schedule_category VARCHAR(30) DEFAULT 'Schedule H', -- OTC, Schedule H, Schedule H1, Schedule X, Schedule G
    prescription_required BOOLEAN NOT NULL DEFAULT true,
    is_essential BOOLEAN NOT NULL DEFAULT false,
    clinical_review_status VARCHAR(50) NOT NULL DEFAULT 'approved', -- approved, under_review, deprecated
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON public.medicines_master(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name ON public.medicines_master(brand_name);
CREATE INDEX IF NOT EXISTS idx_medicines_therapeutic_class ON public.medicines_master(therapeutic_class);

-- 2. CLINICAL ENCOUNTERS (Consultation Records)
CREATE TABLE IF NOT EXISTS public.clinical_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_number VARCHAR(50) NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    encounter_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress', -- in_progress, completed, cancelled
    consultation_type VARCHAR(30) NOT NULL DEFAULT 'physical', -- physical, telemedicine, follow_up
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    review_of_systems JSONB DEFAULT '{}'::jsonb,
    physical_examination TEXT,
    assessment TEXT,
    treatment_plan TEXT,
    advice TEXT,
    follow_up_instructions TEXT,
    follow_up_date DATE,
    specialty_data JSONB DEFAULT '{}'::jsonb, -- e.g. pediatric growth, gynaecological history, ortho ROM
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON public.clinical_encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_doctor_id ON public.clinical_encounters(doctor_id);
CREATE INDEX IF NOT EXISTS idx_encounters_appointment_id ON public.clinical_encounters(appointment_id);
CREATE INDEX IF NOT EXISTS idx_encounters_date ON public.clinical_encounters(encounter_date);

-- 3. CLINICAL VITALS (Structured Vital Signs)
CREATE TABLE IF NOT EXISTS public.clinical_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES public.clinical_encounters(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    pulse_rate INT,
    temperature_f NUMERIC(4,1),
    spo2_percent NUMERIC(4,1),
    respiratory_rate INT,
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    bmi NUMERIC(4,1),
    blood_glucose_mg_dl NUMERIC(5,1),
    glucose_type VARCHAR(30), -- fasting, post_prandial, random
    pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON public.clinical_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_encounter_id ON public.clinical_vitals(encounter_id);
CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON public.clinical_vitals(recorded_at);

-- 4. CLINICAL DIAGNOSES (ICD-10 & Clinical Findings)
CREATE TABLE IF NOT EXISTS public.clinical_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES public.clinical_encounters(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    diagnosis_text TEXT NOT NULL,
    icd10_code VARCHAR(30),
    diagnosis_type VARCHAR(30) NOT NULL DEFAULT 'provisional', -- provisional, confirmed, differential
    is_chronic BOOLEAN NOT NULL DEFAULT false,
    onset_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_encounter_id ON public.clinical_diagnoses(encounter_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON public.clinical_diagnoses(patient_id);

-- 5. PATIENT ALLERGIES
CREATE TABLE IF NOT EXISTS public.patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    allergen_type VARCHAR(50) NOT NULL DEFAULT 'drug', -- drug, food, environmental, other
    allergen_name VARCHAR(255) NOT NULL,
    reaction TEXT,
    severity VARCHAR(30) NOT NULL DEFAULT 'moderate', -- mild, moderate, severe, life_threatening
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- active, resolved, suspected
    verified_by_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_allergies_patient_id ON public.patient_allergies(patient_id);

-- 6. PATIENT CHRONIC CONDITIONS
CREATE TABLE IF NOT EXISTS public.patient_chronic_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(30),
    diagnosed_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- active, controlled, remission
    management_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON public.patient_chronic_conditions(patient_id);

-- 7. PRESCRIPTIONS (Digital Prescriptions Header)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_number VARCHAR(50) NOT NULL UNIQUE,
    encounter_id UUID REFERENCES public.clinical_encounters(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- draft, reviewed, signed, finalized, amended, cancelled
    prescription_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    prescriber_name VARCHAR(255) NOT NULL,
    prescriber_reg_no VARCHAR(100),
    prescriber_qualifications VARCHAR(255),
    diagnosis_summary TEXT,
    advice_general TEXT,
    diet_lifestyle_advice TEXT,
    follow_up_date DATE,
    follow_up_reason TEXT,
    digital_signature_hash TEXT,
    signed_at TIMESTAMPTZ,
    signed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    immutable_snapshot JSONB DEFAULT NULL,
    amended_from_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    amendment_reason TEXT,
    is_delivered BOOLEAN NOT NULL DEFAULT false,
    delivered_via VARCHAR(50), -- whatsapp, sms, print, email
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_encounter_id ON public.prescriptions(encounter_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_number ON public.prescriptions(prescription_number);

-- 8. PRESCRIPTION ITEMS (Line Items)
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines_master(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand_name VARCHAR(255),
    dosage_form VARCHAR(50) NOT NULL DEFAULT 'tablet',
    strength VARCHAR(100) NOT NULL DEFAULT '500mg',
    dose VARCHAR(50) NOT NULL DEFAULT '1 tablet',
    route VARCHAR(50) NOT NULL DEFAULT 'Oral',
    frequency VARCHAR(50) NOT NULL DEFAULT '1-0-1', -- 1-0-1, 1-0-0, 0-0-1, 1-1-1, TDS, BD, OD, SOS
    timing VARCHAR(50) NOT NULL DEFAULT 'after_food', -- before_food, after_food, with_food, empty_stomach, at_bedtime, as_directed
    duration_value INT NOT NULL DEFAULT 5,
    duration_unit VARCHAR(20) NOT NULL DEFAULT 'days', -- days, weeks, months, sos
    quantity INT NOT NULL DEFAULT 10,
    is_prn BOOLEAN NOT NULL DEFAULT false,
    prn_condition TEXT,
    special_instructions TEXT,
    instructions_bengali TEXT,
    instructions_hindi TEXT,
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescription_items_rx_id ON public.prescription_items(prescription_id);

-- 9. CONSULTATION INVESTIGATION REQUESTS (Diagnostic Orders from Doctor)
CREATE TABLE IF NOT EXISTS public.consultation_investigation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES public.clinical_encounters(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    diagnostic_test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE SET NULL,
    test_name VARCHAR(255) NOT NULL,
    clinical_indication TEXT,
    priority VARCHAR(30) NOT NULL DEFAULT 'routine', -- routine, urgent, stat
    status VARCHAR(30) NOT NULL DEFAULT 'recommended', -- recommended, ordered, completed
    diagnostic_order_id UUID REFERENCES public.diagnostic_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigation_requests_encounter ON public.consultation_investigation_requests(encounter_id);
CREATE INDEX IF NOT EXISTS idx_investigation_requests_patient ON public.consultation_investigation_requests(patient_id);

-- 10. CLINICAL TEMPLATES & FAVORITES
CREATE TABLE IF NOT EXISTS public.clinical_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE, -- NULL for org-wide templates
    specialty VARCHAR(100),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL DEFAULT 'soap', -- soap, specialty, prescription_bundle, advice
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_templates_doctor ON public.clinical_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_templates_specialty ON public.clinical_templates(specialty);

-- 11. DOCTOR FAVORITES (Medicines & Tests)
CREATE TABLE IF NOT EXISTS public.doctor_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL, -- medicine, investigation
    medicine_id UUID REFERENCES public.medicines_master(id) ON DELETE CASCADE,
    diagnostic_test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    custom_name VARCHAR(255),
    dosage_preset JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, item_type, medicine_id, diagnostic_test_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_favorites_doctor ON public.doctor_favorites(doctor_id);

-- 12. CLINICAL DOCUMENTS (Certificates, Referrals, Outside Records)
CREATE TABLE IF NOT EXISTS public.clinical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL, -- referral_letter, medical_certificate, fitness_certificate, discharge_summary, outside_record
    title VARCHAR(255) NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    file_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- draft, signed, finalized
    signed_at TIMESTAMPTZ,
    digital_signature_hash TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_patient ON public.clinical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_documents_doctor ON public.clinical_documents(doctor_id);

-- 13. CLINICAL AUDIT EVENTS & BREAK-GLASS ACCESS LOGS
CREATE TABLE IF NOT EXISTS public.clinical_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- view_emr, sign_prescription, amend_prescription, break_glass_access, print_prescription, deliver_prescription
    reason TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_audit_patient ON public.clinical_audit_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_event_type ON public.clinical_audit_events(event_type);

-- 14. ROW-LEVEL SECURITY ENFORCEMENT
ALTER TABLE public.medicines_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_chronic_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_investigation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_audit_events ENABLE ROW LEVEL SECURITY;

-- Permissive Authenticated / System Policies
CREATE POLICY "medicines_master_auth_all" ON public.medicines_master FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clinical_encounters_auth_all" ON public.clinical_encounters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clinical_vitals_auth_all" ON public.clinical_vitals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clinical_diagnoses_auth_all" ON public.clinical_diagnoses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "patient_allergies_auth_all" ON public.patient_allergies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "patient_chronic_conditions_auth_all" ON public.patient_chronic_conditions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prescriptions_auth_all" ON public.prescriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prescription_items_auth_all" ON public.prescription_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "investigation_requests_auth_all" ON public.consultation_investigation_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clinical_templates_auth_all" ON public.clinical_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "doctor_favorites_auth_all" ON public.doctor_favorites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clinical_documents_auth_all" ON public.clinical_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clinical_audit_events_auth_all" ON public.clinical_audit_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 15. SEED ESSENTIAL INDIAN FORMULARY (Generic Medicines Master)
INSERT INTO public.medicines_master (
    generic_name, brand_name, manufacturer, dosage_form, strength, strength_unit, route, therapeutic_class, standard_code, schedule_category, prescription_required, is_essential
) VALUES
-- Analgesics / Antipyretics
('Paracetamol', 'Dolo 650', 'Micro Labs Ltd', 'tablet', '650mg', 'mg', 'oral', 'Analgesic / Antipyretic', 'IP-PCM-650', 'OTC', false, true),
('Paracetamol', 'Calpol 500', 'GlaxoSmithKline', 'tablet', '500mg', 'mg', 'oral', 'Analgesic / Antipyretic', 'IP-PCM-500', 'OTC', false, true),
('Paracetamol', 'Calpol T suspension', 'GlaxoSmithKline', 'syrup', '250mg/5ml', 'mg', 'oral', 'Pediatric Antipyretic', 'IP-PCM-PED', 'OTC', false, true),
('Ibuprofen + Paracetamol', 'Combiflam', 'Sanofi India', 'tablet', '400mg + 325mg', 'mg', 'oral', 'NSAID Analgesic', 'IP-IBU-PCM', 'Schedule H', true, true),
('Aceclofenac + Paracetamol', 'Zerodol-P', 'Ipca Laboratories', 'tablet', '100mg + 325mg', 'mg', 'oral', 'NSAID Analgesic', 'IP-ACE-PCM', 'Schedule H', true, false),
('Tramadol + Paracetamol', 'Ultracet', 'Janssen', 'tablet', '37.5mg + 325mg', 'mg', 'oral', 'Opioid Analgesic', 'IP-TRA-PCM', 'Schedule H1', true, false),

-- Antibiotics & Anti-infectives
('Amoxicillin + Clavulanic Acid', 'Augmentin 625 Duo', 'GlaxoSmithKline', 'tablet', '500mg + 125mg', 'mg', 'oral', 'Penicillin Antibiotic', 'IP-AMX-CLV', 'Schedule H1', true, true),
('Amoxicillin + Clavulanic Acid', 'Moxikind-CV 625', 'Mankind Pharma', 'tablet', '500mg + 125mg', 'mg', 'oral', 'Penicillin Antibiotic', 'IP-AMX-CV', 'Schedule H1', true, true),
('Amoxicillin', 'Novamox 500', 'Cipla Ltd', 'capsule', '500mg', 'mg', 'oral', 'Penicillin Antibiotic', 'IP-AMX-500', 'Schedule H1', true, true),
('Azithromycin', 'Azithral 500', 'Alembic Pharma', 'tablet', '500mg', 'mg', 'oral', 'Macrolide Antibiotic', 'IP-AZI-500', 'Schedule H1', true, true),
('Azithromycin', 'Azee 250', 'Cipla Ltd', 'tablet', '250mg', 'mg', 'oral', 'Macrolide Antibiotic', 'IP-AZI-250', 'Schedule H1', true, true),
('Cefixime', 'Zifi 200', 'FDC Ltd', 'tablet', '200mg', 'mg', 'oral', 'Cephalosporin Antibiotic', 'IP-CFX-200', 'Schedule H1', true, true),
('Cefixime', 'Taxim-O 200', 'Alkem Laboratories', 'tablet', '200mg', 'mg', 'oral', 'Cephalosporin Antibiotic', 'IP-CFX-ALM', 'Schedule H1', true, true),
('Ciprofloxacin', 'Ciplox 500', 'Cipla Ltd', 'tablet', '500mg', 'mg', 'oral', 'Fluoroquinolone', 'IP-CIP-500', 'Schedule H1', true, true),
('Ofloxacin + Ornidazole', 'O2 Tablet', 'Medley Pharma', 'tablet', '200mg + 500mg', 'mg', 'oral', 'Antidiarrheal Antibiotic', 'IP-OFL-ORN', 'Schedule H1', true, false),
('Metronidazole', 'Flagyl 400', 'Abbott India', 'tablet', '400mg', 'mg', 'oral', 'Antiamoebic / Antibacterial', 'IP-MET-400', 'Schedule H', true, true),
('Doxycycline', 'Doxicip 100', 'Cipla Ltd', 'capsule', '100mg', 'mg', 'oral', 'Tetracycline Antibiotic', 'IP-DOX-100', 'Schedule H', true, true),

-- Gastrointestinal & Antacids
('Pantoprazole', 'Pan 40', 'Alkem Laboratories', 'tablet', '40mg', 'mg', 'oral', 'Proton Pump Inhibitor', 'IP-PAN-40', 'Schedule H', true, true),
('Pantoprazole + Domperidone', 'Pan-D', 'Alkem Laboratories', 'capsule', '40mg + 30mg SR', 'mg', 'oral', 'PPI + Antiemetic', 'IP-PAN-DOM', 'Schedule H', true, true),
('Rabeprazole', 'Razo 20', 'Dr. Reddys Laboratories', 'tablet', '20mg', 'mg', 'oral', 'Proton Pump Inhibitor', 'IP-RAB-20', 'Schedule H', true, true),
('Rabeprazole + Levosulpiride', 'Razo-L', 'Dr. Reddys Laboratories', 'capsule', '20mg + 75mg SR', 'mg', 'oral', 'PPI + Gastroprokinetic', 'IP-RAB-LEV', 'Schedule H', true, false),
('Omeprazole', 'Omez 20', 'Dr. Reddys Laboratories', 'capsule', '20mg', 'mg', 'oral', 'Proton Pump Inhibitor', 'IP-OME-20', 'Schedule H', true, true),
('Ondansetron', 'Emeset 4', 'Cipla Ltd', 'tablet', '4mg', 'mg', 'oral', 'Antiemetic', 'IP-OND-4', 'Schedule H', true, true),
('Ondansetron', 'Vomikind Syrup', 'Mankind Pharma', 'syrup', '2mg/5ml', 'mg', 'oral', 'Pediatric Antiemetic', 'IP-OND-PED', 'Schedule H', true, true),
('Sucralfate + Oxetacaine', 'Sucrafil O Suspension', 'Fourrts India', 'syrup', '1000mg + 20mg/10ml', 'mg', 'oral', 'Ulcer Protectant', 'IP-SUC-OXE', 'Schedule H', true, false),

-- Cardiovascular & Antihypertensives
('Telmisartan', 'Telma 40', 'Glenmark Pharma', 'tablet', '40mg', 'mg', 'oral', 'Angiotensin Receptor Blocker', 'IP-TEL-40', 'Schedule H', true, true),
('Telmisartan + Amlodipine', 'Telma-AM', 'Glenmark Pharma', 'tablet', '40mg + 5mg', 'mg', 'oral', 'ARB + Calcium Channel Blocker', 'IP-TEL-AML', 'Schedule H', true, true),
('Telmisartan + Hydrochlorothiazide', 'Telma-H', 'Glenmark Pharma', 'tablet', '40mg + 12.5mg', 'mg', 'oral', 'ARB + Thiazide Diuretic', 'IP-TEL-HCT', 'Schedule H', true, true),
('Amlodipine', 'Amlong 5', 'Micro Labs Ltd', 'tablet', '5mg', 'mg', 'oral', 'Calcium Channel Blocker', 'IP-AML-5', 'Schedule H', true, true),
('Enalapril', 'Envas 5', 'Cadila Healthcare', 'tablet', '5mg', 'mg', 'oral', 'ACE Inhibitor', 'IP-ENA-5', 'Schedule H', true, true),
('Metoprolol Succinate', 'Metolar-XR 25', 'Cipla Ltd', 'tablet', '25mg', 'mg', 'oral', 'Beta Blocker', 'IP-MET-XR25', 'Schedule H', true, true),
('Atorvastatin', 'Atorva 10', 'Zydus Cadila', 'tablet', '10mg', 'mg', 'oral', 'Statin / Lipid Lowering', 'IP-ATO-10', 'Schedule H', true, true),
('Atorvastatin', 'Atorva 20', 'Zydus Cadila', 'tablet', '20mg', 'mg', 'oral', 'Statin / Lipid Lowering', 'IP-ATO-20', 'Schedule H', true, true),
('Rosuvastatin', 'Rosuvas 10', 'Sun Pharma', 'tablet', '10mg', 'mg', 'oral', 'Statin / Lipid Lowering', 'IP-ROS-10', 'Schedule H', true, true),
('Aspirin', 'Ecosprin 75', 'USV Pvt Ltd', 'tablet', '75mg', 'mg', 'oral', 'Antiplatelet', 'IP-ASP-75', 'Schedule H', true, true),
('Clopidogrel', 'Clopilet 75', 'Sun Pharma', 'tablet', '75mg', 'mg', 'oral', 'Antiplatelet', 'IP-CLO-75', 'Schedule H', true, true),

-- Diabetes Mellitus
('Metformin', 'Glycomet 500', 'USV Pvt Ltd', 'tablet', '500mg', 'mg', 'oral', 'Biguanide Antidiabetic', 'IP-MET-500', 'Schedule H', true, true),
('Metformin PR', 'Glycomet-SR 500', 'USV Pvt Ltd', 'tablet', '500mg SR', 'mg', 'oral', 'Biguanide Antidiabetic', 'IP-MET-SR500', 'Schedule H', true, true),
('Glimepiride + Metformin', 'Glycomet-GP 1', 'USV Pvt Ltd', 'tablet', '1mg + 500mg SR', 'mg', 'oral', 'Sulfonylurea + Biguanide', 'IP-GLI-MET1', 'Schedule H', true, true),
('Glimepiride + Metformin', 'Glycomet-GP 2', 'USV Pvt Ltd', 'tablet', '2mg + 500mg SR', 'mg', 'oral', 'Sulfonylurea + Biguanide', 'IP-GLI-MET2', 'Schedule H', true, true),
('Teneligliptin', 'Ziten 20', 'Glenmark Pharma', 'tablet', '20mg', 'mg', 'oral', 'DPP-4 Inhibitor', 'IP-TEN-20', 'Schedule H', true, true),
('Dapagliflozin', 'Forxiga 10', 'AstraZeneca', 'tablet', '10mg', 'mg', 'oral', 'SGLT2 Inhibitor', 'IP-DAP-10', 'Schedule H', true, true),
('Vildagliptin + Metformin', 'Galvus Met 50/500', 'Novartis', 'tablet', '50mg + 500mg', 'mg', 'oral', 'DPP-4 Inhibitor + Biguanide', 'IP-VIL-MET', 'Schedule H', true, true),

-- Respiratory, Cough & Allergy
('Montelukast + Levocetirizine', 'Montair-LC', 'Cipla Ltd', 'tablet', '10mg + 5mg', 'mg', 'oral', 'Leukotriene Receptor Antagonist', 'IP-MON-LEV', 'Schedule H', true, true),
('Montelukast + Levocetirizine', 'Montair-LC Kid Syrup', 'Cipla Ltd', 'syrup', '4mg + 2.5mg/5ml', 'mg', 'oral', 'Pediatric Antiallergic', 'IP-MON-KID', 'Schedule H', true, true),
('Levocetirizine', 'Vozet 5', 'Torrent Pharma', 'tablet', '5mg', 'mg', 'oral', 'Antihistamine', 'IP-LEV-5', 'Schedule H', true, true),
('Cetirizine', 'Cetzine 10', 'Dr. Reddys Laboratories', 'tablet', '10mg', 'mg', 'oral', 'Antihistamine', 'IP-CET-10', 'OTC', false, true),
('Salbutamol + Ipratropium', 'Duolin Inhaler', 'Cipla Ltd', 'inhaler', '100mcg + 20mcg', 'mcg', 'inhalation', 'Bronchodilator MDI', 'IP-SAL-IPR', 'Schedule H', true, true),
('Budecort Inhaler', 'Budecort 200 Inhaler', 'Cipla Ltd', 'inhaler', '200mcg', 'mcg', 'inhalation', 'Inhaled Corticosteroid', 'IP-BUD-200', 'Schedule H', true, true),
('Dextromethorphan + Chlorpheniramine', 'Ascoril-D Plus Syrup', 'Glenmark Pharma', 'syrup', '10mg + 2mg/5ml', 'mg', 'oral', 'Cough Suppressant', 'IP-DEX-CPM', 'Schedule H', true, false),

-- Vitamins, Minerals & Hematinics
('Vitamin D3', 'Calcirol 60K Granules', 'Cadila Pharma', 'powder', '60,000 IU', 'IU', 'oral', 'Vitamin D Supplement', 'IP-VIT-D3', 'OTC', false, true),
('Calcium + Vitamin D3', 'Shelcal 500', 'Torrent Pharma', 'tablet', '500mg + 250 IU', 'mg', 'oral', 'Bone Health Mineral', 'IP-SHE-500', 'OTC', false, true),
('Ferrous Ascorbate + Folic Acid', 'Orofer-XT', 'Emcure Pharma', 'tablet', '100mg + 1.5mg', 'mg', 'oral', 'Hematinic / Iron Supplement', 'IP-ORO-XT', 'OTC', false, true),
('Vitamin B-Complex', 'Becosules Capsules', 'Pfizer Ltd', 'capsule', 'B-Complex + Vit C', 'mg', 'oral', 'Multivitamin', 'IP-BEC-CAP', 'OTC', false, true),

-- Neuro-Psychiatry
('Alprazolam', 'Alprax 0.25', 'Torrent Pharma', 'tablet', '0.25mg', 'mg', 'oral', 'Anxiolytic Benzodiazepine', 'IP-ALP-025', 'Schedule H1', true, false),
('Clonazepam', 'Clona 0.5', 'Icon Life Sciences', 'tablet', '0.5mg', 'mg', 'oral', 'Anxiolytic / Anticonvulsant', 'IP-CLN-05', 'Schedule H1', true, false),
('Escitalopram', 'Nexito 10', 'Sun Pharma', 'tablet', '10mg', 'mg', 'oral', 'SSRI Antidepressant', 'IP-ESC-10', 'Schedule H', true, true),

-- Topical & Dermatological
('Clotrimazole 1%', 'Candid Cream', 'Glenmark Pharma', 'ointment', '1% w/w', '%', 'topical', 'Antifungal', 'IP-CLO-CRM', 'OTC', false, true),
('Mupirocin 2%', 'T-Bact Ointment', 'GlaxoSmithKline', 'ointment', '2% w/w', '%', 'topical', 'Topical Antibacterial', 'IP-MUP-OIN', 'Schedule H', true, true),
('Hydrocortisone 1%', 'Hycort Cream', 'Torrent Pharma', 'ointment', '1% w/w', '%', 'topical', 'Topical Corticosteroid', 'IP-HYC-CRM', 'Schedule H', true, true),

-- Ophthalmic & Otic
('Ciprofloxacin Eye/Ear Drops', 'Ciplox Eye Drops', 'Cipla Ltd', 'drops', '0.3% w/v', '%', 'ophthalmic', 'Antibacterial Eye Drop', 'IP-CIP-EYE', 'Schedule H', true, true),
('Carboxymethylcellulose 0.5%', 'Refresh Tears', 'Allergan India', 'drops', '0.5% w/v', '%', 'ophthalmic', 'Artificial Tears Lubricant', 'IP-CMC-EYE', 'OTC', false, true)
ON CONFLICT DO NOTHING;

-- 16. SEED STANDARD SPECIALTY CLINICAL TEMPLATES
INSERT INTO public.clinical_templates (
    doctor_id, specialty, template_name, template_type, content, is_default, is_active
) VALUES
(
    NULL,
    'General Medicine',
    'General Medicine Adult SOAP',
    'soap',
    '{
        "chief_complaint": "Fever, malaise and body aches for 3 days.",
        "hpi": "Patient reports acute onset of moderate fever associated with chills and generalised myalgia. No cough, breathlessness, or urinary complaints.",
        "ros": { "respiratory": "Clear", "cardiac": "Normal", "gi": "Soft, non-tender", "cns": "Conscious, oriented" },
        "examination": "Febrile (100.4 F). Pulse: 88 bpm regular. BP: 124/82 mmHg. Throat: Mild erythema, no tonsillar exudate. Chest: Bilateral vesicular breath sounds, no rales. Abdomen: Soft, non-tender, no organomegaly.",
        "assessment": "Acute Viral Upper Respiratory Tract Infection (URTI) with constitutional symptoms.",
        "treatment_plan": "Symptomatic antipyretic therapy, oral hydration, warm saline gargles, adequate rest.",
        "advice": "Drink 2.5 - 3 liters of warm fluids daily. Monitor temperature every 6 hours. Light diet, avoid cold/chilled beverages.",
        "follow_up_instructions": "Review after 3 days if fever persists or earlier if warning signs (breathlessness, severe headache, persistent vomiting) develop."
    }'::jsonb,
    true,
    true
),
(
    NULL,
    'Pediatrics',
    'Pediatric Acute Illness & Growth Review',
    'specialty',
    '{
        "chief_complaint": "Fever and mild dry cough for 2 days in child.",
        "hpi": "Mother reports fever since yesterday evening, child active between spikes. Taking oral feeds normally, wet diapers adequate (6+ per day).",
        "examination": "Alert child, playful, no tachypnea or chest indrawing. Temp: 100 F. PR: 110 bpm. SpO2: 99% on room air. Weight recorded for dosing verification.",
        "assessment": "Pediatric acute mild viral URI.",
        "treatment_plan": "Weight-based Paracetamol suspension (15 mg/kg/dose) SOS for fever > 100 F, saline nasal drops.",
        "advice": "Continue frequent feeds/fluids. Watch for red flags: poor feeding, lethargy, rapid breathing, cyanosis.",
        "follow_up_instructions": "SOS or routine review in 3 days."
    }'::jsonb,
    true,
    true
),
(
    NULL,
    'Cardiology',
    'Hypertension & Cardiovascular Review',
    'specialty',
    '{
        "chief_complaint": "Follow-up evaluation for Essential Hypertension.",
        "hpi": "Known hypertensive on regular medication. Compliant with therapy. No chest discomfort, palpitations, orthopnea, or pedal swelling.",
        "examination": "BP Right Arm Sitting: 136/86 mmHg. PR: 72 bpm regular. Heart sounds S1 S2 heard, no murmurs. Bilateral pedal pulses palpable, no edema.",
        "assessment": "Primary Essential Hypertension — Stage 1, moderately controlled on monotherapy.",
        "treatment_plan": "Continue current antihypertensive regimen. Lifestyle modifications with sodium restriction.",
        "advice": "Low salt diet (< 5g/day), 30 minutes brisk walking daily, maintain home BP log twice weekly.",
        "follow_up_instructions": "Review with home BP log and Renal Function Test (RFT + Serum Electrolytes) in 4 weeks."
    }'::jsonb,
    true,
    true
),
(
    NULL,
    'Orthopedics',
    'Knee Osteoarthritis & Joint Pain',
    'specialty',
    '{
        "chief_complaint": "Bilateral knee joint pain, aggravated by stair climbing and prolonged standing for 6 months.",
        "hpi": "Pain gradual in onset, morning stiffness lasting < 20 minutes. No night pain, fever, or joint swelling.",
        "examination": "Mild crepitus on bilateral knee flexion-extension. No effusion, joint line tenderness medial compartment. ROM 0 - 120 degrees bilateral.",
        "assessment": "Primary Osteoarthritis of Bilateral Knees (Mild to Moderate).",
        "treatment_plan": "Short course analgesic, quadriceps isometric strengthening exercises, weight reduction advice.",
        "advice": "Avoid deep squatting and cross-legged sitting. Use western commode. Low-impact aerobic exercises (swimming/cycling).",
        "follow_up_instructions": "Review after 2 weeks with X-Ray Both Knees AP/Lateral Standing."
    }'::jsonb,
    true,
    true
),
(
    NULL,
    'Dermatology',
    'Eczema & Allergic Contact Dermatitis',
    'specialty',
    '{
        "chief_complaint": "Itchy erythematous patches with dry scaling on forearms and neck for 10 days.",
        "hpi": "Pruritus intense especially at night. Started following contact with synthetic detergent.",
        "examination": "Erythematous scaly plaques with excoriation marks on bilateral dorsal forearms. No oozing or secondary bacterial infection.",
        "assessment": "Subacute Eczematous Dermatitis / Contact Dermatitis.",
        "treatment_plan": "Mild topical corticosteroid ointment BD x 7 days, non-sedating antihistamine for pruritus, barrier emollients.",
        "advice": "Apply emollient generously immediately after bath. Avoid hot water, harsh soaps, and suspected contact irritants. Use cotton clothing.",
        "follow_up_instructions": "Review in 2 weeks or earlier if secondary infection signs appear."
    }'::jsonb,
    true,
    true
)
ON CONFLICT DO NOTHING;
