import type { ReactNode } from 'react'
import AuthCard from '@/app/components/AuthCard'
import AuthClerkWrap from '@/app/components/AuthClerkWrap'
import AuthPageGate from '@/app/components/AuthPageGate'
import AuthShellHeading from '@/app/components/AuthShellHeading'
import AuthVerifyLayout from '@/app/components/AuthVerifyLayout'
import ConstructBrandMark from '@/app/components/ConstructBrandMark'
import GuestSplashBackground from '@/app/components/GuestSplashBackground'
import RotatingTagline from '@/app/components/RotatingTagline'
import type { AuthMode } from '@/lib/auth-headings'

interface Props {
  children: ReactNode
  mode?: AuthMode
}

export default function AuthShell({ children, mode = 'sign-in' }: Props) {
  return (
    <main
      className={`auth-page guest-surface auth-page-${mode === 'sign-up' ? 'signup' : 'signin'}`}
    >
      <GuestSplashBackground />

      <div className={`auth-shell auth-shell-${mode}`}>
        <AuthPageGate>
          <ConstructBrandMark size="compact" />
          <RotatingTagline className="auth-tagline" />
          <AuthShellHeading mode={mode} />
          <AuthVerifyLayout>
            <AuthCard mode={mode}>
              <AuthClerkWrap>{children}</AuthClerkWrap>
            </AuthCard>
          </AuthVerifyLayout>
        </AuthPageGate>
      </div>
    </main>
  )
}
