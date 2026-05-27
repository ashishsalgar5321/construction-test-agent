'use client'

import Link from 'next/link'
import type { AuthMode } from '@/lib/auth-headings'

export default function AuthBackButton({ mode }: { mode: AuthMode }) {
  const isSignUp = mode === 'sign-up'
  return (
    <Link href={isSignUp ? '/sign-in' : '/'} className="auth-btn-back auth-btn-back--link">
      {isSignUp ? 'Already have an account? Sign in' : 'Back to home'}
    </Link>
  )
}
