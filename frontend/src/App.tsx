import { useState, useEffect, useCallback } from 'react'
import { SettingsProvider } from './context/SettingsContext'
import LessonNav from './components/LessonNav'
import LessonView from './components/LessonView'
import RunnerPanel from './components/RunnerPanel'
import SettingsPage from './components/SettingsPage'
import AICopilot from './components/AICopilot'
import WelcomeScreen from './components/WelcomeScreen'
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

type Page = 'lesson' | 'settings'

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeId, setActiveId] = useState(1)
  const [activePage, setActivePage] = useState<Page>('lesson')
  const [showRunner, setShowRunner] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)
  const [visitedIds, setVisitedIds] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('gha_visited') || '[]')) } catch { return new Set() }
  })
  const [hasSeenWelcome, setHasSeenWelcome] = useState(
    () => !!localStorage.getItem('gha_welcome_seen')
  )

  useEffect(() => {
    fetch('/api/lessons')
      .then((r) => r.json())
      .then(setLessons)
      .catch(() => setLessons([]))
  }, [])

  const selectLesson = useCallback((id: number) => {
    setActiveId(id)
    setActivePage('lesson')
    setVisitedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('gha_visited', JSON.stringify([...next]))
      return next
    })
  }, [])

  // Mark first lesson visited on load
  useEffect(() => {
    if (lessons.length > 0) selectLesson(activeId)
  }, [lessons.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return
      if (e.key === 'ArrowLeft') selectLesson(Math.max(1, activeId - 1))
      if (e.key === 'ArrowRight') selectLesson(Math.min(lessons.length, activeId + 1))
      if (e.key === '?') setShowCopilot(v => !v)
      if (e.key === 'Escape') setShowCopilot(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeId, lessons.length, selectLesson])

  const activeLesson = lessons.find((l) => l.id === activeId)

  const dismissWelcome = () => {
    localStorage.setItem('gha_welcome_seen', '1')
    setHasSeenWelcome(true)
  }

  return (
    <SettingsProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <span className="logo">⚡</span>
            <span className="app-title">GitHub Actions Playground</span>
            <span className="app-subtitle">Learn by doing</span>
          </div>
          <div className="header-right">
            <div className="header-nav">
              {activePage === 'lesson' && lessons.length > 0 && (
                <div className="lesson-arrows">
                  <button className="btn-secondary arrow-btn" onClick={() => selectLesson(Math.max(1, activeId - 1))} disabled={activeId === 1} title="Previous lesson (←)">←</button>
                  <span className="lesson-indicator">{activeId}/{lessons.length}</span>
                  <button className="btn-secondary arrow-btn" onClick={() => selectLesson(Math.min(lessons.length, activeId + 1))} disabled={activeId === lessons.length} title="Next lesson (→)">→</button>
                </div>
              )}
            </div>
            <button
              className={`btn-secondary copilot-btn ${showCopilot ? 'active-btn' : ''}`}
              onClick={() => setShowCopilot(!showCopilot)}
              title="AI Copilot (?)"
            >
              🤖 AI Copilot
            </button>
            <button
              className={`btn-secondary ${activePage === 'settings' ? 'active-btn' : ''}`}
              onClick={() => setActivePage(p => p === 'settings' ? 'lesson' : 'settings')}
            >
              ⚙ Settings
            </button>
            <button className="btn-secondary runner-btn" onClick={() => setShowRunner(!showRunner)}>
              {showRunner ? '✕ Runner' : '🖥 Runner'}
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
            <LessonNav
              lessons={lessons}
              activeId={activeId}
              onSelect={selectLesson}
              visitedIds={visitedIds}
            />
          </aside>

          <main className={`main-content ${showCopilot ? 'with-copilot' : ''}`}>
            {showRunner && <RunnerPanel />}
            {activePage === 'settings' ? (
              <SettingsPage />
            ) : activeLesson ? (
              <LessonView key={activeLesson.id} lesson={activeLesson} />
            ) : (
              <div className="loading">Loading lessons…</div>
            )}
          </main>
        </div>

        <AICopilot
          isOpen={showCopilot}
          onClose={() => setShowCopilot(false)}
          lesson={activeLesson}
        />

        {!hasSeenWelcome && <WelcomeScreen onDismiss={dismissWelcome} />}
      </div>
    </SettingsProvider>
  )
}
