import { useState, useEffect, useRef, useCallback } from 'react'
import type { Lesson } from '../App'
import { useSettings } from '../context/SettingsContext'
import './AICopilot.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | undefined
}

const PROMPT_CHIPS = [
  'Explain this lesson step by step',
  'What are common mistakes here?',
  'Show a real-world example',
  'Quiz me on this topic',
  'How would I debug this workflow?',
  'What comes after this lesson?',
]

function buildSystemPrompt(lesson: Lesson, yamlContent: string): string {
  return `You are a GitHub Actions tutor embedded in the GitHub Actions Playground app.

SCOPE: You ONLY answer questions about:
- GitHub Actions (workflows, triggers, jobs, steps, contexts, secrets, actions, runners, matrix, caching, reusable workflows)
- The current lesson and its workflow YAML
- General CI/CD concepts as they relate to GitHub Actions
- How to use this playground app (its features, tabs, buttons)

If asked anything outside this scope, politely redirect: "I'm here specifically to help you learn GitHub Actions. Try asking me about workflows, triggers, jobs, or the current lesson!"

CURRENT LESSON CONTEXT:
- Lesson ${lesson.id}: ${lesson.title}
- Subtitle: ${lesson.subtitle}
- Concepts: ${lesson.concepts.join(', ')}
- Description: ${lesson.description}
- Key points:
${lesson.keyPoints.map(p => `  • ${p}`).join('\n')}
- Workflow file: ${lesson.workflowFile}
${yamlContent ? `- Workflow YAML:\n\`\`\`yaml\n${yamlContent}\n\`\`\`` : ''}

TEACHING STYLE:
- Be concise and practical. Prefer short answers with code examples.
- Use GitHub Actions YAML snippets in fenced code blocks.
- Encourage hands-on learning: suggest the user try something in the YAML editor tab or trigger a run.
- Don't just repeat the lesson — add value with the "why", edge cases, and real-world usage.
- End responses with a follow-up suggestion or question when appropriate.

RESPONSE FORMAT:
- Use markdown. The chat panel renders bold, code, and lists.
- Keep initial answers to 3-5 sentences unless more is asked.`
}

function renderMarkdown(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huplo])(.+)$/gm, '$1')
}

export default function AICopilot({ isOpen, onClose, lesson }: Props) {
  const { settings } = useSettings()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [yamlContent, setYamlContent] = useState('')
  const [configError, setConfigError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Clear messages and reload YAML when lesson changes
  useEffect(() => {
    setMessages([])
    setConfigError('')
    if (!lesson) return
    fetch(`/api/workflows/${lesson.workflowFile}/yaml`)
      .then(r => r.json())
      .then(d => setYamlContent(d.content || ''))
      .catch(() => setYamlContent(''))
  }, [lesson?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return
    if (!settings.model) {
      setConfigError('No model configured. Go to ⚙ Settings to choose a model.')
      return
    }
    if (!settings.apiKey) {
      setConfigError('No API key configured. Go to ⚙ Settings to add your API key.')
      return
    }
    setConfigError('')
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setStreaming(true)

    try {
      const payload = {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        systemPrompt: lesson ? buildSystemPrompt(lesson, yamlContent) : 'You are a GitHub Actions tutor.',
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: `⚠ ${err.error}` }
          return updated
        })
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const msg = JSON.parse(part.slice(6))
            if (msg.type === 'token') {
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                updated[updated.length - 1] = { ...last, content: last.content + msg.data }
                return updated
              })
            } else if (msg.type === 'error') {
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                updated[updated.length - 1] = { ...last, content: `⚠ ${msg.data}` }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: `⚠ ${err.message}` }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }, [messages, streaming, settings, lesson, yamlContent])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => setMessages([])

  return (
    <div className={`copilot-drawer ${isOpen ? 'open' : ''}`}>
      <div className="copilot-header">
        <div className="copilot-title">
          <span className="copilot-icon">🤖</span>
          <span>AI Copilot</span>
          {settings.model && (
            <span className="copilot-model-badge">{settings.model.split('/').pop()?.split('--').pop()}</span>
          )}
        </div>
        <div className="copilot-header-actions">
          {messages.length > 0 && (
            <button className="btn-secondary copilot-clear" onClick={clearChat} title="Clear chat">✕ Clear</button>
          )}
          <button className="btn-secondary copilot-close" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      {lesson && (
        <div className="copilot-context-bar">
          <span className="ctx-icon">📖</span>
          <span className="ctx-lesson">Lesson {lesson.id}: {lesson.title}</span>
        </div>
      )}

      <div className="copilot-messages">
        {messages.length === 0 && (
          <div className="copilot-welcome">
            <div className="welcome-icon">⚡</div>
            <h3>GitHub Actions Copilot</h3>
            <p>Ask me anything about this lesson, GitHub Actions concepts, or how to use the playground.</p>
            {!settings.model && (
              <div className="copilot-config-warn">
                ⚙ Configure your LLM provider in Settings first.
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-bubble">
              {msg.role === 'assistant' ? (
                <div
                  className="message-content markdown"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) || (streaming && i === messages.length - 1 ? '<span class="cursor">▋</span>' : '') }}
                />
              ) : (
                <div className="message-content">{msg.content}</div>
              )}
              {streaming && i === messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                <div className="message-content"><span className="cursor">▋</span></div>
              )}
            </div>
          </div>
        ))}

        {configError && (
          <div className="copilot-error">{configError}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="copilot-prompts">
        {PROMPT_CHIPS.map(chip => (
          <button key={chip} className="prompt-chip" onClick={() => sendMessage(chip)} disabled={streaming}>
            {chip}
          </button>
        ))}
      </div>

      <div className="copilot-input-area">
        <textarea
          ref={inputRef}
          className="copilot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about GitHub Actions… (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={streaming}
        />
        <button
          className="btn-primary send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
        >
          {streaming ? '⏳' : '↑ Send'}
        </button>
      </div>
    </div>
  )
}
