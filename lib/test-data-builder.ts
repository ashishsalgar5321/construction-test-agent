/** Compact scenario summary for test-case prompt (keeps token count low). */
export function summarizeScenariosForPrompt(
  scenarios: Record<string, unknown>
): string {
  const keys = [
    'positive',
    'negative',
    'role_based',
    'status',
    'dashboard',
    'regression',
  ] as const
  const parts: string[] = []
  for (const key of keys) {
    const list = scenarios[key]
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (!item || typeof item !== 'object') continue
      const s = item as Record<string, unknown>
      parts.push(
        `${String(s.id ?? '')}:${String(s.title ?? '').slice(0, 60)}`
      )
    }
  }
  return parts.slice(0, 20).join('; ')
}

/** Build synthetic test data locally — no AI call needed. */
export function buildTestData(
  parsed: Record<string, unknown>,
  requirement: string
): Record<string, unknown> {
  const workflow = String(parsed.workflow ?? 'Construction Workflow')
  const due = new Date()
  due.setDate(due.getDate() + 14)
  const dueStr = due.toISOString().slice(0, 10)

  const projectName = workflow.includes('Dashboard')
    ? 'Alpha Construction Dashboard'
    : 'Alpha Construction Site'

  return {
    project: {
      id: 'PRJ-101',
      name: projectName,
      status: 'active',
    },
    workPackage: {
      id: 'WP-1001',
      subject: requirement.toLowerCase().includes('safety')
        ? 'Safety Issue - Zone A'
        : 'Construction Task - Phase 1',
      type: 'SafetyIssue',
      status: 'Open',
      priority: 'High',
      dueDate: dueStr,
    },
    users: [
      { role: 'Site Engineer', name: 'Alex Engineer', email: 'engineer@acme.com' },
      { role: 'Contractor', name: 'Bob Builder', email: 'contractor@build.com' },
      { role: 'Project Manager', name: 'Carol Manager', email: 'manager@acme.com' },
      { role: 'Viewer', name: 'Dave Viewer', email: 'viewer@acme.com' },
    ],
    statusFlow: ['Open', 'In Progress', 'Closed'],
    dashboardMetrics: { open: 12, overdue: 3, closed: 45, assignedToMe: 5 },
    rows: [
      { label: 'Project', value: projectName },
      { label: 'Work Package', value: 'Safety Issue - Zone A' },
      { label: 'Due Date', value: dueStr },
      { label: 'Site Engineer', value: 'engineer@acme.com' },
      { label: 'Contractor', value: 'contractor@build.com' },
    ],
  }
}
