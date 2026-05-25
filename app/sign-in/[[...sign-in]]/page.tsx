import { SignIn } from '@clerk/nextjs'
import AuthShell from '@/app/components/AuthShell'
import OnboardingGuide from '@/app/components/OnboardingGuide'
import { clerkAppearance } from '@/lib/clerk-appearance'

export default function SignInPage() {
  return (
    <>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to generate AI test suites for your construction workflows."
      >
        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        />
      </AuthShell>
      <OnboardingGuide scene="sign-in" />
    </>
  )
}
