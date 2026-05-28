# Product / Technical Architecture Document

## 1) High-Level Architecture

ConstructQA Agent is a web application that converts construction requirements into QA outputs through a staged AI + deterministic pipeline.

### Runtime Flow

1. User authenticates with Clerk.
2. User enters a requirement in dashboard.
3. Frontend calls `/api/generate`.
4. API orchestrates 6 stages and streams progress.
5. Outputs are rendered in tabs and can be exported/saved.
6. Runs and reports are retrieved via `/api/runs` and `/api/reports`.

## 2) Frontend Architecture

- **Framework:** Next.js 16 App Router + React 19
- **Main surfaces:**
  - `app/page.tsx` (home entry + splash)
  - `app/sign-in/*`, `app/sign-up/*` (auth views)
  - `app/dashboard/*` (generation and artifact management)
- **Styling:** centralized in `app/globals.css` (no Tailwind in JSX components).
- **State Pattern:** local component state for generation and tab rendering, API-driven for persisted lists.

## 3) Backend / API Architecture

- **Route Handlers:**
  - `app/api/generate/route.ts` - generation orchestration with progress events.
  - `app/api/runs/*` - run persistence retrieval/deletion.
  - `app/api/reports/*` - report persistence retrieval/deletion.
- **Service Layer (`lib/`):**
  - Prompt definitions (`lib/prompts.ts`)
  - Data normalization/building helpers
  - Storage abstraction (file + optional Postgres usage pattern)

## 4) Data and Storage

- **Primary Model Types:**
  - Requirement, scenarios, test cases, synthetic data, automation skeleton, coverage review.
- **Persistence Paths:**
  - Local/file-based mode for development and evidence workflows.
  - Postgres-backed mode in production when `POSTGRES_URL` is configured.

## 5) Authentication and Authorization

- **Provider:** Clerk
- **Protected assets:** dashboard routes and generation/report APIs.
- **Middleware:** `middleware.ts` enforces route protection and authenticated access.
- **Auth UX:** sign-up, sign-in, and password recovery flows are customized for product behavior while using Clerk security primitives.

## 6) Integrations

- **Groq AI:** stages 1, 2, 3, and 6 using structured JSON prompts.
- **OpenProject references:** optional URL-based links from dashboard requirements area.
- **Vercel:** deployment target with environment-based runtime config.

## 7) AI Agent Usage Pattern

The pipeline is intentionally split to avoid a monolithic prompt:

1. Requirement Parser (AI)
2. Scenario Generator (AI)
3. Test Case Generator (AI)
4. Test Data Builder (deterministic)
5. Skeleton Builder (deterministic)
6. Coverage Reviewer (AI)

Benefits:

- Better control over schema at each stage
- Improved debuggability and recovery
- Lower risk of long single-response truncation

## 8) Deployment Flow

1. Push source to GitHub.
2. Import project in Vercel.
3. Set env vars (`CLERK_*`, `NEXT_PUBLIC_CLERK_*`, `GROQ_API_KEY`, optional `POSTGRES_URL`).
4. Build and deploy.
5. Validate auth + generation + history/reports in production.

## 9) Key Design Decisions

- **Central CSS** for consistent dark theme control.
- **Auth-first route protection** to secure API and dashboard.
- **Deterministic stages for data and skeleton** to stabilize outputs.
- **SSE progress updates** for user confidence during long-running generation.
- **Submission-oriented docs/evidence** embedded in repository for judge accessibility.
