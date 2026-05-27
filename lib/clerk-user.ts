type ClerkUserLike = {
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  username?: string | null
  primaryEmailAddress?: { emailAddress: string } | null
} | null | undefined

/** Single source of truth for name shown in nav, guides, and profile UI */
export function getClerkDisplayName(user: ClerkUserLike): string {
  if (!user) return 'Engineer'

  const full = user.fullName?.trim()
  if (full) return full

  const parts = [user.firstName, user.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')

  const username = user.username?.trim()
  if (username) return username

  const email = user.primaryEmailAddress?.emailAddress
  if (email) return email.split('@')[0] ?? 'Engineer'

  return 'Engineer'
}

export function getClerkPrimaryEmail(user: ClerkUserLike): string {
  return user?.primaryEmailAddress?.emailAddress ?? ''
}
