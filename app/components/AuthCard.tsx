import type { ReactNode } from 'react'
import AuthBackButton from '@/app/components/AuthBackButton'
import type { AuthMode } from '@/lib/auth-headings'

/** Unified auth card: back button + Clerk form */
export default function AuthCard({
  children,
  mode,
}: {
  children: ReactNode
  mode: AuthMode
}) {
  return (
    <div className="auth-card">
      <AuthBackButton mode={mode} />
      <div className="auth-card-body">{children}</div>
    </div>
  )
}
