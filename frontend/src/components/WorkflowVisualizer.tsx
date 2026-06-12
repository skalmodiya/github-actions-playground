import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import './WorkflowVisualizer.css'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    background: '#161b22',
    primaryColor: '#1f6feb',
    primaryTextColor: '#c9d1d9',
    primaryBorderColor: '#30363d',
    lineColor: '#8b949e',
    secondaryColor: '#238636',
    tertiaryColor: '#0d1117',
    fontSize: '13px',
  },
})

interface Props {
  graph: string
  runningSteps?: string[]
}

export default function WorkflowVisualizer({ graph, runningSteps = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const id = `mermaid-${Math.random().toString(36).slice(2)}`
    mermaid.render(id, graph).then(({ svg }) => {
      if (containerRef.current) containerRef.current.innerHTML = svg
    }).catch((err) => {
      if (containerRef.current)
        containerRef.current.innerHTML = `<pre style="color:var(--red);font-size:11px">${err.message}</pre>`
    })
  }, [graph])

  return (
    <div className={`visualizer ${runningSteps.length ? 'running' : ''}`}>
      <div className="visualizer-label">Workflow DAG</div>
      <div className="visualizer-graph" ref={containerRef} />
    </div>
  )
}
