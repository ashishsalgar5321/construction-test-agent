# Cursor configuration

This folder is **committed to the repo** so all contributors share the same AI guidance.

## Rules (`.cursor/rules/`)

| File | Scope |
|------|--------|
| `project-core.mdc` | Always applied |
| `nextjs-react.mdc` | `app/**/*` |
| `ai-pipeline.mdc` | API + `lib` AI modules |
| `styling.mdc` | `globals.css`, Clerk theme |
| `typescript-lib.mdc` | `lib/**/*.ts` |

## Skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| `constructqa-dev` | Building or fixing ConstructQA features |

Invoke in chat: e.g. “use constructqa-dev skill to add …”

## More docs

- [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)
- [AGENTS.md](../AGENTS.md)
