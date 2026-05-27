/** Clerk OAuth / verification sub-routes — skip intro overlay so auth can finish */
export function shouldSkipAuthIntro(pathname: string | null): boolean {
  if (!pathname) return false
  const path = pathname.toLowerCase()
  return (
    path.includes('sso-callback') ||
    path.includes('/continue') ||
    path.includes('verify') ||
    path.includes('factor-one') ||
    path.includes('factor-two') ||
    path.includes('reset-password') ||
    path.includes('forgot-password')
  )
}

export function isClerkHandshake(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has('__clerk_status') ||
    searchParams.has('__clerk_ticket') ||
    searchParams.has('__clerk_redirect_url')
  )
}
