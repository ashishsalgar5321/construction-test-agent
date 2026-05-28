const STORAGE_PREFIX = 'constructqa-onboarding-v1'
const SESSION_DONE_PREFIX = 'constructqa-guide-session-done-'
const FORCE_DASHBOARD_KEY = 'constructqa-alex-dashboard'

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

function sceneFlag(state: OnboardingState, scene: GuideScene): boolean {
  switch (scene) {
    case 'home':
      return state.home
    case 'sign-in':
      return state.signIn
    case 'sign-up':
      return state.signUp
    case 'dashboard':
      return state.dashboard
    default:
      return false
  }
}

function setSceneFlag(state: OnboardingState, scene: GuideScene, value: boolean) {
  switch (scene) {
    case 'home':
      state.home = value
      break
    case 'sign-in':
      state.signIn = value
      break
    case 'sign-up':
      state.signUp = value
      break
    case 'dashboard':
      state.dashboard = value
      break
  }
}

function sessionDoneKey(scene: GuideScene): string {
  return `${SESSION_DONE_PREFIX}${scene}`
}

function isSessionGuideComplete(scene: GuideScene): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(sessionDoneKey(scene)) === '1'
  } catch {
    return false
  }
}

function markSessionGuideComplete(scene: GuideScene) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(sessionDoneKey(scene), '1')
  } catch {
    /* private mode */
  }
}

/** Normalize Clerk createdAt (Date, ms, or seconds). */
export function toCreatedAtMs(createdAt: Date | number | string | null | undefined): number | null {
  if (createdAt == null) return null
  if (createdAt instanceof Date) {
    const ms = createdAt.getTime()
    return Number.isNaN(ms) ? null : ms
  }
  if (typeof createdAt === 'number') {
    const ms = createdAt < 1e12 ? createdAt * 1000 : createdAt
    return Number.isNaN(ms) ? null : ms
  }
  const ms = new Date(createdAt).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function isGuideComplete(scene: GuideScene, userId?: string | null): boolean {
  if (scene === 'dashboard') {
    return sceneFlag(readState(userId), scene)
  }

  if (isSessionGuideComplete(scene)) return true

  const uid = userId?.trim()
  if (uid) {
    return sceneFlag(readState(uid), scene)
  }

  return false
}

export function markGuideComplete(scene: GuideScene, userId?: string | null) {
  if (scene !== 'dashboard') {
    markSessionGuideComplete(scene)
  }

  const uid = scene === 'dashboard' ? userId?.trim() : userId?.trim() || 'guest'
  if (!uid) return

  const s = readState(uid)
  setSceneFlag(s, scene, true)
  writeState(s, uid)

  if (scene === 'dashboard') {
    clearForceDashboardGuide()
  }
}

export function resetAllGuides(userId?: string | null) {
  localStorage.removeItem(storageKey(userId))
}

/** Set when sign-up completes so the dashboard tour runs for the new account. */
export function queueDashboardGuideForNewUser() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(FORCE_DASHBOARD_KEY, '1')
  } catch {
    /* private mode */
  }
}

export function isForceDashboardGuidePending(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(FORCE_DASHBOARD_KEY) === '1'
  } catch {
    return false
  }
}

export function clearForceDashboardGuide() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(FORCE_DASHBOARD_KEY)
  } catch {
    /* private mode */
  }
}

/** True when account was created recently (first-time / new-user tour). */
export function isRecentlyCreatedAccount(createdAt: Date | number | string | null | undefined): boolean {
  const ms = toCreatedAtMs(createdAt)
  if (ms == null) return false
  const ageMs = Date.now() - ms
  return ageMs >= 0 && ageMs < 14 * 24 * 60 * 60 * 1000
}

/** Whether Alex should appear for this scene and user (does not consume session flags). */
export function shouldShowGuide(
  scene: GuideScene,
  userId: string | null | undefined,
  createdAt?: Date | number | string | null
): boolean {
  if (scene === 'dashboard') {
    if (!userId) return false
    if (isForceDashboardGuidePending()) return true
    if (isRecentlyCreatedAccount(createdAt)) {
      return !isGuideComplete(scene, userId)
    }
    return !isGuideComplete(scene, userId)
  }

  return !isGuideComplete(scene, userId ?? undefined)
}
