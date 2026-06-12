import { useState, useEffect } from 'react'
import LessonNav from './components/LessonNav'
import LessonView from './components/LessonView'
import RunnerPanel from './components/RunnerPanel'
import './App.css'

export interface Lesson {
  id: number
  slug: string
  title: string
  subtitle: string
  concepts: string[]
  description: string
  keyPoints: string[]
  mermaidGraph: string
  workflowFile: string
}

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeId, setActiveId] = useState(1)
  const [showRunner, setShowRunner] = useState(false)

  useEffect(() => {
    fetch('/api/lessons')
      .then((r) => r.json())
      .then(setLessons)
      .catch(() => setLessons([]))
  }, [])

  const activeLesson = lessons.find((l) => l.id === activeId)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo">⚡</span>
          <span className="app-title">GitHub Actions Playground</span>
          <span className="app-subtitle">Learn by doing</span>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={() => setShowRunner(!showRunner)}>
            {showRunner ? '✕ Close Runner' : '🖥 Self-hosted Runner'}
          </button>
          <a
            href="https://github.com/skalmodiya/github-actions-playground"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-icon"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <LessonNav lessons={lessons} activeId={activeId} onSelect={setActiveId} />
        </aside>

        <main className="main-content">
          {showRunner && <RunnerPanel />}
          {activeLesson ? (
            <LessonView lesson={activeLesson} />
          ) : (
            <div className="loading">Loading lessons…</div>
          )}
        </main>
      </div>
    </div>
  )
}
