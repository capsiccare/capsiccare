-- ==============================================================================
-- CAPSIC CARE OS — STEP 11: PATIENT PORTAL & DIGITAL HEALTH RECORDS
-- Migration: 20261119000013_patient_portal_and_digital_health_records.sql
-- ==============================================================================

-- 1. PATIENT PORTAL LINKS (Profile to UHID secure binding)
CREATE TABLE IF NOT EXISTS public.patient_portal_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    uhid VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'verified', -- pending_verification, verified, rejected, unlinked
    verification_method VARCHAR(50) NOT NULL DEFAULT 'mobile_match', -- mobile_match, otp_challenge, staff_assisted
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_links_profile ON public.patient_portal_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_portal_links_patient ON public.patient_portal_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_portal_links_uhid ON public.patient_portal_links(uhid);

-- 2. PATIENT FAMILY MEMBERS & DEPENDENTS
CREATE TABLE IF NOT EXISTS public.patient_family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    dependent_patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL, -- parent, child, spouse, guardian, caregiver, other
    permission_scope VARCHAR(50) NOT NULL DEFAULT 'full_access', -- full_access, appointments_only, records_only
    is_active BOOLEAN NOT NULL DEFAULT true,
    consent_recorded BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(primary_patient_id, dependent_patient_id)
);

CREATE INDEX IF NOT EXISTS idx_family_primary ON public.patient_family_members(primary_patient_id);
CREATE INDEX IF NOT EXISTS idx_family_dependent ON public.patient_family_members(dependent_patient_id);

-- 3. PATIENT ADDRESSES (Saved addresses for home sample collection)
CREATE TABLE IF NOT EXISTS public.patient_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    address_label VARCHAR(50) NOT NULL DEFAULT 'Home', -- Home, Work, Parents, Other
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    address_line1 TEXT NOT NULL,
    landmark TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Kolkata',
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_addresses_patient ON public.patient_addresses(patient_id);

-- 4. PATIENT PORTAL NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.patient_portal_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- appointment, prescription, report, payment, follow_up, support, general
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_notif_patient ON public.patient_portal_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_portal_notif_unread ON public.patient_portal_notifications(patient_id, is_read);

-- 5. PATIENT SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.patient_support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- appointment_help, report_query, billing_issue, prescription_access, callback_request, general
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_patient ON public.patient_support_tickets(patient_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.patient_support_tickets(status);

-- 6. PATIENT ABHA PROFILES (ABDM Interoperability Readiness)
CREATE TABLE IF NOT EXISTS public.patient_abha_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE UNIQUE,
    abha_number VARCHAR(50),
    abha_address VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'unlinked', -- unlinked, consent_pending, linked
    consent_artifact JSONB DEFAULT '{}'::jsonb,
    linked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abha_patient ON public.patient_abha_profiles(patient_id);

-- 7. PATIENT PORTAL ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.patient_portal_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- login, link_uhid, book_appointment, cancel_appointment, view_prescription, download_report, book_diagnostic, submit_feedback, raise_ticket, update_privacy
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_activity_patient ON public.patient_portal_activity_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_portal_activity_action ON public.patient_portal_activity_logs(action);

-- 8. ROW LEVEL SECURITY ENFORCEMENT
ALTER TABLE public.patient_portal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_portal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_abha_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_portal_activity_logs ENABLE ROW LEVEL SECURITY;

-- Permissive Authenticated / Service Role Policies
CREATE POLICY "portal_links_auth_all" ON public.patient_portal_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "family_members_auth_all" ON public.patient_family_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "addresses_auth_all" ON public.patient_addresses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "portal_notif_auth_all" ON public.patient_portal_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "support_tickets_auth_all" ON public.patient_support_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "abha_profiles_auth_all" ON public.patient_abha_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "portal_activity_auth_all" ON public.patient_portal_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
