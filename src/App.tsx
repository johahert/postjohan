import { useCallback, useEffect, useMemo, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────

type KVEntry = { key: string; value: string; enabled: boolean }

type AuthType = 'none' | 'bearer' | 'basic' | 'api-key'

type AuthConfig = {
  type: AuthType
  bearer: string
  basicUser: string
  basicPass: string
  apiKeyHeader: string
  apiKeyValue: string
}

type AuthProfile = {
  id: string
  name: string
  auth: AuthConfig
}

type ResponseData = {
  statusCode: number
  statusText: string
  headers: Record<string, string>
  body: string
  timeTotal: number
  sizeDownload: number
}

type HistoryEntry = {
  id: string
  method: string
  url: string
  statusCode?: number
  timeTotal?: number
  createdAt: string
}

type SavedState = {
  method: string
  url: string
  headers: KVEntry[]
  params: KVEntry[]
  body: string
  auth: AuthConfig
  history: HistoryEntry[]
  profiles: AuthProfile[]
  activeProfileId: string | null
  darkMode: boolean
}

// ── Constants ──────────────────────────────────────────────────────────

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const
const TABS = ['Headers', 'Params', 'Body', 'Auth'] as const
type Tab = (typeof TABS)[number]

const STORAGE_KEY = 'postjohan-state'

const defaultAuth = (): AuthConfig => ({
  type: 'none',
  bearer: '',
  basicUser: '',
  basicPass: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyValue: '',
})

// ── Helpers ────────────────────────────────────────────────────────────

function loadState(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SavedState>) : {}
  } catch {
    return {}
  }
}

