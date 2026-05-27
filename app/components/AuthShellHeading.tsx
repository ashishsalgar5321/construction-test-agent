'use client'

import { usePathname } from 'next/navigation'
import { getAuthHeading, type AuthMode } from '@/lib/auth-headings'

export default function AuthShellHeading({ mode }: { mode: AuthMode }) {
  const pathname = usePathname() ?? ''
  const { title, subtitle } = getAuthHeading(pathname, mode)

  return (
    <div className="auth-heading">
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>
    </div>
  )
}
