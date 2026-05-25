import Groq from 'groq-sdk'
import { SYSTEM_PROMPT } from './prompts'

/** Free-tier friendly models (separate daily token buckets). 70b is only 100K TPD. */
export const GROQ_MODELS = [
  process.env.GROQ_MODEL?.trim(),
  'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'allam-2-7b',
  'qwen/qwen3-32b',
  'llama-3.3-70b-versatile',
].filter((m): m is string => Boolean(m))

const DEFAULT_MODEL = GROQ_MODELS[0] || 'llama-3.1-8b-instant'

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is missing. Add it to .env.local and restart npm run dev.'
    )
  }
  if (!apiKey.startsWith('gsk_')) {
    throw new Error(
      'GROQ_API_KEY looks invalid (should start with gsk_). Copy a new key from console.groq.com'
    )
  }
  return new Groq({ apiKey })
}

function isJsonValidationError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as { status?: number; error?: { code?: string } }
    return (
      e.status === 400 &&
      (e.error?.code === 'json_validate_failed' ||
        String(e.error?.code || '').includes('json'))
    )
  }
  return false
}

function isRateLimitError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as { status?: number; error?: { code?: string } }
    return e.status === 429 || e.error?.code === 'rate_limit_exceeded'
  }
  return false
}

function groqErrorMessage(err: unknown, model: string): string {
  if (err && typeof err === 'object') {
    const e = err as {
      status?: number
      message?: string
      error?: { message?: string }
    }
    const detail = e.error?.message || e.message || ''
    if (e.status === 401) {
      return `Invalid Groq API key (401). Create a new free key at https://console.groq.com/keys — update GROQ_API_KEY in .env.local, then restart npm run dev.`
    }
    if (e.status === 429) {
      const waitHint = detail.match(/try again in ([^.]+)/i)?.[1]
      return (
        `Groq rate limit on ${model}. ` +
        (waitHint
          ? `Wait ${waitHint.trim()}, or we will try another model automatically.`
          : `Wait 60 seconds and try again.`) +
        ` Tip: use llama-3.1-8b-instant (500K tokens/day on free tier).`
      )
    }
    if (e.status === 413 || detail.toLowerCase().includes('too large')) {
      return 'Request too large. Try a shorter requirement.'
    }
    if (detail) return detail
    if (e.status) return `Groq API error (${e.status})`
  }
  if (err instanceof Error) return err.message
  return 'Groq API request failed'
}

export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim()
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1].trim() : cleaned
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI returned invalid JSON. Please click Generate again.')
  }

  const slice = raw.slice(start, end + 1)

  const tryParse = (s: string): T | null => {
    try {
      return JSON.parse(s) as T
    } catch {
      return null
    }
  }

  let result = tryParse(slice)
  if (result) return result

  for (const suffix of ['}', ']}', ']}]}', '"}]}']) {
    result = tryParse(slice + suffix)
    if (result) return result
  }

  throw new Error('AI returned malformed JSON. Please click Generate again.')
}

export async function runGroqStage(
  userPrompt: string,
  options?: { jsonMode?: boolean; maxTokens?: number; model?: string }
): Promise<{ content: string; model: string }> {
  const groq = getGroqClient()
  const modelsToTry = options?.model
    ? [options.model, ...GROQ_MODELS.filter((m) => m !== options.model)]
    : GROQ_MODELS

  let lastError: unknown

  for (const model of modelsToTry) {
    const attempts: boolean[] = options?.jsonMode ? [true, false] : [false]
    for (const useJsonMode of attempts) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.2,
          max_tokens: options?.maxTokens ?? 3072,
          response_format: useJsonMode ? { type: 'json_object' } : undefined,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })
        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('Empty response from Groq AI')
        return { content, model }
      } catch (err) {
        lastError = err
        if (isRateLimitError(err)) break
        if (useJsonMode && isJsonValidationError(err)) continue
        if (!isRateLimitError(err)) throw new Error(groqErrorMessage(err, model))
      }
    }
    if (lastError && isRateLimitError(lastError)) continue
  }

  throw new Error(
    groqErrorMessage(
      lastError,
      modelsToTry[modelsToTry.length - 1] || DEFAULT_MODEL
    )
  )
}

export async function runGroqJson<T>(
  userPrompt: string,
  maxTokens = 3072
): Promise<T> {
  const compactSuffix =
    '\nKeep response compact. Valid JSON only. Max 8 test cases if generating tests.'

  try {
    const { content } = await runGroqStage(userPrompt, {
      jsonMode: true,
      maxTokens,
    })
    return parseJsonResponse<T>(content)
  } catch (firstErr) {
    const msg = firstErr instanceof Error ? firstErr.message : ''
    if (!msg.includes('JSON') && !msg.includes('json')) throw firstErr

    const { content } = await runGroqStage(userPrompt + compactSuffix, {
      jsonMode: true,
      maxTokens: Math.max(1024, Math.floor(maxTokens * 0.85)),
    })
    return parseJsonResponse<T>(content)
  }
}

/** Brief pause between calls to stay under Groq free-tier RPM (30/min). */
export function groqThrottle(ms = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
