import { Suspense } from 'react'
import Link from 'next/link'
import AuthOAuthAlert from '@/app/components/AuthOAuthAlert'
import AuthPasswordRules from '@/app/components/AuthPasswordRules'
import AuthShell from '@/app/components/AuthShell'
import SignInFlowRouter from '@/app/components/SignInFlowRouter'
import OnboardingGuide from '@/app/components/OnboardingGuide'

export default function SignInPage() {
  return (
    <>
      <AuthShell mode="sign-in">
        <Suspense fallback={null}>
          <AuthOAuthAlert />
        </Suspense>
        <AuthPasswordRules />
        <SignInFlowRouter />
        <p className="auth-forgot-row">
          <Link className="auth-forgot-link" href="/sign-in/forgot-password">
            Forgot password?
          </Link>
        </p>
        <p className="auth-signin-note">
          Use your registered password to sign in. Use <strong>Forgot password</strong> only when you need a reset code.
        </p>
      </AuthShell>
      <OnboardingGuide scene="sign-in" />
    </>
  )
}
