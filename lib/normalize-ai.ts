/** Normalize Groq JSON fields so UI never crashes on strings vs arrays. */

const OPENPROJECT_MODULE_LABELS: Record<string, string> = {
  '/api/v3/work_packages': 'Work Package Management',
  '/api/v3/projects': 'Project Management',
  '/api/v3/users': 'User & Role Management',
  '/api/v3/statuses': 'Status Workflow Engine',
  work_packages: 'Work Package Management',
  work_packages_module: 'Work Package Management',
}

export function humanizeOpenProjectReference(ref: unknown): string {
  const s = String(ref ?? '').trim()
  if (!s) return 'OpenProject'
  if (OPENPROJECT_MODULE_LABELS[s]) return OPENPROJECT_MODULE_LABELS[s]
  if (s.startsWith('/api/')) {
    if (s.includes('work_package')) return 'Work Package Management'
    if (s.includes('user')) return 'User & Role Management'
    if (s.includes('project')) return 'Project Management'
    return 'OpenProject Module'
  }
  return s
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === 'string') return item.trim() ? [item.trim()] : []
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          if (typeof o.text === 'string') return [o.text]
          if (typeof o.step === 'string') return [o.step]
          if (typeof o.description === 'string') return [o.description]
        }
        const str = String(item ?? '').trim()
        return str ? [str] : []
      })
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    const t = value.trim()
    if (!t) return []
    if (t.includes('\n')) {
      return t
        .split(/\n+/)
        .map((s) => s.replace(/^\d+[\).\]]\s*/, '').trim())
        .filter(Boolean)
    }
    return [t]
  }
  return []
}

export function asObjectArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.filter((v) => v && typeof v === 'object') as Record<string, unknown>[]
}

export function normalizeTestCase(tc: unknown): Record<string, unknown> {
  const base =
    tc && typeof tc === 'object' ? { ...(tc as Record<string, unknown>) } : {}

  let type = String(base.type ?? 'positive')
  if (type === 'role_based') type = 'role'

  return {
    ...base,
    type,
    openproject_reference: humanizeOpenProjectReference(base.openproject_reference),
    steps: asStringArray(base.steps),
    preconditions: asStringArray(base.preconditions),
  }
}

export function extractTestCases(results: Record<string, unknown>): Record<string, unknown>[] {
  const candidates = [
    results.testCases,
    results.tests,
    results.cases,
    (results.data as Record<string, unknown> | undefined)?.testCases,
  ]

  let list: unknown[] = []

  for (const raw of candidates) {
    if (Array.isArray(raw)) {
      list = raw
      break
    }
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>
      for (const key of ['testCases', 'cases', 'items', 'data']) {
        if (Array.isArray(obj[key])) {
          list = obj[key] as unknown[]
          break
        }
      }
      if (list.length > 0) break
    }
  }

  return list.map(normalizeTestCase).filter((tc) => tc.id || tc.title)
}

export function normalizeScenarios(
  scenarios: Record<string, unknown>
): Record<string, unknown[]> {
  const keys = [
    'positive',
    'negative',
    'role_based',
    'status',
    'regression',
    'dashboard',
  ] as const
  const out: Record<string, unknown[]> = {}
  for (const key of keys) {
    out[key] = asObjectArray(scenarios[key])
  }
  return out
}

/** Flat list from nested testCases bundle object (used by API route). */
export function flattenTestCaseBundle(
  testCases: Record<string, unknown> | unknown[] | undefined
): Record<string, unknown>[] {
  if (!testCases) return []
  if (Array.isArray(testCases)) {
    return testCases.map(normalizeTestCase)
  }
  return extractTestCases({ testCases })
}

export type TestPolarity = 'positive' | 'negative'
export type CaseFilter = 'all' | 'positive' | 'negative'
export type SortOrder = 'positive-first' | 'negative-first'

const NEGATIVE_SIGNALS = [
  'cannot',
  'denied',
  'unauthorized',
  'forbidden',
  'disabled',
  'not allowed',
  'prevent',
  'block',
  'fail',
  'invalid',
  'reject',
  '403',
  'error',
  'missing',
  'incomplete',
  'without',
]

export function classifyPolarity(tc: Record<string, unknown>): TestPolarity {
  const type = String(tc.type ?? '').toLowerCase()
  if (type === 'negative') return 'negative'
  if (type === 'positive') return 'positive'

  const blob = [
    tc.title,
    tc.description,
    tc.expectedResult,
    ...asStringArray(tc.steps),
    ...asStringArray(tc.preconditions),
  ]
    .join(' ')
    .toLowerCase()

  return NEGATIVE_SIGNALS.some((w) => blob.includes(w)) ? 'negative' : 'positive'
}

export function buildScenarioTitleMap(
  scenarios: Record<string, unknown>
): Map<string, string> {
  const map = new Map<string, string>()
  const normalized = normalizeScenarios(scenarios)
  for (const list of Object.values(normalized)) {
    for (const item of list) {
      const s = item as Record<string, unknown>
      const id = String(s.id ?? '').trim()
      if (id) map.set(id, String(s.title ?? id))
    }
  }
  return map
}

export function enrichTestCase(
  tc: Record<string, unknown>,
  scenarioTitles: Map<string, string>
): Record<string, unknown> {
  const polarity = classifyPolarity(tc)
  const traceId = String(tc.traceability ?? '').trim()
  const scenarioName =
    (traceId && scenarioTitles.get(traceId)) ||
    String(tc.title ?? 'Untitled scenario')

  return { ...tc, polarity, scenarioName }
}

