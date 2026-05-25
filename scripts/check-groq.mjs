import { readFileSync } from 'fs'
import { resolve } from 'path'
import Groq from 'groq-sdk'

const envPath = resolve(process.cwd(), '.env.local')
let apiKey = ''

try {
  const text = readFileSync(envPath, 'utf8')
  const line = text.split(/\r?\n/).find((l) => l.startsWith('GROQ_API_KEY='))
  if (line) apiKey = line.replace(/^GROQ_API_KEY=/, '').trim()
} catch {
  /* .env.local optional if env var set */
}

if (!apiKey && process.env.GROQ_API_KEY) {
  apiKey = process.env.GROQ_API_KEY.trim()
}

if (!apiKey?.startsWith('gsk_')) {
  console.error('GROQ_API_KEY is missing or invalid in .env.local')
  process.exit(1)
}

const groq = new Groq({ apiKey })
try {
  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant'
  const res = await groq.chat.completions.create({
    model,
    max_tokens: 5,
    messages: [{ role: 'user', content: 'Reply with OK only' }],
  })
  console.log(`SUCCESS: Groq API key works (model: ${model}).`)
  console.log('Sample reply:', res.choices[0]?.message?.content)
} catch (e) {
  console.error('FAILED:', e?.status === 401 ? 'Invalid API key (401)' : e?.message || e)
  console.error('\nFix:')
  console.error('1. Open https://console.groq.com/keys')
  console.error('2. Create API Key → copy it')
  console.error('3. Paste in .env.local as GROQ_API_KEY=gsk_...')
  console.error('4. Restart: npm run dev')
  process.exit(1)
}
