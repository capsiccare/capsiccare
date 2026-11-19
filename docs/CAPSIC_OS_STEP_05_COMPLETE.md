# CAPSIC CARE OS — STEP 05 COMPLETION REPORT
## UNIFIED DIAGNOSTICS, HOME SAMPLE COLLECTION, BILLING & POS ENGINE + GLOBAL THEME SWITCHING

**Status:** Completed & Validated  
**Git Branch:** `develop` (Commit: `9a197b4`)  
**Database Reference:** Supabase PostgreSQL `capsic-care-dev` (`ariswlepjxyjsnnttpyg.supabase.co`)  
**Database Tables:** 36 Public Tables with Row-Level Security (RLS)  
**Test Suite:** 100% Pass (16 Unit Tests + 14 Integration Tests)  
**TypeScript Compilation:** Zero Errors (`tsc --noEmit` clean)  

---

## 1. Executive Summary

Step 05 completes the core commercial and clinical execution engine of CAPSIC CARE OS. The platform now has a fully operational, integrated diagnostics and billing infrastructure running on PostgreSQL with integer paise financial precision, multi-mode payment capture (Cash, UPI, Card), real-time cashier shift drawer reconciliation, doorstep phlebotomy dispatch, and certified pathologist digital sign-offs.

Simultaneously, responsive, persistent dark/light theme switching has been rolled out across the entire application—including public website headers, mobile navigation drawers, footers, and administrative OS consoles.

---

## 2. Global Theme Switching Across Entire Website

- **Theme Engine:** `next-themes` with `ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`).
- **Interactive Component:** `components/theme-toggle.tsx` supporting:
  - Header icon toggle (`Sun`, `Moon`, `Laptop` system fallback).
  - Pill variant with smooth background sliders.
  - Dropdown menu variant.
  - Guarded against SSR hydration mismatches with `mounted` state checks.
- **Surface Integrations:**
  - **Public Desktop & Mobile Header:** `components/navbar.tsx` — prominent theme switcher next to "Book Appointment" CTA and inside mobile navigation sheet.
  - **Public Footer:** `components/footer.tsx` — clean pill theme switcher at footer bottom row next to copyright.
  - **Admin OS Top Bar:** `components/admin/top-bar.tsx` — integrated directly into operational status bar next to clinic alerts and user avatar.

---

## 3. Database Architecture & Migration 008

Applied migration `20261119000008_billing_pos_and_diagnostics.sql`:
1. `tax_classifications`: GST statutory definitions (`HEALTHCARE_EXEMPT` 0% SAC 999312 per Notification No. 12/2017-CT(R), `GST_18` 18% SAC 999319).
2. `home_collection_rules`: Doorstep sample collection rules (Base fee: ₹100 / 10,000 paise; Free collection threshold: ₹1,000 / 100,000 paise).
3. `promotions`: Coupon codes with percentage or flat discounts, max caps, and valid date bounds (`WELCOME10` 10% discount).
4. `invoices`: Multi-branch billing headers with integer paise arithmetic (`subtotal_paise`, `discount_paise`, `tax_paise`, `total_paise`, `paid_paise`, and generated column `balance_paise`).
5. `invoice_items`: Granular invoice itemization for OPD consultations, diagnostic tests, packages, consumables, and home collection fees.
6. `payments`: Multi-mode payment receipts (`cash`, `upi`, `card`, `bank_transfer`) linked to cashier shift sessions.
7. `refunds`: Structured refund records with audit trails.
8. `cash_counter_sessions`: Shift management tracking opening cash float, collections, refunds, expected cash in drawer, actual physical count, variance, and supervisor notes.
9. `diagnostic_reports`: Certified laboratory report records with status lifecycle (`received_from_lab` -> `verified` -> `ready_for_delivery` -> `delivered`).

---

## 4. Centralized Pricing Engine

Implemented in `lib/modules/pricing/pricing-service.ts`:
- **Branch Overrides:** Resolves branch-specific price overrides from `diagnostic_prices`, falling back to base catalogue price.
- **GST Evaluation:** Correctly classifies diagnostic and clinical consultation services as tax-exempt under Indian Healthcare GST regulations.
- **Doorstep Fee Policy:** Automatically computes free home sample collection when eligible order items reach or exceed ₹1,000; applies ₹100 base fee otherwise.
- **Promotions:** Evaluates coupon codes server-side with maximum discount caps.
- **Financial Precision:** Strictly executes all calculations in integer paise (`1 INR = 100 paise`), preventing binary floating-point drift.

---

## 5. Backend REST API Endpoints

### Diagnostics & Pathology
- `GET /api/v1/diagnostics/catalogue`: Paginated tests and packages with branch pricing overrides.
- `POST /api/v1/diagnostics/catalogue/sync`: CSV catalogue parser and database synchronization engine.
- `GET /api/v1/diagnostics/orders`: Diagnostic orders with branch, status, and fulfillment filtering.
- `POST /api/v1/diagnostics/orders`: Transactional order placement with quick patient registration, auto-invoice creation, and payment recording.
- `GET /api/v1/diagnostics/orders/[id]`: Detailed order view with patient profile, branch, ordered tests, and invoice status.
- `POST /api/v1/diagnostics/orders/[id]/status`: Validated state machine transitions (`placed` -> `phlebotomist_assigned` -> `sample_collected` -> `received_at_lab` -> `processing` -> `completed`).
- `GET /api/v1/diagnostics/home-collection`: Doorstep collection operations queue with date and slot filters.
- `GET /api/v1/diagnostics/dispatch`: Active phlebotomist and clinical staff directory.
- `POST /api/v1/diagnostics/dispatch`: 1-click field phlebotomist route assignment.
- `GET /api/v1/diagnostics/reports`: Queue of diagnostic reports by status.
- `POST /api/v1/diagnostics/reports`: Laboratory report registration.
- `PATCH /api/v1/diagnostics/reports/[id]`: Pathologist sign-off, digital verification, and multi-channel delivery status.

