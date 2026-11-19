# CAPSIC CARE OS — Database Architecture & Schema Specification

**Document Version:** 1.3.0  
**Status:** Step 03 Complete OS Shell & Admin Management Active  
**Engine:** PostgreSQL 15+ (via Supabase)  
**Project:** `capsic-care-dev` (Reference: `ariswlepjxyjsnnttpyg`)  
**Project URL:** `https://ariswlepjxyjsnnttpyg.supabase.co`  
**Monetary Standard:** Integer Paise (`amount_paise INT`, where 100 INR = 10,000 paise)  
**Security:** Multi-tenant Row-Level Security (RLS) with deny-by-default across all 24 tables

---

## 1. Entity-Relationship Overview

```mermaid
erDiagram
    ORGANIZATIONS ||--|{ BRANCHES : operates
    ORGANIZATIONS ||--o{ PROFILES : belongs_to
    ORGANIZATIONS ||--o{ ROLES : scopes
    PROFILES ||--o{ USER_ROLE_ASSIGNMENTS : has
    ROLES ||--o{ USER_ROLE_ASSIGNMENTS : assigned_in
    BRANCHES ||--o{ USER_ROLE_ASSIGNMENTS : scopes

    ORGANIZATIONS ||--o{ PATIENTS : registers
    BRANCHES ||--o{ PATIENTS : serves
    PROFILES ||--o| PATIENTS : optionally_links
    PATIENTS ||--o{ PATIENT_CONTACTS : has
    PATIENTS ||--o{ PATIENT_CONSENTS : grants

    ORGANIZATIONS ||--o{ DOCTORS : affiliates
    DOCTORS ||--|{ DOCTOR_BRANCHES : practices_at
    BRANCHES ||--|{ DOCTOR_BRANCHES : hosts
    DOCTORS ||--o{ DOCTOR_SCHEDULES : configures
    DOCTORS ||--o{ SCHEDULE_EXCEPTIONS : logs

    ORGANIZATIONS ||--o{ DIAGNOSTIC_CATEGORIES : manages
    DIAGNOSTIC_CATEGORIES ||--o{ DIAGNOSTIC_TESTS : classifies
    ORGANIZATIONS ||--o{ DIAGNOSTIC_PACKAGES : curates
    DIAGNOSTIC_PACKAGES ||--|{ DIAGNOSTIC_PACKAGE_ITEMS : contains
    DIAGNOSTIC_TESTS ||--|{ DIAGNOSTIC_PACKAGE_ITEMS : included_in

    ORGANIZATIONS ||--o{ DIAGNOSTIC_PRICES : defines
    BRANCHES ||--o{ DIAGNOSTIC_PRICES : overrides
    DIAGNOSTIC_TESTS ||--o{ DIAGNOSTIC_PRICES : priced_at
    DIAGNOSTIC_PACKAGES ||--o{ DIAGNOSTIC_PRICES : bundled_rate

    DOCTORS ||--o{ APPOINTMENTS : conducts
    PATIENTS ||--o{ APPOINTMENTS : books
    APPOINTMENTS ||--o{ APPOINTMENT_STATUS_HISTORY : tracks

    PATIENTS ||--o{ DIAGNOSTIC_ORDERS : places
    BRANCHES ||--o{ DIAGNOSTIC_ORDERS : fulfills
    DIAGNOSTIC_ORDERS ||--|{ DIAGNOSTIC_ORDER_ITEMS : contains
    DIAGNOSTIC_ORDERS ||--o{ DIAGNOSTIC_ORDER_STATUS_HISTORY : audits

    ORGANIZATIONS ||--o{ AUDIT_LOGS : records
    ORGANIZATIONS ||--o{ IDEMPOTENCY_KEYS : guards
    ORGANIZATIONS ||--o{ NOTIFICATION_JOBS : dispatches
```

---

## 2. Migration Sequence (`supabase/migrations/`)

All migrations are idempotent, version-controlled, and enforce standard database constraints:

