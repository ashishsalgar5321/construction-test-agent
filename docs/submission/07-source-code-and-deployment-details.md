# Source Code and Deployment Details

## 1) Repository

- **Project:** ConstructQA Agent
- **Source:** `https://github.com/ashishsalgar5321/construction-test-agent`
- **Primary stack:** Next.js 16, TypeScript, Clerk, Groq

## 2) Live Deployment

- **Vercel URL:** [https://construction-test-agent.vercel.app](https://construction-test-agent.vercel.app)

## 3) Local Setup Instructions

### Prerequisites

- Node.js v22+
- npm
- Clerk account
- Groq API key

### Installation

```bash
git clone https://github.com/ashishsalgar5321/construction-test-agent.git
cd construction-test-agent
npm install
cp .env.example .env.local
```

Update `.env.local` with valid values.

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## 4) Required Environment Variables

Minimum required keys:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (usually `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (usually `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (usually `/dashboard`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (usually `/dashboard`)
- `GROQ_API_KEY`

Optional:

- `POSTGRES_URL` (for production-grade run/report persistence)
- `NEXT_PUBLIC_OPENPROJECT_URL` (for OpenProject module links in dashboard)

## 5) Build and Validation

Use this release checklist:

```bash
npm run build
npm run lint
npm run test:validate
```

## 6) Deployment Steps (Vercel)

1. Push latest repository state to GitHub.
2. Import the project in Vercel.
3. Add all required environment variables.
4. Deploy and monitor build logs.
5. Verify:
   - auth flows
   - generation pipeline
   - history and reports

Detailed guide: `docs/DEPLOY-VERCEL.md`.

## 7) Source Layout Reference

- `app/` - routes, API handlers, and UI components
- `lib/` - prompts, builders, normalization, shared logic
- `samples/` - sample generated outputs
- `tests/` - validation evidence documents
- `docs/` - architecture, development, and submission package
