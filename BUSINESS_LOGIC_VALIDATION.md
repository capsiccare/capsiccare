# CAPSIC CARE OS — BUSINESS LOGIC VALIDATION
**Document Reference:** CC-BLV-2026-FINAL  
**Scope:** Financial Accounting, Operational Workflows, Patient Experience, Healthcare Business Delivery  

---

## 1. Monetary Unit & Financial Precision

### Integer Paise Rule
To prevent floating-point rounding errors common in medical billing, all monetary values in CAPSIC CARE OS are stored and computed in **integer paise** (1 INR = 100 paise):
- `diagnostic_orders.subtotal_paise`, `discount_paise`, `collection_fee_paise`, `total_paise`
- `invoices.subtotal_paise`, `discount_paise`, `tax_paise`, `total_paise`, `paid_paise`
- `doctors.physical_fee_paise`, `telemedicine_fee_paise`
- `payments.amount_paise`, `refunds.amount_paise`

### Balance Calculation Guard
In PostgreSQL, `invoices.balance_paise` is maintained via a generated column:
`balance_paise INT GENERATED ALWAYS AS (total_paise - paid_paise) STORED`
This prevents data entry drift between total invoice amount, payments received, and pending balances.

---

## 2. Patient Identity & Longitudinal Identifier (UHID)

### Format Specification
`CAP-YYYY-XXXXXX` (e.g. `CAP-2026-482915`)
- Unique per patient organization-wide.
- Generated automatically upon first touchpoint (whether web appointment, cart checkout, in-clinic reception, or lab walk-in).
- Links all consultations, prescriptions, diagnostic orders, lab reports, and invoices into one lifelong health record.

---

## 3. Consultation Booking & Overlap Prevention

### Clinical Scheduling Architecture
- Each doctor has branch schedules with defined availability windows.
- When an appointment is scheduled via `POST /api/v1/appointments/public`, the system queries existing appointments for that doctor on that date:
  ```ts
  const nextToken = latestToken ? latestToken.token_number + 1 : 1
  ```
- Consultation time slots are allocated sequentially in 15-minute intervals starting from clinic opening:
  ```ts
  const startMinutes = 10 * 60 + ((nextToken - 1) * 15)
  const endMinutes = startMinutes + 15
  ```
- **Database Trigger Guard:** Migration `005` establishes trigger `trg_prevent_appointment_overlap` which verifies that non-cancelled appointments do not overlap:
  `(start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)`
  Any conflicting booking attempt is rejected at the database engine level.

---

## 4. Diagnostic Order Fulfillment & Home Sample Collection

### Workflow Validation
1. **Cart Submission:** Patient selects tests or packages on `/checkout`.
2. **Order Creation:** Stored in `diagnostic_orders` with status `'placed'`.
3. **Qualification for Free Home Collection:**
   - Orders >= ₹2,000 (Howrah & Kolkata) automatically qualify for free home collection (`collection_fee_paise = 0`).
   - For orders below ₹2,000, UI transparently informs the patient of the qualification threshold.
4. **Line Item Integrity:** Every line item in `diagnostic_order_items` enforces check constraint:
   `CHECK ((item_type = 'test' AND test_id IS NOT NULL AND package_id IS NULL) OR (item_type = 'package' AND package_id IS NOT NULL AND test_id IS NULL))`
5. **Invoice & Cash Memo:** An invoice record is generated in `invoices` with status `'issued'`, allowing immediate printing of the Outpatient Cash Memo via `OutpatientCashMemo`.

---

## 5. Staff Multi-Role Operational Model

In real healthcare clinics, staff frequently perform multiple roles across shifts (e.g., morning receptionist + afternoon phlebotomist, or clinic admin + cash counter operator).
- The schema decoupled role assignment from a single column:
  `user_role_assignments(user_id, role_id, branch_id)`
- Staff management UI (`/admin/staff`) and API (`POST /api/v1/staff/[id]/roles`) support assigning multiple active roles to a single staff profile.
- RLS policies verify active assignments for the acting branch.

---

## 6. Offline / Paper Prescription Digitization Fallback

A common operational gap in healthcare clinics is when doctors write paper prescriptions or external specialists refer patients with physical documents.
- CAPSIC CARE OS provides a paper prescription upload engine:
  `POST /api/v1/patients/[id]/prescriptions/upload-paper`
- Records are attached to `patient_documents` under category `'prescription'` and indexed in the Patient Portal.
- The Patient Portal displays both digitally authored prescriptions and uploaded paper prescriptions in a single timeline, ensuring continuous care.

---

## 7. Business Validation Summary

The business logic across financial accounting, clinical appointments, phlebotomy workflows, staff permissions, and patient records has been verified against actual database triggers, constraints, and test executions.
