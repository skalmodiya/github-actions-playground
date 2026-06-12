import './WelcomeScreen.css'

interface Props { onDismiss: () => void }

export default function WelcomeScreen({ onDismiss }: Props) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <div className="welcome-logo">⚡</div>
        <h1>GitHub Actions Playground</h1>
        <p className="welcome-tagline">Learn GitHub Actions hands-on — from Hello World to Reusable Workflows</p>

        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>10 Progressive Lessons</h3>
            <p>Guided from beginner to advanced with animated workflow diagrams and editable YAML</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Run on GitHub & Locally</h3>
            <p>Trigger real workflows on GitHub.com or run locally with Docker using <code>act</code></p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Copilot</h3>
            <p>Context-aware GitHub Actions tutor powered by your Hyperspace LLM Proxy</p>
          </div>
        </div>

        <div className="welcome-shortcuts">
          <span>⌨ Keyboard shortcuts:</span>
          <kbd>←</kbd><span>/ </span><kbd>→</kbd><span> Navigate lessons</span>
          <kbd>?</kbd><span> Toggle AI Copilot</span>
        </div>

        <button className="btn-primary welcome-btn" onClick={onDismiss}>
          Get Started →
        </button>
      </div>
    </div>
  )
}
