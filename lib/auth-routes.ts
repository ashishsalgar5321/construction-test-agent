/** Clerk OAuth / verification sub-routes — skip page transition banner only */
export function shouldSkipAuthIntro(pathname: string | null): boolean {
  if (!pathname) return false
  const path = pathname.toLowerCase()
  return (
    path.includes('sso-callback') ||
    path.includes('reset-password') ||
    path.includes('forgot-password')
  )
}

/** Hide Alex only on recovery/OAuth handshakes — keep visible through full sign-up. */
export function shouldHideGuideForAuthPath(pathname: string | null): boolean {
  if (!pathname) return false
  const path = pathname.toLowerCase()
  if (path.includes('/sign-up')) {
    return path.includes('sso-callback')
  }
  return (
    path.includes('sso-callback') ||
    path.includes('reset-password') ||
    path.includes('forgot-password') ||
    (path.includes('/sign-in') &&
      (path.includes('factor-one') || path.includes('factor-two')))
  )
}

export function isClerkHandshake(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has('__clerk_status') ||
    searchParams.has('__clerk_ticket') ||
    searchParams.has('__clerk_redirect_url')
  )
}