function saveState(state: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ── Component ──────────────────────────────────────────────────────────

function App() {
  const saved = useMemo(loadState, [])

  const [darkMode, setDarkMode] = useState(saved.darkMode ?? false)
  const [method, setMethod] = useState<(typeof METHODS)[number]>(
    (saved.method as (typeof METHODS)[number]) ?? 'GET',
  )
  const [url, setUrl] = useState(saved.url ?? 'https://jsonplaceholder.typicode.com/todos/1')
  const [headers, setHeaders] = useState<KVEntry[]>(
    saved.headers ?? [{ key: 'Accept', value: 'application/json', enabled: true }],
  )
  const [params, setParams] = useState<KVEntry[]>(saved.params ?? [])
  const [body, setBody] = useState(saved.body ?? '')
  const [auth, setAuth] = useState<AuthConfig>(saved.auth ?? defaultAuth())
  const [profiles, setProfiles] = useState<AuthProfile[]>(saved.profiles ?? [])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    saved.activeProfileId ?? null,
  )
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(saved.history ?? [])
  const [activeTab, setActiveTab] = useState<Tab>('Headers')
  const [profileName, setProfileName] = useState('')

  // ── Dark mode ────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // ── Persistence helper ───────────────────────────────────────────────

  const persist = useCallback(() => {
    saveState({
      method,
      url,
      headers,
      params,
      body,
      auth,
      history,
      profiles,
      activeProfileId,
      darkMode,
    })
  }, [method, url, headers, params, body, auth, history, profiles, activeProfileId, darkMode])

  // Auto-persist when dark mode changes
  useEffect(() => {
    persist()
  }, [darkMode, persist])

  // ── Build final URL with query params ────────────────────────────────

  const finalUrl = useMemo(() => {
    const enabledParams = params.filter((p) => p.enabled && p.key.trim())
    if (enabledParams.length === 0) return url
    try {
      const u = new URL(url)
      enabledParams.forEach((p) => u.searchParams.set(p.key.trim(), p.value))
      return u.toString()
    } catch {
      const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
      return url + (url.includes('?') ? '&' : '?') + qs
    }
  }, [url, params])

  // ── Build headers including auth ─────────────────────────────────────

  const preparedHeaders = useMemo(() => {
    const map: Record<string, string> = {}
    headers
      .filter((e) => e.enabled && e.key.trim())
      .forEach((e) => {
        map[e.key.trim()] = e.value
      })
    if (auth.type === 'bearer' && auth.bearer.trim()) {
      map['Authorization'] = `Bearer ${auth.bearer.trim()}`
    } else if (auth.type === 'basic' && auth.basicUser.trim()) {
      map['Authorization'] = `Basic ${btoa(`${auth.basicUser}:${auth.basicPass}`)}`
    } else if (auth.type === 'api-key' && auth.apiKeyHeader.trim() && auth.apiKeyValue.trim()) {
      map[auth.apiKeyHeader.trim()] = auth.apiKeyValue.trim()
    }
    return map
  }, [headers, auth])

  // ── KV list helpers ──────────────────────────────────────────────────

  const kvAdd = (setter: React.Dispatch<React.SetStateAction<KVEntry[]>>) => () =>
    setter((prev) => [...prev, { key: '', value: '', enabled: true }])

  const kvChange =
    (setter: React.Dispatch<React.SetStateAction<KVEntry[]>>) =>
    (index: number, field: keyof KVEntry, value: string | boolean) =>
      setter((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))

  const kvRemove =
    (setter: React.Dispatch<React.SetStateAction<KVEntry[]>>) => (index: number) =>
      setter((prev) => prev.filter((_, i) => i !== index))

  // ── Profile helpers ──────────────────────────────────────────────────

  const handleSaveProfile = () => {
    if (!profileName.trim()) return
    const profile: AuthProfile = {
      id: crypto.randomUUID(),
      name: profileName.trim(),
      auth: { ...auth },
    }
    setProfiles((prev) => [...prev, profile])
    setActiveProfileId(profile.id)
    setProfileName('')
  }

  const handleLoadProfile = (id: string) => {
    const profile = profiles.find((p) => p.id === id)
    if (!profile) return
    setAuth({ ...profile.auth })
    setActiveProfileId(id)
  }

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    if (activeProfileId === id) setActiveProfileId(null)
  }

  // ── Send request ─────────────────────────────────────────────────────

  const sendRequest = async () => {
    setIsSending(true)
    setError(null)

    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      method,
      url: finalUrl,
      createdAt: new Date().toLocaleString(),
    }

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url: finalUrl,
          headers: preparedHeaders,
          body: body.trim() ? body : undefined,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with ${res.status}`)
      }

      const payload = (await res.json()) as ResponseData
      setResponse(payload)
      setHistory((prev) => {
        const next = [
          { ...historyEntry, statusCode: payload.statusCode, timeTotal: payload.timeTotal },
          ...prev,
        ].slice(0, 50)
        return next
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setResponse(null)
      setHistory((prev) => [historyEntry, ...prev].slice(0, 50))
    } finally {
      setIsSending(false)
      // auto-save after every request
      setTimeout(persist, 0)
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────

  const renderKVList = (
    items: KVEntry[],
    setter: React.Dispatch<React.SetStateAction<KVEntry[]>>,
    keyPlaceholder = 'Key',
    valuePlaceholder = 'Value',
  ) => {
    const add = kvAdd(setter)
    const change = kvChange(setter)
    const remove = kvRemove(setter)
    return (
      <div className="mt-4 space-y-2">
        {items.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={entry.enabled}
              onChange={(e) => change(index, 'enabled', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
            />
            <input
              value={entry.key}
              onChange={(e) => change(index, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-indigo-500"
            />
            <input
              value={entry.value}
              onChange={(e) => change(index, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-indigo-500"
            />
            <button
              onClick={() => remove(index)}
              className="rounded px-2 py-1 text-xs font-semibold text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={add}
          className="rounded-lg border border-dashed border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          + Add
        </button>
      </div>
    )
  }

  const renderAuth = () => (
    <div className="mt-4 space-y-4">
      {/* Profiles */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
          Profiles
        </p>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                activeProfileId === p.id
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              <button onClick={() => handleLoadProfile(p.id)} className="font-medium">
                {p.name}
              </button>
              <button
                onClick={() => handleDeleteProfile(p.id)}
                className="ml-1 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          ))}
          {profiles.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">No saved profiles</span>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Profile name"
            className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
          <button
            onClick={handleSaveProfile}
            disabled={!profileName.trim()}
            className="h-8 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-600"
          >
            Save current
          </button>
        </div>
      </div>

      {/* Auth type */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
          Type
        </label>
        <select
          value={auth.type}
          onChange={(e) => setAuth((a) => ({ ...a, type: e.target.value as AuthType }))}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </select>
      </div>

      {auth.type === 'bearer' && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Token
          </label>
          <input
            value={auth.bearer}
            onChange={(e) => setAuth((a) => ({ ...a, bearer: e.target.value }))}
            placeholder="Paste your token"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Username
            </label>
            <input
              value={auth.basicUser}
              onChange={(e) => setAuth((a) => ({ ...a, basicUser: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={auth.basicPass}
              onChange={(e) => setAuth((a) => ({ ...a, basicPass: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Header Name
            </label>
            <input
              value={auth.apiKeyHeader}
              onChange={(e) => setAuth((a) => ({ ...a, apiKeyHeader: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Value
            </label>
            <input
              value={auth.apiKeyValue}
              onChange={(e) => setAuth((a) => ({ ...a, apiKeyValue: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  )

  // ── Main render ──────────────────────────────────────────────────────

  const methodColor: Record<string, string> = {
    GET: 'text-emerald-600 dark:text-emerald-400',
    POST: 'text-amber-600 dark:text-amber-400',
    PUT: 'text-blue-600 dark:text-blue-400',
    PATCH: 'text-purple-600 dark:text-purple-400',
    DELETE: 'text-rose-600 dark:text-rose-400',
    HEAD: 'text-slate-600 dark:text-slate-400',
    OPTIONS: 'text-cyan-600 dark:text-cyan-400',
  }

  return (
    <div className="min-h-screen px-4 py-6 text-slate-900 transition-colors dark:text-slate-100 sm:px-6 sm:py-8">
      {/* Header */}
      <header className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
            PostJohan
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            CURL-powered API Console
          </p>
        </div>
        <button
          onClick={() => setDarkMode((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-lg shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300 dark:bg-slate-800 dark:ring-slate-700 dark:hover:ring-indigo-600"
          title="Toggle theme"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <section className="space-y-6">
          {/* Request bar */}
          <div className="rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as (typeof METHODS)[number])}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:ring-indigo-900"
              />
              <button
                onClick={sendRequest}
                disabled={isSending}
                className="h-11 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-indigo-800"
              >
                {isSending ? 'Sending…' : 'Send'}
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-5">
              <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-700">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-2 text-xs font-medium transition ${
                      activeTab === t
                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {t}
                    {t === 'Params' && params.filter((p) => p.enabled && p.key.trim()).length > 0 && (
                      <span className="ml-1 inline-block rounded-full bg-indigo-100 px-1.5 text-[10px] text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                        {params.filter((p) => p.enabled && p.key.trim()).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'Headers' && renderKVList(headers, setHeaders, 'Header', 'Value')}
              {activeTab === 'Params' && renderKVList(params, setParams, 'Parameter', 'Value')}
              {activeTab === 'Body' && (
                <div className="mt-4">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Raw JSON / text body"
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  />
                </div>
              )}
              {activeTab === 'Auth' && renderAuth()}
            </div>
          </div>

          {/* Response */}
          <div className="rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Response</h2>
              {response && (
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      response.statusCode < 300
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : response.statusCode < 400
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}
                  >
                    {response.statusCode} {response.statusText}
                  </span>
                  <span>{(response.timeTotal * 1000).toFixed(0)} ms</span>
                  <span>{(response.sizeDownload / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
                {error}
              </div>
            )}

            {!error && !response && (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                Send a request to see the response here.
              </div>
            )}

            {response && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                    Body
                  </p>
                  <pre className="max-h-[400px] max-w-full overflow-y-auto  font-mono text-xs  text-slate-700 dark:text-slate-300 text-wrap">
                    {response.body || 'No body returned'}
                  </pre>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                    Response Headers
                  </p>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600 dark:text-slate-400">
                    {Object.entries(response.headers)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('\n')}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right column — History */}
        <aside>
          <div className="sticky top-6 rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">History</h2>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([])
                    persist()
                  }}
                  className="text-[10px] font-semibold text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-3 max-h-[calc(100vh-180px)] space-y-2 overflow-y-auto">
              {history.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                  No requests yet.
                </p>
              )}
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setMethod(entry.method as (typeof METHODS)[number])
                    setUrl(entry.url)
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-xs shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${methodColor[entry.method] ?? ''}`}>
                      {entry.method}
                    </span>
                    {entry.statusCode ? (
                      <span
                        className={
                          entry.statusCode < 300
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : entry.statusCode < 400
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {entry.statusCode}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {entry.url}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{entry.createdAt}</span>
                    {entry.timeTotal !== undefined && (
                      <span>{(entry.timeTotal * 1000).toFixed(0)} ms</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
