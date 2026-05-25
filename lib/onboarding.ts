const STORAGE_KEY = 'constructqa-onboarding-v1'

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

function readState(): OnboardingState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

function writeState(state: OnboardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isGuideComplete(scene: GuideScene): boolean {
  const s = readState()
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

export function markGuideComplete(scene: GuideScene) {
  const s = readState()
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
  writeState(s)
}

export function resetAllGuides() {
  localStorage.removeItem(STORAGE_KEY)
}
