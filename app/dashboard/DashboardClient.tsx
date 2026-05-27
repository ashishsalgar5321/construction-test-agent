'use client'

import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import DashboardTopBar from '@/app/components/DashboardTopBar'
import GuestSplashBackground from '@/app/components/GuestSplashBackground'
import { getClerkDisplayName } from '@/lib/clerk-user'
import {
  asObjectArray,
  asStringArray,
  buildScenarioTitleMap,
  classifyPolarity,
  computeTraceabilityStats,
  countPolarity,
  enrichTestCase,
  extractTestCases,
  normalizeScenarios,
  sortAndFilterTestCases,
  type CaseFilter,
  type SortOrder,
} from '@/lib/normalize-ai'
import { SAMPLE_REQUIREMENTS } from '@/lib/sample-requirements'
import OnboardingGuide from '@/app/components/OnboardingGuide'

const SAMPLES = SAMPLE_REQUIREMENTS

const TABS = [
  'Test Cases',
  'Scenarios',
  'Test Data',
  'Automation Code',
  'Coverage Report',
  'Traceability',
]

const PIPE_STAGES = [
  'Parser',
  'Scenarios',
  'Test Cases',
  'Test Data',
  'Skeleton',
  'Coverage',
]

const SCENARIO_TYPES = [
  'positive',
  'negative',
  'role_based',
  'status',
  'regression',
  'dashboard',
] as const

const OPENPROJECT_BASE_URL = process.env.NEXT_PUBLIC_OPENPROJECT_URL?.trim() || ''

const OPENPROJECT_MODULE_LINKS = [
  {
    label: 'OpenProject',
    path: '/',
    fallback: 'https://www.openproject.org/',
  },
  {
    label: 'Work Packages',
    path: '/work_packages',
    fallback: 'https://www.openproject.org/docs/user-guide/work-packages/',
  },
  {
    label: 'Projects',
    path: '/projects',
    fallback: 'https://www.openproject.org/docs/user-guide/projects/',
  },
  {
    label: 'Meetings',
    path: '/meetings',
    fallback: 'https://www.openproject.org/docs/user-guide/meetings/',
  },
  {
    label: 'Time Tracking',
    path: '/time_entries',
    fallback: 'https://www.openproject.org/docs/user-guide/time-and-costs/time-tracking/',
  },
] as const

function openProjectLink(path: string, fallback: string): string {
  if (!OPENPROJECT_BASE_URL) return fallback
  const normalized = OPENPROJECT_BASE_URL.replace(/\/+$/, '')
  return `${normalized}${path}`
}

interface Props {
  userName: string
  userLastName: string
  userEmail: string
}

type ResultMap = Record<string, unknown>

