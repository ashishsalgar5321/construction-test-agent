'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { useSignUp } from '@clerk/nextjs'

type Step = 'email' | 'code' | 'password'

function normalizeError(err: unknown): string {
  if (typeof err === 'string') return err
  if (!err || typeof err !== 'object') return 'Something went wrong. Please try again.'
  const first = (err as {
    errors?: Array<{ message?: string; longMessage?: string; code?: string }>
  }).errors?.[0]
  const code = first?.code || ''
  const msg = first?.longMessage || first?.message || ''

  if (code.includes('captcha') || msg.toLowerCase().includes('captcha')) {
    return 'Sign-up blocked by CAPTCHA verification. Please refresh and try again.'
  }
  if (code === 'form_identifier_exists') {
    return 'This email is already registered. Please sign in instead.'
  }
  if (msg) return msg
  return 'Something went wrong. Please try again.'
}

export default function EmailCodeSignUpFlow() {
  const router = useRouter()
  const signUpState = useSignUp() as unknown as {
    signUp?: {
      create: (payload: { emailAddress: string }) => Promise<unknown>
      prepareEmailAddressVerification: (payload: { strategy: 'email_code' }) => Promise<unknown>
      attemptEmailAddressVerification: (payload: { code: string }) => Promise<unknown>
      update: (payload: { password: string }) => Promise<unknown>
    }
    setActive?: (payload: { session: string }) => Promise<unknown>
  }
  const signUp = signUpState.signUp
  const setActive = signUpState.setActive
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submitLabel = useMemo(() => {
    if (loading) return 'Please wait...'
    if (step === 'email') return 'Continue'
    if (step === 'code') return 'Verify code'
    return 'Set password'
  }, [loading, step])

  const onEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!signUp) return
    const value = email.trim()
    if (!value) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await signUp.create({ emailAddress: value })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('code')
      setSuccess(`Verification code sent to ${value}`)
    } catch (err) {
      console.error('EmailCodeSignUpFlow email step failed:', err)
      setError(normalizeError(err))
    } finally {
      setLoading(false)
    }
  }

  const onCodeSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!signUp) return
    const value = code.trim()
    if (!value) {
      setError('Verification code is required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const attempt = (await signUp.attemptEmailAddressVerification({
        code: value,
      })) as { status?: string; createdSessionId?: string }

      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive?.({ session: attempt.createdSessionId })
        router.replace('/dashboard')
        return
      }

      setStep('password')
      setSuccess('Email verified. Set your password to finish.')
    } catch (err) {
      console.error('EmailCodeSignUpFlow code step failed:', err)
      setError(normalizeError(err))
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!signUp) return
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const updated = (await signUp.update({ password })) as {
        status?: string
        createdSessionId?: string
      }
      if (updated.status === 'complete' && updated.createdSessionId) {
        await setActive?.({ session: updated.createdSessionId })
        router.replace('/dashboard')
        return
      }
      setError('Password was set, but sign-up is not complete yet. Please try again.')
    } catch (err) {
      console.error('EmailCodeSignUpFlow password step failed:', err)
      setError(normalizeError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="manual-signup">
      <div className="manual-signup-header">
        {step === 'email' && 'Enter your email to continue.'}
        {step === 'code' && 'Enter the verification code from your email.'}
        {step === 'password' && 'Set your password to complete sign-up.'}
      </div>

      {error && <p className="field-error">{error}</p>}
      {success && <p className="field-success">{success}</p>}

      {step === 'email' && (
        <form onSubmit={onEmailSubmit} className="manual-signup-form">
          <label className="manual-signup-label" htmlFor="signup-email">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            className="manual-signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            required
          />
          <div id="clerk-captcha" className="manual-signup-captcha" />
          <button type="submit" className="clerk-btn-primary manual-signup-btn" disabled={loading}>
            {submitLabel}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={onCodeSubmit} className="manual-signup-form">
          <label className="manual-signup-label" htmlFor="signup-code">
            Verification code
          </label>
          <input
            id="signup-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="manual-signup-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            disabled={loading}
            required
          />
          <button type="submit" className="clerk-btn-primary manual-signup-btn" disabled={loading}>
            {submitLabel}
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={onPasswordSubmit} className="manual-signup-form">
          <label className="manual-signup-label" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            className="manual-signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8+ characters"
            disabled={loading}
            minLength={8}
            required
          />
          <button type="submit" className="clerk-btn-primary manual-signup-btn" disabled={loading}>
            {submitLabel}
          </button>
        </form>
      )}

      <p className="manual-signup-footer">
        Already have an account?{' '}
        <Link className="clerk-link" href="/sign-in">
          Sign in
        </Link>
      </p>
    </div>
  )
}
