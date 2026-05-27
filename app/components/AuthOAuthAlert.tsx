'use client'

import { useSearchParams } from 'next/navigation'
import { humanizeValidationMessage } from '@/lib/validation-messages'

function messageFromParams(params: URLSearchParams): string {
  const direct =
    params.get('error_description') ||
    params.get('error') ||
    params.get('clerk_error') ||
    params.get('auth_error')

  if (direct) {
    return humanizeValidationMessage(
      decodeURIComponent(direct.replace(/\+/g, ' '))
    )
  }

  const status = params.get('__clerk_status')
  if (status === 'expired') {
    return 'Your sign-in session expired. Please try again.'
  }
  if (status === 'failed' || status === 'error') {
    return 'Google sign-in did not complete. Please choose an account and try again.'
  }

  return ''
}

/** Shows inline errors when OAuth redirect returns to sign-in / sign-up */
export default function AuthOAuthAlert() {
  const params = useSearchParams()
  const message = messageFromParams(params)

  if (!message) return null

  return (
    <p className="field-error auth-oauth-alert" role="alert">
      {message}
    </p>
  )
}

