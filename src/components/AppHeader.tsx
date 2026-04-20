import { FalconMark } from './FalconSVG'

const THEME_LABELS: Record<string, string> = {
  'falcon-dark': 'Falcon Dark',
  'falcon-sky': 'Falcon Sky',
  'dark-forest': 'Forest Dark',
  'dark-ocean': 'Ocean Dark',
}

interface AppHeaderProps {
  theme: string
  accentColor: string
  accent: string
  accentDim: string
  onToggleTheme: () => void
  onThemeChange: (t: string) => void
  onAccentChange: (a: string) => void
  accentOptions: Record<string, { a: string }>
}

function MoonSun({ isLight }: { isLight: boolean }) {
  return isLight ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function AppHeader({
  theme,
  accentColor,
  accent,
  accentDim,
  onToggleTheme,
  onThemeChange,
  onAccentChange,
  accentOptions,
}: AppHeaderProps) {
  const isLight = theme === 'falcon-sky'

  return (
    <div style={{
      height: 46, borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      flexShrink: 0, background: 'var(--bg1)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <FalconMark size={20} color={accent} />
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em', color: 'var(--text0)' }}>Falcon</span>
        <span style={{
          background: accentDim, color: accent,
          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 2, letterSpacing: '0.07em',
        }}>API</span>
      </div>

      {/* Nav links */}
      {['Collections', 'Environments', 'History'].map((n) => (
        <button
          key={n}
          style={{ background: 'none', border: 'none', color: 'var(--text2)', fontFamily: "'Inter',sans-serif", fontSize: 12, cursor: 'pointer', padding: '4px 8px', transition: 'color 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text0)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
        >
          {n}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Theme selector */}
      <select
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text1)',
          borderRadius: 5, padding: '4px 10px', fontFamily: "'Inter',sans-serif", fontSize: 12,
          cursor: 'pointer', outline: 'none',
        }}
      >
        {Object.entries(THEME_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      {/* Accent swatches */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {Object.entries(accentOptions).map(([k, v]) => (
          <div
            key={k}
            onClick={() => onAccentChange(k)}
            title={k}
            style={{
              width: 14, height: 14, borderRadius: '50%', background: v.a, cursor: 'pointer',
              border: accentColor === k ? `2.5px solid var(--text0)` : '2px solid transparent',
              boxSizing: 'border-box', transition: 'border 0.15s',
            }}
          />
        ))}
      </div>

      {/* Dark/light toggle */}
      <button
        onClick={onToggleTheme}
        style={{
          width: 30, height: 30, borderRadius: 6, background: 'var(--bg2)',
          border: '1px solid var(--border)', color: 'var(--text1)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = accent; el.style.color = accent }}
        onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text1)' }}
      >
        <MoonSun isLight={isLight} />
      </button>

      {/* User avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#1a0e00', cursor: 'pointer',
      }}>
        JL
      </div>
    </div>
  )
}
