import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { HistoryEntry, ResponseData } from './types'
import { METHODS, defaultAuth } from './constants'
import { useRequestForm } from './hooks/useRequestForm'
import { useAuth } from './hooks/useAuth'
import { useHistory } from './hooks/useHistory'
import { loadState, saveState } from './services/storageService'
import { fetchConfig, persistConfig } from './services/configService'
import { executeRequest } from './services/requestService'
import { buildFinalUrl, buildPreparedHeaders } from './utils/httpUtils'
import { AppHeader } from './components/AppHeader'
import { RequestBuilder } from './components/RequestBuilder'
import { ResponseViewer } from './components/ResponseViewer'
import { CollectionsSidebar } from './components/CollectionsSidebar'
import { SplashScreen } from './components/SplashScreen'

// ── Falcon brand palette ────────────────────────────────────────────────────

const THEMES: Record<string, Record<string, string>> = {
  'falcon-dark': {
    '--bg0': '#0d0b08', '--bg1': '#141210', '--bg2': '#1c1916', '--bg3': '#26221c', '--bg4': '#322d26',
    '--border': 'rgba(240,210,130,0.08)', '--border2': 'rgba(240,210,130,0.15)',
    '--text0': '#f0e8d0', '--text1': '#a09272', '--text2': '#665840',
    '--shadow': 'rgba(0,0,0,0.6)',
  },
  'falcon-sky': {
    '--bg0': '#e4eff8', '--bg1': '#f4f9fd', '--bg2': '#daeaf5', '--bg3': '#ccdeed', '--bg4': '#b8d0e4',
    '--border': 'rgba(10,30,60,0.09)', '--border2': 'rgba(10,30,60,0.16)',
    '--text0': '#0c1c2e', '--text1': '#3a5878', '--text2': '#7a98b8',
    '--shadow': 'rgba(10,30,60,0.14)',
  },
  'dark-forest': {
    '--bg0': '#0f1210', '--bg1': '#161a18', '--bg2': '#1e2421', '--bg3': '#252e29', '--bg4': '#2d3830',
    '--border': 'rgba(255,255,255,0.07)', '--border2': 'rgba(255,255,255,0.13)',
    '--text0': '#e8ede9', '--text1': '#9dada2', '--text2': '#5e706a',
    '--shadow': 'rgba(0,0,0,0.5)',
  },
  'dark-ocean': {
    '--bg0': '#0b0f1a', '--bg1': '#111827', '--bg2': '#16213a', '--bg3': '#1c2a4a', '--bg4': '#243354',
    '--border': 'rgba(255,255,255,0.07)', '--border2': 'rgba(255,255,255,0.13)',
    '--text0': '#dce8f5', '--text1': '#7a98b8', '--text2': '#3d5a7a',
    '--shadow': 'rgba(0,0,0,0.6)',
  },
}

const ACCENTS: Record<string, { a: string; dim: string; glow: string; ink: string }> = {
  gold:  { a: '#e8b840', dim: 'rgba(232,184,64,0.15)',  glow: 'rgba(232,184,64,0.28)',  ink: '#1a0e00' },
  sky:   { a: '#5ab4d8', dim: 'rgba(90,180,216,0.15)',  glow: 'rgba(90,180,216,0.28)',  ink: '#061828' },
  cream: { a: '#d4c8a0', dim: 'rgba(212,200,160,0.15)', glow: 'rgba(212,200,160,0.28)', ink: '#14100a' },
  rust:  { a: '#c86428', dim: 'rgba(200,100,40,0.15)',  glow: 'rgba(200,100,40,0.28)',  ink: '#1a0800' },
}

