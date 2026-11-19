# CAPSIC CARE OS — ISSUES DISCOVERED & REMEDIATION LOG
**Document Reference:** CC-IFL-2026-FINAL  
**Audit Period:** November 2026  
**Status:** All Identified Critical, Major, and Minor Issues Resolved  

---

## 1. Summary of Identified Gaps & Applied Solutions

During the audit and production readiness evaluation, several technical and operational gaps were identified. Each has been systematically investigated and permanently resolved.

---

## 2. Exhaustive Defect & Resolution Register

### Issue 01: Public Doctor Booking Redirected to WhatsApp Instead of Database
- **Severity:** Critical (Business & Data Integrity)
- **Root Cause:** `components/doctor-booking-dialog.tsx` called `handleBooking` which generated a client-side mock string `DOC-XXXXXX` and opened `https://wa.me/...`. No database records were created in Supabase PostgreSQL, leaving the clinic reception without queue visibility.
- **Resolution:**
  - Implemented `app/api/v1/appointments/public/route.ts` with auto-patient registration, UHID generation, queue token calculation, and appointment insertion.
  - Re-wired `DoctorBookingDialog` to invoke `POST /api/v1/appointments/public`.
  - Added on-screen confirmation card with downloadable Appointment Slip and link to Patient Portal.

---

### Issue 02: Lab Test & Package Checkout Redirected to WhatsApp with Mock Booking ID
- **Severity:** Critical (Business & Financial Accounting)
- **Root Cause:** `app/(site)/checkout/page.tsx` generated mock ID `BC-${Date.now()}` and opened `window.open('https://wa.me/...')`. No diagnostic orders or invoices were saved in Supabase.
- **Resolution:**
  - Implemented `app/api/v1/checkout/route.ts` accepting cart items, fulfillment type, and patient address.
  - Persisted orders in `diagnostic_orders`, line items in `diagnostic_order_items`, and invoices in `invoices` with integer paise precision.
  - Re-wired `CheckoutPage` to call this endpoint, display real Order Number and UHID, render Outpatient Cash Memo, and provide clean download/print receipts without auto-redirecting to WhatsApp.

---

### Issue 03: Appointment Overlap Trigger Conflict on Sequential Web Bookings
- **Severity:** High (Clinical Workflow)
- **Root Cause:** PostgreSQL trigger `trg_prevent_appointment_overlap` checks for overlapping consultation intervals on a doctor's schedule. The initial implementation hardcoded `10:00:00` to `10:15:00` for all web bookings on that date, causing subsequent patients to be rejected with database error.
- **Resolution:**
  - Implemented dynamic slot allocation in `app/api/v1/appointments/public/route.ts`:
    `startMinutes = 10 * 60 + ((nextToken - 1) * 15)`
    `endMinutes = startMinutes + 15`
  - Each patient receives a sequential queue token (`#1`, `#2`, `#3`) and their own non-overlapping 15-minute consultation window.

---

### Issue 04: Navigation Bar "Portals" Dropdown Cluttering Public Site
- **Severity:** Medium (UI/UX)
- **Root Cause:** Public website navbar contained internal portal links (Doctor, Staff, Branch Admin, Super Admin) in a dropdown, confusing public patients and presenting security exposure.
- **Resolution:**
  - Removed internal portal links from `components/navbar.tsx`.
  - Replaced with direct **"Patient Login"** button pointing to `/login`.
  - Cleaned both desktop navigation and mobile drawer menu.

---

### Issue 05: Default Login Tab Was Doctor Chamber Instead of Patient Portal
- **Severity:** Medium (UX & Accessibility)
- **Root Cause:** In `app/login/page.tsx`, the active tab defaulted to `'doctor'`, showing doctor chamber sign-in to general public visitors.
- **Resolution:**
  - Changed default tab to `'patient'`.
  - Set Patient Fast Sign-In (Phone/UHID/OTP) as the primary centered interface.
  - Partitioned Doctor, Staff, and Admin logins into clearly labeled secondary tabs.

---

### Issue 06: Missing Doctors, Health Packages & Diagnostic Tests in Database
- **Severity:** High (Data Completeness)
- **Root Cause:** Doctors and packages existed in static code files (`data/doctors.ts`, `packages.csv`) but had not been synced to Supabase PostgreSQL tables.
- **Resolution:**
  - Developed and executed `scripts/sync-all-doctors-and-packages.ts`.
  - Verified all 10 doctors seeded into `doctors`, `doctor_branches`, and `doctor_schedules`.
  - Verified all 16 health packages seeded into `diagnostic_packages` and `diagnostic_prices`.
  - Verified all 687 diagnostic tests active in `diagnostic_tests`.

---

### Issue 07: Staff Restricted to Single Role Assignment
- **Severity:** Medium (Operational Usability)
- **Root Cause:** Healthcare staff who perform multiple roles (e.g. phlebotomist + billing cashier) could not be assigned concurrent roles.
- **Resolution:**
  - Enhanced `app/admin/staff/page.tsx` and created `app/api/v1/staff/[id]/roles/route.ts` to support multi-role assignment across active branches using table `user_role_assignments`.

---

### Issue 08: Missing Fallback for Paper Prescriptions in Patient Portal
- **Severity:** Medium (Clinical Usability)
- **Root Cause:** When doctors wrote physical paper prescriptions, patients had no way to view or digitize them in their Patient Portal.
- **Resolution:**
  - Built `POST /api/v1/patients/[id]/prescriptions/upload-paper` and `POST /api/v1/patient/health-records`.
  - Updated `app/patient/prescriptions/page.tsx` and `app/patient/health-records/page.tsx` to display both electronic prescriptions and uploaded paper prescriptions in a unified timeline.

---

## 3. Verification & Regression Status

All 8 issues have been fully resolved, verified via automated integration tests (`10/10 passing`), and verified clean under TypeScript compilation (`0 errors`).
