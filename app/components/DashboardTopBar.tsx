import DashboardNav, { type DashboardTab } from '@/app/components/DashboardNav'
import DashboardUserNav from '@/app/components/DashboardUserNav'
import ConstructBrandMark from '@/app/components/ConstructBrandMark'

interface Props {
  active: DashboardTab
  fallbackName: string
  fallbackEmail: string
  statusLabel?: string
}

export default function DashboardTopBar({
  active,
  fallbackName,
  fallbackEmail,
  statusLabel = 'Ready',
}: Props) {
  return (
    <nav className="topnav">
      <div className="nav-logo">
        <ConstructBrandMark size="compact" />
      </div>
      <DashboardNav active={active} />
      <div className="nav-right">
        <div className="ai-status">
          <span className="status-dot" />
          {statusLabel}
        </div>
        <DashboardUserNav
          fallbackName={fallbackName}
          fallbackEmail={fallbackEmail}
        />
      </div>
    </nav>
  )
}
