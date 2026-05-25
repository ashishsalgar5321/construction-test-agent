---
name: constructqa-dev
description: Develop and maintain ConstructQA Agent (Next.js 16, Clerk, Groq AI pipeline, construction QA UI). Use when implementing features, fixing bugs, extending the dashboard, API routes, prompts, onboarding guide, or preparing GitHub releases for this repository.
---

# ConstructQA Development

## Quick context

Hackathon app: paste construction requirements → 6-stage pipeline → test cases, data, Playwright skeleton, coverage. Live: README deploy URL.

## Workflow

1. Read `docs/FOLDER-STRUCTURE.md` and `docs/ARCHITECTURE.md` if touching multiple areas.
2. Follow `.cursor/rules/*.mdc` (auto-loaded by Cursor).
3. Implement minimal diff; match `app/globals.css` patterns.
4. Run `npm run build`, `npm run lint`, `npm run test:validate` before suggesting a commit.

## Critical pitfalls

- **No `motion.div`** — project has no Framer Motion; use plain HTML elements or split into `GuideSpeechBubble.tsx`-style files.
- **No mega-prompt** — keep AI stages separate in `app/api/generate/route.ts`.
- **Next.js 16** — check `node_modules/next/dist/docs/` before using deprecated APIs.
- **Secrets** — only `.env.example` in git; keys in `.env.local`.

## Key extension points

| Feature | Where |
|---------|--------|
| New Quick Select sample | `lib/sample-requirements.ts` |
| New AI stage / prompt | `lib/prompts.ts`, `app/api/generate/route.ts` |
| Dashboard UI | `app/dashboard/DashboardClient.tsx` |
| Alex guide copy | `lib/guide-scripts.ts` |
| Auth UI | `lib/clerk-appearance.ts`, `app/components/AuthShell.tsx` |

## GitHub readiness

- Do not commit `.next/`, `node_modules/`, `.env.local`.
- Update `tests/validation-results.md` when changing pipeline output shape.
- Add sample JSON under `samples/` if output schema changes.

## Reference

- `docs/DEVELOPMENT.md` — setup and checklist
- `AGENTS.md` — agent rules and hackathon evidence
