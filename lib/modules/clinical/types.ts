// ==============================================================================
// CAPSIC CARE OS — STEP 10: CLINICAL & DOCTOR PORTAL TYPES
// ==============================================================================

export type EncounterStatus = 'in_progress' | 'completed' | 'cancelled'
export type ConsultationType = 'physical' | 'telemedicine' | 'follow_up'
export type PrescriptionStatus = 'draft' | 'reviewed' | 'signed' | 'finalized' | 'amended' | 'cancelled'
export type DiagnosisType = 'provisional' | 'confirmed' | 'differential'
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening'
export type ScheduleCategory = 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'Schedule G'
export type DocumentType = 'referral_letter' | 'medical_certificate' | 'fitness_certificate' | 'discharge_summary' | 'outside_record'

export interface MedicineMaster {
  id: string
  generic_name: string
  brand_name: string
  manufacturer: string | null
  dosage_form: string
  strength: string
  strength_unit: string
  route: string
  therapeutic_class: string | null
  standard_code: string | null
  combination_ingredients: Array<{ ingredient: string; strength: string }>
  schedule_category: ScheduleCategory
  prescription_required: boolean
  is_essential: boolean
  clinical_review_status: 'approved' | 'under_review' | 'deprecated'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClinicalVitals {
  id?: string
  encounter_id?: string | null
  patient_id: string
  recorded_at?: string
  recorded_by?: string | null
  blood_pressure_systolic?: number | null
  blood_pressure_diastolic?: number | null
  pulse_rate?: number | null
  temperature_f?: number | null
  spo2_percent?: number | null
  respiratory_rate?: number | null
  height_cm?: number | null
  weight_kg?: number | null
  bmi?: number | null
  blood_glucose_mg_dl?: number | null
  glucose_type?: 'fasting' | 'post_prandial' | 'random' | null
  pain_score?: number | null
  notes?: string | null
  created_at?: string
}

export interface PatientAllergy {
  id?: string
  patient_id: string
  allergen_type: 'drug' | 'food' | 'environmental' | 'other'
  allergen_name: string
  reaction?: string | null
  severity: AllergySeverity
  status: 'active' | 'resolved' | 'suspected'
  verified_by_doctor_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface PatientChronicCondition {
  id?: string
  patient_id: string
  condition_name: string
  icd10_code?: string | null
  diagnosed_date?: string | null
  status: 'active' | 'controlled' | 'remission'
  management_notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ClinicalDiagnosis {
  id?: string
  encounter_id: string
  patient_id: string
  doctor_id: string
  diagnosis_text: string
  icd10_code?: string | null
  diagnosis_type: DiagnosisType
  is_chronic: boolean
  onset_date?: string | null
  notes?: string | null
  created_at?: string
}

export interface PrescriptionItem {
  id?: string
  prescription_id?: string
  medicine_id?: string | null
  medicine_name: string
  generic_name?: string | null
  brand_name?: string | null
  dosage_form: string
  strength: string
  dose: string
  route: string
  frequency: string
  timing: string
  duration_value: number
  duration_unit: string
  quantity: number
  is_prn: boolean
  prn_condition?: string | null
  special_instructions?: string | null
  instructions_bengali?: string | null
  instructions_hindi?: string | null
  sequence_order: number
}

export interface Prescription {
  id: string
  prescription_number: string
  encounter_id?: string | null
  patient_id: string
  doctor_id: string
  branch_id?: string | null
  status: PrescriptionStatus
  prescription_date: string
  prescriber_name: string
  prescriber_reg_no?: string | null
  prescriber_qualifications?: string | null
  diagnosis_summary?: string | null
  advice_general?: string | null
  diet_lifestyle_advice?: string | null
  follow_up_date?: string | null
  follow_up_reason?: string | null
  digital_signature_hash?: string | null
  signed_at?: string | null
  signed_by_profile_id?: string | null
  immutable_snapshot?: any
  amended_from_id?: string | null
  amendment_reason?: string | null
  is_delivered: boolean
  delivered_via?: string | null
  delivered_at?: string | null
  items: PrescriptionItem[]
  created_at: string
  updated_at: string
}

export interface InvestigationRequest {
  id?: string
  encounter_id: string
  prescription_id?: string | null
  patient_id: string
  doctor_id: string
  diagnostic_test_id?: string | null
  test_name: string
  clinical_indication?: string | null
  priority: 'routine' | 'urgent' | 'stat'
  status: 'recommended' | 'ordered' | 'completed'
  diagnostic_order_id?: string | null
  created_at?: string
}

export interface ClinicalEncounter {
  id: string
  encounter_number: string
  organization_id?: string | null
  branch_id?: string | null
  appointment_id?: string | null
  patient_id: string
  doctor_id: string
  encounter_date: string
  status: EncounterStatus
  consultation_type: ConsultationType
  chief_complaint?: string | null
  history_of_present_illness?: string | null
  review_of_systems?: Record<string, string>
  physical_examination?: string | null
  assessment?: string | null
  treatment_plan?: string | null
  advice?: string | null
  follow_up_instructions?: string | null
  follow_up_date?: string | null
  specialty_data?: Record<string, any>
  created_by?: string | null
  created_at: string
  updated_at: string
  patient?: any
  doctor?: any
  vitals?: ClinicalVitals[]
  diagnoses?: ClinicalDiagnosis[]
  prescription?: Prescription | null
  investigations?: InvestigationRequest[]
}

export interface ClinicalSafetyAlert {
  type: 'allergy_conflict' | 'duplicate_ingredient' | 'duplicate_class' | 'pediatric_caution' | 'general'
  severity: 'high' | 'medium' | 'low'
  medicine_name: string
  message: string
  action: string
}

export interface PrescriptionSafetyReport {
  is_safe: boolean
  alerts: ClinicalSafetyAlert[]
  disclaimer: string
}

export interface DoctorDashboardMetrics {
  doctor: {
    id: string
    name: string
    specialty: string
    registration_number: string
    designation: string
    qualifications: string
  }
  today_stats: {
    total_appointments: number
    waiting_count: number
    in_consultation_count: number
    completed_count: number
    cancelled_count: number
    pending_prescriptions_count: number
    reports_pending_review_count: number
  }
  queue: Array<{
    appointment_id: string
    token_number: string | number
    patient_id: string
    patient_name: string
    patient_uhid: string
    patient_age: number
    patient_gender: string
    patient_phone: string
    status: string
    chief_complaint?: string | null
    appointment_time: string
    check_in_time?: string | null
    has_vitals: boolean
    encounter_id?: string | null
  }>
  current_chamber?: {
    chamber_id: string
    chamber_name: string
    room_number: string
    floor?: string
  } | null
}
