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

// ── Accent palette — only these vars need to be injected dynamically ───────
// Theme vars (--bg*, --text*, --border*) come from [data-theme] CSS selectors.

const ACCENTS: Record<string, { a: string; dim: string; glow: string; ink: string }> = {
  gold:  { a: '#e8b840', dim: 'rgba(232,184,64,0.15)',  glow: 'rgba(232,184,64,0.28)',  ink: '#1a0e00' },
  sky:   { a: '#5ab4d8', dim: 'rgba(90,180,216,0.15)',  glow: 'rgba(90,180,216,0.28)',  ink: '#061828' },
  cream: { a: '#d4c8a0', dim: 'rgba(212,200,160,0.15)', glow: 'rgba(212,200,160,0.28)', ink: '#14100a' },
  rust:  { a: '#c86428', dim: 'rgba(200,100,40,0.15)',  glow: 'rgba(200,100,40,0.28)',  ink: '#1a0800' },
}

const THEMES = ['falcon-dark', 'falcon-sky', 'dark-forest', 'dark-ocean'] as const
type Theme = (typeof THEMES)[number]

function App() {
  const saved = useMemo(loadState, [])

  const [theme, setTheme] = useState<Theme>((saved.theme as Theme) ?? 'falcon-dark')
  const [accentColor, setAccentColor] = useState<string>(saved.accentColor ?? 'gold')
  const [showSplash, setShowSplash] = useState(true)
  const [isSendingStage, setIsSendingStage] = useState<'connecting' | 'sending' | 'receiving' | ''>('')

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

  const ac = ACCENTS[accentColor] ?? ACCENTS.gold

  // Only accent vars are injected inline — theme vars come from [data-theme] in CSS
  const accentVars = {
    '--accent': ac.a,
    '--accent-dim': ac.dim,
    '--accent-glow': ac.glow,
  } as React.CSSProperties

  // ── Load auth profiles ────────────────────────────────────────────────────

  useEffect(() => {
    if (hasLoadedConfig.current) return
    hasLoadedConfig.current = true
    fetchConfig()
      .then((cfg) => {
        if (cfg.profiles?.length) {
          auth.setProfiles(cfg.profiles)
          if (cfg.activeProfileId != null) {
            auth.setActiveProfileId(cfg.activeProfileId)
            const active = cfg.profiles.find((p) => p.id === cfg.activeProfileId)
            if (active) auth.setAuth({ ...active.auth })
          }
        }
      })
      .catch(() => {})
  }, [auth.setProfiles, auth.setActiveProfileId, auth.setAuth])

  useEffect(() => {
    const t = setTimeout(() => persistConfig(auth.profiles, auth.activeProfileId).catch(() => {}), 300)
    return () => clearTimeout(t)
  }, [auth.profiles, auth.activeProfileId])

  // ── Persist state ─────────────────────────────────────────────────────────

  const persist = useCallback(() => {
    saveState({
      method: form.method, url: form.url, headers: form.headers,
      params: form.params, body: form.body, auth: auth.auth,
      history: history.history, profiles: auth.profiles,
      activeProfileId: auth.activeProfileId,
      darkMode: theme === 'falcon-sky',
      theme, accentColor,
    })
  }, [form.method, form.url, form.headers, form.params, form.body,
      auth.auth, history.history, auth.profiles, auth.activeProfileId,
      theme, accentColor])

  useEffect(() => { persist() }, [theme, accentColor, persist])

  // ── Derived values ────────────────────────────────────────────────────────

  const finalUrl = useMemo(() => buildFinalUrl(form.url, form.params), [form.url, form.params])
  const preparedHeaders = useMemo(
    () => buildPreparedHeaders(form.headers, auth.auth),
    [form.headers, auth.auth],
  )

  // ── Send request ──────────────────────────────────────────────────────────

  const sendRequest = async () => {
    if (isSending) return
    setIsSending(true)
    setError(null)
    setIsSendingStage('connecting')

    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      method: form.method,
      url: finalUrl,
      createdAt: new Date().toLocaleString(),
    }
    const t1 = setTimeout(() => setIsSendingStage('sending'),   600)
    const t2 = setTimeout(() => setIsSendingStage('receiving'), 1400)

    try {
      const payload = await executeRequest({
        method: form.method, url: finalUrl,
        headers: preparedHeaders,
        body: form.body.trim() ? form.body : undefined,
      })
      setResponse(payload)
      history.addEntry({ ...entry, statusCode: payload.statusCode, timeTotal: payload.timeTotal })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setResponse(null)
      history.addEntry(entry)
    } finally {
      clearTimeout(t1); clearTimeout(t2)
      setIsSending(false); setIsSendingStage('')
      setTimeout(persist, 0)
    }
  }

  const resetForm = () => {
    form.setMethod('GET'); form.setUrl(''); form.setHeaders([])
    form.setParams([]); form.setBody('')
    setResponse(null); setError(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div data-theme={theme} style={accentVars} className="flex flex-col h-screen bg-layer-0 text-ink font-sans">
      {showSplash && (
        <SplashScreen accent={ac.a} theme={theme} onDone={() => setShowSplash(false)} />
      )}

      <AppHeader
        theme={theme}
        accentColor={accentColor}
        accent={ac.a}
        accentInk={ac.ink}
        accents={Object.fromEntries(Object.entries(ACCENTS).map(([k, v]) => [k, v.a]))}
        onToggleTheme={() => setTheme((t) => (t === 'falcon-sky' ? 'falcon-dark' : 'falcon-sky'))}
        onThemeChange={(t) => setTheme(t as Theme)}
        onAccentChange={setAccentColor}
      />

      <div className="flex flex-1 overflow-hidden">
        <CollectionsSidebar
          history={history.history}
          onSelectEntry={(e) => {
            form.setMethod(e.method as (typeof METHODS)[number])
            form.setUrl(e.url)
            setResponse(null); setError(null)
          }}
          onClear={() => { history.clearHistory(); persist() }}
          onNewRequest={resetForm}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <RequestBuilder
            method={form.method}       onMethodChange={form.setMethod}
            url={form.url}             onUrlChange={form.setUrl}
            isSending={isSending}      onSend={sendRequest}
            activeTab={form.activeTab} onTabChange={form.setActiveTab}
            headers={form.headers}     onHeadersChange={form.setHeaders}
            params={form.params}       onParamsChange={form.setParams}
            body={form.body}           onBodyChange={form.setBody}
            auth={auth.auth}           onAuthChange={auth.setAuth}
            profiles={auth.profiles}   activeProfileId={auth.activeProfileId}
            profileName={auth.profileName}
            onProfileNameChange={auth.setProfileName}
            onSaveProfile={auth.saveProfile}
            onLoadProfile={auth.loadProfile}
            onDeleteProfile={auth.deleteProfile}
          />

          <ResponseViewer
            response={response}
            error={error}
            finalUrl={finalUrl}
            showTypesModal={showTypesModal}
            onShowTypesModal={setShowTypesModal}
            isSending={isSending}
            isSendingStage={isSendingStage}
          />
        </div>
      </div>

      {/* Status bar */}
      <footer className="h-statusbar border-t border-edge bg-layer-1 flex items-center px-4 gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-accent inline-block" />
          <span className="text-[10px] font-mono text-ink-3">
            {isSending ? `${isSendingStage}…` : 'Ready'}
          </span>
        </div>
        <span className="text-[10px] text-edge-strong">|</span>
        <span className="text-[10px] font-mono text-ink-3">
          {history.history.length > 0 ? `${history.history.length} requests` : 'No history'}
        </span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-ink-3">v0.1.0</span>
      </footer>
    </div>
  )
}

export default App
