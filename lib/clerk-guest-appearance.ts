import { clerkAppearance } from '@/lib/clerk-appearance'

/** Classic black-accent Clerk theme for sign-in / sign-up only */
export const clerkGuestAppearance = {
  ...clerkAppearance,
  variables: {
    ...clerkAppearance.variables,
    colorPrimary: '#1a1a1a',
    colorBackground: '#0a0a0f',
    colorInputBackground: '#141418',
    colorInputText: '#f8fafc',
    colorText: '#f8fafc',
    colorTextSecondary: '#b8c0cc',
    colorNeutral: '#94a3b8',
    borderRadius: '0.5rem',
  },
}
