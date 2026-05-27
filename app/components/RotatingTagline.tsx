'use client'

import { useEffect, useState } from 'react'
import { CONSTRUCTION_TAGLINES } from '@/lib/taglines'

type Props = {
  className?: string
  intervalMs?: number
  /** Show one fixed line (e.g. page exit) */
  fixed?: string
}

export default function RotatingTagline({
  className = '',
  intervalMs = 3200,
  fixed,
}: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (fixed) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % CONSTRUCTION_TAGLINES.length),
      intervalMs
    )
    return () => window.clearInterval(id)
  }, [fixed, intervalMs])

  const text = fixed ?? CONSTRUCTION_TAGLINES[index]

  return (
    <p className={`rotating-tagline ${className}`} role="status" aria-live="polite">
      <span key={text} className="rotating-tagline-text">
        {text}
      </span>
    </p>
  )
}
