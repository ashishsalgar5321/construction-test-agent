/** Clerk UI copy overrides (Set password, sign-up flow labels) */
export const clerkLocalization = {
  signIn: {
    forgotPassword: {
      title: 'Reset password',
      subtitle: 'Enter your registered email to receive a reset code.',
      formTitle: 'Reset password',
    },
    emailCode: {
      title: 'Verify reset code',
      subtitle: 'Enter the code sent to your email.',
      formTitle: 'Verification code',
      resendButton: 'Resend code',
    },
    resetPassword: {
      title: 'Set password',
      subtitle: 'Set and confirm your new password.',
      formButtonPrimary: 'Set password',
    },
  },
  signUp: {
    title: 'Create your account',
    subtitle: 'Enter your email to receive a verification code.',
    emailCode: {
      title: 'Verify your email',
      subtitle: 'Enter the verification code sent to your email.',
      formTitle: 'Verification code',
      resendButton: 'Resend code',
    },
    continue: {
      title: 'Set password',
      subtitle: 'Create your password to finish signing up.',
      actionText: 'Set password',
    },
  },
} as const
