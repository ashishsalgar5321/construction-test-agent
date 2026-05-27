import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'
import AuthOAuthAlert from '@/app/components/AuthOAuthAlert'
import AuthPasswordRules from '@/app/components/AuthPasswordRules'
import AuthShell from '@/app/components/AuthShell'
import OnboardingGuide from '@/app/components/OnboardingGuide'
import { clerkSignUpProps } from '@/lib/clerk-auth-config'
import { clerkGuestAppearance } from '@/lib/clerk-guest-appearance'

export default function SignUpPage() {
  return (
    <>
      <AuthShell mode="sign-up">
        <Suspense fallback={null}>
          <AuthOAuthAlert />
        </Suspense>
        <SignUp
          appearance={{
            ...clerkGuestAppearance,
            elements: {
              ...clerkGuestAppearance.elements,
              socialButtons: 'auth-signup-hide-social',
              socialButtonsBlockButton: 'auth-signup-hide-social',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          {...clerkSignUpProps}
        />
        <AuthPasswordRules />
      </AuthShell>
      <OnboardingGuide scene="sign-up" />
    </>
  )
}
