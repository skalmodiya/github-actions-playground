import { useState, useEffect, useCallback } from 'react'
import './RunStatus.css'

interface Run {
  databaseId: number
  status: string
  conclusion: string | null
  startedAt: string
  updatedAt: string
  displayTitle: string
}

interface Props {
  workflowFile: string
  pollInterval?: number
}

export default function RunStatus({ workflowFile, pollInterval = 5000 }: Props) {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string | null>(null)
  const [logsRunId, setLogsRunId] = useState<number | null>(null)

  const fetchRuns = useCallback(() => {
    setLoading(true)
    fetch(`/api/workflows/${workflowFile}/runs`)
      .then((r) => r.json())
      .then((data) => setRuns(Array.isArray(data) ? data : []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false))
  }, [workflowFile])

  useEffect(() => {
    fetchRuns()
    const timer = setInterval(fetchRuns, pollInterval)
    return () => clearInterval(timer)
  }, [fetchRuns, pollInterval])

  const fetchLogs = async (runId: number) => {
    if (logsRunId === runId) { setLogs(null); setLogsRunId(null); return }
    setLogsRunId(runId)
    setLogs('Loading logs…')
    const res = await fetch(`/api/workflows/runs/${runId}/logs`)
    const data = await res.json()
    setLogs(data.logs || data.error || 'No logs available')
  }

  const badge = (run: Run) => {
    if (run.status === 'in_progress' || run.status === 'queued') return 'running'
    if (run.conclusion === 'success') return 'success'
    if (run.conclusion === 'failure') return 'failure'
    return 'waiting'
  }

  const label = (run: Run) => {
    if (run.status === 'in_progress') return '⏳ Running'
    if (run.status === 'queued') return '🕐 Queued'
    if (run.conclusion === 'success') return '✓ Success'
    if (run.conclusion === 'failure') return '✗ Failed'
    return run.status
  }

  return (
    <div className="run-status">
      <div className="run-status-header">
        <span>Recent Runs</span>
        <button className="btn-secondary refresh-btn" onClick={fetchRuns} disabled={loading}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>
      {runs.length === 0 ? (
        <div className="no-runs">No runs yet — trigger one above</div>
      ) : (
        <ul className="runs-list">
          {runs.map((run) => (
            <li key={run.databaseId} className="run-item">
              <div className="run-row">
                <span className={`badge badge-${badge(run)}`}>{label(run)}</span>
                <span className="run-title">{run.displayTitle}</span>
                <span className="run-time">{new Date(run.updatedAt).toLocaleTimeString()}</span>
                <button
                  className="btn-secondary log-btn"
                  onClick={() => fetchLogs(run.databaseId)}
                >
                  {logsRunId === run.databaseId ? 'Hide logs' : 'View logs'}
                </button>
              </div>
              {logsRunId === run.databaseId && logs && (
                <pre className="run-logs">{logs}</pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
