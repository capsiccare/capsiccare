# CAPSIC CARE OS — STEP 07: WORKFORCE MANAGEMENT, PATIENT COMMUNICATION, MEDICAL DOCUMENTS & EXPERIENCE AUTOMATION

## EXECUTIVE SUMMARY

CAPSIC CARE OS Step 07 delivers the clinical workforce management system, multi-channel communication engine, secure expiring medical document delivery, and patient satisfaction grievance automation engine.

All modules are integrated into the existing Next.js 16 + React 19 + Supabase PostgreSQL architecture with Row-Level Security (RLS) enabled across all tables, strict server-side authorization, and zero regressions on prior steps.

---

## 1. ARCHITECTURE & DATABASE SCHEMA (MIGRATION 009)

Migration file: `supabase/migrations/20261119000009_workforce_and_patient_experience.sql`
Total public tables in database: **52 tables** (all protected by Row-Level Security).

### Core Tables Added:
1. **`staff_details`**: Extended employee records (employee ID `EMP-XXXXX`, designation, department, employment status `active | on_leave | probation | terminated | resigned`, reporting manager, joining date, qualifications, notes).
2. **`staff_invitations`**: Token-based onboarding workflow (`inv_...`), role assignment, target branch, and expiration dates.
3. **`staff_shifts`**: Weekly rosters, shift templates (timings, weekly offs, swaps, status `scheduled | completed | swapped | leave`).
4. **`staff_attendance`**: Clock-in and clock-out timestamps, late arrival and overtime minute tracking, supervisor approval.
5. **`staff_tasks`**: Operational task allocations (`TSK-XXXXX`), priority (`low | medium | high | urgent`), category (`patient_call | sample_coordination | report_delivery | complaint_resolution | clinical_escalation | administrative`), patient/appointment/order linkages.
6. **`calling_campaigns` & `call_attempts`**: Patient recall outreach desks, call outcomes (`appointment_booked | diagnostic_booked | interested | not_interested | callback_requested`), conversion attribution counters.
7. **`patient_documents`**: Private medical records repository (prescriptions, diagnostic reports, consents), versioning chain (`version`, `is_latest`, `previous_version_id`), and 48-hour secure expiring delivery tokens (`tok_...`).
8. **`document_access_logs`**: Access audit trail logging channel (`expiring_link | whatsapp | email | patient_portal | admin_portal`), IP address, user agent, and timestamp.
9. **`patient_communication_preferences`**: Granular patient consent ledger (WhatsApp service, SMS service, email, promotional WhatsApp/SMS, preferred language `en | bn | hi`).
10. **`communication_templates`**: Pre-seeded multi-lingual templates with variables (`APPOINTMENT_CONFIRMED`, `HOME_COLLECTION_CONFIRMED`, `DIAGNOSTIC_REPORT_READY`, `PRESCRIPTION_AVAILABLE`, `FOLLOW_UP_REMINDER`).
11. **`communication_messages`**: Unified multi-channel message ledger with delivery statuses (`queued | sending | delivered | failed`), mock adapter provider, retry counters, and relation metadata.
12. **`patient_feedback`**: 1-to-5 star ratings for overall experience, doctor consultation, reception, and waiting time, with automatic escalation on low scores (< 3 stars).
13. **`patient_complaints`**: Grievance ticketing (`TKT-YYYYMMDD-XXXX`), categories (`clinical_quality | billing_dispute | delayed_service | staff_behavior | report_error | facility_hygiene`), priority, SLA target deadline, resolution notes, and supervisor sign-off.
14. **`automation_rules` & `automation_logs`**: Event-driven rules engine with pre-seeded automations for appointment confirmation, report ready, missed appointment follow-up task, and low rating escalation.

---

## 2. BACKEND SERVICES & REST API ENDPOINTS

### Modules Implemented (`lib/modules/`):
- `lib/modules/staff/staff-service.ts`: Staff listing, onboarding via auth admin, invitations, shifts, attendance clocking, task management, calling campaigns.
- `lib/modules/documents/document-service.ts`: Document registration, 48h expiring token generation, token verification with access logging, token refresh.
- `lib/modules/communication/communication-service.ts`: Multi-channel dispatcher, template rendering, consent verification & promotional opt-out suppression, broadcast dispatcher.
- `lib/modules/experience/experience-service.ts`: CSAT feedback recording, auto-escalation trigger, complaint ticket creation, SLA calculation, resolution workflow.
- `lib/modules/automation/automation-service.ts`: Event-driven automation rule engine dispatching tasks, notifications, and grievance tickets.

