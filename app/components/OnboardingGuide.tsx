'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import GuideEngineer from '@/app/components/GuideEngineer'
import { shouldHideGuideForAuthPath } from '@/lib/auth-routes'
import {
  AUTH_SIGN_IN_LINES,
  AUTH_SIGN_UP_CONTINUE_LINES,
  AUTH_SIGN_UP_LINES,
  AUTH_SIGN_UP_VERIFY_LINES,
  DASHBOARD_LINES,
  HOME_LOGIN_LINES,
  personalizeMessage,
  type GuideLine,
} from '@/lib/guide-scripts'
import {
  isRecentlyCreatedAccount,
  markGuideComplete,
  queueDashboardGuideForNewUser,
  shouldShowGuide,
  type GuideScene,
} from '@/lib/onboarding'

interface Props {
  scene: GuideScene
  userName?: string
}

function getLines(scene: GuideScene, pathname: string): GuideLine[] {
  const path = pathname.toLowerCase()
  if (scene === 'sign-up') {
    if (
      path.includes('continue') ||
      path.includes('create-password') ||
      path.includes('set-password')
    ) {
      return AUTH_SIGN_UP_CONTINUE_LINES
    }
    if (path.includes('verify') || path.includes('factor')) {
      return AUTH_SIGN_UP_VERIFY_LINES
    }
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

function isSignUpPasswordStep(): boolean {
  if (typeof document === 'undefined') return false
  const root = document.querySelector('.auth-clerk-wrap')
  if (!root) return false
  return Boolean(
    root.querySelector(
      'input[type="password"], input[name="password"], input[name="newPassword"]'
    )
  )
}

export default function OnboardingGuide({ scene, userName = 'there' }: Props) {
  const pathname = usePathname() ?? ''
  const { isLoaded: authLoaded, userId } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const lines = getLines(scene, pathname)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const showTimerRef = useRef<number | null>(null)

  const storageUserId = scene === 'dashboard' ? userId : userId ?? undefined
  const createdAt = user?.createdAt ?? null
  const isNewAccount = scene === 'dashboard' && isRecentlyCreatedAccount(createdAt)
  const authReady = scene === 'dashboard' ? authLoaded && userLoaded && Boolean(userId) : true
  const canShow =
    authReady &&
    !shouldHideGuideForAuthPath(pathname) &&
    shouldShowGuide(scene, storageUserId ?? null, createdAt) &&
    lines.length > 0

  useEffect(() => {
    if (scene !== 'sign-up') return

    const maybeQueueDashboard = () => {
      const path = pathname.toLowerCase()
      if (
        path.includes('continue') ||
        path.includes('create-password') ||
        path.includes('set-password') ||
        isSignUpPasswordStep()
      ) {
        queueDashboardGuideForNewUser()
      }
    }

    maybeQueueDashboard()
    const root = document.querySelector('.auth-clerk-wrap')
    if (!root) return

    const observer = new MutationObserver(maybeQueueDashboard)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [scene, pathname])

  useEffect(() => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }

    if (!canShow) {
      return
    }

    const delay = scene === 'dashboard' ? (isNewAccount ? 700 : 1000) : 450
    showTimerRef.current = window.setTimeout(() => {
      setStep(0)
      setVisible(true)
    }, delay)

    return () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
    }
  }, [canShow, scene, isNewAccount, pathname, storageUserId])

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
    if (storageUserId || scene !== 'dashboard') {
      markGuideComplete(scene, storageUserId ?? null)
    }
    setVisible(false)
  }, [scene, storageUserId])

  const handleAction = () => {
    if (step < lines.length - 1) {
      setStep((s) => s + 1)
      return
    }
    finish()
  }

  if (shouldHideGuideForAuthPath(pathname) || !visible || !current) {
    return null
  }

  if (typeof document === 'undefined') {
    return null
  }

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
