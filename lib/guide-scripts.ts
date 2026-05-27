export interface GuideLine {
  message: string
  highlightId?: string
  actionLabel?: string
}

export const AUTH_SIGN_IN_LINES: GuideLine[] = [
  {
    message:
      "Hi there! I'm Alex, your Site QA Engineer. Welcome to ConstructQA! When you're ready, please sign in with Google or use your email below. I'll meet you on the dashboard next.",
    actionLabel: 'Got it',
  },
]

export const AUTH_SIGN_UP_LINES: GuideLine[] = [
  {
    message:
      "Hello! I'm Alex. Great to have you joining the team! Please fill in the form below to create your account — it only takes a minute. Use Google for the fastest sign-up.",
    actionLabel: 'Got it',
  },
]

export const HOME_LOGIN_LINES: GuideLine[] = [
  {
    message:
      "Welcome! I'm Alex, your construction QA guide. Sign in with email and password, or use Google below. New here? Choose Sign up.",
    actionLabel: 'Thanks, Alex!',
  },
]

export const DASHBOARD_LINES: GuideLine[] = [
  {
    message: `Hey ${'{name}'}! I'm Alex, your Site QA Engineer. I'll walk you through generating your first test suite — it only takes a minute.`,
    actionLabel: 'Show me how',
  },
  {
    message:
      'First, pick a construction workflow from Quick Select on the left. Try "Work package creation" or any option that matches your project.',
    highlightId: 'guide-quick-select',
    actionLabel: 'Next',
  },
  {
    message:
      'Perfect choice! Now click the purple "Generate Test Suite" button. ConstructQA will build test cases, data, and automation code for you.',
    highlightId: 'guide-generate-btn',
    actionLabel: 'Got it!',
  },
]

export function personalizeMessage(message: string, name: string) {
  return message.replace(/\{name\}/g, name || 'there')
}
