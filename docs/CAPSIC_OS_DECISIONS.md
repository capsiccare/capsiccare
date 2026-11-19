# CAPSIC CARE OS — Architectural Decision Records (ADR)

This document tracks all foundational architectural, technical, and operational decisions for CAPSIC CARE OS.

---

### ADR-001: Next.js App Router Single-Repository Monolith
- **Status:** Accepted
- **Context:** CAPSIC CARE currently operates a Next.js public website with 14,254 programmatic SEO pages. Introducing a separate microservice backend or moving to a detached framework would compromise existing SEO rankings, domain authority, and deployment workflows.
- **Decision:** Build the entire CAPSIC CARE OS within the existing Next.js App Router repository, keeping backend business logic in `lib/modules/` and exposing versioned REST APIs under `app/api/v1/`.
- **Consequences:** Highly maintainable, single CI/CD pipeline on Vercel, zero-latency server-side component queries, and no cross-origin API complexity.

---

### ADR-002: Supabase (PostgreSQL + Auth + Storage)
- **Status:** Accepted
- **Context:** The system requires relational integrity for medical appointments, lab orders, test pricing, and multi-tenant branch operations, with strict role-based access control (RBAC).
- **Decision:** Use Supabase PostgreSQL as the primary database with Row-Level Security (RLS) policies and Supabase Auth with SSR cookies.
- **Consequences:** Enterprise-grade relational guarantees, zero-maintenance database hosting, built-in connection pooling, and low operating costs on free/pro tiers.

---

### ADR-003: Versioned REST APIs (`/api/v1/`)
- **Status:** Accepted
- **Context:** CAPSIC CARE has an existing mobile app repository (`mobile-app/` built with React Native / Expo) and planned future mobile applications.
- **Decision:** Expose modular, versioned REST endpoints under `/api/v1/` returning standardized JSON envelopes (`{ success, data, error, meta }`).
- **Consequences:** Full backward compatibility for mobile clients as the backend evolves, and predictable API responses for web and mobile.

---

### ADR-004: Decoupled Patient Identity
- **Status:** Accepted
- **Context:** Patients booking diagnostic tests or chamber appointments in Indian semi-urban environments (e.g. Howrah / Bankra) often book via phone, walk-in, or family members without creating user accounts.
- **Decision:** Separate clinical patient identity (`patients` table with unique UHID) from user authentication (`profiles` / `auth.users`).
- **Consequences:** Staff can register walk-in patients immediately without an email or password. Portal users can claim or link their patient profile using phone OTP verification.

---

### ADR-005: Dual-Dispatch Order Engine (Database + WhatsApp)
- **Status:** Accepted
- **Context:** CAPSIC CARE relies heavily on WhatsApp for customer engagement and booking confirmations in West Bengal.
- **Decision:** All appointment and diagnostic test bookings write a persistent record to PostgreSQL while generating structured WhatsApp messages to dispatch to the customer and call center.
- **Consequences:** Immediate booking confirmation via the customer's preferred channel, backed by persistent database audit trails.

---

### ADR-006: Zod Runtime Schema Validation
- **Status:** Accepted
- **Context:** Healthcare APIs handle critical patient details, test codes, and financial amounts where silent type coercion or missing parameters can lead to clinical errors.
- **Decision:** Validate all API request payloads, query parameters, and external data feeds with Zod schemas.
- **Consequences:** Type-safe runtime boundary, automatic error messages, and rejection of malformed requests before hitting the database.

---

### ADR-007: Standardized Development Scripts
- **Status:** Accepted
- **Context:** Commands must run predictably across developer workstations and CI environments without depending on specific global package managers.
- **Decision:** Standardize scripts in `package.json` using `pnpm` and `tsx` for TypeScript execution.
- **Consequences:** Reliable execution across Windows and Linux environments without shell-specific script drift.

---

### ADR-008: Pre-rendering Preservation & On-Demand Dev Execution
- **Status:** Accepted
- **Context:** The existing site contains 14,254 programmatic SEO landing pages in `sitemap.ts`. A full local `next build` generates ~3.5 GB of static HTML/JSON files, which saturated local disk space (ENOSPC error).
- **Decision:** Keep local verification dynamic via `next dev --turbopack` (which compiles pages on demand without pre-generating static pages). Full static pre-rendering will occur in Vercel CI build containers.
- **Consequences:** Preserves local development headroom, avoids disk exhaustion, and maintains production SEO builds in CI.

---

### ADR-009: Integer Paise Currency Representation
- **Status:** Accepted
- **Context:** Storing healthcare consultation fees, diagnostic test rates, and discounts as floating-point decimals causes rounding errors during arithmetic aggregation and payment reconciliation.
- **Decision:** Represent all monetary values across database tables, API payloads, and internal services as 32-bit integers in paise (`price_paise INT`, where ₹100 = 10,000 paise).
- **Consequences:** Eliminates float rounding inaccuracies, simplifies multi-item invoice summing, and matches Indian payment gateway (Razorpay/UPI) standards.

---

### ADR-010: Supabase SSR Authentication with Offline Fallback
- **Status:** Accepted
- **Context:** Development must proceed autonomously and offline before cloud credentials are provisioned, without crashing Route Handlers or Server Components.
- **Decision:** Implement browser, server, and administrative Supabase client bindings in `lib/supabase/` that gracefully check `isSupabaseConfigured()`.
- **Consequences:** Enables zero-touch local development, continuous testing, and immediate activation once environment variables are set.

---

### ADR-011: Database-Level Appointment Overlap Concurrency Prevention
- **Status:** Accepted
- **Context:** Concurrent booking attempts from web, mobile, and reception desks can result in double-booking a doctor during the same time window.
- **Decision:** Implement a PostgreSQL `BEFORE INSERT OR UPDATE` trigger (`check_appointment_overlap()`) that evaluates interval overlaps on `(doctor_id, scheduled_date, start_time, end_time)` across non-cancelled appointments.
- **Consequences:** Guarantees database-level concurrency protection against duplicate bookings regardless of which channel initiates the transaction.

---

### ADR-012: Edge/Node In-Memory Sliding Window Rate Limiting
- **Status:** Accepted
- **Context:** Public APIs (`/api/v1/doctors`, `/api/v1/branches`, `/api/v1/health`) require rate-limiting to prevent scraping and denial-of-service without adding external Redis costs during local development.
- **Decision:** Implement a zero-dependency sliding window rate limiter in `lib/api/rate-limit.ts` keyed by client IP (`x-forwarded-for` / `x-real-ip`).
- **Consequences:** Protects local development and serverless edge functions without third-party key-value store overhead.

---

### ADR-013: Transparent Database Failure Mode & Universal Table RLS
- **Status:** Accepted
- **Context:** Silent mock fallbacks mask database connectivity or permission failures during testing and production cutover. Additionally, public catalogue tables without RLS permit unauthorized client-side mutations.
- **Decision:**
  1. Enforce Row-Level Security across all 24 schema entities, granting explicit `SELECT` to public active records and restricting `INSERT/UPDATE/DELETE` to authorized clinical/administrative roles.
  2. In Route Handlers (`/api/v1/branches`, `/api/v1/doctors`), when Supabase is configured (`isSupabaseConfigured() = true`), throw explicit `ApiError(DATABASE_ERROR, 500)` on query failures rather than silently reverting to static mock arrays.
  3. Ensure all security definer helper functions (`has_role`, `has_branch_access`) enforce `SET search_path = public, auth` against search-path hijacking.
- **Consequences:** Ensures database failures and permission denials are surfaced immediately during integration testing and operational monitoring.
