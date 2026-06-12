import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type Provider = 'Anthropic' | 'OpenAI' | 'Gemini' | 'LiteLLM' | 'Perplexity'

export interface AppSettings {
  baseUrl: string
  apiKey: string
  provider: Provider
  model: string
}

export const PROVIDER_BASE_URLS: Record<Provider, string> = {
  Anthropic: 'http://localhost:6655/anthropic/v1',
  OpenAI: 'http://localhost:6655/openai/v1',
  Gemini: 'http://localhost:6655/gemini',
  LiteLLM: 'http://localhost:6655/litellm/v1',
  Perplexity: 'http://localhost:6655/litellm/v1',
}

const DEFAULTS: AppSettings = {
  baseUrl: 'http://localhost:6655/anthropic/v1',
  apiKey: '',
  provider: 'Anthropic',
  model: '',
}

interface SettingsContextValue {
  settings: AppSettings
  setSettings: (s: AppSettings) => void
  saveSettings: (s: AppSettings) => Promise<void>
  isLoaded: boolean
  isSaving: boolean
}

const SettingsContext = createContext<SettingsContextValue>(null!)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { setSettings({ ...DEFAULTS, ...d }); setIsLoaded(true) })
      .catch(() => setIsLoaded(true))
  }, [])

  const saveSettings = async (s: AppSettings) => {
    setIsSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      setSettings(s)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings, saveSettings, isLoaded, isSaving }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