| Sequence | Migration File | Core Entities & Purpose |
|---|---|---|
| **001** | `20261119000001_foundation_core.sql` | `organizations`, `branches`, `profiles`, `roles`, `user_role_assignments`. Pre-seeds 11 system roles. |
| **002** | `20261119000002_patient_management.sql` | `patients`, `patient_contacts`, `patient_consents`. Decouples patient clinical identity from authentication account. |
| **003** | `20261119000003_doctor_management.sql` | `doctors`, `doctor_branches`, `doctor_schedules`, `schedule_exceptions`. Stores consultation fees in integer paise. |
| **004** | `20261119000004_diagnostic_catalogue.sql` | `diagnostic_categories`, `diagnostic_tests`, `diagnostic_packages`, `diagnostic_package_items`, `diagnostic_prices`. Immutable pricing snapshots with historical validity windows. |
| **005** | `20261119000005_appointments_and_orders.sql` | `appointments`, `appointment_status_history`, `diagnostic_orders`, `diagnostic_order_items`, `diagnostic_order_status_history`. Includes `check_appointment_overlap` trigger. |
| **006** | `20261119000006_infrastructure_and_security.sql` | `audit_logs`, `idempotency_keys`, `notification_jobs`. Implements security helper functions (`has_role`, `has_branch_access` with sanitized `search_path`) and comprehensive RLS policies on all 24 schema tables. |

---

## 3. Database Connection Architecture

### 3.1 Connection Options
1. **Direct PostgreSQL Connection (Port 5432):**
   `postgresql://postgres:[PASSWORD]@db.ariswlepjxyjsnnttpyg.supabase.co:5432/postgres`
   - Tested and verified: This development machine resolves IPv6 `AAAA` record (`2406:da14:...`) and establishes direct TCP handshakes on port 5432.
2. **Session Pooler Connection (Port 5432, IPv4 compatible):**
   `postgresql://postgres.ariswlepjxyjsnnttpyg:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
   - Recommended if connecting through networks with restricted IPv6 egress.

### 3.2 Automated Migration & Seed Execution
- **Run Migrations:** `pnpm run db:migrate`
- **Run Migrations & Synthetic Seed:** `pnpm run db:seed`
- Tracks executed migrations in `public._capsic_migrations` to prevent repeated execution.

---

## 4. Critical Architectural Constraints

### 4.1 Integer Paise Monetary Representation
All currency fields (fees, subtotals, discounts, invoices) are strictly stored as 32-bit integers in paise:
$$\text{paise} = \text{round}(\text{INR} \times 100)$$
- Example: Consultation fee of ₹400 is stored as `40000`.
- Eliminates floating-point rounding errors across database math, reporting, and payment reconciliations.

### 4.2 Decoupled Patient Identity
- Clinical records are anchored to `patients.id` with a unique hospital identifier (`uhid`), not an authentication account.
- Staff can immediately register emergency, walk-in, or home-collection patients without requiring the patient to create an auth password.
- When a patient signs up via the portal or mobile app, their `profiles.id` is linked via `patients.profile_id`.

### 4.3 Appointment Overlap Prevention
The `check_appointment_overlap()` PL/pgSQL trigger prevents doctor double-booking:
```sql
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
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
```

---

## 5. Synthetic Development Seed Data (`supabase/seed.sql`)

The development seed data populates an isolated, fictional healthcare environment:
- **Organization:** `Capsic Care Health Network (Synthetic Dev)` (code: `CAPSIC_CARE_DEV`)
- **Branch:** `Bankra Central Diagnostic Hub (Synthetic)` (code: `HOWRAH_BANKRA_CENTRAL`)
- **Doctors:** Dr. Sanjoy Kumar Dey (Pediatrics, 35 yrs exp), Dr. Tooneer Mallik (Family Medicine, 5 yrs exp)
- **Tests & Packages:** CBC (26 parameters, ₹249), Lipid Profile (₹399), HbA1c (₹450), Basic Full Body Package (₹599)
- **Patients:** Rahul Sen (`CC-2026-SYN001`), Fatima Begum (`CC-2026-SYN002`)
- **Appointments & Orders:** Fictional confirmed physical appointment and pending home collection order.
- **Repeatability:** Seed statements are idempotent using `ON CONFLICT DO NOTHING`.
