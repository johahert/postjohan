import type { AuthConfig, AuthProfile, AuthType } from '../types'

const inputCls = 'w-full h-8 bg-layer-2 border border-edge rounded-[5px] px-2.5 text-ink font-mono text-[12px] outline-none placeholder-ink-3'
const labelCls = 'block text-[10px] font-semibold text-ink-3 uppercase tracking-[0.08em] mb-1.5'

interface AuthEditorProps {
  auth: AuthConfig
  onAuthChange: (auth: AuthConfig) => void
  profiles: AuthProfile[]
  activeProfileId: string | null
  profileName: string
  onProfileNameChange: (name: string) => void
  onSaveProfile: () => void
  onLoadProfile: (id: string) => void
  onDeleteProfile: (id: string) => void
}

export function AuthEditor({
  auth, onAuthChange, profiles, activeProfileId,
  profileName, onProfileNameChange, onSaveProfile, onLoadProfile, onDeleteProfile,
}: AuthEditorProps) {
  return (
    <div className="px-4 py-3 flex flex-col gap-4">
      {/* Saved profiles */}
      <div className="bg-layer-2 border border-edge rounded-[6px] p-3">
        <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-[0.08em] mb-2">Profiles</p>

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {profiles.length === 0 ? (
            <span className="text-[11px] text-ink-3 italic">No saved profiles</span>
          ) : (
            profiles.map((p) => (
              <span
                key={p.id}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px]
                  ${activeProfileId === p.id
                    ? 'border-accent bg-accent-dim text-accent'
                    : 'border-edge-strong bg-layer-3 text-ink-2'}`}
              >
                <button onClick={() => onLoadProfile(p.id)} className="font-medium">{p.name}</button>
                <button
                  onClick={() => onDeleteProfile(p.id)}
                  className="text-ink-3 hover:text-red-400 text-[12px] leading-none transition-colors"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={profileName}
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Profile name"
            className="flex-1 h-8 bg-layer-1 border border-edge rounded-[5px] px-2.5 text-ink font-mono text-[12px] outline-none placeholder-ink-3 min-w-0"
          />
          <button
            onClick={onSaveProfile}
            disabled={!profileName.trim()}
            className="h-8 px-3 rounded-[5px] bg-accent text-[var(--bg0)] font-semibold text-[11px] font-sans transition-all disabled:bg-layer-3 disabled:text-ink-3 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>

      {/* Auth type select */}
      <div>
        <label className={labelCls}>Auth Type</label>
        <select
          value={auth.type}
          onChange={(e) => onAuthChange({ ...auth, type: e.target.value as AuthType })}
          className={inputCls + ' cursor-pointer'}
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </select>
      </div>

      {auth.type === 'bearer' && (
        <div>
          <label className={labelCls}>Token</label>
          <input
            value={auth.bearer}
            onChange={(e) => onAuthChange({ ...auth, bearer: e.target.value })}
            placeholder="Paste your token"
            className={inputCls}
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Username</label>
            <input
              value={auth.basicUser}
              onChange={(e) => onAuthChange({ ...auth, basicUser: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              value={auth.basicPass}
              onChange={(e) => onAuthChange({ ...auth, basicPass: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Header Name</label>
            <input
              value={auth.apiKeyHeader}
              onChange={(e) => onAuthChange({ ...auth, apiKeyHeader: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Value</label>
            <input
              value={auth.apiKeyValue}
              onChange={(e) => onAuthChange({ ...auth, apiKeyValue: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      )}
    </div>
  )
}
