import {
  asStringArray,
  classifyPolarity,
  enrichTestCase,
  extractTestCases,
  buildScenarioTitleMap,
  sortAndFilterTestCases,
} from '@/lib/normalize-ai'
import type { PipelineResults } from '@/lib/types/run'

type Row = Record<string, unknown>

function runTitle(requirement: string): string {
  const line = requirement.trim().split('\n')[0] || 'Test run'
  return line.length > 72 ? `${line.slice(0, 69)}…` : line
}

/** Markdown test report (same structure as dashboard export) */
export function buildMarkdownReport(
  requirement: string,
  results: PipelineResults
): string {
  const parsed = (results.parsed as Row) || {}
  const scenarios = (results.scenarios as Row) || {}
  const scenarioTitleMap = buildScenarioTitleMap(scenarios)
  const testCases = extractTestCases(results)
  const enrichedCases = testCases.map((tc) =>
    enrichTestCase(tc as Row, scenarioTitleMap)
  )
  const sorted = sortAndFilterTestCases(enrichedCases, 'all', 'positive-first')
  const coverage = (results.coverage as Row) || {}

  let md = `# ConstructQA Test Report\n\n`
  md += `**Generated:** ${new Date().toISOString()}\n\n`
  md += `## Requirement\n\n${requirement}\n\n`
  if (parsed.summary) md += `**Summary:** ${parsed.summary}\n\n`
  if (coverage.coverageScore != null) {
    md += `**Coverage score:** ${coverage.coverageScore}%\n\n`
  }
  md += `## Test Cases (${sorted.length})\n\n`

  sorted.forEach((t) => {
    const c = t as Row
    const polarity = classifyPolarity(c)
    md += `### ${c.id} — ${c.title}\n`
    md += `**Polarity:** ${polarity} | **Type:** ${c.type} | **Priority:** ${c.priority} | **Role:** ${c.role}\n`
    md += `**Scenario:** ${String(c.scenarioName ?? c.title)}\n`
    md += `**OpenProject:** ${c.openproject_reference}\n\n`
    if (asStringArray(c.preconditions).length > 0) {
      md += `**Preconditions:**\n${asStringArray(c.preconditions).map((s) => `- ${s}`).join('\n')}\n\n`
    }
    md += `**Steps:**\n${asStringArray(c.steps).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`
    md += `**Expected:** ${c.expectedResult}\n\n---\n\n`
  })

  if (asStringArray(coverage.missing).length > 0) {
    md += `## Coverage gaps\n\n`
    asStringArray(coverage.missing).forEach((m) => {
      md += `- ${m}\n`
    })
    md += '\n'
  }

  if (asStringArray(coverage.risks).length > 0) {
    md += `## Risks\n\n`
    asStringArray(coverage.risks).forEach((r) => {
      md += `- ${r}\n`
    })
  }

  return md
}

export function summarizeRun(requirement: string, results: PipelineResults) {
  const testCases = extractTestCases(results)
  const coverage = (results.coverage as Row) || {}
  const score =
    typeof coverage.coverageScore === 'number'
      ? Math.round(coverage.coverageScore)
      : null

  return {
    title: runTitle(requirement),
    testCaseCount: testCases.length,
    coverageScore: score,
  }
}

export function buildJsonReport(
  requirement: string,
  results: PipelineResults
): string {
  return JSON.stringify({ requirement, ...results }, null, 2)
}