export default function DashboardClient({
  userName,
  userLastName,
  userEmail,
}: Props) {
  const { user } = useUser()
  const displayName =
    (user ? getClerkDisplayName(user) : null) ||
    [userName, userLastName].filter(Boolean).join(' ') ||
    'Engineer'

  const [requirement, setRequirement] = useState(SAMPLES[0].value)
  const [activeTab, setActiveTab] = useState(0)
  const [activeSample, setActiveSample] = useState(0)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [results, setResults] = useState<ResultMap>({})
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [caseFilter, setCaseFilter] = useState<CaseFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('positive-first')
  const searchParams = useSearchParams()

  const persistRun = useCallback(
    async (req: string, resultMap: ResultMap) => {
      try {
        const res = await fetch('/api/runs', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirement: req, results: resultMap }),
        })
        if (!res.ok) return
        setSaveMsg('Saved to History & Reports.')
        window.setTimeout(() => setSaveMsg(''), 5000)
      } catch {
        /* non-blocking */
      }
    },
    []
  )

  useEffect(() => {
    const runId = searchParams.get('runId')
    if (!runId) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/runs/${encodeURIComponent(runId)}`, {
          credentials: 'same-origin',
        })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { run: { requirement: string; results: ResultMap } }
        setRequirement(data.run.requirement)
        setResults(data.run.results)
        setGenerated(true)
        setActiveTab(0)
        setSaveMsg('Loaded from history.')
        window.setTimeout(() => setSaveMsg(''), 4000)
      } catch {
        if (!cancelled) setError('Could not load that saved run.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  const selectSample = (i: number) => {
    setActiveSample(i)
    setRequirement(SAMPLES[i].value)
    setError('')
  }

  const generate = async () => {
    const trimmed = requirement.trim()
    if (!trimmed) {
      setError('Add a workflow requirement above, or pick one from Quick Select.')
      return
    }

    setError('')
    setLoading(true)
    setGenerated(false)
    setResults({})
    setCurrentStep(0)
    setStatusMsg('Starting test pipeline…')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: trimmed }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(
          (errBody as { error?: string }).error || `Server error (${res.status})`
        )
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream from server')

      const decoder = new TextDecoder()
      let buffer = ''
      let completed = false
      let accumulated: ResultMap = {}

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const line = part.split('\n').find((l) => l.startsWith('data: '))
          if (!line) continue

          let json: { stage: string; data: Record<string, unknown> }
          try {
            json = JSON.parse(line.replace('data: ', ''))
          } catch {
            continue
          }

          if (json.stage === 'error') {
            setGenerated(false)
            throw new Error(String(json.data.message || 'Generation failed'))
          }
          if (json.stage === 'status') {
            setStatusMsg(String(json.data.message || ''))
            setCurrentStep(Number(json.data.step) || 0)
          } else if (json.stage === 'complete') {
            completed = true
            setGenerated(true)
            setLoading(false)
            setCurrentStep(6)
            setCaseFilter('all')
            setSortOrder('positive-first')
          } else {
            accumulated = { ...accumulated, [json.stage]: json.data }
            setResults(accumulated)
          }
        }
      }

      if (!completed) {
        setError((prev) =>
          prev ||
          'Generation stopped early. Wait 60 seconds (rate limit) and click Generate again.'
        )
      } else {
        void persistRun(trimmed, accumulated)
      }
    } catch (e) {
      setGenerated(false)
      setError(
        e instanceof Error ? e.message : 'We could not generate tests. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const testCases = extractTestCases(results)
  const scenarios = normalizeScenarios((results.scenarios as ResultMap) || {})
  const scenarioTitleMap = buildScenarioTitleMap(
    (results.scenarios as ResultMap) || {}
  )
  const enrichedCases = testCases.map((tc) =>
    enrichTestCase(tc as ResultMap, scenarioTitleMap)
  )
  const polarityCounts = countPolarity(enrichedCases)
  const displayedCases = sortAndFilterTestCases(
    enrichedCases,
    caseFilter,
    sortOrder
  )
  const coverage = (results.coverage as ResultMap) || {}
  const skeleton = (results.skeleton as ResultMap) || {}
  const parsed = (results.parsed as ResultMap) || {}
  const testData = (results.testData as ResultMap) || {}

  const testDataRows =
    (testData.rows as { label: string; value: string }[]) ||
    [
      { label: 'Project', value: String((testData.project as ResultMap)?.name || '—') },
      {
        label: 'Work Package',
        value: String((testData.workPackage as ResultMap)?.subject || '—'),
      },
      {
        label: 'WP ID',
        value: String((testData.workPackage as ResultMap)?.id || '—'),
      },
      {
        label: 'Due Date',
        value: String((testData.workPackage as ResultMap)?.dueDate || '—'),
      },
      {
        label: 'Priority',
        value: String((testData.workPackage as ResultMap)?.priority || '—'),
      },
      {
        label: 'Status Flow',
        value: asStringArray(testData.statusFlow).join(' → ') || '—',
      },
      ...asObjectArray(testData.users).map((u) => ({
        label: String(u.role ?? 'User'),
        value: String(u.email ?? u.name ?? '—'),
      })),
    ]

  const exportMD = () => {
    let md = `# ConstructQA Test Suite\n\n## Requirement\n${requirement}\n\n`
    if (parsed.summary) md += `**Summary:** ${parsed.summary}\n\n`
    md += `## Test Cases (${polarityCounts.total})\n\n`
    sortAndFilterTestCases(enrichedCases, 'all', 'positive-first').forEach((t) => {
      const c = t as ResultMap
      const polarity = classifyPolarity(c)
      md += `### ${c.id} — ${c.title}\n`
      md += `**Polarity:** ${polarity} | **Type:** ${c.type} | **Priority:** ${c.priority} | **Role:** ${c.role}\n`
      md += `**Scenario:** ${String(c.scenarioName ?? c.title)}\n`
      md += `**OpenProject:** ${c.openproject_reference}\n\n`
      if (asStringArray(c.preconditions).length > 0) {
        md += `**Input / Preconditions:**\n${asStringArray(c.preconditions).map((s) => `- ${s}`).join('\n')}\n\n`
      }
      md += `**Steps:**\n${asStringArray(c.steps).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`
      md += `**Expected:** ${c.expectedResult}\n\n---\n\n`
    })
    downloadFile(md, 'test-suite.md', 'text/markdown')
  }

  const exportJSON = () => {
    downloadFile(
      JSON.stringify({ requirement, ...results }, null, 2),
      'test-suite.json',
      'application/json'
    )
  }

  const exportCSV = () => {
    let csv =
      'ID,Title,Polarity,Type,Priority,Role,Expected Result,Traceability,OpenProject Reference\n'
    sortAndFilterTestCases(enrichedCases, 'all', 'positive-first').forEach((t) => {
      const c = t as ResultMap
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
      csv +=
        [
          c.id,
          c.title,
          classifyPolarity(c),
          c.type,
          c.priority,
          c.role,
          c.expectedResult,
          c.traceability,
          c.openproject_reference,
        ]
          .map(esc)
          .join(',') + '\n'
    })
    downloadFile(csv, 'test-suite.csv', 'text/csv')
  }

  const downloadFile = (content: string, name: string, type: string) => {
    // UTF-8 BOM helps Excel open CSV correctly on Windows
    const payload = name.endsWith('.csv') ? `\uFEFF${content}` : content
    const blob = new Blob([payload], { type: `${type};charset=utf-8` })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.rel = 'noopener'
    link.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Revoking too soon makes the browser open blob: in this tab (looks like site closed)
    window.setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const runExport =
    (fn: () => void, fileName: string) => (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        fn()
        setCopyMsg(
          `Saved ${fileName} — open it from your Downloads folder (not in the browser tab).`
        )
      } catch {
        setError('Export did not complete. Please try again.')
      }
      setTimeout(() => setCopyMsg(''), 5000)
    }

  const copyAll = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify({ requirement, ...results }, null, 2)
    )
    setCopyMsg('Copied to clipboard!')
    setTimeout(() => setCopyMsg(''), 2500)
  }

  const typeColor: Record<string, string> = {
    positive: 'type-pos',
    negative: 'type-neg',
    role: 'type-role',
    regression: 'type-reg',
    status: 'type-st',
    dashboard: 'type-dash',
  }

  const priColor: Record<string, string> = {
    critical: 'pri-critical',
    high: 'pri-high',
    medium: 'pri-med',
    low: 'pri-low',
  }

  const hasResults = generated && testCases.length > 0
  const traceStats = computeTraceabilityStats(
    (results.scenarios as ResultMap) || {},
    testCases
  )

  return (
    <div className="app-shell">
      <DashboardTopBar
        active="dashboard"
        fallbackName={displayName}
        fallbackEmail={userEmail}
        statusLabel={loading ? 'Generating…' : 'Ready'}
      />

      <div className="dashboard-splash-bg" aria-hidden>
        <GuestSplashBackground />
      </div>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="s-section">
            <div className="s-label">Requirement Input</div>
            <div
              className={`req-box ${loading ? 'loading' : ''} ${error ? 'input-invalid' : ''}`}
            >
              <textarea
                value={requirement}
                onChange={(e) => {
                  setRequirement(e.target.value)
                  setError('')
                }}
                placeholder="Describe your construction workflow requirement…"
                rows={4}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'requirement-error' : undefined}
              />
              <div className="req-footer">
                <span className="char-count">{requirement.length} chars</span>
                <div className="req-openproject-links">
                  {OPENPROJECT_MODULE_LINKS.map((item) => (
                    <a
                      key={item.label}
                      className="req-tag req-tag-link"
                      href={openProjectLink(item.path, item.fallback)}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={
                        OPENPROJECT_BASE_URL
                          ? `Open ${item.label} in your OpenProject instance`
                          : `Open ${item.label} docs (set NEXT_PUBLIC_OPENPROJECT_URL for your instance)`
                      }
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {error && (
              <p id="requirement-error" className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="s-section" id="guide-quick-select">
            <div className="s-label">Quick Select ({SAMPLES.length} workflows)</div>
            <div className="samples-list">
              {SAMPLES.map((s, i) => (
                <div
                  key={s.text}
                  className={`sample-item ${activeSample === i ? 'active' : ''}`}
                  onClick={() => selectSample(i)}
                  onKeyDown={(e) => e.key === 'Enter' && selectSample(i)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="s-icon">{s.icon}</span>
                  <span className="s-text">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {hasResults && (
            <div className="s-section">
              <div className="s-label">QA Metrics</div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-val">{testCases.length}</div>
                  <div className="metric-label">Test Cases</div>
                </div>
                <div className="metric-card">
                  <div className="metric-val green">
                    {Number(coverage.coverageScore) || 0}%
                  </div>
                  <div className="metric-label">Coverage</div>
                </div>
                <div className="metric-card">
                  <div className="metric-val amber">
                    {(coverage.risks as unknown[])?.length || 0}
                  </div>
                  <div className="metric-label">Risks</div>
                </div>
                <div className="metric-card">
                  <div className="metric-val red">
                    {(coverage.missing as unknown[])?.length || 0}
                  </div>
                  <div className="metric-label">Gaps</div>
                </div>
              </div>
            </div>
          )}

          <button
            id="guide-generate-btn"
            type="button"
            className="gen-btn"
            onClick={generate}
            disabled={loading}
          >
            {loading ? `⏳ ${statusMsg}` : '⚡ Generate Test Suite'}
          </button>
        </aside>

        <main className="content">
          <div className="pipeline">
            {PIPE_STAGES.map((s, i) => {
              const stepNum = i + 1
              const isDone =
                generated || (loading && currentStep > stepNum)
              const isActive = loading && currentStep === stepNum
              return (
                <div key={s} className="pipe-item">
                  <div
                    className={`pipe-dot ${isDone ? 'done' : isActive ? 'active' : 'idle'}`}
                  >
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span className={`pipe-label ${isDone ? 'done' : ''}`}>{s}</span>
                  {i < PIPE_STAGES.length - 1 && (
                    <div
                      className={`pipe-line ${generated || (loading && currentStep > stepNum) ? 'done' : ''}`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {generated && Boolean(parsed.summary) && (
            <div className="parsed-banner">
              <div className="parsed-banner-title">Parsed Requirement</div>
              <div className="parsed-banner-text">
                <strong>{String(parsed.workflow || 'Workflow')}:</strong>{' '}
                {String(parsed.summary)} · Module:{' '}
                {String(parsed.openproject_module || 'OpenProject')}
              </div>
            </div>
          )}

          <div className="tabs-row">
            {TABS.map((t, i) => (
              <div
                key={t}
                className={`tab ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab(i)}
                role="tab"
                tabIndex={0}
              >
                {t}
              </div>
            ))}
          </div>

          <div className="tab-content">
            {!generated && !loading && (
              <div className="empty-state">
                <div className="empty-icon">🏗️</div>
                <div className="empty-title">Ready to generate test cases</div>
                <div className="empty-sub">
                  Select a sample requirement or paste your own, then click Generate
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <div className="loading-title">{statusMsg}</div>
                <div className="loading-sub">Stage {currentStep} of 6</div>
              </div>
            )}

            {generated && activeTab === 0 && (
              <div className="cards-list">
                <div className="tc-summary-bar">
                  <span>
                    Total: <strong>{polarityCounts.total}</strong>
                  </span>
                  <span className="summary-pos">
                    Positive: <strong>{polarityCounts.positive}</strong>
                  </span>
                  <span className="summary-neg">
                    Negative: <strong>{polarityCounts.negative}</strong>
                  </span>
                </div>
                <div className="tc-filter-bar">
                  {(['all', 'positive', 'negative'] as CaseFilter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`filter-pill ${caseFilter === f ? 'active' : ''} ${f !== 'all' ? f : ''}`}
                      onClick={() => setCaseFilter(f)}
                    >
                      {f === 'all' ? 'All' : f === 'positive' ? 'Positive' : 'Negative'}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sort-toggle"
                    onClick={() =>
                      setSortOrder((o) =>
                        o === 'positive-first' ? 'negative-first' : 'positive-first'
                      )
                    }
                  >
                    {sortOrder === 'positive-first'
                      ? '↕ Positive first'
                      : '↕ Negative first'}
                  </button>
                </div>
                {displayedCases.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">⚠️</div>
                    <div className="empty-title">No test cases generated</div>
                    <div className="empty-sub">
                      No test cases were returned for this requirement.
                      Try clicking Generate again or rephrase the requirement.
                    </div>
                  </div>
                )}
                {displayedCases.map((tc, i) => {
                  const c = tc as ResultMap
                  const polarity = String(c.polarity ?? classifyPolarity(c))
                  const preconditions = asStringArray(c.preconditions)
                  const steps = asStringArray(c.steps)
                  return (
                    <div key={String(c.id) || i} className="tc-card">
                      <div className="tc-head">
                        <div className="tc-head-left">
                          <div className="tc-meta-row">
                            <span className="tc-id">{String(c.id)}</span>
                            <span className="tc-module-badge">
                              {String(c.openproject_reference || 'OpenProject')}
                            </span>
                            {c.traceability != null && String(c.traceability) !== '' && (
                              <span className="tc-trace">{String(c.traceability)}</span>
                            )}
                          </div>
                          <div className="tc-scenario-name">
                            {String(c.scenarioName ?? c.title)}
                          </div>
                          <div className="tc-title">{String(c.title)}</div>
                          {c.description != null && String(c.description) !== '' && (
                            <div className="tc-description">{String(c.description)}</div>
                          )}
                        </div>
                        <div className="tc-badges">
                          <span
                            className={`polarity-badge ${polarity === 'negative' ? 'negative' : 'positive'}`}
                          >
                            {polarity === 'negative' ? 'Negative' : 'Positive'}
                          </span>
                          <span
                            className={`pri-badge ${priColor[String(c.priority)] || 'pri-med'}`}
                          >
                            {String(c.priority)}
                          </span>
                        </div>
                      </div>
                      <div className="tc-body">
                        <div className="tc-section-label">Input Details</div>
                        <div className="tc-role-row">
                          <span className="tc-role">👤 {String(c.role)}</span>
                        </div>
                        {preconditions.length > 0 && (
                          <div className="precond-list">
                            {preconditions.map((pre, pi) => (
                              <div key={pi} className="precond-row">
                                <span className="precond-dot">◆</span>
                                <span className="precond-text">{pre}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="steps-list">
                          {steps.map((step, si) => (
                            <div key={si} className="step-row">
                              <span className="step-num">{si + 1}</span>
                              <span className="step-text">{step}</span>
                            </div>
                          ))}
                        </div>
                        <div className="tc-section-label">Expected Output</div>
                      </div>
                      <div className="tc-foot">
                        <span className="expected">✓ {String(c.expectedResult)}</span>
                        <span className="trace-id">{String(c.traceability)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {generated && activeTab === 1 && (
              <div className="cards-list">
                {SCENARIO_TYPES.flatMap((type) =>
                  (scenarios[type] || []).map((s, i) => {
                    const sc = s as ResultMap
                    const badgeType = type.replace('_based', '').replace('_', '')
                    return (
                      <div key={`${type}-${i}`} className="tc-card">
                        <div className="tc-head">
                          <div>
                            <div className="tc-id">
                              {String(sc.id)} · {type.replace('_', ' ')}
                            </div>
                            <div className="tc-title">{String(sc.title)}</div>
                          </div>
                          <span
                            className={`type-badge ${typeColor[badgeType] || 'type-pos'}`}
                          >
                            {type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="tc-body">
                          <p className="step-text">{String(sc.description)}</p>
                          {sc.role != null && (
                            <div className="tc-role">👤 {String(sc.role)}</div>
                          )}
                          {sc.status != null && (
                            <div className="tc-role">📌 {String(sc.status)}</div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {generated && activeTab === 2 && (
              <div className="cards-list">
                <div className="tc-card">
                  <div className="tc-head">
                    <div className="tc-title">Synthetic Test Data</div>
                    <span className="type-badge type-dash">Construction QA</span>
                  </div>
                  <div className="tc-body">
                    <div className="data-grid">
                      {testDataRows.map((d, i) => (
                        <div key={`${d.label}-${i}`} className="data-row">
                          <span className="data-label">{d.label}</span>
                          <span className="data-val">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generated && activeTab === 3 && (
              <div className="cards-list">
                <div className="tc-card">
                  <div className="tc-head">
                    <div className="tc-title">Playwright Automation Skeleton</div>
                    <span className="type-badge type-pos">TypeScript</span>
                  </div>
                  <div className="tc-body">
                    <pre className="code-block">
                      {String(skeleton.code || '// No code generated').replace(
                        /\\n/g,
                        '\n'
                      )}
                    </pre>
                  </div>
                </div>
                {asObjectArray(skeleton.apiTests).map((t, i) => {
                  const api = t as ResultMap
                  return (
                    <div key={i} className="tc-card">
                      <div className="tc-head">
                        <div className="tc-title">
                          {String(api.method)} {String(api.endpoint)}
                        </div>
                        <span className="pri-badge pri-high">API Test</span>
                      </div>
                      <div className="tc-body">
                        <p className="step-text">{String(api.description)}</p>
                        <div className="tc-role">
                          Expected Status: {String(api.expectedStatus)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {generated && activeTab === 4 && (
              <div className="cards-list">
                <div className="coverage-grid-3">
                  <div className="cov-card green-card">
                    <div className="cov-title green">
                      ✓ Covered ({(coverage.covered as unknown[])?.length || 0})
                    </div>
                    {asObjectArray(coverage.covered).map((c, i) => (
                      <div key={i} className="cov-row">
                        <span className="cov-area">{String(c.area)}</span>
                        <span className="cov-conf green">{String(c.confidence)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cov-card red-card">
                    <div className="cov-title red">
                      ✗ Missing ({(coverage.missing as unknown[])?.length || 0})
                    </div>
                    {asObjectArray(coverage.missing).map((c, i) => (
                      <div key={i} className="cov-row">
                        <span className="cov-area">{String(c.area)}</span>
                        <span
                          className={`cov-conf ${c.risk === 'high' ? 'red' : 'amber'}`}
                        >
                          {String(c.risk)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="cov-card amber-card">
                    <div className="cov-title amber">
                      ⚠ Risks ({(coverage.risks as unknown[])?.length || 0})
                    </div>
                    {asObjectArray(coverage.risks).map((c, i) => (
                      <div key={i} className="cov-row">
                        <span className="cov-area">{String(c.title)}</span>
                        <span
                          className={`cov-conf ${c.severity === 'high' ? 'red' : 'amber'}`}
                        >
                          {String(c.severity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="tc-card">
                  <div className="tc-head">
                    <div className="tc-title">Coverage Summary</div>
                  </div>
                  <div className="tc-body">
                    <p className="step-text">{String(coverage.summary || '')}</p>
                    <div className="score-bar">
                      <span className="score-label">Coverage Score</span>
                      <div className="score-track">
                        <div
                          className="score-fill"
                          style={{
                            width: `${Number(coverage.coverageScore) || 0}%`,
                          }}
                        />
                      </div>
                      <span className="score-val green">
                        {Number(coverage.coverageScore) || 0}%
                      </span>
                    </div>
                    {asStringArray(coverage.assumptions).length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div className="parsed-banner-title">Assumptions</div>
                        {asStringArray(coverage.assumptions).map((a, i) => (
                          <div key={i} className="step-row">
                            <span className="step-num">•</span>
                            <span className="step-text">{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 12 }}>
                      {asStringArray(coverage.recommendations).map((r, i) => (
                        <div key={i} className="step-row">
                          <span className="step-num">💡</span>
                          <span className="step-text">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generated && activeTab === 5 && (
              <div className="cards-list">
                <div className="tc-card">
                  <div className="tc-head">
                    <div className="tc-title">Requirement → Scenario → Test Case</div>
                    <span
                      className={`type-badge ${traceStats.scenarioCoveragePct >= 90 ? 'type-pos' : 'type-neg'}`}
                    >
                      Traceability {traceStats.scenarioCoveragePct}%
                    </span>
                  </div>
                  <div className="tc-body">
                    <div className="trace-summary">
                      <p>
                        <strong>{traceStats.linkedScenarios}</strong> of{' '}
                        <strong>{traceStats.scenarioCount}</strong> scenarios mapped to test
                        cases ({traceStats.testCaseCount} total). Test-case linkage:{' '}
                        <strong>{traceStats.testCaseLinkagePct}%</strong>. Hackathon target:{' '}
                        <strong>≥90%</strong> scenario coverage.
                      </p>
                      {String(parsed.summary ?? '').trim() && (
                        <p className="trace-req-line">
                          <strong>Requirement:</strong> {String(parsed.summary)}
                        </p>
                      )}
                      {traceStats.unmappedScenarioIds.length > 0 && (
                        <p className="trace-gap">
                          Unmapped scenarios:{' '}
                          {traceStats.unmappedScenarioIds.join(', ')}
                        </p>
                      )}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="trace-table">
                        <thead>
                          <tr>
                            <th>Test Case</th>
                            <th>Scenario</th>
                            <th>Scenario ID</th>
                            <th>Type</th>
                            <th>Role</th>
                            <th>OpenProject</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrichedCases.map((tc, i) => {
                            const c = tc as ResultMap
                            const traceId = String(c.traceability ?? '').trim()
                            const mapped =
                              traceId &&
                              !traceStats.unmappedScenarioIds.includes(traceId)
                                ? 'trace-mapped'
                                : 'trace-unmapped'
                            return (
                              <tr key={String(c.id) || i} className={mapped}>
                                <td>{String(c.id)}</td>
                                <td>{String(c.scenarioName ?? '—')}</td>
                                <td>{traceId || '—'}</td>
                                <td>{String(c.type)}</td>
                                <td>{String(c.role)}</td>
                                <td>{String(c.openproject_reference)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {generated && (
            <div className="export-bar">
              {saveMsg && <span className="alert-success">{saveMsg}</span>}
              {copyMsg && <span className="alert-success">{copyMsg}</span>}
              <button
                type="button"
                className="exp-btn primary"
                onClick={runExport(exportMD, 'test-suite.md')}
              >
                ⬇ Export Report
              </button>
              <button
                type="button"
                className="exp-btn"
                onClick={runExport(exportMD, 'test-suite.md')}
              >
                📄 Markdown
              </button>
              <button
                type="button"
                className="exp-btn"
                onClick={runExport(exportJSON, 'test-suite.json')}
              >
                📊 JSON
              </button>
              <button
                type="button"
                className="exp-btn"
                onClick={runExport(exportCSV, 'test-suite.csv')}
              >
                📋 CSV
              </button>
              <button type="button" className="exp-btn" onClick={copyAll}>
                📋 Copy All
              </button>
            </div>
          )}
        </main>
      </div>
      <OnboardingGuide scene="dashboard" userName={displayName} />
    </div>
  )
}