### Versioned REST Endpoints (`app/api/v1/`):
| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/staff` | GET, POST | List internal staff members with roles; onboard new staff member |
| `/api/v1/staff/invitations` | GET, POST | List pending invitations; issue secure onboarding token |
| `/api/v1/staff/shifts` | GET, POST | Query shifts by date and branch; schedule new staff shift |
| `/api/v1/staff/attendance` | GET, POST | Query daily attendance; record staff clock-in / clock-out |
| `/api/v1/staff/tasks` | GET, POST, PATCH | Query tasks; create task; update task status & completion notes |
| `/api/v1/staff/campaigns` | GET, POST | List calling campaigns; record call attempt with conversion attribution |
| `/api/v1/patients/[id]/prescriptions` | GET, POST | Query prescriptions for patient; upload prescription with expiring link |
| `/api/v1/patients/[id]/documents` | GET, POST | Query all patient medical documents; upload reports & consent forms |
| `/api/v1/documents/[token]` | GET | Secure expiring document viewer with access logging |
| `/api/v1/communications/messages` | GET, POST | Message ledger timeline; dispatch single notification |
| `/api/v1/communications/templates` | GET, POST | Query approved templates; create or update template |
| `/api/v1/communications/preferences` | GET, PATCH | Query and update patient communication consent |
| `/api/v1/communications/broadcasts` | POST | Bulk campaign dispatcher with opt-out suppression |
| `/api/v1/patient-experience/feedback` | GET, POST | Query feedback; submit CSAT rating with low-rating auto-escalation |
| `/api/v1/patient-experience/complaints` | GET, POST, PATCH | Query complaints; register grievance ticket; resolve ticket with notes |
| `/api/v1/automation/rules` | GET, POST | List active automation rules & execution logs; trigger test event |

---

## 3. FRONTEND OPERATIONAL CONSOLES

1. **Staff & Workforce Operations Hub (`/admin/staff`)**:
   - Tab 1: **Staff Directory** with Employee IDs, phone, designation, department, roles, MFA status, Onboard & Invite modals.
   - Tab 2: **Shifts & Rosters** with date picker, branch filter, and "+ Schedule Shift" modal.
   - Tab 3: **Attendance & Clocking** with daily clock-in/out records, punctuality tracking, and quick clock-out buttons.
   - Tab 4: **Operational Tasks** with priority badges, category filters, and 1-click completion workflow.
   - Tab 5: **Outreach Campaigns** with campaign cards, lead counts, and call outcome logging.
2. **Communications Center (`/admin/communications`)**:
   - Tab 1: **Messages Timeline** with live status, channel badges, and "Dispatch Notification" modal.
   - Tab 2: **Message Templates** with variable pills and template preview.
   - Tab 3: **Broadcast Dispatcher** with audience selection and promotional opt-out suppression guard.
   - Tab 4: **Patient Consent Ledger** with phone lookup and channel toggles.
3. **Patient Experience & Grievance Desk (`/admin/patient-experience`)**:
   - Tab 1: **CSAT Ratings & Feedback** with star breakdowns and auto-escalation badges.
   - Tab 2: **Complaints & Grievance Desk** with ticket numbers, SLA countdown, and "Resolve Ticket" modal.
   - Tab 3: **Automation Engine & Live Logs** with active rules and recent execution history.
4. **Enhanced Patient Health Record Drawer (`/admin/patients`)**:
   - Added **Documents & RX** tab: View prescriptions, reports, and copy 48-hour secure expiring delivery links.
   - Added **Communications** tab: View all historical notifications sent to the patient.

---

## 4. VERIFICATION & TEST RESULTS

All 27 automated integration tests pass with 100% success against live PostgreSQL:
- `tests/integration/step7-workforce-and-patient-experience.test.ts`: **10 / 10 PASS**
- `tests/integration/step5-billing-and-diagnostics.test.ts`: **8 / 8 PASS**
- `tests/integration/appointments-step4.test.ts`: **6 / 6 PASS**
- `tests/integration/admin-crud.test.ts`: **3 / 3 PASS**
- TypeScript Typecheck (`pnpm run typecheck`): **0 errors (Clean compile)**
