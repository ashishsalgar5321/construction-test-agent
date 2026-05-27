'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Adds verify-page class for OTP layout (email code step) */
export default function AuthVerifyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isVerify =
    pathname?.includes('verify-email') ||
    pathname?.includes('verify-phone') ||
    pathname?.includes('factor-one') ||
    pathname?.includes('factor-two')

  if (!isVerify) return <>{children}</>

  return <div className="auth-page-verify">{children}</div>
}
