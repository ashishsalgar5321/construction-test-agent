'use client'

import { useEffect, useMemo, useState } from 'react'
import { PASSWORD_RULES } from '@/lib/password-rules'

type Props = {
  title?: string
  className?: string
}

export default function PasswordRulesPanel({
  title = 'Password must include:',
  className = '',
}: Props) {
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const root = document.querySelector('.auth-clerk-wrap')
    if (!root) return

    const isPasswordInput = (input: HTMLInputElement) =>
      input.type === 'password' &&
      !input.name.toLowerCase().includes('current') &&
      !input.id.toLowerCase().includes('current')

    let raf = 0
    const syncPassword = () => {
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => {
        const inputs = Array.from(root.querySelectorAll('input')) as HTMLInputElement[]
        const target = inputs.find(isPasswordInput)
        setPassword(target?.value ?? '')
      })
    }

    const markTouchedAndSync = () => {
      setTouched(true)
      syncPassword()
    }

    const onPasswordField = (e: Event) => {
      const target = e.target
      if (!(target instanceof HTMLInputElement) || !isPasswordInput(target)) return
      setTouched(true)
      setPassword(target.value)
    }

    const onFocusIn = (e: Event) => {
      const target = e.target
      if (!(target instanceof HTMLInputElement) || !isPasswordInput(target)) return
      syncPassword()
    }

    /** Clerk mounts forms/buttons after load — delegate from root */
    const onSubmitCapture = (e: Event) => {
      if (e.target instanceof HTMLFormElement && root.contains(e.target)) {
        markTouchedAndSync()
      }
    }

    const onClickCapture = (e: Event) => {
      if (!(e.target instanceof Element) || !root.contains(e.target)) return
      const btn = e.target.closest('button, [role="button"], a.cl-formButtonPrimary')
      if (btn && root.contains(btn)) {
        markTouchedAndSync()
      }
      syncPassword()
    }

    syncPassword()
    root.addEventListener('input', onPasswordField, true)
    root.addEventListener('change', onPasswordField, true)
    root.addEventListener('keyup', onPasswordField, true)
    root.addEventListener('paste', onPasswordField, true)
    root.addEventListener('cut', onPasswordField, true)
    root.addEventListener('blur', onPasswordField, true)
    root.addEventListener('focusin', onFocusIn, true)
    root.addEventListener('submit', onSubmitCapture, true)
    root.addEventListener('click', onClickCapture, true)

    const observer = new MutationObserver(() => {
      syncPassword()
    })
    observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true })

    return () => {
      window.cancelAnimationFrame(raf)
      observer.disconnect()
      root.removeEventListener('input', onPasswordField, true)
      root.removeEventListener('change', onPasswordField, true)
      root.removeEventListener('keyup', onPasswordField, true)
      root.removeEventListener('paste', onPasswordField, true)
      root.removeEventListener('cut', onPasswordField, true)
      root.removeEventListener('blur', onPasswordField, true)
      root.removeEventListener('focusin', onFocusIn, true)
      root.removeEventListener('submit', onSubmitCapture, true)
      root.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  const rules = useMemo(() => {
    const checks = [
      password.length >= 8,
      /[A-Za-z]/.test(password),
      /\d/.test(password),
    ]
    return PASSWORD_RULES.map((rule, idx) => ({ rule, ok: checks[idx] }))
  }, [password])

  const allGood = rules.every((r) => r.ok) && password.length > 0

  return (
    <div className={`password-rules ${className}`} aria-label="Password requirements">
      <p className="password-rules-title">{title}</p>
      <ul className="password-rules-list">
        {rules.map(({ rule, ok }) => (
          <li
            key={rule}
            className={!touched ? 'rule-neutral' : ok ? 'rule-ok' : 'rule-fail'}
          >
            {rule}
          </li>
        ))}
      </ul>
      {touched && (
        <p className={`password-rules-summary ${allGood ? 'ok' : 'pending'}`}>
          {allGood
            ? 'You meet all the password requirements.'
            : 'Complete the highlighted password requirements.'}
        </p>
      )}
    </div>
  )
}