### Unified Billing & Cash Counter POS
- `GET /api/v1/billing/invoices`: Paginated invoice ledger with status, patient, and date filters.
- `POST /api/v1/billing/invoices`: New POS invoice generation for OPD consultations, diagnostic tests, or customized hospital services.
- `GET /api/v1/billing/invoices/[id]`: Full invoice breakdown with line items, tax notes, and payment receipts.
- `POST /api/v1/billing/invoices/[id]/pay`: Payment processing (Cash, UPI, Card) with automatic allocation against invoice balance and active cash drawer session.
- `GET /api/v1/billing/cash-counter`: Current cashier shift session and today's shift history.
- `POST /api/v1/billing/cash-counter/open`: Opens cash counter with opening float.
- `POST /api/v1/billing/cash-counter/close`: Closes shift with physical counted cash, auto-calculating variance (surplus/deficit).
- `GET /api/v1/billing/tax-rates`: Active GST tax classifications.

---

## 6. Frontend Operations Consoles

1. **Diagnostic Command Hub (`/admin/diagnostics`)**: Live KPI metrics, quick navigation cards, and recent orders.
2. **Diagnostic Catalogue Terminal (`/admin/diagnostics/catalogue`)**: Pathology & package directory, specimen notes, TAT, base vs. MRP pricing, and "+ Add Test" modal.
3. **Diagnostic Orders Desk (`/admin/diagnostics/orders`)**: Filterable terminal with status tabs, quick inspection drawer, and 1-click status transitions.
4. **Diagnostic Intake & POS (`/admin/diagnostics/orders/new`)**: Interactive diagnostic intake desk with patient auto-complete / quick registration, live cart calculations, free collection threshold check, promo code, and immediate receipt generation.
5. **Home Sample Collection Operations (`/admin/diagnostics/home-collection`)**: Doorstep phlebotomy routing board, slot badges, free-collection indicator, patient call shortcuts, and collection progress.
6. **Phlebotomist Dispatch (`/admin/diagnostics/dispatch`)**: Certified field collector directory, active duty badges, and today's assigned route inspection.
7. **Diagnostic Reports Terminal (`/admin/diagnostics/reports`)**: Pathologist sign-off terminal with clinical notes, report PDF cloud link attachment, and 1-click patient dispatch.
8. **Unified Billing & POS Core (`/admin/billing`)**: Operational financial stats (Invoiced, Collected, Outstanding Due), searchable invoice table, "New POS Bill" modal, and "Collect Payment" drawer.
9. **Cash Counter Shift Reconciliation (`/admin/billing/cash-counter`)**: Cashier drawer terminal with live running totals, opening float modal, and closing physical currency audit with variance calculation.
10. **Printable GST Tax Invoice & Receipt (`components/admin/billing/invoice-receipt-modal.tsx`)**: Compliant thermal and A4 print layout with CAPSIC CARE branding, GST exemption statutory note (Notification No. 12/2017-CT(R)), SAC 999312 codes, itemized breakdown, and authorized signature.

---

## 7. Automated Test Results

```
▶ Step 04: Unified Appointments, Scheduling & Reception Tests
  ✔ Chambers Master: should verify active chambers configured in branch (528ms)
  ✔ Availability Engine: should generate slots for doctor working day and handle bookings (1618ms)
  ✔ Availability Engine: should handle schedule exceptions (leaves/holidays) (1273ms)
  ✔ Appointment Booking & Token Assignment: should book an appointment with token number (638ms)
  ✔ Concurrency Guard: database trigger prevents double-booking same doctor at same time (969ms)
  ✔ Status Transition & History: should transition through valid states and record timestamps (2112ms)
✔ Step 04: Unified Appointments, Scheduling & Reception Tests (7144ms)

▶ Step 05: Unified Diagnostics, Home Sample Collection, Billing & POS Engine Tests
  ✔ 1. Database Tables: should verify all Step 05 tables exist and are accessible (2780ms)
  ✔ 2. Pricing Engine: should enforce free home collection on orders >= ₹1,000 (1281ms)
  ✔ 3. Pricing Engine: should apply promotional discounts (WELCOME10 - 10%) (872ms)
  ✔ 4. Diagnostic Order Lifecycle: should create order with items and validate state machine (1689ms)
  ✔ 5. Diagnostic Reports: should register report and support pathologist verification (478ms)
  ✔ 6. Cash Counter Session: should open session, track collections and calculate closing variance (1433ms)
  ✔ 7. Unified Billing & POS: should generate invoice and record partial + final payment (1415ms)
  ✔ 8. Test Teardown: clean up synthetic integration test entities (1942ms)
✔ Step 05: Unified Diagnostics, Home Sample Collection, Billing & POS Engine Tests (11897ms)

ℹ tests 14 | pass 14 | fail 0 (100% Pass)
```
