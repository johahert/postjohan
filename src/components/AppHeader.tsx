import { FalconMark } from './FalconSVG'

const THEME_OPTIONS = [
  { value: 'falcon-dark', label: 'Falcon Dark' },
  { value: 'falcon-sky',  label: 'Falcon Sky'  },
  { value: 'dark-forest', label: 'Forest Dark'  },
  { value: 'dark-ocean',  label: 'Ocean Dark'   },
]

interface AppHeaderProps {
  theme: string
  accentColor: string
  accent: string
  accentInk: string
  accents: Record<string, string>          // key → hex value
  onToggleTheme: () => void
  onThemeChange: (t: string) => void
  onAccentChange: (a: string) => void
}

function MoonSun({ isLight }: { isLight: boolean }) {
  return isLight ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function AppHeader({
  theme, accentColor, accent, accentInk, accents,
  onToggleTheme, onThemeChange, onAccentChange,
}: AppHeaderProps) {
  const isLight = theme === 'falcon-sky'

  return (
    <header className="h-topbar border-b border-edge bg-layer-1 flex items-center px-4 gap-2 shrink-0">
      {/* Brand mark */}
      <div className="flex items-center gap-2 mr-2">
        <FalconMark size={20} color={accent} />
        <span className="font-bold text-[15px] tracking-tight text-ink">Falcon</span>
        <span className="text-[9px] font-bold px-1.5 py-px rounded-sm tracking-[0.07em] text-accent bg-accent-dim">
          API
        </span>
      </div>

      {/* Nav links */}
      {(['Collections', 'Environments', 'History'] as const).map((label) => (
        <button
          key={label}
          className="text-ink-3 hover:text-ink text-xs px-2 py-1 transition-colors font-sans"
        >
          {label}
        </button>
      ))}

      <div className="flex-1" />

      {/* Theme selector */}
      <select
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="bg-layer-2 border border-edge text-ink-2 rounded-[5px] px-2.5 py-1 text-xs cursor-pointer outline-none font-sans"
      >
        {THEME_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Accent colour swatches */}
      <div className="flex items-center gap-1.5 px-1">
        {Object.entries(accents).map(([key, hex]) => (
          <button
            key={key}
            title={key}
            onClick={() => onAccentChange(key)}
            className="w-3.5 h-3.5 rounded-full transition-all focus:outline-none"
            style={{
              background: hex,
              border: accentColor === key ? `2.5px solid var(--text0)` : '2px solid transparent',
            }}
          />
        ))}
      </div>

      {/* Light / dark toggle */}
      <button
        onClick={onToggleTheme}
        className="w-[30px] h-[30px] rounded-[6px] bg-layer-2 border border-edge text-ink-2 flex items-center justify-center transition-all hover:border-accent hover:text-accent"
      >
        <MoonSun isLight={isLight} />
      </button>

      {/* User avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer select-none"
        style={{ background: accent, color: accentInk }}
      >
        JL
      </div>
    </header>
  )
}
