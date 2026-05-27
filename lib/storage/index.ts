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

function isPostgresConfigured(): boolean {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.DATABASE_URL
  )
}

export function getRunsStore(): RunsStore {
  return isPostgresConfigured() ? postgresStore : fileStore
}

export function storageMode(): 'postgres' | 'file' {
  return isPostgresConfigured() ? 'postgres' : 'file'
}

