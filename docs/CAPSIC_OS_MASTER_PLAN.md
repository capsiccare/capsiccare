# CAPSIC CARE OS — Master Plan & Execution Roadmap

**Project URL:** [https://capsic.in](https://capsic.in)  
**Document Version:** 1.0.0  
**Status:** Active Foundational Document  
**Target Architecture:** Next.js 16 (App Router) + React 19 + TypeScript + Supabase (PostgreSQL & Auth) + Tailwind CSS 4 + shadcn/ui + React Native / Expo (Mobile)

---

## 1. Executive Summary & Vision

CAPSIC CARE is transitioning from a high-speed programmatic diagnostic website into an enterprise-grade, mobile-ready **Healthcare Operating System (CAPSIC CARE OS)**. 

The platform serves patients, consulting doctors, phlebotomists, administrative staff, clinic partners, and diagnostic laboratories across Kolkata and Howrah (headquartered at Bankra Bazar, Domjur, Howrah, West Bengal).

### Core Directives
1. **Zero Disruption to Live Production:** All development occurs in strict local isolation. No live production database or Vercel production deployment may be modified without explicit, prior owner approval.
2. **Preservation of SEO & Branding:** Retain all programmatic routes, schema markup, metadata, branding palette (Teal `#0D9488`, Green accent `#10b981`, Orange CTA `#f97316`), and sub-second page performance.
3. **Unified Backend Core:** Architect a centralized, modular API (`/api/v1/...`) and Supabase PostgreSQL schema with Row-Level Security (RLS) that simultaneously powers the web interface, the administrative operations dashboard, and future native Android & iOS mobile applications.
4. **Synthetic Test Data Only:** Strictly use synthetic records during development for patient records, phlebotomist runs, prescriptions, and financial transactions.

---

## 2. Platform Modules & Functional Scope

CAPSIC CARE OS comprises ten cohesive functional pillars:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CAPSIC CARE OS                                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌───────────────────┐        ┌─────────────────┐
│ Public Web   │          │ Central Admin     │        │ Doctor & Care   │
│ & Programmatic│         │ Operations OS     │        │ Management      │
│ SEO Engine   │          │                   │        │                 │
│ • Catalog    │          │ • RBAC Access     │        │ • Profiles      │
│ • Packages   │          │ • Order Mgmt      │        │ • Appointments  │
│ • Geo-Pages  │          │ • Phlebotomy Desk │        │ • Telemedicine  │
│ • Symptoms   │          │ • Financials      │        │ • CareFlow CRM  │
└──────────────┘          └───────────────────┘        └─────────────────┘
      │                            │                            │
      ├────────────────────────────┼────────────────────────────┤
      ▼                            ▼                            ▼
┌──────────────┐          ┌───────────────────┐        ┌─────────────────┐
│ Diagnostics  │          │ Patient Portal    │        │ Staff & Partner │
│ & Billing    │          │ & Health Records  │        │ Network         │
│ • 700+ Tests │          │ • OTP / Auth      │        │ • Field Staff   │
│ • Custom Pkgs│          │ • Report Access   │        │ • Task Dispatch │
│ • WhatsApp   │          │ • History         │        │ • Incentives    │
│ • Invoicing  │          │ • Family Profiles │        │ • Franchise Ptrs│
└──────────────┘          └───────────────────┘        └─────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌───────────────────┐         ┌───────────────────┐
          │ Notifications &   │         │ Native Mobile     │
          │ Analytics Engine  │         │ (iOS / Android)   │
          │ • WhatsApp Bot    │         │ • Expo Router     │
          │ • SMS / Email     │         │ • Shared API v1   │
          │ • Revenue Reports │         │ • Field App Mode  │
          └───────────────────┘         └───────────────────┘
```

### Module 01: Public Healthcare Website & Programmatic SEO
- **Current State:** Active SSG/Turbopack implementation with ~14,000 generated static pages covering lab tests, packages, symptoms, diseases, and hyper-local service zones in West Bengal.
- **Enhancements:** Retain static speed while injecting dynamic real-time slot availability, live cart management, and instant booking submission.

### Module 02: Central Administration Dashboard
- Comprehensive role-based command center for administrators and operational supervisors.
- Audit logs, test catalog editor, package bundle creator, price controls, discount/promo code manager, and service zone toggles.

### Module 03: Doctor Profiles & Appointment Management
- Structured doctor directory with credentials, verified registration numbers (e.g., WBMC), chamber timing, consultation fees, and hospital affiliations.
- Physical chamber booking + assisted telemedicine workflow with token management.

### Module 04: Diagnostic Catalogue, Bookings & Billing
- 700+ individual test catalog with turnaround times, parameters, sample type (blood/urine/swab), and preparation requirements (e.g., 12h fasting).
- Smart cart, dynamic promo code engine, partner referral tracking, multi-item invoicing (PDF generation), and cash/UPI status reconciliations.

### Module 05: Patient CRM & Patient Portal
- Passwordless / OTP-based and verified phone login for patients.
- Centralized electronic patient records: historical test reports, upcoming appointment status, prescription uploads, and dependent family member profiles.

### Module 06: Staff Management, Tasks & Phlebotomist Incentives
- Field task assignment engine for home sample collection phlebotomists.
- Real-time run sheets, sample barcode assignment, GPS service area allocation, and per-sample collection incentive calculations.

### Module 07: CareFlow Doctor Follow-up CRM
- Automated post-consultation and post-report follow-up tracker.
- Chronic illness care loops (diabetes quarterly checks, thyroid bi-monthly monitoring, hypertensive follow-ups).
- Doctor notification triggers when critical abnormal lab results are recorded.

### Module 08: Notifications, Reporting & Analytics
- Multi-channel notification pipeline (WhatsApp Business API, transactional SMS, email delivery for PDF reports).
- Operational dashboards: daily bookings, gross collection, test volume by category, partner referral payouts, and customer retention metrics.

### Module 09: Multi-Branch & Partner Accounts
- Multi-tenant readiness for physical collection centers, franchisee clinics, and hospital referral desks.
- Granular commissions, settlement records, and localized service radius management.

### Module 10: Future Android & iOS Applications
- React Native / Expo codebase (`mobile-app/`) consuming the shared `/api/v1` backend endpoints.
- Role-adaptive interface supporting patient booking mode and phlebotomist run-sheet execution mode.

---

## 3. Staged Implementation Roadmap

| Stage | Focus Area | Key Deliverables | Risk / Boundaries |
|---|---|---|---|
| **Step 01** *(Current)* | Project Foundation & Quality Baseline | Repository audit, environmental tooling (Node 20, Git, pnpm), zero-error build and type checks, architecture and database master plans. | Local only; no cloud changes. |
| **Step 02** | Data Architecture & Isolated Dev Backend | Local/Dev Supabase schema design, migrations, synthetic seed generators, data abstraction service. | Dedicated dev project only; no production credentials. |
| **Step 03** | Core Diagnostic & Cart Engine | Unified catalog service (merging static CSV & database), dynamic cart state, WhatsApp & database dual-order bridge. | Preserve existing static routes and canonical SEO. |
| **Step 04** | Doctor Registry & Appointment Scheduling | Doctor profiles, chamber slot allocator, telemedicine scheduling module, synthetic booking tests. | No real doctor contact details modified. |
| **Step 05** | Auth & Patient Portal | Supabase Auth integration, patient profile management, report download desk, family profiles. | Strong data encryption and RLS enforcement. |
| **Step 06** | Phlebotomy & Operations Desk | Task dispatch system, sample status tracker (Collected → Processing → Reported), phlebotomist incentive module. | Synthetic sample tracking. |
| **Step 07** | Central Admin Operating System | Unified admin dashboard (`/admin`), role-based routing, test & package CRUD, financial reporting. | Strict RBAC; audit trail logging. |
| **Step 08** | CareFlow CRM & Follow-up Engine | Automated recall alerts, recurring test reminders, chronic care management tracking. | Configurable notification simulators. |
| **Step 09** | Mobile App Alignment (Expo) | Connect `mobile-app/` to `/api/v1`, shared auth tokens, phlebotomist field interface. | Test in Expo simulator / web. |
| **Step 10** | Pre-Production Hardening & Verification | End-to-end testing, security penetration audit, performance load testing, staging sign-off. | Owner approval required prior to any production cutover. |

---

## 4. Non-Negotiable Operational Principles

1. **Local-Only Sandbox:** Never push commits, create remote branches, or alter Vercel production settings without explicit approval.
2. **Deterministic Data Contracts:** Every domain entity has a corresponding TypeScript interface in `lib/data/types.ts` and a matching Zod schema for runtime validation.
3. **Database Guardrails:** All database tables must implement Row-Level Security (RLS) policies by default. No client-side direct table writes without authenticated user ID checks.
4. **Documentation as Truth:** Update `docs/CAPSIC_OS_PROGRESS.md` and `docs/CAPSIC_OS_DECISIONS.md` upon completion of each technical phase.
