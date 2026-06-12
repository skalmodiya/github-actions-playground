import { useState, useEffect, useRef } from 'react'
import './YamlEditor.css'

interface Props {
  workflowFile: string
}

export default function YamlEditor({ workflowFile }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/workflows/${workflowFile}/yaml`)
      .then((r) => r.json())
      .then((d) => setContent(d.content || ''))
      .catch(() => setContent('# Could not load workflow file'))
      .finally(() => setLoading(false))
  }, [workflowFile])

  const lineCount = content.split('\n').length

  return (
    <div className="yaml-editor">
      <div className="yaml-header">
        <span className="yaml-filename">.github/workflows/{workflowFile}</span>
        <button
          className="btn-secondary copy-btn"
          onClick={() => navigator.clipboard.writeText(content)}
        >
          Copy
        </button>
      </div>
      <div className="yaml-body">
        <div className="line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="line-num">{i + 1}</div>
          ))}
        </div>
        {loading ? (
          <div className="yaml-loading">Loading…</div>
        ) : (
          <textarea
            ref={textareaRef}
            className="yaml-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}
