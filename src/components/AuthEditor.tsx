import type { CSSProperties } from 'react'
import type { AuthConfig, AuthProfile, AuthType } from '../types'

const inputStyle: CSSProperties = {
  height: 32, width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '0 10px', color: 'var(--text0)',
  fontFamily: "'JetBrains Mono',monospace", fontSize: 12, outline: 'none',
}

const labelStyle: CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text2)',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
}

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
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Profiles */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Profiles
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {profiles.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px',
                borderRadius: 20, border: '1px solid',
                borderColor: activeProfileId === p.id ? 'var(--accent)' : 'var(--border2)',
                background: activeProfileId === p.id ? 'var(--accent-dim)' : 'var(--bg3)',
                fontSize: 11,
              }}
            >
              <button
                onClick={() => onLoadProfile(p.id)}
                style={{ background: 'none', border: 'none', color: activeProfileId === p.id ? 'var(--accent)' : 'var(--text1)', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, padding: 0 }}
              >
                {p.name}
              </button>
              <button
                onClick={() => onDeleteProfile(p.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, padding: '0 2px', lineHeight: 1 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#cc5c5c' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
              >
                ×
              </button>
            </div>
          ))}
          {profiles.length === 0 && (
            <span style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic' }}>No saved profiles</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <input
            value={profileName}
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Profile name"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={onSaveProfile}
            disabled={!profileName.trim()}
            style={{
              background: profileName.trim() ? 'var(--accent)' : 'var(--bg3)',
              color: profileName.trim() ? 'var(--bg0)' : 'var(--text2)',
              border: 'none', borderRadius: 5, padding: '0 12px',
              fontSize: 11, fontWeight: 600, cursor: profileName.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter',sans-serif", height: 32, whiteSpace: 'nowrap',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Auth type */}
      <div>
        <label style={labelStyle}>Auth Type</label>
        <select
          value={auth.type}
          onChange={(e) => onAuthChange({ ...auth, type: e.target.value as AuthType })}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </select>
      </div>

      {auth.type === 'bearer' && (
        <div>
          <label style={labelStyle}>Token</label>
          <input
            value={auth.bearer}
            onChange={(e) => onAuthChange({ ...auth, bearer: e.target.value })}
            placeholder="Paste your token"
            style={inputStyle}
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              value={auth.basicUser}
              onChange={(e) => onAuthChange({ ...auth, basicUser: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={auth.basicPass}
              onChange={(e) => onAuthChange({ ...auth, basicPass: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Header Name</label>
            <input
              value={auth.apiKeyHeader}
              onChange={(e) => onAuthChange({ ...auth, apiKeyHeader: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Value</label>
            <input
              value={auth.apiKeyValue}
              onChange={(e) => onAuthChange({ ...auth, apiKeyValue: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
      )}
    </div>
  )
}
