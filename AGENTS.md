# ConstructQA Agent — Agent & Developer Guide

> Primary context for AI assistants (Cursor, Claude) and contributors.  
> **Skill**: `.cursor/skills/constructqa-dev/` · **Rules**: `.cursor/rules/*.mdc`

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16

This is **not** the Next.js version from older training data. Read guides in `node_modules/next/dist/docs/` before changing routing, middleware, or data APIs. Follow deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repository standards

| Topic | Location |
|-------|----------|
| Folder layout | [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Dev workflow | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| User setup | [README.md](README.md) |

### Layout summary

- `app/` — routes, API, components, `globals.css`
- `lib/` — prompts, Groq, normalization, samples, onboarding
- `public/` — static images (`alex-engineer.png`)
- `samples/` + `tests/` — demo outputs and validation evidence
- `.cursor/rules/` — enforced coding conventions
- `.cursor/skills/constructqa-dev/` — project skill for feature work

### Hard rules

1. **No Framer Motion** — do not use `motion.div` or add `framer-motion`; use semantic HTML (`div`, `section`, `figure`).
2. **No Tailwind in JSX** — styles live in `app/globals.css`.
3. **Split AI pipeline** — never one prompt for all stages (JSON truncation).
4. **No secrets in git** — only `.env.example`; use `.env.local` locally.
5. **Minimal diffs** — match existing naming and patterns.

### Verification

```bash
npm run build && npm run lint && npm run test:validate
```

---

## Agentic Programming Evidence (Hackathon)

### AI tools used

- **Cursor IDE** — implementation, refactoring, rules/skills setup
- **Claude** — architecture, prompts, debugging, review

### Stages demonstrated

| Stage | Evidence |
|-------|----------|
| 1. Requirements | MVP scope, QA persona, 25 Quick Select workflows |
| 2. Design | 6-stage pipeline, JSON schemas, OpenProject mapping |
| 3. Implementation | App Router UI, SSE API, Clerk auth, Alex onboarding |
| 4. Testing | `tests/tool-validation.md`, `npm run test:validate`, `samples/` |
| 5. Review | Auth on API, env gitignore, pipeline split fix |
| 6. Iteration | Polarity UI, splash/auth theme, 3D Alex guide character |

### Product AI pipeline

1. Requirement Parser — Groq  
2. Scenario Generator — Groq  
3. Test Case Generator — Groq  
4. Synthetic Test Data — `lib/test-data-builder.ts`  
5. Automation Skeleton — `lib/skeleton-builder.ts`  
6. Coverage Reviewer — Groq  

Each AI stage: dedicated prompt in `lib/prompts.ts`, structured JSON, SSE progress in `app/api/generate/route.ts`.

### Sample outputs

- `samples/work-package-output.json`
- `samples/role-based-access-output.json`
- `samples/dashboard-validation-output.json`

---

## When implementing features

1. Read the matching `.cursor/rules/*.mdc` for the files you edit.
2. Use skill **constructqa-dev** for multi-file or pipeline changes.
3. Update `README.md` / `docs/` if behavior or env vars change.
4. Run build + lint before recommending a GitHub push.
