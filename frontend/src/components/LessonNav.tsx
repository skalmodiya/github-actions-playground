import type { Lesson } from '../App'
import './LessonNav.css'

interface Props {
  lessons: Lesson[]
  activeId: number
  onSelect: (id: number) => void
}

export default function LessonNav({ lessons, activeId, onSelect }: Props) {
  return (
    <nav className="lesson-nav">
      <div className="nav-section-label">Lessons</div>
      {lessons.map((lesson) => (
        <button
          key={lesson.id}
          className={`nav-item ${activeId === lesson.id ? 'active' : ''}`}
          onClick={() => onSelect(lesson.id)}
        >
          <span className="nav-num">{String(lesson.id).padStart(2, '0')}</span>
          <span className="nav-text">
            <span className="nav-title">{lesson.title}</span>
            <span className="nav-sub">{lesson.subtitle}</span>
          </span>
        </button>
      ))}
    </nav>
  )
}
