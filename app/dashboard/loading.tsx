import ConstructBrandMark from '@/app/components/ConstructBrandMark'
import RotatingTagline from '@/app/components/RotatingTagline'

export default function DashboardLoading() {
  return (
    <div className="page-loading">
      <ConstructBrandMark size="hero" />
      <RotatingTagline className="page-loading-tagline" intervalMs={2400} />
      <p className="page-loading-hint">Preparing your QA workspace…</p>
    </div>
  )
}
