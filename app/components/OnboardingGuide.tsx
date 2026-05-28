'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import GuideEngineer from '@/app/components/GuideEngineer'
import { shouldHideGuideForAuthPath } from '@/lib/auth-routes'
import {
  AUTH_SIGN_IN_LINES,
  AUTH_SIGN_UP_LINES,
  AUTH_SIGN_UP_VERIFY_LINES,
  DASHBOARD_LINES,
  HOME_LOGIN_LINES,
  personalizeMessage,
  type GuideLine,
} from '@/lib/guide-scripts'
import {
  isGuideComplete,
  isRecentlyCreatedAccount,
  markGuideComplete,
  type GuideScene,
} from '@/lib/onboarding'

interface Props {
  scene: GuideScene
  userName?: string
}

function getLines(scene: GuideScene, pathname: string): GuideLine[] {
  const path = pathname.toLowerCase()
  if (scene === 'sign-up' && (path.includes('verify') || path.includes('factor'))) {
    return AUTH_SIGN_UP_VERIFY_LINES
  }
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
  const pathname = usePathname() ?? ''
  const { isLoaded: authLoaded, userId } = useAuth()
  const { user } = useUser()
  const lines = getLines(scene, pathname)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  const storageUserId = userId ?? 'guest'
  const isNewAccount =
    scene === 'dashboard' && isRecentlyCreatedAccount(user?.createdAt ?? null)

  useEffect(() => {
    if (scene === 'dashboard' && !authLoaded) return
    if (shouldHideGuideForAuthPath(pathname)) return
    if (isGuideComplete(scene, storageUserId)) return

    const delay = scene === 'dashboard' ? (isNewAccount ? 600 : 900) : 500
    const timer = window.setTimeout(() => setVisible(true), delay)
    return () => window.clearTimeout(timer)
  }, [scene, pathname, storageUserId, authLoaded, isNewAccount])

  const current = lines[step]
  const highlightId = current?.highlightId

  const [spotRect, setSpotRect] = useState<DOMRect | null>(null)

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
    markGuideComplete(scene, storageUserId)
    setVisible(false)
  }, [scene, storageUserId])

  const handleAction = () => {
    if (step < lines.length - 1) {
      setStep((s) => s + 1)
      return
    }
    finish()
  }

  if (shouldHideGuideForAuthPath(pathname) || !visible || lines.length === 0) {
    return null
  }

  if (typeof document === 'undefined') return null

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

  const content = (
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

  return createPortal(content, document.body)
}
