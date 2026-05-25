import { auth } from '@clerk/nextjs/server'
import {
  PARSER_PROMPT,
  SCENARIO_PROMPT,
  TESTCASE_PROMPT,
  COVERAGE_PROMPT,
  roleRequirementEmphasis,
  summarizeParsed,
} from '@/lib/prompts'
import { groqThrottle, runGroqJson } from '@/lib/groq'
import { buildPlaywrightSkeleton } from '@/lib/skeleton-builder'
import { flattenTestCaseBundle } from '@/lib/normalize-ai'
import {
  buildTestData,
  summarizeScenariosForPrompt,
} from '@/lib/test-data-builder'

export const runtime = 'nodejs'
export const maxDuration = 300

async function runStage<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`${name} failed: ${detail}`)
  }
}

function summarizeTestCases(testCases: Record<string, unknown>) {
  return flattenTestCaseBundle(testCases)
    .slice(0, 8)
    .map((tc) => ({
      id: tc.id,
      title: tc.title,
      type: tc.type,
    }))
}

function sseLine(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { requirement?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const requirement = body.requirement?.trim()
  if (!requirement) {
    return Response.json({ error: 'Requirement text is required' }, { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(sseLine(payload)))
      }

      const sendStatus = (step: number, message: string) => {
        send({ stage: 'status', data: { step, message } })
      }

      try {
        const roleHint = roleRequirementEmphasis(requirement)

        sendStatus(1, 'Parsing requirement…')
        const parsed = await runStage('Requirement Parser', () =>
          runGroqJson<Record<string, unknown>>(PARSER_PROMPT(requirement), 800)
        )
        send({ stage: 'parsed', data: parsed })
        await groqThrottle()

        sendStatus(2, 'Generating scenarios…')
        const scenarios = await runStage('Scenario Generator', () =>
          runGroqJson<Record<string, unknown>>(
            SCENARIO_PROMPT(summarizeParsed(parsed), roleHint),
            2048
          )
        )
        send({ stage: 'scenarios', data: scenarios })
        await groqThrottle()

        sendStatus(3, 'Creating test cases…')
        const scenarioBrief = summarizeScenariosForPrompt(scenarios)
        const testCasesRaw = await runStage('Test Case Generator', () =>
          runGroqJson<Record<string, unknown>>(
            TESTCASE_PROMPT(scenarioBrief, requirement, roleHint),
            3072
          )
        )
        const normalizedCases = {
          testCases: flattenTestCaseBundle(testCasesRaw),
        }
        send({ stage: 'testCases', data: normalizedCases })

        sendStatus(4, 'Building synthetic test data…')
        const testData = buildTestData(parsed, requirement)
        send({ stage: 'testData', data: testData })
        await groqThrottle()

        sendStatus(5, 'Writing automation skeleton…')
        const skeleton = buildPlaywrightSkeleton(normalizedCases, requirement)
        send({ stage: 'skeleton', data: skeleton })

        sendStatus(6, 'Analyzing coverage…')
        const coverage = await runStage('Coverage Reviewer', () =>
          runGroqJson<Record<string, unknown>>(
            COVERAGE_PROMPT(
              JSON.stringify(summarizeTestCases(normalizedCases)),
              scenarioBrief
            ),
            1536
          )
        )
        if (typeof coverage.coverageScore === 'number') {
          coverage.coverageScore = Math.min(
            100,
            Math.max(0, Math.round(coverage.coverageScore as number))
          )
        }
        send({ stage: 'coverage', data: coverage })

        sendStatus(6, 'Complete')
        send({ stage: 'complete', data: { ok: true } })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Generation failed'
        console.error('[generate]', message)
        send({ stage: 'error', data: { message } })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
