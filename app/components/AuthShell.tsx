import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <main className="auth-page">
      <div className="auth-aurora" />
      <div className="auth-orb1" />
      <div className="auth-orb2" />
      <div className="auth-grid" />

      <div className="auth-shell">
        <Link href="/" className="auth-back">
          ← Back to home
        </Link>

        <div className="auth-brand">
          <div className="auth-brand-icon">🏗️</div>
          <div>
            <div className="auth-brand-name">ConstructQA Agent</div>
            <div className="auth-brand-sub">OpenProject · Construction QA</div>
          </div>
        </div>

        <div className="auth-heading">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        <div className="auth-clerk-wrap">{children}</div>

        <p className="auth-footer">TalentServ Hackathon 2026 · Secure Clerk Auth</p>
      </div>
    </main>
  )
}
