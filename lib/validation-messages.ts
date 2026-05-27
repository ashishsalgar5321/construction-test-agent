/** Map Clerk / browser validation text to plain, user-friendly copy */
export function humanizeValidationMessage(message: string): string {
  const raw = message.trim()
  if (!raw) return 'Please check this field and try again.'

  const lower = raw.toLowerCase()

  if (
    lower === 'enter email address.' ||
    lower === 'enter email address' ||
    lower.includes('enter email')
  ) {
    return 'Please enter your email address.'
  }

  if (
    lower === 'enter password.' ||
    lower === 'enter password' ||
    lower.includes('enter password')
  ) {
    return 'Please enter the password.'
  }

  if (
    lower.includes('password must contain') ||
    lower.endsWith('must contain .') ||
    raw === 'Your password must contain .'
  ) {
    return 'Use at least 8 characters with letters and numbers.'
  }

  if (lower.includes('invalid') && lower.includes('email')) {
    return 'Please enter a valid email address.'
  }

  if (lower.includes('already exists') || lower.includes('is taken')) {
    return 'This email is already registered. Try signing in instead.'
  }

  if (lower.includes('is required') || lower === 'required') {
    return 'This field is required.'
  }

  if (lower.includes('too short')) {
    return 'Please enter a longer value.'
  }

  if (lower.includes('too long')) {
    return 'This value is too long.'
  }

  if (lower.includes('does not match') || lower.includes("don't match")) {
    return 'Passwords do not match. Please try again.'
  }

  if (lower.includes('incorrect') && lower.includes('password')) {
    return 'Please enter valid password.'
  }

  if (
    (lower.includes('invalid') && lower.includes('password')) ||
    lower.includes('password is incorrect')
  ) {
    return 'Please enter valid password.'
  }

  if (lower.includes('could not find') || lower.includes('not found')) {
    return 'No account found with this email. Sign up to get started.'
  }

  if (
    lower.includes('oauth') ||
    lower.includes('google') ||
    lower.includes('access_denied') ||
    lower.includes('cancelled') ||
    lower.includes('canceled')
  ) {
    if (lower.includes('denied') || lower.includes('cancel')) {
      return 'Google sign-in was cancelled. Pick an account to continue.'
    }
    return 'Google sign-in failed. Please choose an account and try again.'
  }

  if (lower.includes('session') && lower.includes('expired')) {
    return 'Your sign-in session expired. Please try again.'
  }

  // Fix broken Clerk strings that end with a lone period
  if (/\.\s*$/.test(raw) && raw.split(' ').length <= 6 && lower.includes('must contain')) {
    return 'Use at least 8 characters with letters and numbers.'
  }

  if (raw === lower && raw.length > 0) {
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }

  return raw
}
