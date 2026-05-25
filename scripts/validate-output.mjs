import { readFileSync } from 'fs'

// Load compiled normalize helpers via ts — use inline validation for sample JSON
function asStringArray(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function extractTestCases(results) {
  const raw = results.testCases
  if (Array.isArray(raw)) return raw
  if (raw?.testCases) return raw.testCases
  return []
}

function validatePipelineOutput(results) {
  const errors = []
  for (const stage of ['parsed', 'scenarios', 'testCases', 'testData', 'skeleton', 'coverage']) {
    if (!results[stage]) errors.push(`Missing stage: ${stage}`)
  }
  const cases = extractTestCases(results)
  if (cases.length < 5) errors.push(`Expected >= 5 test cases, got ${cases.length}`)
  for (const tc of cases) {
    for (const field of ['id', 'title', 'type', 'expectedResult', 'traceability']) {
      if (!tc[field]) errors.push(`Missing ${field} on ${tc.id ?? 'case'}`)
    }
    if (asStringArray(tc.steps).length === 0) errors.push(`Missing steps on ${tc.id}`)
  }
  const code = String(results.skeleton?.code ?? '')
  for (const kw of ['test(', 'expect(', 'page.']) {
    if (!code.includes(kw)) errors.push(`skeleton missing ${kw}`)
  }
  const score = results.coverage?.coverageScore
  if (typeof score !== 'number' || score < 0 || score > 100) {
    errors.push('Invalid coverageScore')
  }
  return { ok: errors.length === 0, errors }
}

const files = process.argv.slice(2)
if (files.length === 0) {
  console.log('Usage: node scripts/validate-output.mjs samples/work-package-output.json ...')
  process.exit(1)
}

let failed = 0
for (const file of files) {
  const data = JSON.parse(readFileSync(file, 'utf8'))
  const { ok, errors } = validatePipelineOutput(data)
  if (ok) {
    console.log(`PASS ${file}`)
  } else {
    failed++
    console.log(`FAIL ${file}`)
    errors.forEach((e) => console.log('  -', e))
  }
}
process.exit(failed > 0 ? 1 : 0)
