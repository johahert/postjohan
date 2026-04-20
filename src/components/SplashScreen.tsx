import { useState, useEffect } from 'react'
import { FalconSVG } from './FalconSVG'

type Phase = 'fly' | 'settle' | 'reveal' | 'out'

const THEMES: Record<string, Record<string, string>> = {
  'falcon-dark': {
    '--bg0': '#0d0b08', '--text0': '#f0e8d0', '--text2': '#665840',
  },
  'falcon-sky': {
    '--bg0': '#e4eff8', '--text0': '#0c1c2e', '--text2': '#7a98b8',
  },
  'dark-forest': {
    '--bg0': '#0f1210', '--text0': '#e8ede9', '--text2': '#5e706a',
  },
  'dark-ocean': {
    '--bg0': '#0b0f1a', '--text0': '#dce8f5', '--text2': '#3d5a7a',
  },
}

const STEPS = ['Initializing', 'Loading routes', 'Establishing connection', 'Ready']

interface SplashScreenProps {
  accent: string
  theme: string
  onDone: () => void
}

export function SplashScreen({ accent, theme, onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>('fly')
  const [stepIdx, setStepIdx] = useState(0)

  const th = THEMES[theme] ?? THEMES['falcon-dark']
  const text0 = th['--text0']
  const text2 = th['--text2']
  const isLight = theme === 'falcon-sky'
  const accentDim = `${accent}26`

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('settle'), 1200),
      setTimeout(() => setPhase('reveal'), 1650),
      setTimeout(() => setStepIdx(1), 1700),
      setTimeout(() => setStepIdx(2), 2100),
      setTimeout(() => setStepIdx(3), 2500),
      setTimeout(() => setPhase('out'), 2900),
      setTimeout(onDone, 3320),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  const skip = () => { setPhase('out'); setTimeout(onDone, 320) }

  return (
    <div
      onClick={skip}
      className={phase === 'out' ? 'anim-splash-out' : ''}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, overflow: 'hidden',
        background: isLight
          ? 'radial-gradient(ellipse at 50% 30%, #b8d8f0 0%, #e4eff8 60%)'
          : 'radial-gradient(ellipse at 50% 25%, #1a1810 0%, #0d0b08 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      {/* Horizon line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '38%', height: 1,
        background: isLight ? 'rgba(90,180,216,0.18)' : 'rgba(232,184,64,0.08)',
      }} />

      {/* Speed streaks during fly */}
      {phase === 'fly' && [
        { top: '28%', left: '55%', w: 140, delay: '0.1s' },
        { top: '35%', left: '58%', w: 90,  delay: '0.18s' },
        { top: '42%', left: '60%', w: 60,  delay: '0.08s' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.w, height: 1.5, borderRadius: 1,
          background: `linear-gradient(to left, transparent, ${accent}80, transparent)`,
          animation: `streakFade 1.1s ${s.delay} ease-out forwards`,
          transformOrigin: 'right center',
        }} />
      ))}

      {/* Falcon */}
      <div
        className={phase === 'fly' ? 'anim-falcon-entry' : ''}
        style={{
          filter: phase === 'fly' ? `drop-shadow(0 0 18px ${accent}60)` : `drop-shadow(0 0 8px ${accent}30)`,
          transition: phase === 'settle' ? 'filter 0.4s ease' : 'none',
          marginBottom: 24,
        }}
      >
        <FalconSVG size={164} color={accent} flap={phase === 'fly'} />
      </div>

      {/* Brand text */}
      <div style={{
        textAlign: 'center',
        opacity: phase === 'fly' ? 0 : 1,
        animation: phase === 'reveal' || phase === 'out' ? 'logoIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: text0, fontFamily: "'Inter',sans-serif" }}>
            Falcon
          </span>
          <span style={{
            fontSize: 14, fontWeight: 700, color: accent,
            background: accentDim, padding: '2px 8px', borderRadius: 3,
            letterSpacing: '0.06em', verticalAlign: 'middle',
          }}>
            API
          </span>
        </div>
        <div className="anim-tag-in" style={{ fontSize: 11, color: text2, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
          Test · Document · Deploy
        </div>
      </div>

      {/* Status ticks */}
      {(phase === 'reveal' || phase === 'out') && (
        <div className="anim-logo-in" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} style={{
                width: 3, height: 12, borderRadius: 1, background: accent,
                animation: `tickPulse 1.8s ${(i / 20) * 1.8}s infinite`, opacity: 0.15,
              }} />
            ))}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: text2, letterSpacing: '0.06em' }}>
            {STEPS[stepIdx]}{stepIdx < 3 ? '…' : ' ✓'}
          </span>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 22, fontSize: 10, color: text2, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.4 }}>
        click to skip
      </div>
    </div>
  )
}
