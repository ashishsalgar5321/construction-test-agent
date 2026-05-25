import { SignUp } from '@clerk/nextjs'
import AuthShell from '@/app/components/AuthShell'
import OnboardingGuide from '@/app/components/OnboardingGuide'
import { clerkAppearance } from '@/lib/clerk-appearance'

export default function SignUpPage() {
  return (
    <>
      <AuthShell
        title="Create your account"
        subtitle="Join ConstructQA to automate OpenProject construction test cases."
      >
        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        />
      </AuthShell>
      <OnboardingGuide scene="sign-up" />
    </>
  )
}
