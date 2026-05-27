'use client'

import { useRouter } from 'next/navigation'
import { KeyboardEvent, useMemo, useRef, useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import PasswordRulesPanel from '@/app/components/PasswordRulesPanel'

type ResetStep = 'password' | 'code'

function hasPasswordRules(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

function parseError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  if (!err || typeof err !== 'object') return 'Something went wrong. Please try again.'
  const first = (err as { errors?: Array<{ message?: string; longMessage?: string }> }).errors?.[0]
  return first?.longMessage || first?.message || JSON.stringify(err)
}

export default function ForgotPasswordFlow() {
  const router = useRouter()
  const signInState = useSignIn() as unknown as {
    signIn?: {
      create: (params: { strategy: 'reset_password_email_code'; identifier: string }) => Promise<{
        error?: { message?: string; longMessage?: string } | null
      }>
      resetPasswordEmailCode: {
        sendCode: () => Promise<{ error?: { message?: string; longMessage?: string } | null }>
        verifyCode: (params: { code: string }) => Promise<{
          error?: { message?: string; longMessage?: string } | null
        }>
        submitPassword: (params: { password: string }) => Promise<{
          error?: { message?: string; longMessage?: string } | null
        }>
      }
      finalize: () => Promise<{ error?: { message?: string; longMessage?: string } | null }>
    }
  }
  const { signIn } = signInState

  const [step, setStep] = useState<ResetStep>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const codeRefs = useRef<Array<HTMLInputElement | null>>([])

  const code = useMemo(() => digits.join(''), [digits])

  const submitPasswordStep = async () => {
    if (!signIn) return
    const identifier = email.trim()
    if (!identifier) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter the password.')
      return
    }
    if (!hasPasswordRules(password)) {
      setError('Please satisfy all password requirements.')
      return
    }
    if (confirmPassword !== password) {
      setError('Passwords do not match. Please try again.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const created = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier,
      })
      if (created.error) {
        throw new Error(created.error.longMessage || created.error.message || 'Unable to start password reset.')
      }
      const sent = await signIn.resetPasswordEmailCode.sendCode()
      if (sent.error) {
        throw new Error(sent.error.longMessage || sent.error.message || 'Unable to send reset code.')
      }
      setStep('code')
      setSuccess('Reset code sent to your registered email.')
      setTimeout(() => codeRefs.current[0]?.focus(), 0)
    } catch (err) {
      console.error('ForgotPasswordFlow send code failed:', err)
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  const submitCodeStep = async () => {
    if (!signIn) return
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const verified = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      })
      if (verified.error) {
        throw new Error(verified.error.longMessage || verified.error.message || 'Invalid code.')
      }
      const submitted = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      })
      if (submitted.error) {
        throw new Error(
          submitted.error.longMessage || submitted.error.message || 'Unable to set the new password.'
        )
      }
      const finalized = await signIn.finalize()
      if (finalized.error) {
        throw new Error(finalized.error.longMessage || finalized.error.message || 'Unable to complete sign-in.')
      }
      router.replace('/dashboard')
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  const onCodeKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus()
    }
  }

  const onCodeChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[idx] = clean
      return next
    })
    if (clean && idx < 5) codeRefs.current[idx + 1]?.focus()
  }

  return (
    <div className="manual-reset">
      {error && <p className="field-error">{error}</p>}
      {success && <p className="field-success">{success}</p>}

      {step === 'password' && (
        <div className="manual-reset-form">
          <label className="manual-signup-label" htmlFor="reset-email">
            Registered email
          </label>
          <input
            id="reset-email"
            type="email"
            className="manual-signup-input"
            autoComplete="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label className="manual-signup-label" htmlFor="reset-password-new">
            New password
          </label>
          <div className="manual-password-wrap">
            <input
              id="reset-password-new"
              type={showNewPassword ? 'text' : 'password'}
              className="manual-signup-input"
              autoComplete="new-password"
              placeholder="Create a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="manual-password-toggle"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <label className="manual-signup-label" htmlFor="reset-password-confirm">
            Confirm password
          </label>
          <div className="manual-password-wrap">
            <input
              id="reset-password-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              className="manual-signup-input"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="manual-password-toggle"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <PasswordRulesPanel className="auth-password-rules-inline" />
          <div id="clerk-captcha" className="manual-signup-captcha" />

          <button
            type="button"
            className="clerk-btn-primary manual-signup-btn"
            onClick={submitPasswordStep}
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Send reset code'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="manual-reset-form">
          <label className="manual-signup-label">Enter code sent to your email</label>
          <div className="manual-reset-code-grid">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  codeRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="manual-reset-code-box"
                maxLength={1}
                value={digit}
                onChange={(e) => onCodeChange(idx, e.target.value)}
                onKeyDown={(e) => onCodeKeyDown(idx, e)}
                disabled={loading}
              />
            ))}
          </div>
          <button
            type="button"
            className="clerk-btn-primary manual-signup-btn"
            onClick={submitCodeStep}
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Verify code'}
          </button>
        </div>
      )}
    </div>
  )
}
