# ConstructQA Agent

> AI-Powered Test Automation Agent for Construction Project Management Workflows

Built for TalentServ 2-Day Agentic Programming Hackathon 2026.

## Live Demo

[https://construction-test-agent.vercel.app](https://construction-test-agent.vercel.app)

## Hackathon Completion Checklist

| Requirement | Status |
|-------------|--------|
| Third-party auth (Clerk login/logout) | Done |
| Protected dashboard route | Done |
| User name/email visible | Done |
| Requirement input + 25 Quick Select samples | Done |
| 6-stage AI agent pipeline | Done |
| Positive, negative, role, status, dashboard, regression tests | Done |
| Positive/Negative sort, filter, badges on Test Cases tab | Done |
| Synthetic test data | Done |
| Playwright + API automation skeleton | Done |
| Coverage / risk summary | Done |
| Traceability matrix tab | Done |
| Export MD / CSV / JSON | Done |
| User history (saved runs) | Done |
| Test reports (MD + JSON per run) | Done |
| 10 tool validation cases + results | Done |
| Sample generated outputs (3 workflows) | Done |
| Deployed on Vercel | See [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md) |
| Agentic programming evidence | See AGENTS.md |

## What It Does

ConstructQA Agent accepts a construction workflow requirement and runs it through a **6-stage AI pipeline**:

1. **Requirement Parser** (AI)
2. **Scenario Generator** (AI) — positive, negative, role, status, dashboard, regression
3. **Test Case Generator** (AI)
4. **Synthetic Test Data** (structured builder)
5. **Automation Skeleton** (Playwright + REST API)
6. **Coverage Reviewer** (AI)

## Tech Stack

- Next.js 16.2.6 (App Router, TypeScript)
- Clerk (authentication — Google login)
- Groq AI — `llama-3.1-8b-instant`
- Vercel (deployment)

## Setup Instructions

### Prerequisites

- Node.js v22+
- [Clerk](https://clerk.com) account (free)
- [Groq](https://console.groq.com) API key (free)

### Installation

```bash
git clone https://github.com/ashishsalgar5321/construction-test-agent.git
cd construction-test-agent
npm install
cp .env.example .env.local
# Edit .env.local with your Clerk and Groq keys
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Verify

```bash
npm run build
npm run test:groq
npm run test:validate
```

## Deploy to Vercel

1. Push repo to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables from `.env.example`
4. Deploy — `vercel.json` sets 300s timeout for `/api/generate`

## AI Pipeline

```
Requirement → Parser → Scenarios → Test Cases → Test Data → Skeleton → Coverage
```

## Sample Requirements

25 Quick Select workflows in the dashboard sidebar, including:

1. Work package creation and assignment
2. Due date and overdue tracking
3. Role-based access control
4. Dashboard validation
5. Status transition flow
6. Budget, time logging, documents, Gantt, meetings, and more

Full list: [lib/sample-requirements.ts](lib/sample-requirements.ts)

## Sample Generated Outputs

- [samples/work-package-output.json](samples/work-package-output.json)
- [samples/role-based-access-output.json](samples/role-based-access-output.json)
- [samples/dashboard-validation-output.json](samples/dashboard-validation-output.json)

## Test Evidence

- [tests/tool-validation.md](tests/tool-validation.md) — 10 validation cases
- [tests/validation-results.md](tests/validation-results.md) — pass/fail results

## Agentic Programming Evidence

See [AGENTS.md](AGENTS.md) for Cursor/Claude usage across design, implementation, testing, and iteration.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Standard repo layout |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & pipeline |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local dev, scripts, pre-push checklist |
| [docs/submission/README.md](docs/submission/README.md) | Final submission document pack for judges |
| [AGENTS.md](AGENTS.md) | AI agent rules & hackathon evidence |

## Cursor AI (rules & skills)

- **Rules**: `.cursor/rules/` — project conventions (auto-applied in Cursor)
- **Skill**: `.cursor/skills/constructqa-dev/` — use for ConstructQA feature work

## Known Limitations

- Groq free tier daily token limits — use `llama-3.1-8b-instant`
- Generation takes 15–45 seconds
- History/reports need `POSTGRES_URL` on Vercel (local dev uses `data/` files)
- Test data and skeleton are template builders (not AI calls) for reliability
- Traceability % depends on AI linking scenario IDs; re-run Generate if below 90%

## OpenProject Reference

Domain model based on [OpenProject](https://github.com/opf/openproject). No local OpenProject install required.
