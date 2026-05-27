'use client'

import { SignIn } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import ForgotPasswordFlow from '@/app/components/ForgotPasswordFlow'
import { clerkGuestAppearance } from '@/lib/clerk-guest-appearance'
import { clerkSignInProps } from '@/lib/clerk-auth-config'

export default function SignInFlowRouter() {
  const pathname = (usePathname() ?? '').toLowerCase()
  const isForgotPassword = pathname.includes('/sign-in/forgot-password')

  if (isForgotPassword) {
    return <ForgotPasswordFlow />
  }

  return (
    <SignIn
      appearance={clerkGuestAppearance}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      {...clerkSignInProps}
    />
  )
}
