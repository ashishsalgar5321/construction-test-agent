import { readFileSync } from 'fs'
import Groq from 'groq-sdk'

const line = readFileSync('.env.local', 'utf8')
  .split(/\r?\n/)
  .find((l) => l.startsWith('GROQ_API_KEY='))
const groq = new Groq({ apiKey: line.replace(/^GROQ_API_KEY=/, '').trim() })
const MODEL = 'llama-3.3-70b-versatile'

async function runJson(userPrompt) {
  const res = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Expert QA for OpenProject. JSON only.' },
      { role: 'user', content: userPrompt },
    ],
  })
  const text = res.choices[0]?.message?.content || ''
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  return JSON.parse(text.slice(start, end + 1))
}

const requirement =
  'A site engineer creates a work package for a safety issue and assigns it to a contractor with a due date.'

const prompts = [
  ['Parser', `Analyze requirement and return JSON with entities, workflow, roles, actions, conditions, openproject_module, summary. Requirement: "${requirement}"`],
]

let parsed, scenarios, testCases
const stages = [
  ['Parser', async () => { parsed = await runJson(prompts[0][1]); return parsed }],
  ['Scenarios', async () => { scenarios = await runJson(`Generate positive, negative, role_based, regression, status, dashboard scenario arrays as JSON from: ${JSON.stringify(parsed)}`); return scenarios }],
  ['TestCases', async () => { testCases = await runJson(`Generate 8+ testCases array in JSON from scenarios ${JSON.stringify(scenarios)}`); return testCases }],
]

for (const [name, fn] of stages) {
  process.stdout.write(`${name}... `)
  const t = Date.now()
  try {
    await fn()
    console.log(`OK (${((Date.now() - t) / 1000).toFixed(1)}s)`)
  } catch (e) {
    console.log('FAILED', e.message)
    process.exit(1)
  }
}
console.log('Pipeline sample stages OK')
