'use client'

import Link from 'next/link'

export type DashboardTab = 'dashboard' | 'history' | 'reports'

const TABS: { id: DashboardTab; label: string; href: string }[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'history', label: 'History', href: '/dashboard/history' },
  { id: 'reports', label: 'Reports', href: '/dashboard/reports' },
]

export default function DashboardNav({ active }: { active: DashboardTab }) {
  return (
    <div className="nav-pills">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`nav-pill ${active === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
