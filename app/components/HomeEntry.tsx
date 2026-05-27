'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ConstructBrandMark from '@/app/components/ConstructBrandMark'
import GuestSplashBackground from '@/app/components/GuestSplashBackground'
import OnboardingGuide from '@/app/components/OnboardingGuide'
import PageTransitionBanner from '@/app/components/PageTransitionBanner'
import { PAGE_TRANSITION_MS } from '@/lib/page-transition'
import { hasSeenSplashThisSession, markSplashSeenThisSession } from '@/lib/splash-storage'

const SPLASH_DURATION_MS = 5500

const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 11) % 98}%`,
  top: `${(i * 31 + 5) % 92}%`,
  delay: `${(i % 7) * 0.35}s`,
  dur: `${2.5 + (i % 5) * 0.6}s`,
  size: 2 + (i % 4),
}))

const FLOAT_ICONS = [
  { cls: 'fi-0', icon: '🦺' },
  { cls: 'fi-1', icon: '📐' },
  { cls: 'fi-2', icon: '🔧' },
  { cls: 'fi-3', icon: '⚡' },
  { cls: 'fi-4', icon: '🏗️' },
  { cls: 'fi-5', icon: '📋' },
]

const FEATURES = [
  { icon: '✓', label: 'Test Cases', color: 'feat-green' },
  { icon: '◆', label: 'Scenarios', color: 'feat-cyan' },
  { icon: '▣', label: 'Playwright', color: 'feat-purple' },
  { icon: '◎', label: 'Coverage', color: 'feat-amber' },
]

interface Props {
  /** When true, after splash go straight to dashboard */
  signedIn?: boolean
}

export default function HomeEntry({ signedIn = false }: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<'splash' | 'login' | 'exiting'>(() =>
    hasSeenSplashThisSession() ? 'login' : 'splash'
  )

  const finishSplash = useCallback(() => {
    markSplashSeenThisSession()
    if (signedIn) {
      router.replace('/dashboard')
      return
    }
    if (phase === 'login') return
    setPhase('exiting')
    window.setTimeout(() => setPhase('login'), PAGE_TRANSITION_MS)
  }, [phase, router, signedIn])

  useEffect(() => {
    if (phase !== 'splash') return
    const timer = window.setTimeout(finishSplash, SPLASH_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [phase, finishSplash])

  const showSplash = phase === 'splash' || phase === 'exiting'
  const showLogin = phase === 'login' || phase === 'exiting'

  return (
    <div className="home-entry guest-surface">
      {showLogin && <GuestSplashBackground />}
      <PageTransitionBanner show={phase === 'exiting'} />

      {showSplash && (
        <main className={`splash-screen ${phase === 'exiting' ? 'splash-exit' : ''}`}>
          <div className="splash-aurora" />
          <div className="splash-aurora splash-aurora-2" />
          <div className="splash-sky" />
          <div className="splash-vignette" />
          <div className="splash-grid" />
          <div className="splash-scanline" />

          <div className="splash-particles" aria-hidden>
            {PARTICLES.map((p) => (
              <span
                key={p.id}
                className="splash-particle"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.dur,
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}
          </div>

          <div className="splash-float-icons" aria-hidden>
            {FLOAT_ICONS.map(({ cls, icon }) => (
              <span key={cls} className={`splash-float-icon ${cls}`}>
                {icon}
              </span>
            ))}
          </div>

          <div className="splash-hero">
            <div className="splash-hero-glow" aria-hidden />
            <div className="splash-hero-card">
              <div className="splash-hero-border" aria-hidden />

              <div className="splash-badge-row">
                <span className="splash-badge splash-badge-live">
                  <span className="splash-live-dot" aria-hidden />
                  Construction QA Platform
                </span>
              </div>

              <div className="splash-logo-ring">
                <div className="splash-logo-icon" aria-hidden>
                  🏗️
                </div>
              </div>

              <h1 className="splash-title">
                <span className="splash-title-line">Construct</span>
                <span className="splash-title-accent">QA Agent</span>
              </h1>

              <p className="splash-tagline">
                Test automation for <strong>construction project management</strong>
              </p>

              <div className="splash-feature-grid" aria-label="Capabilities">
                {FEATURES.map((f) => (
                  <div key={f.label} className={`splash-feature ${f.color}`}>
                    <span className="splash-feature-icon">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

              <div className="splash-progress-wrap">
                <div className="splash-progress-track">
                  <div className="splash-progress-fill" />
                  <div className="splash-progress-shine" />
                </div>
                <span className="splash-progress-label">Initializing QA pipeline…</span>
              </div>

              <button type="button" className="splash-cta" onClick={finishSplash}>
                <span className="splash-cta-shine" aria-hidden />
                Enter ConstructQA
                <span className="splash-cta-arrow" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </div>

          <div className="splash-skyline" aria-hidden>
            {[90, 120, 160, 200, 140, 100, 75, 110, 85].map((h, i) => (
              <div
                key={i}
                className={`building b${i}`}
                style={{ height: h, width: 36 + (i % 4) * 14 }}
              />
            ))}
          </div>
          <div className="splash-ground" />
        </main>
      )}

      <main
        className={`login-page login-page-enter ${showLogin ? 'login-visible' : ''}`}
        hidden={!showLogin}
      >
        <div className="login-card">
          <ConstructBrandMark size="compact" />

          <h1 className="login-title">AI Construction QA Agent</h1>
          <p className="login-desc">
            Generate scenarios, test cases, and automation code from construction workflow
            requirements.
          </p>

          <div className="login-features" aria-label="Capabilities">
            {FEATURES.map((f) => (
              <div key={f.label} className={`login-feat ${f.color}`}>
                <span className="feat-icon">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <Link className="login-btn" href="/sign-in">
            Sign in
          </Link>

          <p className="login-signup-hint">
            New here?{' '}
            <Link className="login-inline-link" href="/sign-up">
              Create an account
            </Link>
          </p>

          <div className="login-footer">Built for the Construction QA Hackathon</div>
        </div>
      </main>

      {phase === 'login' && <OnboardingGuide scene="home" />}
    </div>
  )
}
