import type { KVEntry, AuthConfig, AuthProfile } from '../../types'
import { METHODS, TABS, type Tab } from '../../constants'
import { KVEditor } from '../KVEditor'
import { AuthEditor } from '../AuthEditor'

const METHOD_COLOR: Record<string, string> = {
  GET: '#5dbd7a', POST: '#5ab4d8', PUT: '#e09a4d', PATCH: '#9d7fe0', DELETE: '#cc5c5c',
}

interface RequestBuilderProps {
  method: (typeof METHODS)[number]
  onMethodChange: (m: (typeof METHODS)[number]) => void
  url: string
  onUrlChange: (u: string) => void
  isSending: boolean
  onSend: () => void
  activeTab: Tab
  onTabChange: (t: Tab) => void
  headers: KVEntry[]
  onHeadersChange: (items: KVEntry[]) => void
  params: KVEntry[]
  onParamsChange: (items: KVEntry[]) => void
  body: string
  onBodyChange: (b: string) => void
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

function kvAdd(items: KVEntry[]): KVEntry[] { return [...items, { key: '', value: '', enabled: true }] }
function kvSet(items: KVEntry[], i: number, f: keyof KVEntry, v: string | boolean) {
  return items.map((e, idx) => idx === i ? { ...e, [f]: v } : e)
}
function kvDel(items: KVEntry[], i: number) { return items.filter((_, idx) => idx !== i) }

export function RequestBuilder({
  method, onMethodChange, url, onUrlChange,
  isSending, onSend, activeTab, onTabChange,
  headers, onHeadersChange, params, onParamsChange,
  body, onBodyChange, auth, onAuthChange,
  profiles, activeProfileId, profileName, onProfileNameChange,
  onSaveProfile, onLoadProfile, onDeleteProfile,
}: RequestBuilderProps) {
  const activeParamCount  = params.filter((p) => p.enabled && p.key.trim()).length
  const activeHeaderCount = headers.filter((h) => h.enabled && h.key.trim()).length

  return (
    <div className="border-b border-edge bg-layer-1 shrink-0">
      {/* URL row */}
      <div
        className="flex gap-2 px-4 py-[7px]"
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onSend() }}
      >
        {/* Method selector */}
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as (typeof METHODS)[number])}
          className="h-9 bg-layer-2 border border-edge rounded-[6px] px-2.5 font-mono font-semibold text-[12px] cursor-pointer outline-none"
          style={{ color: METHOD_COLOR[method] ?? 'var(--text0)' }}
        >
          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* URL input */}
        <div className="flex-1 flex items-center gap-2 h-9 bg-layer-2 border border-edge rounded-[6px] px-3">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" className="shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="flex-1 bg-transparent border-none outline-none text-ink font-mono text-[12px] placeholder-ink-3"
          />
        </div>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={isSending}
          className="h-9 px-[18px] rounded-[6px] font-sans font-semibold text-[12px] flex items-center gap-2 min-w-[86px] justify-center transition-all disabled:cursor-not-allowed bg-accent text-[var(--accent-ink)] disabled:bg-layer-3 disabled:text-ink-3"
        >
          {isSending ? (
            <>
              <span className="anim-spin w-[13px] h-[13px] border-2 border-ink-3 rounded-full shrink-0" style={{ borderTopColor: 'var(--accent)' }} />
              <span>Sending</span>
            </>
          ) : 'Send'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-layer-3">
        {isSending && <div className="h-full bg-accent anim-progress-grow" />}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-edge px-4">
        {TABS.map((t) => {
          const badge = t === 'Params' ? activeParamCount : t === 'Headers' ? activeHeaderCount : 0
          const isActive = activeTab === t
          return (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`flex items-center gap-1.5 px-[13px] py-[9px] -mb-px text-[12px] font-sans border-b-2 transition-colors
                ${isActive
                  ? 'text-ink border-accent font-medium'
                  : 'text-ink-3 border-transparent hover:text-ink-2'}`}
            >
              {t}
              {badge > 0 && (
                <span className="bg-accent-dim text-accent rounded-sm px-[5px] text-[10px] font-semibold leading-[1.6]">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="bg-layer-0">
        {activeTab === 'Headers' && (
          <KVEditor
            items={headers}
            onAdd={() => onHeadersChange(kvAdd(headers))}
            onChange={(i, f, v) => onHeadersChange(kvSet(headers, i, f, v))}
            onRemove={(i) => onHeadersChange(kvDel(headers, i))}
            keyPlaceholder="Header"
          />
        )}
        {activeTab === 'Params' && (
          <KVEditor
            items={params}
            onAdd={() => onParamsChange(kvAdd(params))}
            onChange={(i, f, v) => onParamsChange(kvSet(params, i, f, v))}
            onRemove={(i) => onParamsChange(kvDel(params, i))}
            keyPlaceholder="Parameter"
          />
        )}
        {activeTab === 'Body' && (
          <div className="p-3">
            <textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Raw JSON / text body"
              rows={6}
              className="w-full bg-layer-2 border border-edge rounded-[6px] text-ink font-mono text-[12px] p-3 outline-none resize-none leading-[1.6] placeholder-ink-3"
            />
          </div>
        )}
        {activeTab === 'Auth' && (
          <AuthEditor
            auth={auth}             onAuthChange={onAuthChange}
            profiles={profiles}     activeProfileId={activeProfileId}
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
