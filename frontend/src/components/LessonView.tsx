import { useState } from 'react'
import type { Lesson } from '../App'
import WorkflowVisualizer from './WorkflowVisualizer'
import YamlEditor from './YamlEditor'
import RunStatus from './RunStatus'
import ActRunner from './ActRunner'
import './LessonView.css'

interface Props {
  lesson: Lesson
}

type Tab = 'learn' | 'yaml' | 'runs' | 'act'

export default function LessonView({ lesson }: Props) {
  const [tab, setTab] = useState<Tab>('learn')
  const [dispatching, setDispatching] = useState(false)
  const [dispatchMsg, setDispatchMsg] = useState('')

  const triggerOnGitHub = async () => {
    setDispatching(true)
    setDispatchMsg('')
    try {
      const res = await fetch(`/api/workflows/${lesson.workflowFile}/dispatch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputs: {} }) })
      const data = await res.json()
      if (data.triggered) {
        setDispatchMsg('✓ Triggered on GitHub! Check the Runs tab.')
        setTab('runs')
      } else {
        setDispatchMsg('✗ ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      setDispatchMsg('✗ Backend not reachable')
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="lesson-view">
      <div className="lesson-head">
        <div className="lesson-num">Lesson {String(lesson.id).padStart(2, '0')}</div>
        <h1 className="lesson-title">{lesson.title}</h1>
        <p className="lesson-subtitle">{lesson.subtitle}</p>
        <div className="concept-tags">
          {lesson.concepts.map((c) => (
            <span key={c} className="concept-tag">{c}</span>
          ))}
        </div>
      </div>

      <div className="lesson-actions">
        <button className="btn-primary" onClick={triggerOnGitHub} disabled={dispatching}>
          {dispatching ? '⏳ Triggering…' : '▶ Run on GitHub'}
        </button>
        <button className="btn-blue" onClick={() => setTab('act')}>
          ⚡ Run Locally (act)
        </button>
        <a
          href={`https://github.com/skalmodiya/github-actions-playground/actions/workflows/${lesson.workflowFile}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary btn-icon"
        >
          Open in GitHub ↗
        </a>
        {dispatchMsg && <span className="dispatch-msg">{dispatchMsg}</span>}
      </div>

      <div className="lesson-tabs">
        {(['learn', 'yaml', 'runs', 'act'] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'learn' && '📚 Learn'}
            {t === 'yaml' && '📄 Workflow YAML'}
            {t === 'runs' && '🚀 Runs'}
            {t === 'act' && '⚡ Act (Local)'}
          </button>
        ))}
      </div>

      <div className="lesson-body">
        {tab === 'learn' && (
          <div className="learn-tab">
            <WorkflowVisualizer graph={lesson.mermaidGraph} />
            <div className="description-card">
              <p className="lesson-desc">{lesson.description}</p>
              <ul className="key-points">
                {lesson.keyPoints.map((point, i) => (
                  <li key={i}>
                    <span className="kp-bullet">→</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'yaml' && <YamlEditor workflowFile={lesson.workflowFile} />}

        {tab === 'runs' && <RunStatus workflowFile={lesson.workflowFile} />}

        {tab === 'act' && <ActRunner workflowFile={lesson.workflowFile} />}
      </div>
    </div>
  )
}
