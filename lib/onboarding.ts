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

/** True when account was created recently (first-time / new-user tour). */
export function isRecentlyCreatedAccount(createdAt: Date | null | undefined): boolean {
  if (!createdAt) return false
  const ageMs = Date.now() - createdAt.getTime()
  return ageMs >= 0 && ageMs < 14 * 24 * 60 * 60 * 1000
}
