import { Suspense } from 'react'
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
          <a className="auth-forgot-link" href="/sign-in/forgot-password">
            Forgot password?
          </a>
        </p>
        <p className="auth-signin-note">
          Use your registered password to sign in. Use <strong>Forgot password</strong> only when you need a reset code.
        </p>
      </AuthShell>
      <OnboardingGuide scene="sign-in" />
    </>
  )
}