export function sortAndFilterTestCases(
  cases: Record<string, unknown>[],
  filter: CaseFilter,
  sortOrder: SortOrder
): Record<string, unknown>[] {
  let list = cases.map((tc) => ({
    ...tc,
    polarity: (tc.polarity as TestPolarity) ?? classifyPolarity(tc),
  }))

  if (filter === 'positive') {
    list = list.filter((tc) => tc.polarity === 'positive')
  } else if (filter === 'negative') {
    list = list.filter((tc) => tc.polarity === 'negative')
  }

  list.sort((a, b) => {
    const aNeg = a.polarity === 'negative' ? 1 : 0
    const bNeg = b.polarity === 'negative' ? 1 : 0
    return sortOrder === 'positive-first' ? aNeg - bNeg : bNeg - aNeg
  })

  return list
}

export function countPolarity(cases: Record<string, unknown>[]) {
  let positive = 0
  let negative = 0
  for (const tc of cases) {
    if (classifyPolarity(tc) === 'negative') negative++
    else positive++
  }
  return { total: cases.length, positive, negative }
}

/** Scenario ↔ test case linkage for Traceability tab (target ≥90% for hackathon demo). */
export function computeTraceabilityStats(
  scenarios: Record<string, unknown>,
  testCases: Record<string, unknown>[]
): {
  scenarioCount: number
  testCaseCount: number
  linkedScenarios: number
  linkedTestCases: number
  scenarioCoveragePct: number
  testCaseLinkagePct: number
  unmappedScenarioIds: string[]
  orphanTestCaseIds: string[]
} {
  const normalized = normalizeScenarios(scenarios)
  const scenarioIds: string[] = []
  for (const list of Object.values(normalized)) {
    for (const item of list) {
      const id = String((item as Record<string, unknown>).id ?? '').trim()
      if (id) scenarioIds.push(id)
    }
  }

  const scenarioSet = new Set(scenarioIds)
  const linkedScenarioSet = new Set<string>()
  let linkedTestCases = 0
  const orphanTestCaseIds: string[] = []

  for (const tc of testCases) {
    const traceId = String(tc.traceability ?? '').trim()
    const tcId = String(tc.id ?? '').trim()
    if (traceId && scenarioSet.has(traceId)) {
      linkedScenarioSet.add(traceId)
      linkedTestCases++
    } else if (tcId) {
      orphanTestCaseIds.push(tcId)
    }
  }

  const unmappedScenarioIds = scenarioIds.filter((id) => !linkedScenarioSet.has(id))
  const scenarioCount = scenarioIds.length
  const testCaseCount = testCases.length

  return {
    scenarioCount,
    testCaseCount,
    linkedScenarios: linkedScenarioSet.size,
    linkedTestCases,
    scenarioCoveragePct:
      scenarioCount > 0
        ? Math.round((linkedScenarioSet.size / scenarioCount) * 100)
        : 0,
    testCaseLinkagePct:
      testCaseCount > 0 ? Math.round((linkedTestCases / testCaseCount) * 100) : 0,
    unmappedScenarioIds,
    orphanTestCaseIds,
  }
}

/** Validate pipeline output structure for hackathon TV-* checks. */
export function validatePipelineOutput(results: Record<string, unknown>): {
  ok: boolean
  errors: string[]
} {
  const errors: string[] = []
  const requiredStages = ['parsed', 'scenarios', 'testCases', 'testData', 'skeleton', 'coverage']
  for (const stage of requiredStages) {
    if (!results[stage] || typeof results[stage] !== 'object') {
      errors.push(`Missing or invalid stage: ${stage}`)
    }
  }

  const scenarios = normalizeScenarios((results.scenarios as Record<string, unknown>) || {})
  if (scenarios.negative.length < 1) {
    errors.push('scenarios.negative should have at least 1 item')
  }

  const cases = extractTestCases(results)
  if (cases.length < 5) {
    errors.push(`Expected at least 5 test cases, got ${cases.length}`)
  }

  for (const tc of cases) {
    for (const field of ['id', 'title', 'type', 'priority', 'role', 'expectedResult', 'traceability']) {
      if (!tc[field] || String(tc[field]).trim() === '') {
        errors.push(`Test case missing field "${field}": ${tc.id ?? 'unknown'}`)
      }
    }
    if (asStringArray(tc.steps).length === 0) {
      errors.push(`Test case missing steps: ${tc.id ?? 'unknown'}`)
    }
    if (!tc.openproject_reference || String(tc.openproject_reference).trim() === '') {
      errors.push(`Test case missing openproject_reference: ${tc.id ?? 'unknown'}`)
    }
  }

  const skeleton = (results.skeleton as Record<string, unknown>) || {}
  const code = String(skeleton.code ?? '')
  for (const kw of ['test(', 'expect(', 'page.']) {
    if (!code.includes(kw)) errors.push(`skeleton.code missing keyword: ${kw}`)
  }

  const coverage = (results.coverage as Record<string, unknown>) || {}
  const score = coverage.coverageScore
  if (typeof score !== 'number' || score < 0 || score > 100) {
    errors.push('coverage.coverageScore must be a number 0-100')
  }

  return { ok: errors.length === 0, errors }
}
