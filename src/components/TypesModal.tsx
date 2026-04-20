import { useMemo, useState } from 'react'
import { generateTypesFromJson } from '../utils/typeGenerator'
import { highlightTs } from '../utils/highlighter'

type ModalTab = 'types' | 'useQuery'

function deriveQueryKeyAndName(url: string) {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean).map((s) => s.replace(/[^a-zA-Z0-9]/g, ''))
    if (!segments.length) return { queryKey: 'data', hookName: 'useData', fetchUrl: url }
    const meaningful = segments.filter((s) => !/^\d+$/.test(s))
    const base = (meaningful.length ? meaningful[meaningful.length - 1] : segments[0])
    const hookName = `use${base.charAt(0).toUpperCase()}${base.slice(1)}`
    return { queryKey: segments.join('-'), hookName, fetchUrl: url }
  } catch {
    return { queryKey: 'data', hookName: 'useData', fetchUrl: url }
  }
}

function buildUseQuerySnippet(types: string, url: string, isArray: boolean, prefix: string) {
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

export function TypesModal({
  json, url, onClose,
}: {
  json: unknown
  url: string
  onClose: () => void
}) {
  const [tab, setTab]       = useState<ModalTab>('types')
  const [nested, setNested] = useState(false)
  const [copied, setCopied] = useState(false)
  const [prefix, setPrefix] = useState('Response')

  const generated = useMemo(() => generateTypesFromJson(json, prefix, nested), [json, prefix, nested])
  const hookSnippet = useMemo(
    () => buildUseQuerySnippet(generated, url, Array.isArray(json), prefix),
    [generated, url, json, prefix],
  )
  const code = tab === 'types' ? generated : hookSnippet

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-4xl bg-layer-1 border border-edge-strong rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-ink font-sans">Generated TypeScript</h3>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink text-base px-1.5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-edge mb-3">
          {(['types', 'useQuery'] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setCopied(false) }}
              className={`px-3.5 py-2 text-[12px] font-sans border-b-2 transition-colors
                ${tab === t ? 'text-ink border-accent font-medium' : 'text-ink-3 border-transparent hover:text-ink-2'}`}
            >
              {t === 'types' ? 'Types' : 'useQuery Hook'}
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 mb-3 text-[12px] text-ink-3 font-sans">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={nested}
              onChange={(e) => setNested(e.target.checked)}
              className="accent-accent cursor-pointer"
            />
            Extract nested interfaces
          </label>
          <label className="flex items-center gap-2">
            Prefix
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value || 'Response')}
              className="w-24 h-7 bg-layer-2 border border-edge rounded px-2 text-ink font-mono text-[12px] outline-none"
            />
          </label>
        </div>

        {/* Code block */}
        <div className="relative">
          <pre className="max-h-[400px] overflow-auto bg-layer-0 border border-edge rounded-lg p-4 font-mono text-[12px] leading-relaxed text-ink">
            {highlightTs(code)}
          </pre>
          <button
            onClick={copy}
            className="absolute right-3 top-3 bg-accent text-[var(--bg0)] rounded-[6px] px-3 py-1.5 text-[10px] font-bold font-sans"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
