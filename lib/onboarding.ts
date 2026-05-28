const STORAGE_PREFIX = 'constructqa-onboarding-v1'

export type GuideScene = 'home' | 'sign-in' | 'sign-up' | 'dashboard'

export interface OnboardingState {
  home: boolean
  signIn: boolean
  signUp: boolean
  dashboard: boolean
}

const defaultState: OnboardingState = {
  home: false,
  signIn: false,
  signUp: false,
  dashboard: false,
}

function storageKey(userId?: string | null): string {
  const suffix = userId?.trim() || 'guest'
  return `${STORAGE_PREFIX}-${suffix}`
}

function readState(userId?: string | null): OnboardingState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

function writeState(state: OnboardingState, userId?: string | null) {
  localStorage.setItem(storageKey(userId), JSON.stringify(state))
}

export function isGuideComplete(scene: GuideScene, userId?: string | null): boolean {
  const s = readState(userId)
  switch (scene) {
    case 'home':
      return s.home
    case 'sign-in':
      return s.signIn
    case 'sign-up':
      return s.signUp
    case 'dashboard':
      return s.dashboard
    default:
      return false
  }
}

export function markGuideComplete(scene: GuideScene, userId?: string | null) {
  const s = readState(userId)
  switch (scene) {
    case 'home':
      s.home = true
      break
    case 'sign-in':
      s.signIn = true
      break
    case 'sign-up':
      s.signUp = true
      break
    case 'dashboard':
      s.dashboard = true
      break
  }
  writeState(s, userId)
}

export function resetAllGuides(userId?: string | null) {
  localStorage.removeItem(storageKey(userId))
}

const FORCE_DASHBOARD_KEY = 'constructqa-alex-dashboard'

/** Set when sign-up completes so the dashboard tour runs for the new account. */
export function queueDashboardGuideForNewUser() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(FORCE_DASHBOARD_KEY, '1')
}

function consumeForceDashboardGuide(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(FORCE_DASHBOARD_KEY) !== '1') return false
  sessionStorage.removeItem(FORCE_DASHBOARD_KEY)
  return true
}

/** True when account was created recently (first-time / new-user tour). */
export function isRecentlyCreatedAccount(createdAt: Date | number | null | undefined): boolean {
  if (createdAt == null) return false
  const ms =
    createdAt instanceof Date
      ? createdAt.getTime()
      : typeof createdAt === 'number'
        ? createdAt
        : new Date(createdAt).getTime()
  if (Number.isNaN(ms)) return false
  const ageMs = Date.now() - ms
  return ageMs >= 0 && ageMs < 14 * 24 * 60 * 60 * 1000
}

/** Whether Alex should appear for this scene and user. */
export function shouldShowGuide(
  scene: GuideScene,
  userId: string | null | undefined,
  createdAt?: Date | number | null
): boolean {
  if (scene === 'dashboard') {
    if (!userId) return false
    if (consumeForceDashboardGuide()) return true
    if (isRecentlyCreatedAccount(createdAt)) {
      return !isGuideComplete(scene, userId)
    }
    return !isGuideComplete(scene, userId)
  }

  return !isGuideComplete(scene, userId ?? 'guest')
}
