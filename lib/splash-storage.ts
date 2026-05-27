/** Splash once per browser tab session — not on in-app back navigation */
export const SPLASH_SESSION_KEY = 'constructqa-splash-session'

export function hasSeenSplashThisSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(SPLASH_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markSplashSeenThisSession(): void {
  try {
    window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1')
  } catch {
    /* private mode */
  }
}
