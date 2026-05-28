# Project Plan - ConstructQA Agent

## Project Overview

ConstructQA Agent is an AI-assisted QA generation platform for OpenProject-style construction workflows. It transforms requirement text into structured testing artifacts (scenarios, test cases, synthetic data, automation skeletons, and coverage summaries) through a staged pipeline.

## Objectives

- Accelerate QA planning for construction project workflows.
- Improve consistency and completeness of generated test assets.
- Provide role-ready outputs for manual QA, automation QA, and project stakeholders.
- Deliver secure, deployment-ready experience with protected dashboard flows.

## Scope

| Area | In Scope | Out of Scope |
|---|---|---|
| Requirement processing | Parse and structure workflow requirements | NLP tuning outside current providers |
| QA generation | Multi-stage generation of scenarios, cases, data, and skeleton | Auto-execution of generated tests in CI |
| Authentication | Clerk-based sign-up/sign-in/forgot-password with protected routes | Enterprise IAM/SSO administration |
| Reporting | History, reports, open/delete actions, export-ready artifacts | BI dashboards and advanced analytics |
| Deployment | Vercel production deployment with env-based setup | Multi-region active-active infrastructure |

## Features

- Guided input with quick-select construction workflows.
- 6-stage generation pipeline (AI + deterministic builders).
- Dashboard tabs: test cases, scenarios, test data, automation code, coverage, traceability.
- History and reports persistence surfaces.
- Dark-theme UX with auth flow customization and validation clarity.
- Documentation and validation evidence for hackathon submission.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Centralized `app/globals.css` |
| Authentication | Clerk |
| AI | Groq (`llama-3.1-8b-instant`) |
| API | Next.js App Router Route Handlers |
| Storage | Local/file mode and Postgres-ready persistence flow |
| Deployment | Vercel |

## Architecture

```mermaid
flowchart LR
  U[User] --> A[Auth: Clerk]
  A --> D[Dashboard]
  D --> G[/api/generate SSE]
  G --> P1[Requirement Parser AI]
  P1 --> P2[Scenario Generator AI]
  P2 --> P3[Test Case Generator AI]
  P3 --> P4[Synthetic Data Builder]
  P4 --> P5[Automation Skeleton Builder]
  P5 --> P6[Coverage Reviewer AI]
  P6 --> D
  D --> R[/api/runs + /api/reports]
```

## Timeline and Milestones

| Milestone | Deliverables | Status |
|---|---|---|
| M1 - Foundation | App structure, base UI, environment templates | Completed |
| M2 - Authentication | Clerk integration, protected routes, auth pages | Completed |
| M3 - Core Pipeline | 6-stage orchestrator and tab rendering | Completed |
| M4 - Persistence | Runs/reports APIs and UI integration | Completed |
| M5 - UX Hardening | Validation messaging, auth flow polish, spacing/layout fixes | Completed |
| M6 - Submission Readiness | Docs package, verification runs, production deploy | Completed |

## Risks and Dependencies

| Risk/Dependency | Impact | Mitigation |
|---|---|---|
| Third-party service availability (Clerk/Groq) | Auth/generation interruptions | Environment validation, graceful error messaging |
| AI response variability | Output inconsistency | Structured prompts + deterministic stages for data/skeleton |
| CSS centralization complexity | UI regressions | Minimal diffs, targeted selectors, build/lint validation |
| Missing production env vars | Runtime failures | Deployment checklist and `.env.example` guidance |

## Deployment Plan

1. Validate branch state and run release checks: `npm run build`, `npm run lint`, `npm run test:validate`.
2. Push to `master`.
3. Deploy via Vercel production pipeline.
4. Confirm deployment readiness and alias.
5. Execute post-deploy smoke checks:
   - auth flows,
   - generation path,
   - history/reports pages,
   - key UI validations.

## Success Criteria

- Production app is reachable and stable.
- Auth and dashboard are functional for end users.
- Generation artifacts are created and visible across all tabs.
- Submission documents are complete, readable, and reviewer-friendly.
