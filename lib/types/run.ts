/** Persisted pipeline output for history & reports */
export type PipelineResults = Record<string, unknown>

export type RunStatus = 'complete' | 'error'

export interface TestRun {
  id: string
  userId: string
  requirement: string
  title: string
  results: PipelineResults
  coverageScore: number | null
  testCaseCount: number
  status: RunStatus
  createdAt: string
}

export interface TestReport {
  id: string
  runId: string
  userId: string
  format: 'md' | 'json'
  title: string
  content: string
  coverageScore: number | null
  testCaseCount: number
  createdAt: string
}

export interface CreateRunInput {
  requirement: string
  results: PipelineResults
  status?: RunStatus
}
