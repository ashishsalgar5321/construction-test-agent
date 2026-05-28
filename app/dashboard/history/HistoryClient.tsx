'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import DashboardTopBar from '@/app/components/DashboardTopBar'
import { extractTestCases } from '@/lib/normalize-ai'
import type { TestRun } from '@/lib/types/run'

function countTestCases(r: TestRun): number {
  if (typeof r.testCaseCount === 'number') return r.testCaseCount
  return extractTestCases((r.results ?? {}) as Record<string, unknown>).length
}

interface Props {
  userName: string
  userEmail: string
}

function runMeta(iso: string, testCaseCount: number) {
  const dt = new Date(iso)
  return {
    date: dt.toLocaleDateString(),
    time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    testCases: String(testCaseCount),
  }
}

export default function HistoryClient({ userName, userEmail }: Props) {
  const [runs, setRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [storage, setStorage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/runs', { credentials: 'same-origin' })
      const data = (await res.json()) as {
        runs?: TestRun[]
        storage?: string
        warning?: string | null
        error?: string
        detail?: string
      }
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Could not load history')
      }
      setRuns(data.runs || [])
      setStorage(data.storage || '')
      if (data.warning) setError(data.warning)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  const remove = async (id: string) => {
    if (!confirm('Delete this run from your history?')) return
    const res = await fetch(`/api/runs/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })
    if (res.ok) setRuns((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="dashboard-page">
      <DashboardTopBar active="history" fallbackName={userName} fallbackEmail={userEmail} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>History</h1>
          <p className="sub">Your saved test suite generations. {storage ? `(${storage})` : ''}</p>
        </header>

        {error && <p className="field-error">{error}</p>}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : runs.length === 0 ? (
          <div className="empty-state">
            <p>No runs saved yet.</p>
            <Link className="link-btn" href="/dashboard">
              Generate a test suite
            </Link>
          </div>
        ) : (
          <div className="reports-list history-list">
            {runs.map((r) => {
              const count = countTestCases(r)
              const meta = runMeta(r.createdAt, count)
              const title =
                r.requirement.trim().slice(0, 120) ||
                'Untitled requirement'

              return (
                <div key={r.id} className="report-item history-item">
                  <div className="report-main history-main">
                    <div className="report-title history-title">{title}</div>
                  </div>
                  <div className="report-meta-col history-meta-col">
                    <div className="report-meta-row history-meta-row">
                      <span className="report-meta-label">Test cases</span>
                      <span className="report-meta-value">{meta.testCases}</span>
                    </div>
                    <div className="report-meta-row history-meta-row">
                      <span className="report-meta-label">Date</span>
                      <span className="report-meta-value">{meta.date}</span>
                    </div>
                    <div className="report-meta-row history-meta-row">
                      <span className="report-meta-label">Time</span>
                      <span className="report-meta-value">{meta.time}</span>
                    </div>
                  </div>
                  <div className="report-actions history-actions">
                    <Link
                      className="link-btn"
                      href={`/dashboard?runId=${encodeURIComponent(r.id)}`}
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      className="link-btn link-btn-danger"
                      onClick={() => remove(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
