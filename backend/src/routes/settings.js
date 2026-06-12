import { Router } from 'express'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

export const settingsRouter = Router()

const SETTINGS_FILE = process.env.SETTINGS_FILE || '/app/data/settings.json'

const VALID_PROVIDERS = ['Anthropic', 'OpenAI', 'Gemini', 'LiteLLM', 'Perplexity']

const DEFAULTS = {
  baseUrl: 'http://localhost:6655/anthropic/v1',
  apiKey: '',
  provider: 'Anthropic',
  model: '',
}

async function readSettings() {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

settingsRouter.get('/', async (_req, res) => {
  res.json(await readSettings())
})

settingsRouter.post('/', async (req, res) => {
  const { baseUrl, apiKey, provider, model } = req.body
  if (!VALID_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: `Invalid provider: ${provider}` })
  }
  const settings = { baseUrl: baseUrl || DEFAULTS.baseUrl, apiKey: apiKey || '', provider, model: model || '' }
  try {
    await mkdir(dirname(SETTINGS_FILE), { recursive: true })
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
