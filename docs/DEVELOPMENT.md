# Development Guide

## Prerequisites

- Node.js 22+
- Clerk application (Google OAuth optional)
- Groq API key

## Setup

```bash
git clone https://github.com/ashishsalgar5321/construction-test-agent.git
cd construction-test-agent
npm install
cp .env.example .env.local
# Fill keys in .env.local
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build + typecheck |
| `npm run lint` | ESLint (Next.js config) |
| `npm run test:groq` | Verify Groq API key |
| `npm run test:validate` | Validate sample JSON outputs |

## Environment variables

See `.env.example`. Never commit `.env.local`.

## Cursor AI setup

This repo includes:

- **Rules**: `.cursor/rules/*.mdc` — auto-applied by file type
- **Skill**: `.cursor/skills/constructqa-dev/` — invoke for feature work on this project
- **Agent context**: `AGENTS.md` — hackathon evidence + conventions

## Code style

- TypeScript strict mode
- Functional React components
- Styles only in `app/globals.css`
- Prefer editing `lib/` for pure logic; keep components presentational

## Adding a Quick Select workflow

1. Add entry to `lib/sample-requirements.ts`
2. Optionally run pipeline and save JSON under `samples/`
3. Run `npm run test:validate`

## Pre-push checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No secrets in diff
- [ ] `.env.example` updated if new env vars
- [ ] README / docs updated for user-visible changes

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Malformed JSON from AI | Ensure stages are split; check `lib/normalize-ai.ts` |
| Build error `motion.div` | Remove invalid tags; use `div` / `section` |
| Clerk redirect loop | Check `NEXT_PUBLIC_CLERK_*` URLs match routes |
| Groq rate limit | Use `llama-3.1-8b-instant`; wait or upgrade tier |
