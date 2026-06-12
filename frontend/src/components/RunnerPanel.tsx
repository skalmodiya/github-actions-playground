import { useState, useEffect } from 'react'
import './RunnerPanel.css'

export default function RunnerPanel() {
  const [status, setStatus] = useState<string>('unknown')
  const [repoUrl, setRepoUrl] = useState('https://github.com/skalmodiya/github-actions-playground')
  const [token, setToken] = useState('')
  const [logs, setLogs] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  const fetchStatus = () => {
    fetch('/api/runner/status')
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    fetchStatus()
    const t = setInterval(fetchStatus, 10000)
    return () => clearInterval(t)
  }, [])

  const start = async () => {
    if (!token) { alert('Enter a GitHub runner registration token first.\nGet it from: Settings → Actions → Runners → New self-hosted runner'); return }
    const res = await fetch('/api/runner/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, token }),
    })
    const d = await res.json()
    if (d.started) fetchStatus()
    else alert('Error: ' + d.error)
  }

  const stop = async () => {
    await fetch('/api/runner/stop', { method: 'POST' })
    fetchStatus()
  }

  const fetchLogs = async () => {
    const res = await fetch('/api/runner/logs')
    const d = await res.json()
    setLogs(d.logs || d.error || 'No logs')
    setShowLogs(true)
  }

  const statusColor = status === 'running' ? '#56d364' : status === 'stopped' ? '#8b949e' : '#f85149'

  return (
    <div className="runner-panel">
      <div className="runner-header">
        <span>🖥 Self-hosted Runner</span>
        <div className="runner-status-dot" style={{ background: statusColor }} title={status} />
        <span className="runner-status-label" style={{ color: statusColor }}>{status}</span>
      </div>

      <div className="runner-body">
        <div className="runner-field">
          <label>Repository URL</label>
          <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
        </div>
        <div className="runner-field">
          <label>Registration Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="AABBCC... (from repo Settings → Actions → Runners)"
          />
        </div>

        <div className="runner-btns">
          <button className="btn-primary" onClick={start} disabled={status === 'running'}>Start Runner</button>
          <button className="btn-secondary" onClick={stop} disabled={status !== 'running'}>Stop Runner</button>
          <button className="btn-secondary" onClick={fetchLogs}>View Logs</button>
        </div>

        <div className="runner-hint">
          The runner connects to GitHub, registers with labels: <code>self-hosted, local, docker</code>.
          Use <code>runs-on: [self-hosted, local]</code> in a workflow to target it.
        </div>

        {showLogs && (
          <pre className="runner-logs">{logs}</pre>
        )}
      </div>
    </div>
  )
}
