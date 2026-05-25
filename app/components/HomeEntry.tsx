'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import OnboardingGuide from '@/app/components/OnboardingGuide'

const SPLASH_DURATION_MS = 5500

const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 11) % 98}%`,
  top: `${(i * 31 + 5) % 92}%`,
  delay: `${(i % 7) * 0.35}s`,
  dur: `${2.5 + (i % 5) * 0.6}s`,
  size: 2 + (i % 4),
}))

const FLOAT_ICONS = ['🦺', '📐', '🔧', '⚡', '🏗️', '📋']

const FEATURES = [
  { icon: '✓', label: 'AI Test Cases', color: 'feat-green' },
  { icon: '◆', label: 'OpenProject', color: 'feat-cyan' },
  { icon: '▣', label: 'Playwright', color: 'feat-purple' },
  { icon: '◎', label: 'Coverage AI', color: 'feat-amber' },
]

export default function HomeEntry() {
  const [phase, setPhase] = useState<'splash' | 'login' | 'exiting'>('splash')

  const goToLogin = useCallback(() => {
    if (phase !== 'splash') return
    setPhase('exiting')
    window.setTimeout(() => setPhase('login'), 700)
  }, [phase])

  useEffect(() => {
    const timer = window.setTimeout(goToLogin, SPLASH_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [goToLogin])

  return (
    <div className="home-entry">
      {(phase === 'splash' || phase === 'exiting') && (
        <div
          className={`splash-screen ${phase === 'exiting' ? 'splash-exit' : ''}`}
          aria-hidden={phase === 'exiting'}
        >
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
                  width: p.size,
                  height: p.size,
                  animationDelay: p.delay,
                  animationDuration: p.dur,
                }}
              />
            ))}
          </div>

          <div className="splash-float-icons" aria-hidden>
            {FLOAT_ICONS.map((icon, i) => (
              <span
                key={icon}
                className={`splash-float-icon fi-${i}`}
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                {icon}
              </span>
            ))}
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

          <div className="splash-crane" aria-hidden>
            <div className="crane-mast" />
            <div className="crane-jib" />
            <div className="crane-cable" />
            <div className="crane-load">📦</div>
            <div className="crane-beacon" />
          </div>

          <div className="splash-hero">
            <div className="splash-hero-glow" />
            <div className="splash-hero-card">
              <div className="splash-hero-border" />

              <div className="splash-badge-row">
                <span className="splash-badge splash-badge-live">
                  <span className="splash-live-dot" />
                  Live · TalentServ Hackathon 2026
                </span>
                <span className="splash-badge splash-badge-op">OpenProject</span>
              </div>

              <div className="splash-logo-ring">
                <div className="splash-logo-icon">🏗️</div>
              </div>

              <h1 className="splash-title">
                <span className="splash-title-line">Construct</span>
                <span className="splash-title-accent">QA Agent</span>
              </h1>

              <p className="splash-tagline">
                AI-powered test automation for{' '}
                <strong>construction project management</strong>
              </p>

              <div className="splash-feature-grid">
                {FEATURES.map((f) => (
                  <div key={f.label} className={`splash-feature ${f.color}`}>
                    <span className="splash-feature-icon">{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="splash-progress-wrap">
                <div className="splash-progress-track">
                  <div className="splash-progress-fill" />
                  <div className="splash-progress-shine" />
                </div>
                <span className="splash-progress-label">
                  Initializing QA pipeline…
                </span>
              </div>

              <button type="button" className="splash-cta" onClick={goToLogin}>
                <span className="splash-cta-shine" />
                Enter ConstructQA
                <span className="splash-cta-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="splash-ground" />
        </div>
      )}

      <main
        className={`login-page login-page-enter ${phase === 'login' ? 'login-visible' : ''}`}
      >
        <div className="login-orb1" />
        <div className="login-orb2" />
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">⚡</div>
            <div>
              <div className="login-logo-name">ConstructQA Agent</div>
              <div className="login-logo-sub">
                AI-Powered Test Automation · OpenProject
              </div>
            </div>
          </div>
          <h2 className="login-title">Generate test cases in seconds</h2>
          <p className="login-desc">
            Paste any construction workflow requirement and get AI-generated test
            scenarios, test cases, automation skeletons, and coverage reports
            instantly.
          </p>
          <div className="login-features">
            <div className="login-feat">✓ Positive, Negative & Role-based tests</div>
            <div className="login-feat">✓ Playwright automation skeleton</div>
            <div className="login-feat">✓ Coverage gap analysis</div>
            <div className="login-feat">✓ Export as MD / JSON / CSV</div>
          </div>
          <Link href="/sign-in" className="login-btn">
            Sign in with Google to continue
          </Link>
          <p className="login-signup-hint">
            No account?{' '}
            <Link href="/sign-up" className="login-inline-link">
              Sign up free
            </Link>
          </p>
          <p className="login-footer">
            OpenProject Reference · TalentServ Hackathon 2026
          </p>
        </div>
      </main>
      {phase === 'login' && <OnboardingGuide scene="home" />}
    </div>
  )
}
