'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { humanizeValidationMessage } from '@/lib/validation-messages'

const ERROR_SELECTORS = [
  '.clerk-field-error',
  '.clerk-field-error-row',
  '.cl-formFieldErrorText',
  '.cl-formFieldErrorText__errorText',
  '.cl-formFieldError',
  '.cl-fieldError',
  '.cl-fieldErrorText',
  '.clerk-alert-text',
  '.cl-alertText',
].join(',')

const FEEDBACK_SELECTORS = [
  '.cl-formFieldError',
  '.cl-formFieldErrorText',
  '.cl-formFieldHintText',
  '.cl-formFieldSuccessText',
  '.cl-formFieldWarningText',
  '.cl-fieldError',
  '.cl-fieldErrorText',
].join(',')

function isInsideOtp(node: Element): boolean {
  return !!node.closest(
    '[data-input-otp-container], .cl-otpCodeFieldInputContainer, .cl-otpCodeField, .clerk-otp-field'
  )
}

/** Disable native validation; rewrite errors; keep OTP fields interactive */
export default function AuthClerkWrap({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isVerify =
    pathname.includes('verify-email') ||
    pathname.includes('verify-phone') ||
    pathname.includes('factor-one') ||
    pathname.includes('factor-two')
  const tuningRef = useRef(false)

  useEffect(() => {
    const root = document.querySelector('.auth-clerk-wrap')
    if (!root) return

    const disableNativeValidation = () => {
      root.querySelectorAll('form').forEach((form) => {
        form.setAttribute('novalidate', 'true')
      })
    }

    const rewriteErrors = () => {
      root.querySelectorAll(ERROR_SELECTORS).forEach((el) => {
        if (isInsideOtp(el)) return
        const node = el as HTMLElement
        const text = node.textContent?.trim()
        if (!text) return
        const friendly = humanizeValidationMessage(text)
        if (friendly !== text) {
          node.textContent = friendly
        }
      })
    }

    const collapseEmptySlots = () => {
      root.querySelectorAll(FEEDBACK_SELECTORS).forEach((el) => {
        if (isInsideOtp(el)) return
        const node = el as HTMLElement
        const text = node.textContent?.trim()
        node.classList.toggle('clerk-feedback-empty', !text)
      })
    }

    const rewriteAuthCopy = () => {
      root.querySelectorAll('.cl-formButtonPrimary button, button.cl-formButtonPrimary').forEach((btn) => {
        const el = btn as HTMLButtonElement
        const text = el.textContent?.trim()
        if (text === 'Reset Password' || text === 'Reset password') {
          el.textContent = 'Set password'
        }
      })
      root.querySelectorAll('.cl-formFieldRow').forEach((row) => {
        if (!row.querySelector('input[type="checkbox"]')) return
        row.querySelectorAll('label, span, p').forEach((node) => {
          const el = node as HTMLElement
          el.style.color = '#e2e8f0'
        })
      })

    }

    const ensureOtpClickable = () => {
      root
        .querySelectorAll(
          '[data-input-otp-container] input, .cl-otpCodeFieldInputContainer input, input[autocomplete="one-time-code"]'
        )
        .forEach((input) => {
          const el = input as HTMLInputElement
          el.style.pointerEvents = 'auto'
          el.style.zIndex = '20'
          el.removeAttribute('disabled')
          el.setAttribute('inputmode', 'numeric')
          el.setAttribute('autocomplete', 'one-time-code')
        })
    }

    const clearErrorsForField = (input: HTMLInputElement) => {
      if (isInsideOtp(input)) return
      input.removeAttribute('aria-invalid')
      const row =
        input.closest('.cl-formFieldRow') ||
        input.closest('.cl-formField') ||
        input.closest('form')
      if (!row) return
      row.querySelectorAll(ERROR_SELECTORS).forEach((el) => {
        const node = el as HTMLElement
        node.textContent = ''
        node.classList.add('clerk-feedback-empty')
      })
      row.querySelectorAll(FEEDBACK_SELECTORS).forEach((el) => {
        const node = el as HTMLElement
        if (!node.textContent?.trim()) {
          node.classList.add('clerk-feedback-empty')
        }
      })
      const form = input.closest('form')
      form?.querySelectorAll('.clerk-alert, .cl-alert').forEach((alert) => {
        const text = (alert as HTMLElement).textContent?.toLowerCase() ?? ''
        if (
          text.includes('email') ||
          text.includes('password') ||
          text.includes('required') ||
          text.includes('enter')
        ) {
          ;(alert as HTMLElement).style.display = 'none'
        }
      })
    }

    const bindLiveValidationClear = () => {
      root
        .querySelectorAll(
          'input[type="email"], input[type="password"], input[type="text"]:not([data-input-otp-input])'
        )
        .forEach((input) => {
          const el = input as HTMLInputElement
          if (el.dataset.cqClearBound === '1') return
          el.dataset.cqClearBound = '1'
          const onChange = () => clearErrorsForField(el)
          el.addEventListener('input', onChange)
          el.addEventListener('change', onChange)
        })
    }

    const tuneLayout = () => {
      if (tuningRef.current) return
      tuningRef.current = true
      try {
        disableNativeValidation()
        rewriteErrors()
        collapseEmptySlots()
        rewriteAuthCopy()
        ensureOtpClickable()
        bindLiveValidationClear()
      } finally {
        tuningRef.current = false
      }
    }

    tuneLayout()

    let debounceId = 0
    const observer = new MutationObserver(() => {
      window.clearTimeout(debounceId)
      debounceId = window.setTimeout(tuneLayout, 120)
    })
    observer.observe(root, { childList: true, subtree: true })

    const onInput = (e: Event) => {
      const target = e.target
      if (target instanceof HTMLInputElement) clearErrorsForField(target)
    }
    root.addEventListener('input', onInput, true)

    return () => {
      window.clearTimeout(debounceId)
      observer.disconnect()
      root.removeEventListener('input', onInput, true)
    }
  }, [])

  return (
    <div
      className={`auth-clerk-wrap auth-clerk-wrap--otp-safe${isVerify ? ' auth-clerk-wrap--verify' : ''}`}
    >
      {children}
    </div>
  )
}
