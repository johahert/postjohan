import type { KVEntry, AuthConfig, AuthProfile } from '../../types'
import { METHODS, TABS, type Tab } from '../../constants'
import { KVEditor } from '../KVEditor'
import { AuthEditor } from '../AuthEditor'

const METHOD_COLORS: Record<string, string> = {
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
  accent: string
  accentInk: string
  isSendingStage: string
}

function kvAdd(items: KVEntry[]): KVEntry[] {
  return [...items, { key: '', value: '', enabled: true }]
}
function kvChange(items: KVEntry[], index: number, field: keyof KVEntry, value: string | boolean): KVEntry[] {
  return items.map((e, i) => (i === index ? { ...e, [field]: value } : e))
}
function kvRemove(items: KVEntry[], index: number): KVEntry[] {
  return items.filter((_, i) => i !== index)
}

export function RequestBuilder({
  method, onMethodChange, url, onUrlChange,
  isSending, onSend, activeTab, onTabChange,
  headers, onHeadersChange, params, onParamsChange,
  body, onBodyChange, auth, onAuthChange,
  profiles, activeProfileId, profileName, onProfileNameChange,
  onSaveProfile, onLoadProfile, onDeleteProfile,
  accent, accentInk,
}: RequestBuilderProps) {
  const activeParamCount = params.filter((p) => p.enabled && p.key.trim()).length
  const activeHeaderCount = headers.filter((h) => h.enabled && h.key.trim()).length

  return (
    <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg1)' }}>
      {/* URL bar row */}
      <div
        style={{ display: 'flex', gap: 7, padding: '7px 16px' }}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onSend() }}
      >
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as (typeof METHODS)[number])}
          style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            color: METHOD_COLORS[method] ?? 'var(--text0)',
            fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 12,
            borderRadius: 6, padding: '0 10px', cursor: 'pointer', outline: 'none', height: 36,
          }}
        >
          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '0 12px', gap: 7, height: 36,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://api.example.com/v1"
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--text0)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, outline: 'none',
            }}
          />
        </div>

        <button
          onClick={onSend}
          disabled={isSending}
          style={{
            background: isSending ? 'var(--bg3)' : accent,
            color: isSending ? 'var(--text2)' : accentInk,
            border: 'none', borderRadius: 6, padding: '0 18px',
            fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600,
            cursor: isSending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            height: 36, minWidth: 86, transition: 'all 0.2s',
          }}
        >
          {isSending ? (
            <>
              <div
                className="anim-spin"
                style={{ width: 13, height: 13, border: '2px solid var(--text2)', borderTopColor: accent, borderRadius: '50%' }}
              />
              <span>Sending</span>
            </>
          ) : 'Send'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--bg3)' }}>
        {isSending && (
          <div className="anim-progress-grow" style={{ height: '100%', background: accent }} />
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
        {TABS.map((t) => {
          const badge = t === 'Params' ? (activeParamCount || null) : t === 'Headers' ? (activeHeaderCount || null) : null
          return (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              style={{
                padding: '9px 13px', background: 'none', border: 'none',
                color: activeTab === t ? 'var(--text0)' : 'var(--text2)',
                fontFamily: "'Inter',sans-serif", fontSize: 12, cursor: 'pointer',
                borderBottom: activeTab === t ? `2px solid ${accent}` : '2px solid transparent',
                marginBottom: -1, fontWeight: activeTab === t ? 500 : 400,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {t}
              {badge && (
                <span style={{
                  background: 'var(--accent-dim)', color: accent,
                  borderRadius: 2, padding: '0 5px', fontSize: 10, fontWeight: 600,
                }}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{ background: 'var(--bg0)' }}>
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
          <div style={{ padding: '12px 16px' }}>
            <textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Raw JSON / text body"
              rows={6}
              style={{
                width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text0)', fontFamily: "'JetBrains Mono',monospace",
                fontSize: 12, padding: '10px 12px', outline: 'none', resize: 'none', lineHeight: 1.6,
              }}
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
