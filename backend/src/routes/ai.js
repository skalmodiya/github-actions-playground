import { Router } from 'express'
import { readFile } from 'fs/promises'

export const aiRouter = Router()

const SETTINGS_FILE = process.env.SETTINGS_FILE || '/app/data/settings.json'

async function loadSettings() {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { baseUrl: 'http://localhost:6655/anthropic/v1', apiKey: '', provider: 'Anthropic', model: '' }
  }
}

// ── GET /api/ai/models ────────────────────────────────────────────────────────
aiRouter.get('/models', async (req, res) => {
  const provider = req.query.provider || 'Anthropic'
  const baseUrl = req.query.baseUrl || 'http://localhost:6655/anthropic/v1'
  const apiKey = req.query.apiKey || ''

  if (!apiKey) return res.status(400).json({ error: 'apiKey required' })

  try {
    const models = await fetchModels(provider, baseUrl, apiKey)
    res.json({ models })
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch models', detail: err.message })
  }
})

async function fetchModels(provider, baseUrl, apiKey) {
  if (provider === 'Gemini') {
    const url = `${baseUrl}/v1beta/models`
    const r = await fetch(url, { headers: { 'x-goog-api-key': apiKey } })
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
    const data = await r.json()
    return (data.models || [])
      .map(m => m.name?.replace(/^models\//, ''))
      .filter(Boolean)
  } else {
    const url = `${baseUrl}/models`
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
    const data = await r.json()
    return (data.data || []).map(m => m.id).filter(Boolean)
  }
}

// ── POST /api/ai/chat (SSE) ───────────────────────────────────────────────────
aiRouter.post('/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body
  const settings = await loadSettings()
  const { baseUrl, apiKey, provider, model } = settings

  if (!apiKey) {
    return res.status(400).json({ error: 'No API key configured. Go to Settings to configure your LLM provider.' })
  }
  if (!model) {
    return res.status(400).json({ error: 'No model selected. Go to Settings to choose a model.' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (type, data) => res.write(`data: ${JSON.stringify({ type, data })}\n\n`)

  try {
    if (provider === 'Anthropic') {
      await streamAnthropic({ baseUrl, apiKey, model, messages, systemPrompt, send })
    } else if (provider === 'Gemini') {
      await streamGemini({ baseUrl, apiKey, model, messages, systemPrompt, send })
    } else {
      // OpenAI, LiteLLM, Perplexity — all OpenAI-compatible
      await streamOpenAI({ baseUrl, apiKey, model, messages, systemPrompt, send })
    }
    send('done', {})
  } catch (err) {
    send('error', err.message)
  } finally {
    res.end()
  }
})

// ── Provider stream handlers ──────────────────────────────────────────────────

async function streamAnthropic({ baseUrl, apiKey, model, messages, systemPrompt, send }) {
  const body = {
    model,
    max_tokens: 8096,
    stream: true,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  }

  const r = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  })

  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)

  for await (const line of iterLines(r.body)) {
    if (!line.startsWith('data: ')) continue
    const raw = line.slice(6).trim()
    if (!raw || raw === '[DONE]') continue
    try {
      const evt = JSON.parse(raw)
      if (evt.type === 'content_block_delta' && evt.delta?.text) send('token', evt.delta.text)
    } catch {}
  }
}

async function streamOpenAI({ baseUrl, apiKey, model, messages, systemPrompt, send }) {
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ]

  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: true, messages: allMessages }),
  })

  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`)

  for await (const line of iterLines(r.body)) {
    if (!line.startsWith('data: ')) continue
    const raw = line.slice(6).trim()
    if (!raw || raw === '[DONE]') continue
    try {
      const evt = JSON.parse(raw)
      const text = evt.choices?.[0]?.delta?.content
      if (text) send('token', text)
    } catch {}
  }
}

async function streamGemini({ baseUrl, apiKey, model, messages, systemPrompt, send }) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
  }

  const url = `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  })

  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`)

  for await (const line of iterLines(r.body)) {
    if (!line.startsWith('data: ')) continue
    const raw = line.slice(6).trim()
    if (!raw) continue
    try {
      const evt = JSON.parse(raw)
      const text = evt.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) send('token', text)
    } catch {}
  }
}

// ── Async line iterator from a ReadableStream ────────────────────────────────
async function* iterLines(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) yield line
  }
  if (buffer) yield buffer
}
