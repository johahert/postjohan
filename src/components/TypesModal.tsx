import { useMemo, useState } from 'react'
import { generateTypesFromJson } from '../utils/typeGenerator'
import { highlightTs } from '../utils/highlighter'

type ModalTab = 'types' | 'useQuery'

const MODAL_TABS: { id: ModalTab; label: string }[] = [
  { id: 'types', label: 'Types' },
  { id: 'useQuery', label: 'useQuery Hook' },
]

function deriveQueryKeyAndName(url: string): { queryKey: string; hookName: string; fetchUrl: string } {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean).map((s) => s.replace(/[^a-zA-Z0-9]/g, ''))
    if (segments.length === 0) return { queryKey: 'data', hookName: 'useData', fetchUrl: url }
    const meaningful = segments.filter((s) => !/^\d+$/.test(s))
    const base = meaningful.length > 0 ? meaningful[meaningful.length - 1] : segments[0]
    const capitalized = base.charAt(0).toUpperCase() + base.slice(1)
    return { queryKey: segments.join('-'), hookName: `use${capitalized}`, fetchUrl: url }
  } catch {
    return { queryKey: 'data', hookName: 'useData', fetchUrl: url }
  }
}

function generateUseQuerySnippet(types: string, url: string, isArray: boolean, prefix: string): string {
  const { queryKey, hookName, fetchUrl } = deriveQueryKeyAndName(url)
  const rootType = isArray ? `${prefix}[]` : prefix
  return `${types}

// ── ${hookName} ────────────────────────────────────────────────────────

async function fetch${hookName.slice(3)}(): Promise<${rootType}> {
  const res = await fetch('${fetchUrl}')
  if (!res.ok) throw new Error(\`Request failed: \$\{res.status\}\`)
  return res.json()
}

export function ${hookName}() {
  return useQuery({
    queryKey: ['${queryKey}'],
    queryFn: fetch${hookName.slice(3)},
  })
}`
}

export function TypesModal({ json, url, onClose }: { json: unknown; url: string; onClose: () => void }) {
  const [nested, setNested] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<ModalTab>('types')
  const [prefix, setPrefix] = useState('Response')
  const generated = useMemo(() => generateTypesFromJson(json, prefix, nested), [json, prefix, nested])
  const hookSnippet = useMemo(
    () => generateUseQuerySnippet(generated, url, Array.isArray(json), prefix),
    [generated, url, json, prefix],
  )
  const currentCode = activeTab === 'types' ? generated : hookSnippet

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{
          margin: '0 16px', width: '100%', maxWidth: 800, borderRadius: 12,
          background: 'var(--bg1)', border: '1px solid var(--border2)',
          padding: 24, boxShadow: '0 20px 60px var(--shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', fontFamily: "'Inter',sans-serif" }}>
            Generated TypeScript
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text0)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
          {MODAL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCopied(false) }}
              style={{
                padding: '8px 14px', background: 'none', border: 'none',
                color: activeTab === tab.id ? 'var(--text0)' : 'var(--text2)',
                fontFamily: "'Inter',sans-serif", fontSize: 12, cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, fontWeight: activeTab === tab.id ? 500 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, fontSize: 12, color: 'var(--text2)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={nested}
              onChange={(e) => setNested(e.target.checked)}
              style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            Extract nested interfaces
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Prefix
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value || 'Response')}
              style={{
                width: 100, background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '2px 8px', color: 'var(--text0)',
                fontFamily: "'JetBrains Mono',monospace", fontSize: 12, outline: 'none',
              }}
            />
          </label>
        </div>

        {/* Code block */}
        <div style={{ position: 'relative' }}>
          <pre style={{
            maxHeight: 400, overflow: 'auto',
            background: 'var(--bg0)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 16,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.6,
            color: 'var(--text0)',
          }}>
            {highlightTs(currentCode)}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute', right: 10, top: 10,
              background: 'var(--accent)', color: 'var(--bg0)',
              border: 'none', borderRadius: 6, padding: '5px 12px',
              fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
