import type { KVEntry, ParamEntry, AuthConfig, AuthProfile } from '../../types'
import { METHODS, TABS, type Tab } from '../../constants'
import { KVEditor } from '../KVEditor'
import { AuthEditor } from '../AuthEditor'

interface RequestBuilderProps {
  // URL bar
  method: (typeof METHODS)[number]
  onMethodChange: (m: (typeof METHODS)[number]) => void
  url: string
  onUrlChange: (u: string) => void
  isSending: boolean
  onSend: () => void
  // Tabs
  activeTab: Tab
  onTabChange: (t: Tab) => void
  // Headers
  headers: KVEntry[]
  onHeadersChange: (items: KVEntry[]) => void
  // Params
  params: ParamEntry[]
  onParamsChange: (items: ParamEntry[]) => void
  // Body
  body: string
  onBodyChange: (b: string) => void
  // Endpoint save/update (collection)
  canSaveEndpoint: boolean
  loadedEndpointId: string | null
  activeContextLabel: string | null
  onSaveAsEndpoint: () => void
  onUpdateEndpoint: () => void
  // Auth
  auth: AuthConfig
  onAuthChange: (a: AuthConfig) => void
  profiles: AuthProfile[]
  activeProfileId: string | null
  profileName: string
  onProfileNameChange: (n: string) => void
  onSaveProfile: () => void
  onLoadProfile: (id: string) => void
  onDeleteProfile: (id: string) => void
}

function kvAdd<T extends KVEntry>(items: T[]): T[] {
  return [...items, { key: '', value: '', enabled: true } as T]
}

function kvChange<T extends KVEntry>(
  items: T[],
  index: number,
  field: keyof KVEntry,
  value: string | boolean,
): T[] {
  return items.map((e, i) => (i === index ? { ...e, [field]: value } : e))
}

function kvRemove<T extends KVEntry>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index)
}

export function RequestBuilder({
  method,
  onMethodChange,
  url,
  onUrlChange,
  isSending,
  onSend,
  activeTab,
  onTabChange,
  headers,
  onHeadersChange,
  params,
  onParamsChange,
  body,
  onBodyChange,
  canSaveEndpoint,
  loadedEndpointId,
  activeContextLabel,
  onSaveAsEndpoint,
  onUpdateEndpoint,
  auth,
  onAuthChange,
  profiles,
  activeProfileId,
  profileName,
  onProfileNameChange,
  onSaveProfile,
  onLoadProfile,
  onDeleteProfile,
}: RequestBuilderProps) {
  const activeParamCount = params.filter((p) => p.enabled && p.key.trim()).length

  return (
    <div className="rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
      {/* URL bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as (typeof METHODS)[number])}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://api.example.com/v1"
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:ring-indigo-900"
        />
        <button
          onClick={onSend}
          disabled={isSending}
          className="h-11 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-indigo-800"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>

      {/* Collection context + save actions */}
      {canSaveEndpoint && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-400 dark:text-slate-500">
            {activeContextLabel ?? 'No environment selected'}
          </p>
          <div className="flex items-center gap-2">
            {loadedEndpointId && (
              <button
                onClick={onUpdateEndpoint}
                className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                Update endpoint
              </button>
            )}
            <button
              onClick={onSaveAsEndpoint}
              className="h-8 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              Save as endpoint
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-5">
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-700">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`px-4 py-2 text-xs font-medium transition ${
                activeTab === t
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t}
              {t === 'Params' && activeParamCount > 0 && (
                <span className="ml-1 inline-block rounded-full bg-indigo-100 px-1.5 text-[10px] text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                  {activeParamCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'Headers' && (
          <KVEditor
            items={headers}
            onAdd={() => onHeadersChange(kvAdd(headers))}
            onChange={(i, f, v) => onHeadersChange(kvChange(headers, i, f, v))}
            onRemove={(i) => onHeadersChange(kvRemove(headers, i))}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
          />
        )}

        {activeTab === 'Params' && (
          <KVEditor
            items={params}
            onAdd={() => onParamsChange(kvAdd(params))}
            onChange={(i, f, v) => onParamsChange(kvChange(params, i, f, v))}
            onRemove={(i) => onParamsChange(kvRemove(params, i))}
            keyPlaceholder="Parameter"
            valuePlaceholder="Value"
          />
        )}

        {activeTab === 'Body' && (
          <div className="mt-4">
            <textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Raw JSON / text body"
              rows={8}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        )}

        {activeTab === 'Auth' && (
          <AuthEditor
            auth={auth}
            onAuthChange={onAuthChange}
            profiles={profiles}
            activeProfileId={activeProfileId}
            profileName={profileName}
            onProfileNameChange={onProfileNameChange}
            onSaveProfile={onSaveProfile}
            onLoadProfile={onLoadProfile}
            onDeleteProfile={onDeleteProfile}
          />
        )}
      </div>
    </div>
  )
}
