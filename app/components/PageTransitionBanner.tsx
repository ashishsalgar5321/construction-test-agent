'use client'

import ConstructBrandMark from '@/app/components/ConstructBrandMark'

/** Full-screen logo + tagline during page transitions */
export default function PageTransitionBanner({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="page-transition-banner" role="status" aria-live="polite">
      <div className="page-transition-banner-inner">
        <ConstructBrandMark
          size="hero"
          showTagline
          tagline="Your construction project is on the way…"
        />
      </div>
    </div>
  )
}
