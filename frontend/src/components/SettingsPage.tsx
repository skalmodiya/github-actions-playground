import { useState, useEffect } from 'react'
import { useSettings, PROVIDER_BASE_URLS } from '../context/SettingsContext'
import type { Provider } from '../context/SettingsContext'
import './SettingsPage.css'

const PROVIDERS: Provider[] = ['Anthropic', 'OpenAI', 'Gemini', 'LiteLLM', 'Perplexity']

const PROVIDER_ICONS: Record<Provider, string> = {
  Anthropic: '🟤',
  OpenAI: '🟢',
  Gemini: '🔵',
  LiteLLM: '🟣',
  Perplexity: '🔍',
}

export default function SettingsPage() {
  const { settings, saveSettings, isSaving } = useSettings()
  const [local, setLocal] = useState(settings)
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setLocal(settings) }, [settings])

  const loadModels = async (provider = local.provider, baseUrl = local.baseUrl, apiKey = local.apiKey) => {
    if (apiKey.length < 8) return
    setLoadingModels(true)
    setModelsError('')
    try {
      const res = await fetch(
        `/api/ai/models?provider=${encodeURIComponent(provider)}&baseUrl=${encodeURIComponent(baseUrl)}&apiKey=${encodeURIComponent(apiKey)}`
      )
      const data = await res.json()
      if (data.models?.length) {
        setModels(data.models)
        if (!data.models.includes(local.model)) setLocal(prev => ({ ...prev, model: data.models[0] }))
      } else {
        setModelsError(data.error || 'No models returned')
        setModels([])
      }
    } catch (err: any) {
      setModelsError(err.message)
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  const onProviderChange = (provider: Provider) => {
    const baseUrl = PROVIDER_BASE_URLS[provider]
    setLocal(prev => ({ ...prev, provider, baseUrl, model: '' }))
    setModels([])
    setModelsError('')
    if (local.apiKey.length >= 8) loadModels(provider, baseUrl, local.apiKey)
  }

  const onApiKeyChange = (apiKey: string) => {
    setLocal(prev => ({ ...prev, apiKey }))
    if (apiKey.length >= 8) loadModels(local.provider, local.baseUrl, apiKey)
  }

  const handleSave = async () => {
    await saveSettings(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙ Settings</h1>
        <p className="settings-desc">Configure your Hyperspace LLM Proxy connection to enable the AI Copilot.</p>
      </div>

      <div className="settings-card">
        <h2 className="settings-section-title">LLM Proxy Configuration</h2>

        <div className="settings-field">
          <label htmlFor="baseUrl">Base URL</label>
          <input
            id="baseUrl"
            type="text"
            value={local.baseUrl}
            onChange={e => setLocal(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="http://localhost:6655/anthropic/v1"
          />
          <span className="field-hint">Hyperspace LLM Proxy endpoint for selected provider</span>
        </div>

        <div className="settings-field">
          <label htmlFor="apiKey">API Key</label>
          <div className="input-row">
            <input
              id="apiKey"
              type="password"
              value={local.apiKey}
              onChange={e => onApiKeyChange(e.target.value)}
              placeholder="Enter your API key..."
              autoComplete="off"
            />
            {local.apiKey.length >= 8 && (
              <span className="key-indicator">✓</span>
            )}
          </div>
          <span className="field-hint">Your Hyperspace API key — stored server-side, never sent to the browser</span>
        </div>

        <div className="settings-field">
          <label htmlFor="provider">Provider</label>
          <div className="provider-grid">
            {PROVIDERS.map(p => (
              <button
                key={p}
                className={`provider-btn ${local.provider === p ? 'active' : ''}`}
                onClick={() => onProviderChange(p)}
              >
                <span className="provider-icon">{PROVIDER_ICONS[p]}</span>
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="model">LLM Model</label>
          <div className="input-row">
            <select
              id="model"
              value={local.model}
              onChange={e => setLocal(prev => ({ ...prev, model: e.target.value }))}
              disabled={models.length === 0}
              className={models.length === 0 ? 'disabled' : ''}
            >
              {models.length === 0 ? (
                <option value="">— load models first —</option>
              ) : (
                models.map(m => <option key={m} value={m}>{m}</option>)
              )}
            </select>
            <button
              className="btn-secondary load-models-btn"
              onClick={() => loadModels()}
              disabled={loadingModels || local.apiKey.length < 8}
            >
              {loadingModels ? '⏳ Loading…' : '↻ Load Models'}
            </button>
          </div>
          {modelsError && <span className="field-error">✗ {modelsError}</span>}
          {models.length > 0 && <span className="field-hint">{models.length} models available</span>}
        </div>

        <div className="settings-actions">
          <button className="btn-primary save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '⏳ Saving…' : saved ? '✓ Saved!' : '💾 Save Settings'}
          </button>
          {saved && <span className="saved-msg">Settings saved successfully</span>}
        </div>
      </div>

      <div className="settings-card settings-info-card">
        <h2 className="settings-section-title">Hyperspace LLM Proxy Endpoints</h2>
        <table className="endpoint-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Base URL</th>
              <th>Chat Endpoint</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Anthropic</td><td>:6655/anthropic/v1</td><td>/messages</td></tr>
            <tr><td>OpenAI</td><td>:6655/openai/v1</td><td>/chat/completions</td></tr>
            <tr><td>Gemini</td><td>:6655/gemini</td><td>/v1beta/models/{`{model}`}:generateContent</td></tr>
            <tr><td>LiteLLM</td><td>:6655/litellm/v1</td><td>/chat/completions</td></tr>
            <tr><td>Perplexity</td><td>:6655/litellm/v1</td><td>/chat/completions</td></tr>
          </tbody>
        </table>
        <p className="settings-note">All providers are accessible at <code>http://localhost:6655</code>. LiteLLM provides a unified OpenAI-compatible interface for all models.</p>
      </div>
    </div>
  )
}
