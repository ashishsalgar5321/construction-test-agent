import { Suspense } from 'react'
import AuthOAuthAlert from '@/app/components/AuthOAuthAlert'
import AuthPasswordRules from '@/app/components/AuthPasswordRules'
import AuthShell from '@/app/components/AuthShell'
import OnboardingGuide from '@/app/components/OnboardingGuide'
import SignUpFlowRouter from '@/app/components/SignUpFlowRouter'

export default function SignUpPage() {
  return (
    <>
      <AuthShell mode="sign-up">
        <Suspense fallback={null}>
          <AuthOAuthAlert />
        </Suspense>
        <SignUpFlowRouter />
        <AuthPasswordRules />
      </AuthShell>
      <OnboardingGuide scene="sign-up" />
    </>
  )
}
