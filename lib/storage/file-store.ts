import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
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

const DATA_ROOT = path.join(process.cwd(), 'data')
const RUNS_DIR = path.join(DATA_ROOT, 'runs')
const REPORTS_DIR = path.join(DATA_ROOT, 'reports')

function runFile(userId: string) {
  return path.join(RUNS_DIR, `${encodeURIComponent(userId)}.json`)
}

function reportFile(userId: string) {
  return path.join(REPORTS_DIR, `${encodeURIComponent(userId)}.json`)
}

async function ensureDirs() {
  await mkdir(RUNS_DIR, { recursive: true })
  await mkdir(REPORTS_DIR, { recursive: true })
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson<T>(filePath: string, data: T) {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function listRuns(userId: string): Promise<TestRun[]> {
  await ensureDirs()
  const runs = await readJson<TestRun[]>(runFile(userId), [])
  return runs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getRun(
  userId: string,
  id: string
): Promise<TestRun | null> {
  const runs = await listRuns(userId)
  return runs.find((r) => r.id === id) ?? null
}

export async function createRun(
  userId: string,
  input: CreateRunInput
): Promise<TestRun> {
  await ensureDirs()
  const summary = summarizeRun(input.requirement, input.results)
  const run: TestRun = {
    id: newId('run'),
    userId,
    requirement: input.requirement,
    title: summary.title,
    results: input.results,
    coverageScore: summary.coverageScore,
    testCaseCount: summary.testCaseCount,
    status: input.status ?? 'complete',
    createdAt: new Date().toISOString(),
  }

  const runs = await readJson<TestRun[]>(runFile(userId), [])
  runs.unshift(run)
  await writeJson(runFile(userId), runs.slice(0, 100))

  const reports = await readJson<TestReport[]>(reportFile(userId), [])
  const md = buildMarkdownReport(input.requirement, input.results)
  const json = buildJsonReport(input.requirement, input.results)

  reports.unshift(
    {
      id: newId('rpt'),
      runId: run.id,
      userId,
      format: 'md',
      title: `${summary.title} — Markdown`,
      content: md,
      coverageScore: summary.coverageScore,
      testCaseCount: summary.testCaseCount,
      createdAt: run.createdAt,
    },
    {
      id: newId('rpt'),
      runId: run.id,
      userId,
      format: 'json',
      title: `${summary.title} — JSON`,
      content: json,
      coverageScore: summary.coverageScore,
      testCaseCount: summary.testCaseCount,
      createdAt: run.createdAt,
    }
  )
  await writeJson(reportFile(userId), reports.slice(0, 200))

  return run
}

export async function deleteRun(userId: string, id: string): Promise<boolean> {
  await ensureDirs()
  const runs = await readJson<TestRun[]>(runFile(userId), [])
  const next = runs.filter((r) => r.id !== id)
  if (next.length === runs.length) return false
  await writeJson(runFile(userId), next)

  const reports = await readJson<TestReport[]>(reportFile(userId), [])
  await writeJson(
    reportFile(userId),
    reports.filter((r) => r.runId !== id)
  )
  return true
}

export async function listReports(userId: string): Promise<TestReport[]> {
  await ensureDirs()
  const reports = await readJson<TestReport[]>(reportFile(userId), [])
  return reports.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getReport(
  userId: string,
  id: string
): Promise<TestReport | null> {
  const reports = await listReports(userId)
  return reports.find((r) => r.id === id) ?? null
}
