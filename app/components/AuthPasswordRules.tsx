'use client'

import { usePathname } from 'next/navigation'
import PasswordRulesPanel from '@/app/components/PasswordRulesPanel'
import { shouldSkipAuthIntro } from '@/lib/auth-routes'

/** Password rules on sign-up / reset — no DOM injection (avoids React unmount races). */
export default function AuthPasswordRules() {
  const pathname = usePathname() ?? ''

  const isVerifyStep =
    pathname.includes('verify-email') || pathname.includes('verify-phone')
  const isSignUp = pathname.includes('/sign-up')
  const isSetPassword =
    pathname.includes('reset-password') ||
    (pathname.includes('/sign-up') && pathname.includes('continue'))

  if (
    shouldSkipAuthIntro(pathname) ||
    isVerifyStep ||
    (!isSignUp && !isSetPassword)
  ) {
    return null
  }

  return (
    <PasswordRulesPanel
      className="auth-password-rules-inline"
      title={isSetPassword ? 'New password must include:' : 'Password must include:'}
    />
  )
}