function App() {
  const saved = useMemo(loadState, [])

  const [theme, setTheme] = useState<string>(saved.theme ?? 'falcon-dark')
  const [accentColor, setAccentColor] = useState<string>(saved.accentColor ?? 'gold')
  const [showSplash, setShowSplash] = useState(true)
  const [isSendingStage, setIsSendingStage] = useState('')

  const form = useRequestForm(saved)
  const auth = useAuth(
    saved.auth ?? defaultAuth(),
    saved.profiles ?? [],
    saved.activeProfileId ?? null,
  )
  const history = useHistory(saved.history ?? [])

  const [response, setResponse] = useState<ResponseData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showTypesModal, setShowTypesModal] = useState(false)
  const hasLoadedConfig = useRef(false)

  const th = THEMES[theme] ?? THEMES['falcon-dark']
  const ac = ACCENTS[accentColor] ?? ACCENTS.gold
  const cssVars = { ...th, '--accent': ac.a, '--accent-dim': ac.dim, '--accent-glow': ac.glow }

  // ── Load auth profiles from config.json on startup ────────────────────

  useEffect(() => {
    if (hasLoadedConfig.current) return
    hasLoadedConfig.current = true

    fetchConfig()
      .then((cfg) => {
        if (cfg.profiles && cfg.profiles.length > 0) {
          auth.setProfiles(cfg.profiles)
          if (cfg.activeProfileId !== undefined) {
            auth.setActiveProfileId(cfg.activeProfileId)
            const active = cfg.profiles.find((p) => p.id === cfg.activeProfileId)
            if (active) auth.setAuth({ ...active.auth })
          }
        }
      })
      .catch(() => {})
  }, [auth.setProfiles, auth.setActiveProfileId, auth.setAuth])

  // ── Persist auth profiles to config.json ─────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      persistConfig(auth.profiles, auth.activeProfileId).catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [auth.profiles, auth.activeProfileId])

  // ── Persist full state to localStorage ───────────────────────────────

  const persist = useCallback(() => {
    saveState({
      method: form.method,
      url: form.url,
      headers: form.headers,
      params: form.params,
      body: form.body,
      auth: auth.auth,
      history: history.history,
      profiles: auth.profiles,
      activeProfileId: auth.activeProfileId,
      darkMode: theme === 'falcon-sky',
      theme,
      accentColor,
    })
  }, [form.method, form.url, form.headers, form.params, form.body, auth.auth, history.history, auth.profiles, auth.activeProfileId, theme, accentColor])

  useEffect(() => { persist() }, [theme, accentColor, persist])

  // ── Derived values ────────────────────────────────────────────────────

  const finalUrl = useMemo(() => buildFinalUrl(form.url, form.params), [form.url, form.params])
  const preparedHeaders = useMemo(
    () => buildPreparedHeaders(form.headers, auth.auth),
    [form.headers, auth.auth],
  )

  // ── Send request ──────────────────────────────────────────────────────

  const sendRequest = async () => {
    if (isSending) return
    setIsSending(true)
    setError(null)
    setIsSendingStage('connecting')

    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      method: form.method,
      url: finalUrl,
      createdAt: new Date().toLocaleString(),
    }

    const stageTimer1 = setTimeout(() => setIsSendingStage('sending'), 600)
    const stageTimer2 = setTimeout(() => setIsSendingStage('receiving'), 1400)

    try {
      const payload = await executeRequest({
        method: form.method,
        url: finalUrl,
        headers: preparedHeaders,
        body: form.body.trim() ? form.body : undefined,
      })
      setResponse(payload)
      history.addEntry({ ...historyEntry, statusCode: payload.statusCode, timeTotal: payload.timeTotal })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setResponse(null)
      history.addEntry(historyEntry)
    } finally {
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      setIsSending(false)
      setIsSendingStage('')
      setTimeout(persist, 0)
    }
  }

  const toggleTheme = () => {
    setTheme((t) => t === 'falcon-sky' ? 'falcon-dark' : 'falcon-sky')
  }

  const resetForm = () => {
    form.setMethod('GET')
    form.setUrl('')
    form.setHeaders([])
    form.setParams([])
    form.setBody('')
    setResponse(null)
    setError(null)
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', height: '100vh',
        background: 'var(--bg0)', color: 'var(--text0)',
        ...(cssVars as Record<string, string>),
      }}
    >
      {showSplash && (
        <SplashScreen accent={ac.a} theme={theme} onDone={() => setShowSplash(false)} />
      )}

      {/* Top bar */}
      <AppHeader
        theme={theme}
        accentColor={accentColor}
        accent={ac.a}
        accentDim={ac.dim}
        onToggleTheme={toggleTheme}
        onThemeChange={setTheme}
        onAccentChange={setAccentColor}
        accentOptions={Object.fromEntries(Object.entries(ACCENTS).map(([k, v]) => [k, { a: v.a }]))}
      />

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Collections sidebar */}
        <CollectionsSidebar
          history={history.history}
          onSelectEntry={(entry) => {
            form.setMethod(entry.method as (typeof METHODS)[number])
            form.setUrl(entry.url)
            setResponse(null)
            setError(null)
          }}
          onClear={() => { history.clearHistory(); persist() }}
          onNewRequest={resetForm}
          accent={ac.a}
          accentDim={ac.dim}
          accentGlow={ac.glow}
        />

        {/* Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <RequestBuilder
            method={form.method}
            onMethodChange={form.setMethod}
            url={form.url}
            onUrlChange={form.setUrl}
            isSending={isSending}
            onSend={sendRequest}
            activeTab={form.activeTab}
            onTabChange={form.setActiveTab}
            headers={form.headers}
            onHeadersChange={form.setHeaders}
            params={form.params}
            onParamsChange={form.setParams}
            body={form.body}
            onBodyChange={form.setBody}
            auth={auth.auth}
            onAuthChange={auth.setAuth}
            profiles={auth.profiles}
            activeProfileId={auth.activeProfileId}
            profileName={auth.profileName}
            onProfileNameChange={auth.setProfileName}
            onSaveProfile={auth.saveProfile}
            onLoadProfile={auth.loadProfile}
            onDeleteProfile={auth.deleteProfile}
            accent={ac.a}
            accentInk={ac.ink}
            isSendingStage={isSendingStage}
          />

          <ResponseViewer
            response={response}
            error={error}
            finalUrl={finalUrl}
            showTypesModal={showTypesModal}
            onShowTypesModal={setShowTypesModal}
            isSending={isSending}
            isSendingStage={isSendingStage}
            accent={ac.a}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        height: 22, borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14,
        flexShrink: 0, background: 'var(--bg1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: ac.a }} />
          <span style={{ fontSize: 10, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace" }}>
            {isSending ? `${isSendingStage}…` : 'Ready'}
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--border2)' }}>|</span>
        <span style={{ fontSize: 10, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace" }}>
          {history.history.length > 0 ? `${history.history.length} requests` : 'No history'}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace" }}>
          v0.1.0
        </span>
      </div>
    </div>
  )
}

export default App
