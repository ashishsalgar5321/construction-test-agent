# Deploy ConstructQA on Vercel

## 1. Push to GitHub

Ensure the repo is connected to Vercel (Import Project).

## 2. Environment variables

In **Vercel → Project → Settings → Environment Variables**, set:

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes |
| `CLERK_SECRET_KEY` | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `GROQ_API_KEY` | Yes |
| `POSTGRES_URL` | Yes (production history/reports) |

Clerk setup: see [CLERK-AUTH-SETUP.md](./CLERK-AUTH-SETUP.md).

## 3. Vercel Postgres (History & Reports)

1. In the Vercel project, open **Storage** → **Create Database** → **Postgres** (Neon).
2. Connect it to the project — Vercel injects `POSTGRES_URL` automatically.
3. Redeploy. Tables `test_runs` and `test_reports` are created on first save.

Without `POSTGRES_URL`, the app uses local JSON files under `data/` (works on `npm run dev` only; **not** persistent on Vercel serverless).

## 4. Deploy

```bash
npm run build
```

Vercel runs this on each deploy. `vercel.json` sets `maxDuration: 300` for `/api/generate`.

## 5. After deploy

1. Open your Vercel URL → sign in.
2. Generate a test suite on **Dashboard**.
3. Confirm **History** lists the run and **Reports** shows Markdown + JSON downloads.

## Routes

| Path | Description |
|------|-------------|
| `/dashboard` | Generate tests |
| `/dashboard/history` | User run history |
| `/dashboard/reports` | Saved test reports |
