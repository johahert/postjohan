import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Endpoint, HistoryEntry, ResponseData } from './types'
import { METHODS, defaultAuth } from './constants'
import { useDarkMode } from './hooks/useDarkMode'
import { useRequestForm } from './hooks/useRequestForm'
import { useAuth } from './hooks/useAuth'
import { useApps } from './hooks/useApps'
import { useHistory } from './hooks/useHistory'
import { loadState, saveState } from './services/storageService'
import { fetchConfig, persistConfig } from './services/configService'
import { executeRequest } from './services/requestService'
import { buildFinalUrl, buildPreparedHeaders, composeUrl, derivePath } from './utils/httpUtils'
import { AppHeader } from './components/AppHeader'
import { RequestBuilder } from './components/RequestBuilder'
import { ResponseViewer } from './components/ResponseViewer'
import { HistorySidebar } from './components/HistorySidebar'
import { CollectionSidebar } from './components/CollectionSidebar'

function App() {
  const saved = useMemo(loadState, [])

  const { darkMode, setDarkMode } = useDarkMode(saved.darkMode ?? false)
  const form = useRequestForm(saved)
  const auth = useAuth(
    saved.auth ?? defaultAuth(),
    saved.profiles ?? [],
    saved.activeProfileId ?? null,
  )
  const apps = useApps(saved.apps ?? [], saved.activeAppId ?? null)
  const history = useHistory(saved.history ?? [])

  const [response, setResponse] = useState<ResponseData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showTypesModal, setShowTypesModal] = useState(false)
  const hasLoadedConfig = useRef(false)

  // ── Load auth profiles from config.json on startup ───────────────────

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
        if (cfg.apps && cfg.apps.length > 0) {
          apps.setApps(cfg.apps)
          if (cfg.activeAppId !== undefined) apps.setActiveAppId(cfg.activeAppId)
        }
      })
      .catch(() => { /* config file may not exist yet */ })
  }, [auth.setProfiles, auth.setActiveProfileId, auth.setAuth, apps.setApps, apps.setActiveAppId])

  // ── Persist profiles + apps to config.json on changes (debounced) ────

  useEffect(() => {
    const timer = setTimeout(() => {
      persistConfig({
        profiles: auth.profiles,
        activeProfileId: auth.activeProfileId,
        apps: apps.apps,
        activeAppId: apps.activeAppId,
      }).catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [auth.profiles, auth.activeProfileId, apps.apps, apps.activeAppId])

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
      apps: apps.apps,
      activeAppId: apps.activeAppId,
      darkMode,
    })
  }, [form.method, form.url, form.headers, form.params, form.body, auth.auth, history.history, auth.profiles, auth.activeProfileId, apps.apps, apps.activeAppId, darkMode])

  useEffect(() => {
    persist()
  }, [darkMode, persist])

  // ── Derived values ───────────────────────────────────────────────────

  const finalUrl = useMemo(() => buildFinalUrl(form.url, form.params), [form.url, form.params])
  const preparedHeaders = useMemo(
    () => buildPreparedHeaders(form.headers, auth.auth),
    [form.headers, auth.auth],
  )

  const activeContextLabel = useMemo(() => {
    if (!apps.activeApp) return null
    const env = apps.activeEnvironment
    return `${apps.activeApp.name} · ${env ? env.name : 'no environment'}`
  }, [apps.activeApp, apps.activeEnvironment])

  // ── Collection: load / save / update endpoints ───────────────────────

  const loadEndpoint = (ep: Endpoint) => {
    const base = apps.activeEnvironment?.baseUrl ?? ''
    form.setMethod(ep.method as (typeof METHODS)[number])
    form.setUrl(composeUrl(base, ep.path))
    form.setHeaders(ep.headers)
    form.setParams(ep.params)
    form.setBody(ep.body)
    form.setLoadedEndpointId(ep.id)
    setTimeout(persist, 0)
  }

  const saveAsEndpoint = () => {
    if (!apps.activeApp) return
    const name = window.prompt('Endpoint name?')
    if (!name?.trim()) return
    const base = apps.activeEnvironment?.baseUrl ?? ''
    const ep = apps.addEndpoint({
      name: name.trim(),
      method: form.method,
      path: derivePath(form.url, base),
      headers: form.headers,
      params: form.params,
      body: form.body,
    })
    form.setLoadedEndpointId(ep.id)
  }

  const updateEndpoint = () => {
    if (!form.loadedEndpointId) return
    const base = apps.activeEnvironment?.baseUrl ?? ''
    apps.updateEndpoint(form.loadedEndpointId, {
      method: form.method,
      path: derivePath(form.url, base),
      headers: form.headers,
      params: form.params,
      body: form.body,
    })
  }

  // Recompose the URL when the active environment changes while an endpoint is loaded.
  const prevEnvId = useRef<string | null>(apps.activeEnvironment?.id ?? null)
  useEffect(() => {
    const envId = apps.activeEnvironment?.id ?? null
    if (prevEnvId.current === envId) return
    prevEnvId.current = envId
    if (!form.loadedEndpointId) return
    const ep = apps.activeApp?.endpoints.find((e) => e.id === form.loadedEndpointId)
    if (ep) form.setUrl(composeUrl(apps.activeEnvironment?.baseUrl ?? '', ep.path))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps.activeEnvironment?.id])

  // Clear the loaded-endpoint marker when switching apps (the endpoint belongs to the old app).
  const prevAppId = useRef<string | null>(apps.activeAppId)
  useEffect(() => {
    if (prevAppId.current === apps.activeAppId) return
    prevAppId.current = apps.activeAppId
    form.setLoadedEndpointId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps.activeAppId])

  // ── Send request ─────────────────────────────────────────────────────

  const sendRequest = async () => {
    setIsSending(true)
    setError(null)

    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      method: form.method,
      url: finalUrl,
      createdAt: new Date().toLocaleString(),
    }

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
      setIsSending(false)
      setTimeout(persist, 0)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen px-4 py-6 text-slate-900 transition-colors dark:text-slate-100 sm:px-6 sm:py-8">
      <AppHeader darkMode={darkMode} onToggleDarkMode={() => setDarkMode((v) => !v)} />

      <main className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_1fr_320px]">
        <CollectionSidebar
          apps={apps}
          loadedEndpointId={form.loadedEndpointId}
          onLoadEndpoint={loadEndpoint}
        />

        <section className="space-y-6">
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
            canSaveEndpoint={!!apps.activeApp}
            loadedEndpointId={form.loadedEndpointId}
            activeContextLabel={activeContextLabel}
            onSaveAsEndpoint={saveAsEndpoint}
            onUpdateEndpoint={updateEndpoint}
            auth={auth.auth}
            onAuthChange={auth.setAuth}
            profiles={auth.profiles}
            activeProfileId={auth.activeProfileId}
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
          />
        </section>

        <HistorySidebar
          history={history.history}
          onSelectEntry={(entry) => {
            form.setMethod(entry.method as (typeof METHODS)[number])
            form.setUrl(entry.url)
          }}
          onClear={() => {
            history.clearHistory()
            persist()
          }}
        />
      </main>
    </div>
  )
}

export default App
