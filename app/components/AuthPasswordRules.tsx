'use client'

import { useAuth } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import PasswordRulesPanel from '@/app/components/PasswordRulesPanel'

function isVerifyPath(pathname: string): boolean {
  const path = pathname.toLowerCase()
  return (
    path.includes('verify-email') ||
    path.includes('verify-phone') ||
    path.includes('factor-one') ||
    path.includes('factor-two')
  )
}

function isForgotPasswordPath(pathname: string): boolean {
  return pathname.toLowerCase().includes('forgot-password')
}

function findSignUpPasswordInput(root: Element): HTMLInputElement | null {
  const inputs = Array.from(root.querySelectorAll('input[type="password"]')) as HTMLInputElement[]
  return (
    inputs.find((input) => {
      const name = input.name.toLowerCase()
      const id = input.id.toLowerCase()
      return !name.includes('current') && !id.includes('current')
    }) ?? null
  )
}

function hasOtpStep(root: Element): boolean {
  return !!root.querySelector(
    '[data-input-otp-container], .cl-otpCodeFieldInputContainer, .cl-otpCodeField, input[autocomplete="one-time-code"]'
  )
}

/** Password rules on sign-up only when Clerk shows a new-password field (not email/code/ack). */
export default function AuthPasswordRules() {
  const pathname = usePathname() ?? ''
  const { isLoaded, isSignedIn } = useAuth()
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)
  const [showRules, setShowRules] = useState(false)

  const isSignUp = pathname.includes('/sign-up')
  const canShowSignUpRules =
    isSignUp && !isVerifyPath(pathname) && !isForgotPasswordPath(pathname)

  useEffect(() => {
    if (!canShowSignUpRules) {
      return
    }

    const root = document.querySelector('.auth-clerk-wrap')
    if (!root) return

    const sync = () => {
      const passwordInput = findSignUpPasswordInput(root)
      const shouldShow = Boolean(passwordInput) && !hasOtpStep(root)
      setShowRules(shouldShow)

      if (!shouldShow || !passwordInput) {
        setMountNode(null)
        return
      }

      const passwordRow =
        passwordInput.closest('.cl-formFieldRow') ||
        passwordInput.closest('.cl-formField')
      const inputGroup = passwordInput.closest('.cl-formFieldInputGroup')
      const inputWrap = passwordInput.closest('.cl-formFieldInput')
      const insertAfter =
        (inputGroup?.parentElement === passwordRow ? inputGroup : null) ??
        (inputWrap?.parentElement === passwordRow ? inputWrap : null) ??
        inputGroup ??
        inputWrap

      if (!passwordRow || !insertAfter) {
        setMountNode(null)
        return
      }

      let host = root.querySelector('.constructqa-password-rules-host') as HTMLElement | null
      if (!host) {
        host = document.createElement('div')
        host.className = 'constructqa-password-rules-host'
      }

      if (insertAfter.parentElement === passwordRow) {
        if (insertAfter.nextElementSibling !== host) {
          insertAfter.insertAdjacentElement('afterend', host)
        }
      } else if (passwordRow.lastElementChild !== host) {
        passwordRow.appendChild(host)
      }

      setMountNode(host)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [canShowSignUpRules, pathname])

  if (!canShowSignUpRules || !showRules) return null
  if (isLoaded && isSignedIn) return null

  const panel = (
    <PasswordRulesPanel className="auth-password-rules-inline" title="Password must include:" />
  )

  if (mountNode) {
    return createPortal(panel, mountNode)
  }

  return panel
}
