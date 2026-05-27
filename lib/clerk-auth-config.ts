/**
 * Shared Clerk auth props for sign-in / sign-up.
 *
 * Email verification & password rules are controlled in Clerk Dashboard
 * (see docs/CLERK-AUTH-SETUP.md). This app expects:
 * - Sign-up: email → verification code → set password (verify at sign-up ON in Dashboard)
 * - Sign-in: email + password first, Google optional below
 */
export const clerkOAuthProps = {
  oauthFlow: 'redirect' as const,
  /** Forces Google account picker when multiple users share a device */
  oidcPrompt: 'select_account',
} as const

export const clerkSignUpProps = {
  ...clerkOAuthProps,
  forceRedirectUrl: '/dashboard',
  fallbackRedirectUrl: '/dashboard',
} as const

export const clerkSignInProps = {
  ...clerkOAuthProps,
  forceRedirectUrl: '/dashboard',
  fallbackRedirectUrl: '/dashboard',
} as const
