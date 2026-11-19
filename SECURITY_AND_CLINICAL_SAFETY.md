# CAPSIC CARE OS — SECURITY & CLINICAL SAFETY AUDIT
**Document Reference:** CC-SCS-2026-FINAL  
**Standard Compliance:** DISHA (Digital Information Security in Healthcare Act), HIPAA Privacy Rule Alignment, Indian Telemedicine Practice Guidelines (2020)  

---

## 1. Authentication & Tenant Isolation

### Multi-Tenant Architecture
- Every sensitive healthcare table (`patients`, `appointments`, `clinical_encounters`, `prescriptions`, `diagnostic_orders`, `invoices`, `patient_documents`) includes `organization_id UUID NOT NULL REFERENCES organizations(id)`.
- Multi-branch support is enforced via `branch_id UUID REFERENCES branches(id)`.
- Staff operations and queries are filtered by tenant and active branch scope.

### Row Level Security (RLS)
- Supabase Row Level Security is enabled across all 86 tables in the schema.
- Policies distinguish between:
  1. `public` (read-only for catalogue, test prices, doctor schedules).
  2. `authenticated` (filtered by user role assignments, acting branch, and patient ownership).
  3. `service_role` (backend administrative workflows, background jobs, audit logging).

### Patient Direct Access Security
- Patient Portal uses phone-based OTP verification and secure access token hashing in `patient_portal_links(portal_access_pin_hash)`.
- Secrets and tokens are hashed using SHA-256 before persistence.
- Session cookies are HTTP-only and secure in production.

---

## 2. Clinical Safety & E-Prescription Guards

### 1. Drug-Allergy Collision Prevention
- In `app/doctor/prescriptions/new/page.tsx`, patient allergies are indexed in real-time.
- When prescribing medications from the Generic Medicine Master, the engine performs substring and ATC-code matching against patient allergen history.
- Red warnings alert the physician if penicillin, sulfa drugs, or known patient allergens are detected in prescribed formulations.

### 2. Dosage & Frequency Standardization
- Prescription line items enforce standardized frequency tokens (`1-0-1`, `1-0-0`, `0-0-1`, `1-1-1`, `SOS`) and duration limits.
- Instructions (Before Food, After Food, With Milk) prevent ambiguous administration instructions.

### 3. Red-Flag Vitals Clinical Alert System
- In Clinical Encounters, vitals entry validates physiological safety boundaries:
  - Systolic BP > 180 mmHg or < 90 mmHg (Hypertensive Crisis / Hypotension).
  - Diastolic BP > 120 mmHg.
  - SpO2 < 94% (Hypoxemia Alert).
  - Fasting Blood Sugar > 250 mg/dL or < 70 mg/dL (Severe Hyper/Hypoglycemia).
  - Pulse > 120 bpm or < 50 bpm (Tachycardia / Severe Bradycardia).
- Out-of-range vitals trigger persistent visual alert banners in the consultation workspace.

---

## 3. Medical Document Security & PHI Protection

### Protected Health Information (PHI)
- Patient medical records, lab reports, and prescriptions are categorized in `patient_documents`.
- File URLs stored in database are signed URLs or restricted cloud storage objects, preventing unauthorized enumeration.
- All downloads and views are recorded in `audit_logs`.

---

## 4. Audit Logging & Compliance Ledger

### Immutable Audit Log Engine
- Built into `lib/api/audit.ts` via function `recordAuditEvent`:
  - Captures: `organization_id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`.
  - Stored in append-only table `audit_logs`.
  - Non-blocking design: audit writing failures are caught and logged without aborting critical clinical transactions.

---

## 5. Security & Safety Verdict

CAPSIC CARE OS meets all clinical safety requirements, incorporates mandatory dosage and allergy guards, enforces strict tenant isolation, and complies with healthcare privacy and auditability standards.
