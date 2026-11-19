// ==============================================================================
// CAPSIC CARE OS — STEP 11: PATIENT PORTAL TYPES
// ==============================================================================

export type PortalLinkStatus = 'pending_verification' | 'verified' | 'rejected' | 'unlinked'
export type FamilyRelationship = 'parent' | 'child' | 'spouse' | 'guardian' | 'caregiver' | 'other'
export type PermissionScope = 'full_access' | 'appointments_only' | 'records_only'

export interface PatientPortalContext {
  patient: {
    id: string
    uhid: string
    full_name: string
    phone: string
    email?: string | null
    gender: string
    age_years: number
    blood_group?: string | null
    address_line1?: string | null
    city?: string | null
  }
  is_linked: boolean
  link_status?: PortalLinkStatus
  dependents: Array<{
    id: string
    patient_id: string
    full_name: string
    uhid: string
    relationship: FamilyRelationship
    permission_scope: PermissionScope
  }>
}

export interface PatientDashboardData {
  patient: {
    id: string
    uhid: string
    full_name: string
    gender: string
    age_years: number
    blood_group?: string | null
    phone: string
  }
  greeting: string
  stats: {
    upcoming_appointments_count: number
    available_reports_count: number
    active_prescriptions_count: number
    outstanding_balance_inr: number
    unread_notifications_count: number
  }
  upcoming_appointment?: {
    id: string
    appointment_number: string
    doctor_name: string
    doctor_specialty: string
    scheduled_date: string
    start_time: string
    consultation_type: string
    branch_name: string
    status: string
  } | null
  recent_prescription?: {
    id: string
    prescription_number: string
    doctor_name: string
    prescription_date: string
    items_count: number
  } | null
  active_follow_up?: {
    follow_up_date: string
    doctor_name: string
    reason?: string | null
  } | null
}

export interface BookAppointmentInput {
  doctor_id: string
  branch_id?: string
  consultation_type: 'physical' | 'telemedicine'
  scheduled_date: string
  start_time: string
  end_time: string
  chief_complaint?: string
}

export interface BookDiagnosticOrderInput {
  branch_id?: string
  fulfillment_type: 'walk_in' | 'home_collection'
  tests: Array<{ test_id: string; price_paise: number }>
  scheduled_collection_date?: string
  scheduled_slot?: string
  collection_address?: string
  collection_landmark?: string
  collection_pincode?: string
  collection_city?: string
  special_instructions?: string
}

export interface FamilyMemberInput {
  full_name: string
  gender: string
  date_of_birth?: string
  age_years?: number
  relationship: FamilyRelationship
  permission_scope?: PermissionScope
  phone?: string
}

export interface SupportTicketInput {
  category: 'appointment_help' | 'report_query' | 'billing_issue' | 'prescription_access' | 'callback_request' | 'general'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  subject: string
  description: string
}

export interface PatientFeedbackInput {
  appointment_id?: string
  diagnostic_order_id?: string
  rating_overall: number
  rating_doctor?: number
  rating_reception?: number
  rating_waiting_time?: number
  facility_rating?: number
  comments?: string
}
