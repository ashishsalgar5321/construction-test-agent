'use client'

import { SignUp, useAuth } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { clerkSignUpProps } from '@/lib/clerk-auth-config'
import { clerkGuestAppearance } from '@/lib/clerk-guest-appearance'

export default function SignUpFlowRouter() {
  const { isLoaded, isSignedIn } = useAuth()
  const pathname = (usePathname() ?? '').toLowerCase()
  const router = useRouter()

  const isSignUpPath = pathname.includes('/sign-up')

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isSignUpPath) return
    const id = window.setTimeout(() => {
      router.replace('/dashboard')
    }, 1800)
    return () => window.clearTimeout(id)
  }, [isLoaded, isSignedIn, isSignUpPath, router])

  if (isLoaded && isSignedIn && isSignUpPath) {
    return (
      <div className="auth-signup-success">
        <p className="field-success">Your account has been created successfully!</p>
      </div>
    )
  }

  return (
    <SignUp
      appearance={{
        ...clerkGuestAppearance,
        elements: {
          ...clerkGuestAppearance.elements,
          socialButtons: 'auth-signup-hide-social',
          socialButtonsBlockButton: 'auth-signup-hide-social',
        },
      }}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      {...clerkSignUpProps}
    />
  )
}
