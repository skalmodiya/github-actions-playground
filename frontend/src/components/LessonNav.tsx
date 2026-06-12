import type { Lesson } from '../App'
import './LessonNav.css'

const DIFFICULTY: Record<number, 'Beginner' | 'Intermediate' | 'Advanced'> = {
  1: 'Beginner', 2: 'Beginner', 3: 'Beginner',
  4: 'Intermediate', 5: 'Intermediate', 6: 'Intermediate', 7: 'Intermediate',
  8: 'Advanced', 9: 'Advanced', 10: 'Advanced',
}

interface Props {
  lessons: Lesson[]
  activeId: number
  onSelect: (id: number) => void
  visitedIds: Set<number>
}

export default function LessonNav({ lessons, activeId, onSelect, visitedIds }: Props) {
  return (
    <nav className="lesson-nav">
      <div className="nav-section-label">
        <span>Lessons</span>
        <span className="nav-progress">{visitedIds.size}/{lessons.length}</span>
      </div>
      <div className="nav-progress-bar">
        <div
          className="nav-progress-fill"
          style={{ width: lessons.length ? `${(visitedIds.size / lessons.length) * 100}%` : '0%' }}
        />
      </div>
      {lessons.map((lesson) => {
        const difficulty = DIFFICULTY[lesson.id] || 'Beginner'
        const visited = visitedIds.has(lesson.id)
        return (
          <button
            key={lesson.id}
            className={`nav-item ${activeId === lesson.id ? 'active' : ''}`}
            onClick={() => onSelect(lesson.id)}
          >
            <div className="nav-num-wrap">
              <span className="nav-num">{String(lesson.id).padStart(2, '0')}</span>
              {visited && <span className="nav-visited" title="Visited" />}
            </div>
            <span className="nav-text">
              <span className="nav-title-row">
                <span className="nav-title">{lesson.title}</span>
                <span className={`nav-diff nav-diff-${difficulty.toLowerCase()}`}>{difficulty}</span>
              </span>
              <span className="nav-sub">{lesson.subtitle}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
