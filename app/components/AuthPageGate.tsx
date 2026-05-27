'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import PageTransitionBanner from '@/app/components/PageTransitionBanner'
import { isClerkHandshake, shouldSkipAuthIntro } from '@/lib/auth-routes'
import { PAGE_TRANSITION_MS } from '@/lib/page-transition'

function AuthPageGateInner({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const skipIntro = shouldSkipAuthIntro(pathname) || isClerkHandshake(searchParams)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    if (skipIntro) {
      const id = window.setTimeout(() => setShowIntro(false), 0)
      return () => window.clearTimeout(id)
    }
    const startId = window.setTimeout(() => setShowIntro(true), 0)
    const endId = window.setTimeout(() => setShowIntro(false), PAGE_TRANSITION_MS)
    return () => {
      window.clearTimeout(startId)
      window.clearTimeout(endId)
    }
  }, [skipIntro, pathname])

  return (
    <>
      <PageTransitionBanner show={showIntro} />
      <div className="auth-shell-content">{children}</div>
    </>
  )
}

/** Intro overlay only — never hide Clerk (required for Google OAuth callback). */
export default function AuthPageGate({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="auth-shell-content">{children}</div>}>
      <AuthPageGateInner>{children}</AuthPageGateInner>
    </Suspense>
  )
}

