'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardTopBar from '@/app/components/DashboardTopBar'
import type { TestReport } from '@/lib/types/run'

interface Props {
  userName: string
  userEmail: string
  highlightRunId?: string
}

export default function ReportsClient({ userName, userEmail, highlightRunId }: Props) {
  const [reports, setReports] = useState<TestReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [storage, setStorage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reports', { credentials: 'same-origin' })
      if (!res.ok) throw new Error('Could not load reports')
      const data = (await res.json()) as { reports: TestReport[]; storage?: string }
      const list = data.reports || []
      setStorage(data.storage || '')
      setReports(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports')
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

  const download = (report: TestReport) => {
    const ext = report.format === 'md' ? 'md' : 'json'
    const type = report.format === 'md' ? 'text/markdown' : 'application/json'
    const blob = new Blob([report.content], { type: `${type};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/[^\w\s-]/g, '').slice(0, 40)}.${ext}`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 3000)
  }

  const pinnedId = useMemo(() => (highlightRunId ? String(highlightRunId) : ''), [highlightRunId])
  const formatMeta = (iso: string, format: TestReport['format']) => {
    const dt = new Date(iso)
    return {
      date: dt.toLocaleDateString(),
      time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: format === 'md' ? 'Markdown' : 'JSON',
    }
  }

  return (
    <div className="dashboard-page">
      <DashboardTopBar active="reports" fallbackName={userName} fallbackEmail={userEmail} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Reports</h1>
          <p className="sub">Saved coverage reports for past runs. {storage ? `(${storage})` : ''}</p>
        </header>

        {error && <p className="field-error">{error}</p>}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports saved yet.</p>
            <Link className="link-btn" href="/dashboard">
              Generate a test suite
            </Link>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((r) => {
              const meta = formatMeta(r.createdAt, r.format)
              return (
                <div key={r.id} className={`report-item ${pinnedId && r.runId === pinnedId ? 'highlight' : ''}`}>
                  <div className="report-main">
                    <div className="report-title">{r.title}</div>
                  </div>
                  <div className="report-meta-col">
                    <div className="report-meta-row">
                      <span className="report-meta-label">File type</span>
                      <span className="report-meta-value">{meta.type}</span>
                    </div>
                    <div className="report-meta-row">
                      <span className="report-meta-label">Date</span>
                      <span className="report-meta-value">{meta.date}</span>
                    </div>
                    <div className="report-meta-row">
                      <span className="report-meta-label">Time</span>
                      <span className="report-meta-value">{meta.time}</span>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button className="link-btn" onClick={() => download(r)}>
                      Download
                    </button>
                    <Link className="link-btn" href={`/dashboard?runId=${encodeURIComponent(r.runId)}`}>
                      Open run
                    </Link>
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

