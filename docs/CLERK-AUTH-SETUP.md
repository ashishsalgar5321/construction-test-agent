# Clerk auth setup (ConstructQA)

Configure once in [Clerk Dashboard](https://dashboard.clerk.com) so sign-in, sign-up, and profile match this app.

## 1. Sign-up flow (email → code → set password)

1. **User & Authentication → Email, phone, username**
2. Enable **Email address**
3. Enable **Password**
4. Turn **ON** “Verify at sign-up” / “Require email verification”
5. Save

Expected user journey:

1. **Sign up** — enter email only (Google is hidden on this screen in the app)
2. **Verify email** — enter the 6-digit code from email
3. **Set password** — choose password (Clerk route: `/sign-up/continue` or reset-password step)
4. **Dashboard** — signed in

Users must not reach **Set password** until the email code is verified. Clerk enforces this when verification at sign-up is enabled.

## 2. Sign-in flow (existing users)

1. **Email + password** fields appear first (Google is below the form)
2. Optional **Google** sign-in at the bottom
3. If MFA / email code is required, user sees **Verify your email** with visible OTP boxes (`/sign-in/factor-one`)

## 3. Google sign-in (optional)

1. **User & Authentication → Social connections → Google** — enable
2. Enable **“Always show account selector”** (recommended)
3. Google is available on **sign-in** only in the app UI; new users use email → code → password on sign-up

## 4. Forgot password / set password labels

The app renames Clerk’s “Reset password” step to **Set password** (localization + UI copy).

## 5. Profile ↔ dashboard sync

The dashboard uses `useUser()` so profile name/email updates appear immediately.

## 6. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`

## 7. After changing Dashboard settings

Restart the dev server and hard-refresh (`Ctrl+Shift+R`).
