'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import GuideEngineer from '@/app/components/GuideEngineer'
import { shouldSkipAuthIntro } from '@/lib/auth-routes'
import {
  AUTH_SIGN_IN_LINES,
  AUTH_SIGN_UP_LINES,
  DASHBOARD_LINES,
  HOME_LOGIN_LINES,
  personalizeMessage,
  type GuideLine,
} from '@/lib/guide-scripts'
import { isGuideComplete, markGuideComplete, type GuideScene } from '@/lib/onboarding'

interface Props {
  scene: GuideScene
  userName?: string
}

function getLines(scene: GuideScene): GuideLine[] {
  switch (scene) {
    case 'home':
      return HOME_LOGIN_LINES
    case 'sign-in':
      return AUTH_SIGN_IN_LINES
    case 'sign-up':
      return AUTH_SIGN_UP_LINES
    case 'dashboard':
      return DASHBOARD_LINES
    default:
      return []
  }
}

export default function OnboardingGuide({ scene, userName = 'there' }: Props) {
  const pathname = usePathname()
  const lines = getLines(scene)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [spotRect, setSpotRect] = useState<DOMRect | null>(null)

  const current = lines[step]
  const highlightId = current?.highlightId

  useEffect(() => {
    if (isGuideComplete(scene)) return
    const timer = window.setTimeout(() => setVisible(true), scene === 'dashboard' ? 900 : 500)
    return () => window.clearTimeout(timer)
  }, [scene])

  useEffect(() => {
    if (!visible || !highlightId) return

    const update = () => {
      const el = document.getElementById(highlightId)
      setSpotRect(el ? el.getBoundingClientRect() : null)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const timer = window.setInterval(update, 400)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.clearInterval(timer)
    }
  }, [visible, highlightId, step])

  useEffect(() => {
    if (!visible || !highlightId) return
    const el = document.getElementById(highlightId)
    if (!el) return
    el.classList.add('guide-highlight-target')
    return () => el.classList.remove('guide-highlight-target')
  }, [visible, highlightId, step])

  const finish = useCallback(() => {
    markGuideComplete(scene)
    setVisible(false)
  }, [scene])

  const handleAction = () => {
    if (step < lines.length - 1) {
      setStep((s) => s + 1)
      return
    }
    finish()
  }

  if (shouldSkipAuthIntro(pathname) || !visible || lines.length === 0) return null

  const message = personalizeMessage(current.message, userName)
  const pointing =
    highlightId === 'guide-quick-select' || highlightId === 'guide-generate-btn'
      ? 'right'
      : 'center'

  const pad = 8

  const spotlightStyle =
    visible && highlightId && spotRect
      ? {
          top: spotRect.top - pad,
          left: spotRect.left - pad,
          width: spotRect.width + pad * 2,
          height: spotRect.height + pad * 2,
        }
      : undefined

  return (
    <>
      {spotlightStyle && (
        <>
          <div className="guide-overlay" aria-hidden />
          <div className="guide-spotlight" style={spotlightStyle} aria-hidden />
        </>
      )}
      <div className={`guide-mount guide-scene-${scene}`}>
        <GuideEngineer
          message={message}
          stepIndex={step}
          totalSteps={lines.length}
          actionLabel={current.actionLabel ?? 'Continue'}
          onAction={handleAction}
          onSkip={finish}
          pointing={pointing}
          compact={scene !== 'dashboard'}
        />
      </div>
    </>
  )
}


