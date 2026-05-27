/** Construction-themed taglines for splash, auth, and page transitions */
export const CONSTRUCTION_TAGLINES = [
  'Your construction project is on the way.',
  'Build safe. Test easy.',
  'Quality checks for every jobsite workflow.',
  'From blueprint to test suite in minutes.',
  'Ship confident releases on every build.',
  'Strong foundations start with solid QA.',
] as const

export function taglineAt(index: number): string {
  return CONSTRUCTION_TAGLINES[index % CONSTRUCTION_TAGLINES.length]
}
