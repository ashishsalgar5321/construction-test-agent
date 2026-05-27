'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/clerk-appearance'
import { getClerkDisplayName, getClerkPrimaryEmail } from '@/lib/clerk-user'

type Props = {
  fallbackName: string
  fallbackEmail: string
}

/** Nav name + UserButton — always synced with Clerk profile edits */
export default function DashboardUserNav({ fallbackName, fallbackEmail }: Props) {
  const { user, isLoaded } = useUser()

  const displayName =
    isLoaded && user ? getClerkDisplayName(user) : fallbackName
  const email = isLoaded && user ? getClerkPrimaryEmail(user) : fallbackEmail

  return (
    <div className="nav-user-block">
      <span className="user-name" title={email}>
        {displayName}
      </span>
      <UserButton
        appearance={clerkAppearance}
        userProfileProps={{
          appearance: clerkAppearance,
        }}
      />
    </div>
  )
}
