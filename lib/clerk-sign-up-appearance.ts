import { clerkAppearance } from '@/lib/clerk-appearance'

/** Sign-up: email → code → set password (no Google on first step) */
export const clerkSignUpAppearance = {
  ...clerkAppearance,
  layout: {
    ...clerkAppearance.layout,
    socialButtonsPlacement: 'bottom' as const,
  },
  elements: {
    ...clerkAppearance.elements,
    socialButtons: 'auth-signup-hide-social',
    socialButtonsBlockButton: 'auth-signup-hide-social',
  },
}
