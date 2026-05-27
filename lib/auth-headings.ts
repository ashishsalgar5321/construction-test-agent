export type AuthMode = 'sign-in' | 'sign-up'

export type AuthHeading = { title: string; subtitle: string }

export function getAuthHeading(pathname: string, mode: AuthMode): AuthHeading {
  const path = pathname.toLowerCase()

  if (path.includes('reset-password') || (path.includes('/sign-up') && path.includes('continue'))) {
    return {
      title: 'Set password',
      subtitle: 'Set a new password and confirm it to complete account recovery.',
    }
  }

  if (
    path.includes('verify-email') ||
    path.includes('verify-phone') ||
    path.includes('factor-one') ||
    path.includes('factor-two')
  ) {
    return {
      title: 'Verify your email',
      subtitle: 'Enter the verification code we sent to your registered email address.',
    }
  }

  if (path.includes('forgot-password')) {
    return {
      title: 'Reset password',
      subtitle: 'Enter your registered email. We will send a reset code to your inbox.',
    }
  }

  if (mode === 'sign-up') {
    return {
      title: 'Create your account',
      subtitle: 'Enter your email first. We will send a verification code before you set your password.',
    }
  }

  return {
    title: 'Welcome',
    subtitle: 'Sign in with your email and password. Google sign-in is below if you prefer.',
  }
}
