import { useState, useEffect, useRef } from 'react'
import './ActRunner.css'

interface Props {
  workflowFile: string
}

export default function ActRunner({ workflowFile }: Props) {
  const [available, setAvailable] = useState<boolean | null>(null)
  const [version, setVersion] = useState('')
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState<string[]>([])
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/act/available')
      .then((r) => r.json())
      .then((d) => { setAvailable(d.available); setVersion(d.version || '') })
      .catch(() => setAvailable(false))
  }, [])

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
  }, [lines])

  const runAct = async () => {
    setRunning(true)
    setLines([])

    const res = await fetch(`/api/act/${workflowFile}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'workflow_dispatch' }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''
      for (const part of parts) {
        if (!part.startsWith('data: ')) continue
        try {
          const msg = JSON.parse(part.slice(6))
          if (msg.type === 'log') {
            setLines((prev) => [...prev, msg.data])
          } else if (msg.type === 'done') {
            setLines((prev) => [...prev, `\n--- Exit code: ${msg.data.exitCode} ---`])
            setRunning(false)
          }
        } catch {}
      }
    }
    setRunning(false)
  }

  if (available === null) return <div className="act-loading">Checking act availability…</div>

  if (!available) {
    return (
      <div className="act-unavailable">
        <h3>act not installed</h3>
        <p>The <code>act</code> tool lets you run GitHub Actions workflows locally using Docker.</p>
        <p>In the Docker setup, act is pre-installed in the backend container. If running locally:</p>
        <pre>{`# macOS
brew install act

# Windows (winget)
winget install nektos.act

# Or use Docker Compose (recommended)`}</pre>
        <p>Once installed, restart the backend.</p>
      </div>
    )
  }

  return (
    <div className="act-runner">
      <div className="act-header">
        <div>
          <span className="act-title">Run Locally with act</span>
          <span className="act-version">{version}</span>
        </div>
        <button className="btn-primary" onClick={runAct} disabled={running}>
          {running ? '⏳ Running…' : '⚡ Run with act'}
        </button>
      </div>

      <div className="act-info">
        <p>act runs your workflow in Docker locally — no GitHub push required. Uses your local Docker daemon.</p>
      </div>

      {lines.length > 0 && (
        <div className="act-logs" ref={logsRef}>
          {lines.map((line, i) => (
            <div key={i} className="act-log-line">{line}</div>
          ))}
          {running && <div className="act-cursor">▋</div>}
        </div>
      )}
    </div>
  )
}
