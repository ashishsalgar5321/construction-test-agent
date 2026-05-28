import * as fileStore from '@/lib/storage/file-store'
import * as postgresStore from '@/lib/storage/postgres-store'
import type { TestReport, TestRun, CreateRunInput } from '@/lib/types/run'

export type RunsStore = {
  listRuns(userId: string): Promise<TestRun[]>
  getRun(userId: string, id: string): Promise<TestRun | null>
  createRun(userId: string, input: CreateRunInput): Promise<TestRun>
  deleteRun(userId: string, id: string): Promise<boolean>
  listReports(userId: string): Promise<TestReport[]>
  getReport(userId: string, id: string): Promise<TestReport | null>
}

function databaseUrl(): string | undefined {
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL
  return url?.trim() || undefined
}

function isPostgresConfigured(): boolean {
  return Boolean(databaseUrl())
}

function isVercel(): boolean {
  return process.env.VERCEL === '1'
}

export function getRunsStore(): RunsStore {
  if (isPostgresConfigured()) {
    return postgresStore
  }
  return fileStore
}

export function storageMode(): 'postgres' | 'file' {
  return isPostgresConfigured() ? 'postgres' : 'file'
}

/** Hint for ops: file mode on Vercel is not durable across instances. */
export function storageWarning(): string | null {
  if (isVercel() && !isPostgresConfigured()) {
    return 'POSTGRES_URL is not set — History and Reports will not persist on Vercel. Add Vercel Postgres (Neon) and redeploy.'
  }
  return null
}
