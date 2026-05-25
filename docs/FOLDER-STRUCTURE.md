# Folder Structure

Standard layout for **ConstructQA Agent** (Next.js 16 App Router).

```
construction-test-agent/
├── .cursor/
│   ├── rules/              # Cursor AI rules (*.mdc)
│   └── skills/
│       └── constructqa-dev/  # Project skill (SKILL.md)
├── .github/
│   └── workflows/          # CI (build, lint, validate)
├── app/                    # Next.js App Router
│   ├── api/
│   │   └── generate/       # POST — SSE 6-stage pipeline
│   ├── components/         # Client UI (home, auth shell, guide)
│   ├── hooks/              # Client hooks (useTypewriter, etc.)
│   ├── dashboard/          # Protected dashboard
│   ├── sign-in/            # Clerk sign-in
│   ├── sign-up/            # Clerk sign-up
│   ├── globals.css         # All application styles
│   ├── layout.tsx          # Root layout + ClerkProvider
│   └── page.tsx            # Home → HomeEntry
├── docs/                   # Project documentation
├── lib/                    # Shared logic (no React)
├── public/                 # Static assets (alex-engineer.png, etc.)
├── samples/                # Example pipeline JSON outputs
├── scripts/                # Node maintenance scripts (.mjs)
├── tests/                  # Manual validation docs
├── AGENTS.md               # AI agent + hackathon evidence
├── CLAUDE.md               # Points to AGENTS.md
├── README.md               # Setup, deploy, checklist
├── middleware.ts           # Clerk route protection
├── .env.example            # Env template (committed)
└── vercel.json             # Deploy config (API timeout)
```

## Conventions

- **Pages** live under `app/<route>/page.tsx`.
- **Client components** use `'use client'` at top of file in `app/components/` or `*Client.tsx` files.
- **No `src/` directory** — root-level `app/` and `lib/` per current repo standard.
- **Imports** use `@/lib/...` and `@/app/...` via `tsconfig` paths.

## Do not add

- Duplicate nested `construction-test-agent/` inside the repo.
- Committed `.env.local` or `.next/` build output.
- Component-level Tailwind (project uses `globals.css` only).
