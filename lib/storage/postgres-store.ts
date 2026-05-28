import { neon } from '@neondatabase/serverless'
import {
  buildJsonReport,
  buildMarkdownReport,
  summarizeRun,
} from '@/lib/report-builder'
import type {
  CreateRunInput,
  TestReport,
  TestRun,
} from '@/lib/types/run'

function getConnectionString(): string {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL
  if (!url?.trim()) {
    throw new Error('POSTGRES_URL (or DATABASE_URL) is not configured')
  }
  return url.trim()
}

let sqlClient: ReturnType<typeof neon> | null = null

function sql() {
  if (!sqlClient) {
    sqlClient = neon(getConnectionString())
  }
  return sqlClient
}

let schemaReady: Promise<void> | null = null

async function ensureSchema() {
  if (schemaReady) {
    try {
      await schemaReady
      return
    } catch {
      schemaReady = null
    }
  }

  schemaReady = (async () => {
    const query = sql()
    await query`
      CREATE TABLE IF NOT EXISTS test_runs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        requirement TEXT NOT NULL,
        title TEXT NOT NULL,
        results JSONB NOT NULL,
        coverage_score INTEGER,
        test_case_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'complete',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await query`
      CREATE TABLE IF NOT EXISTS test_reports (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        format TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        coverage_score INTEGER,
        test_case_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await query`CREATE INDEX IF NOT EXISTS idx_test_runs_user ON test_runs (user_id, created_at DESC)`
    await query`CREATE INDEX IF NOT EXISTS idx_test_reports_user ON test_reports (user_id, created_at DESC)`
  })()

  await schemaReady
}

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function asRows<T>(result: unknown): T[] {
  return Array.isArray(result) ? (result as T[]) : []
}

function mapRun(row: {
  id: string
  user_id: string
  requirement: string
  title: string
  results: unknown
  coverage_score: number | null
  test_case_count: number
  status: string
  created_at: Date | string
}): TestRun {
  return {
    id: row.id,
    userId: row.user_id,
    requirement: row.requirement,
    title: row.title,
    results: row.results as TestRun['results'],
    coverageScore: row.coverage_score,
    testCaseCount: row.test_case_count,
    status: row.status as TestRun['status'],
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }
}

function mapReport(row: {
  id: string
  run_id: string
  user_id: string
  format: string
  title: string
  content: string
  coverage_score: number | null
  test_case_count: number
  created_at: Date | string
}): TestReport {
  return {
    id: row.id,
    runId: row.run_id,
    userId: row.user_id,
    format: row.format as TestReport['format'],
    title: row.title,
    content: row.content,
    coverageScore: row.coverage_score,
    testCaseCount: row.test_case_count,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }
}

export async function listRuns(userId: string): Promise<TestRun[]> {
  await ensureSchema()
  const rows = asRows<Parameters<typeof mapRun>[0]>(await sql()`
    SELECT * FROM test_runs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 100
  `)
  return rows.map((r) => mapRun(r))
}

export async function getRun(
  userId: string,
  id: string
): Promise<TestRun | null> {
  await ensureSchema()
  const rows = asRows<Parameters<typeof mapRun>[0]>(await sql()`
    SELECT * FROM test_runs
    WHERE user_id = ${userId} AND id = ${id}
    LIMIT 1
  `)
  if (!rows[0]) return null
  return mapRun(rows[0])
}

export async function createRun(
  userId: string,
  input: CreateRunInput
): Promise<TestRun> {
  await ensureSchema()
  const summary = summarizeRun(input.requirement, input.results)
  const id = newId('run')
  const createdAt = new Date().toISOString()
  const status = input.status ?? 'complete'
  const resultsJson = JSON.stringify(input.results)

  await sql()`
    INSERT INTO test_runs (
      id, user_id, requirement, title, results,
      coverage_score, test_case_count, status, created_at
    ) VALUES (
      ${id}, ${userId}, ${input.requirement}, ${summary.title},
      ${resultsJson}::jsonb,
      ${summary.coverageScore}, ${summary.testCaseCount}, ${status}, ${createdAt}
    )
  `

  const md = buildMarkdownReport(input.requirement, input.results)
  const json = buildJsonReport(input.requirement, input.results)

  await sql()`
    INSERT INTO test_reports (
      id, run_id, user_id, format, title, content,
      coverage_score, test_case_count, created_at
    ) VALUES (
      ${newId('rpt')}, ${id}, ${userId}, 'md', ${`${summary.title} — Markdown`},
      ${md}, ${summary.coverageScore}, ${summary.testCaseCount}, ${createdAt}
    )
  `
  await sql()`
    INSERT INTO test_reports (
      id, run_id, user_id, format, title, content,
      coverage_score, test_case_count, created_at
    ) VALUES (
      ${newId('rpt')}, ${id}, ${userId}, 'json', ${`${summary.title} — JSON`},
      ${json}, ${summary.coverageScore}, ${summary.testCaseCount}, ${createdAt}
    )
  `

  return {
    id,
    userId,
    requirement: input.requirement,
    title: summary.title,
    results: input.results,
    coverageScore: summary.coverageScore,
    testCaseCount: summary.testCaseCount,
    status,
    createdAt,
  }
}

export async function deleteRun(userId: string, id: string): Promise<boolean> {
  await ensureSchema()
  const deleted = asRows<{ id: string }>(await sql()`
    DELETE FROM test_runs
    WHERE user_id = ${userId} AND id = ${id}
    RETURNING id
  `)
  await sql()`DELETE FROM test_reports WHERE user_id = ${userId} AND run_id = ${id}`
  return deleted.length > 0
}

export async function listReports(userId: string): Promise<TestReport[]> {
  await ensureSchema()
  const rows = asRows<Parameters<typeof mapReport>[0]>(await sql()`
    SELECT * FROM test_reports
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 200
  `)
  return rows.map((r) => mapReport(r))
}

export async function getReport(
  userId: string,
  id: string
): Promise<TestReport | null> {
  await ensureSchema()
  const rows = asRows<Parameters<typeof mapReport>[0]>(await sql()`
    SELECT * FROM test_reports
    WHERE user_id = ${userId} AND id = ${id}
    LIMIT 1
  `)
  if (!rows[0]) return null
  return mapReport(rows[0])
}
