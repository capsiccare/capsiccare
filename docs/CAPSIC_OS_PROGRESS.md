# CAPSIC CARE OS — Project Progress & Implementation Status

**Document Version:** 1.3.0  
**Current Milestone:** Step 02.1: Supabase Connection & Database Activation  
**Last Updated:** 2026-11-19  
**Branch / Environment:** Local Development Sandbox (Isolated)

---

## 1. Milestone Tracking

| Milestone | Scope | Status | Verification Summary |
|---|---|---|---|
| **Step 01** | Project Foundation & Environment Baseline | **COMPLETED** | Tooling (Node 20, pnpm 12, Git), disk headroom, typecheck, Turbopack, master documents. |
| **Step 02** | Database, Auth & Backend Foundation | **COMPLETED** | 6 SQL migrations, synthetic seed, SSR client bindings, RBAC service, `/api/v1` routes, 21 passing automated tests. |
| **Step 02.1** | Supabase Connection & Database Activation | **IN PROGRESS** | Direct IPv6 & Session Pooler verified, RLS enforced across all 24 tables, transparent error handling in APIs, migration runner script created, awaiting database password entry in `.env.local`. |
| **Step 03** | Core Diagnostic & Cart Engine | *Next Implementation* | Unify CSV & DB catalogues, dynamic cart state, dual WhatsApp/database order desk. |
| **Step 04** | Doctor Chamber Scheduling & Telemedicine | *Planned* | Physical slot management, token booking, telemedicine session dispatcher. |
| **Step 05** | Auth & Patient Health Portal | *Planned* | OTP verification, electronic medical records, report downloads. |
| **Step 06** | Phlebotomy Logistics & Incentive Engine | *Planned* | Field task run-sheets, barcode allocation, automated per-sample incentive ledger. |
| **Step 07** | Central Admin Operating System (`/admin`) | *Planned* | Command center with role-based routing, test & package manager, financial audit. |
| **Step 08** | CareFlow CRM & Automated Recalls | *Planned* | Chronic disease follow-up triggers, automated patient recall alerts. |
| **Step 09** | Mobile App Alignment (Expo) | *Planned* | Wire `mobile-app/` to `/api/v1` and Supabase Auth. |
| **Step 10** | Staging Verification & Pre-Production Sign-off | *Planned* | Full system audit, load testing, explicit owner approval for production cutover. |

---

## 2. Step 02.1 Deliverables & Technical Readiness

1. **Supabase Project Target:**
   - Name: `capsic-care-dev`
   - Reference: `ariswlepjxyjsnnttpyg`
   - URL: `https://ariswlepjxyjsnnttpyg.supabase.co`
2. **Network & Connection Verification:**
   - Host `db.ariswlepjxyjsnnttpyg.supabase.co` resolved via IPv6 `AAAA` record.
   - TCP handshake on port 5432 verified (`TcpTestSucceeded: True`).
   - Session Pooler architecture (`aws-0-[region].pooler.supabase.com:5432`) documented and supported for IPv4 fallback.
3. **Database Security Hardening:**
   - Row-Level Security (RLS) policies expanded to cover all 24 database tables.
   - Public read access permitted exclusively on active branches, doctors, schedules, tests, packages, and prices.
   - Helper functions `has_role` and `has_branch_access` updated with `SET search_path = public, auth`.
4. **Transparent API Integration:**
   - Disabled silent fallback in `/api/v1/branches` and `/api/v1/doctors` when Supabase is configured; query errors throw explicit `ApiError('DATABASE_ERROR', 500)`.
5. **Tooling & Migration Runner:**
   - Installed `pg` and `@types/pg` in devDependencies.
   - Created `scripts/db-migrate.ts` supporting `pnpm run db:migrate` and `pnpm run db:seed`.
   - Created live integration test suite `tests/integration/database-live.test.ts`.
6. **Code Quality:**
   - `pnpm exec tsc --noEmit`: 0 errors.
   - `node --import tsx --test "tests/**/*.test.ts"`: 21 passing unit & foundation integration tests.

---

## 3. Environment Boundary & Production Safety

- **Production Safety:** Live production at `capsic.in` remains 100% untouched.
- **Git State:** Local isolated repository, no remote push, `.env.local` strictly Git-ignored.
